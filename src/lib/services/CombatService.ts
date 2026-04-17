import { get } from 'svelte/store';
import type { NPC, Player, Combatant, CombatLogMessage, StatusEffect, GearPassive, ArenaTrigger, ArenaPhaseAbility } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { npcStore } from '$lib/stores/npcStore';
import { openCombatModal, closeCombatModal } from '$lib/stores/uiStore';
import * as CombatEngine from './CombatEngine';
import * as AchievementService from './AchievementService';
import { calculateDamage } from './combatCalculations';
import { getNpcCombatStats, selectBattleAftermath } from './NpcService';
import { getEnemyById } from './EnemyDataService';
import { gainExperience } from './PlayerLevelService';
import { allAbilities, getAbilityById } from '../data/abilities';
import { checkQuestTriggers } from './QuestService';
import { addItems } from './InventoryService';
import { toastStore } from '$lib/stores/toastStore';

// ---------------------------------------------------------------------------
// Gear passives → permanent StatusEffects
// ---------------------------------------------------------------------------

/**
 * Collects GearPassives from all equipped weapons and relics and converts them
 * into permanent StatusEffects (inflictedBy: 'equipment', duration: 999).
 *
 * Storing them in statusEffects means every immunity check in the engine
 * (isImmuneToStatus, immuneToReduction, etc.) finds them automatically.
 * CombatEngine.applyStatusEffects skips these during tick/countdown so they
 * never expire mid-fight.
 */
function resolvePlayerGearPassives(player: Player): StatusEffect[] {
    const allEquipped = [
        ...(player.equipment.weapon_slots ?? []),
        ...(player.equipment.relic_slots ?? []),
    ].filter(Boolean);

    const passiveMap = new Map<string, GearPassive>();
    for (const item of allEquipped) {
        for (const passive of item?.gearPassives ?? []) {
            if (!passiveMap.has(passive.id)) {
                passiveMap.set(passive.id, passive);
            }
        }
    }

    return Array.from(passiveMap.values()).map(passive => ({
        id: passive.id,
        name: passive.name,
        duration: 999,
        remainingTurns: 999,
        inflictedBy: 'equipment' as const,
        flags: passive.flags,
    }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveAbilities(abilityCycle: string[] | undefined): NonNullable<ReturnType<typeof getAbilityById>>[] {
    if (!abilityCycle || abilityCycle.length === 0) {
        const fallback = getAbilityById('basic_slash');
        return fallback ? [fallback] : [];
    }
    return abilityCycle.reduce<NonNullable<ReturnType<typeof getAbilityById>>[]>((acc, id) => {
        const ability = getAbilityById(id);
        if (ability) acc.push(ability);
        else console.warn(`[CombatService] Unknown ability id "${id}" in abilityCycle — skipped.`);
        return acc;
    }, []);
}

function isCombatant(c: Combatant): c is Combatant & Pick<Combatant, 'arenaBehavior'> {
    return !c.isPlayer && 'arenaBehavior' in c;
}

/** Resolves an ArenaPhaseAbility to its string id. */
function phaseAbilityId(slot: ArenaPhaseAbility): string {
    return typeof slot === 'string' ? slot : slot.id;
}

/** Returns the maxUses limit for an ability in the NPC's phase definitions, or null if unlimited. */
function getPhaseMaxUses(opponent: Combatant, abilityId: string): number | null {
    for (const phase of opponent.arenaBehavior?.phases ?? []) {
        for (const slot of phase.abilities) {
            if (typeof slot === 'object' && slot.id === abilityId) {
                return slot.maxUses;
            }
        }
    }
    return null;
}

/**
 * Returns true if this NPC ability has hit its use limit for this fight.
 *
 * oneShot = true means the trigger can only fire once (maxUses: 1).
 * Phase abilities may declare { id, maxUses } to cap uses independently.
 * Abilities with no limit defined are never exhausted.
 */
function isAbilityExhausted(opponent: Combatant, abilityId: string, oneShot = false): boolean {
    const uses = opponent.abilityUseCounts?.[abilityId] ?? 0;
    if (oneShot) return uses >= 1;
    const phaseLimit = getPhaseMaxUses(opponent, abilityId);
    if (phaseLimit !== null) return uses >= phaseLimit;
    return false;
}

function incrementUseCount(opponent: Combatant, abilityId: string): Combatant {
    return {
        ...opponent,
        abilityUseCounts: {
            ...(opponent.abilityUseCounts ?? {}),
            [abilityId]: (opponent.abilityUseCounts?.[abilityId] ?? 0) + 1,
        },
    };
}

// ---------------------------------------------------------------------------
// AI: choose an ability for the opponent
// ---------------------------------------------------------------------------

function chooseArenaAbility(
    player: Combatant,
    opponent: Combatant & Pick<Combatant, 'arenaBehavior'>,
    turnNumber: number
): string {
    const behavior = opponent.arenaBehavior;
    let chosen: string | null = null;

    if (behavior) {
        // --- Triggers (sorted highest priority first) ---
        if (behavior.triggers?.length) {
            const sorted = [...behavior.triggers].sort((a, b) => b.priority - a.priority);
            for (const trigger of sorted) {
                if (isAbilityExhausted(opponent, trigger.responseAbility, trigger.oneShot ?? false)) continue;
                if (isTriggerConditionMet(trigger, player, opponent, turnNumber)) {
                    chosen = trigger.responseAbility;
                    break;
                }
            }
        }

        // --- Phase abilities (fallback when no trigger fires) ---
        if (chosen === null && behavior.phases.length > 0) {
            const hpPct = opponent.hp / opponent.maxHp;
            const activePhase =
                [...behavior.phases]
                    .sort((a, b) => b.hpThreshold - a.hpThreshold)
                    .find(p => hpPct <= p.hpThreshold)
                ?? behavior.phases[0];

            const allIds = activePhase.abilities.map(phaseAbilityId);
            const available = allIds.filter(id => !isAbilityExhausted(opponent, id));
            const pool = available.length > 0 ? available : allIds;

            if (pool.length > 0) {
                chosen = activePhase.tactic === 'RANDOM'
                    ? pool[Math.floor(Math.random() * pool.length)]
                    : pool[(turnNumber - 1) % pool.length];
            }
        }
    }

    return chosen ?? 'basic_slash';
}

function chooseOverworldAbility(
    player: Combatant,
    opponent: Combatant
): { abilityId: string; element: string } {
    let bestAbilityId = 'basic_slash';
    let bestDamage = -1;
    let bestElement = opponent.types?.[0] ?? 'None';

    for (const ability of opponent.abilities) {
        const damageEffect = ability.effects.find(e => e.type === 'damage');
        if (!damageEffect || damageEffect.type !== 'damage') continue;
        const { damageType, multiplier } = damageEffect;

        if (damageType === 'elemental') {
            for (const el of opponent.types) {
                const { damage } = calculateDamage(
                    { ...opponent, elementalAttack: opponent.elementalAttack * multiplier, activeElement: el },
                    player, 'elemental', [el]
                );
                if (damage > bestDamage) { bestDamage = damage; bestAbilityId = ability.id; bestElement = el; }
            }
        } else {
            const { damage } = calculateDamage(
                { ...opponent, physicalAttack: opponent.physicalAttack * multiplier },
                player, 'physical', []
            );
            if (damage > bestDamage) { bestDamage = damage; bestAbilityId = ability.id; }
        }
    }

    return { abilityId: bestAbilityId, element: bestElement };
}

// ---------------------------------------------------------------------------
// Arena trigger evaluation
// ---------------------------------------------------------------------------

function isTriggerConditionMet(
    trigger: ArenaTrigger,
    player: Combatant,
    opponent: Combatant,
    turnNumber: number
): boolean {
    const { condition } = trigger;
    switch (condition.type) {
        case 'PLAYER_HP_BELOW':
            return (player.hp / player.maxHp) < condition.value;
        case 'SELF_HP_BELOW':
            return (opponent.hp / opponent.maxHp) < condition.value;
        case 'SELF_HP_ABOVE':
            return (opponent.hp / opponent.maxHp) >= condition.value;
        case 'ENEMY_STATUS_MISSING':
            return !player.statusEffects.some(s => s.id === condition.statusId);
        case 'ENEMY_STATUS_PRESENT':
            return player.statusEffects.some(s => s.id === condition.statusId);
        case 'SELF_STATUS_PRESENT':
            return opponent.statusEffects.some(s => s.id === condition.statusId);
        case 'TURN_MULTIPLE_OF':
            return turnNumber > 1 && turnNumber % condition.value === 0;
        case 'TURN_NUMBER_IS':
            return turnNumber === condition.value;
        case 'ENEMY_HAS_FLAG':
            // Fires when the player has an active status carrying the given immunity flag.
            // Used to detect when an NPC's strategy (e.g. poison) is blocked and switch tactics.
            return player.statusEffects.some(s => s.flags?.includes(condition.flag as any));
        default:
            condition satisfies never;
            return false;
    }
}

// ---------------------------------------------------------------------------
// Combat end
// ---------------------------------------------------------------------------

function endArenaCombat(outcome: 'win' | 'lose'): void {
    const state = get(combatStore);
    let currentDrops = state.drops || []; // Get drops passed from startArenaCombat

    playerStore.update(p => {
        let u = { ...p };
        if (outcome === 'win') {
            currentDrops.forEach(drop => {
                const roll = Math.random();
                if (!drop.chance || roll < drop.chance) {
                    u = addItems(u, drop.itemId, drop.quantity);
                }
            });
        }
        // Arena combat doesn't have HP cost or kill counts like overworld,
        // but we might want to update combat history or quest triggers.
        // For now, just update player stats if they won/lost HP during combat.
        if (state.player) {
            u.baseStats.hp = state.player.hp;
            u.baseStats.auraShield = state.player.auraShield;
        }
        u.combatHistory = [...u.combatHistory, { npcId: state.opponent!.id, outcome }];
        u = checkQuestTriggers(u);
        return u;
    });

    combatStore.update(s => ({ ...s, combatEnded: true, outcome, drops: currentDrops, turnPhase: null }));
}

function endCombat(outcome: 'win' | 'lose', player: Combatant, opponent: Combatant): void {
    if (get(combatStore).isArenaCombat) return endArenaCombat(outcome);

    const enemyData = getEnemyById(opponent.id);
    const drops: { itemId: string, quantity: number }[] = [];
    const sourceNpc = get(npcStore).globalNpcs[opponent.id];

    playerStore.update(p => {
        let u = { ...p };
        if (outcome === 'win') {
            u.killCounts = { ...u.killCounts, [opponent.id]: (u.killCounts[opponent.id] || 0) + 1 };
            AchievementService.checkKillCounts(opponent.id);

            const xp = enemyData?.xp ?? 0;
            if (xp) u = gainExperience(u, xp);

            const dropTable = enemyData?.drops ?? sourceNpc?.drops ?? [];
            dropTable.forEach(drop => {
                const roll = Math.random();
                if (!drop.chance || roll < drop.chance) {
                    u = addItems(u, drop.itemId, drop.quantity);
                    drops.push(drop);
                }
            });
        }

        const hpCost = enemyData?.hpCost ?? 0;
        u.baseStats.hp = Math.max(0, player.hp - hpCost);
        if (hpCost > 0) messageStore.addMessage(`You lose ${hpCost} HP from the encounter.`, ['Combat']);

        u.baseStats.auraShield = player.auraShield;
        u.combatHistory = [...u.combatHistory, { npcId: opponent.id, outcome }];
        u = checkQuestTriggers(u);
        return u;
    });

    const npc = get(npcStore).globalNpcs[opponent.id];

    if (npc) {
        const aftermath = selectBattleAftermath(npc, get(playerStore), get(npcStore).globalNpcs, outcome);
        if (aftermath) {
            if (aftermath.dialogue?.length) dialogueStore.startDialogue(aftermath.dialogue, npc.name);
            if (aftermath.value !== undefined) npcStore.applyCombatAftermath(npc.id, outcome);
        }
    }

    combatStore.update(s => ({ ...s, combatEnded: true, outcome, drops, turnPhase: null }));
}

// ---------------------------------------------------------------------------
// Single action executor (status tick → ability → death check)
// ---------------------------------------------------------------------------

function executeAction(
    attacker: Combatant,
    defender: Combatant,
    abilityId: string,
    attackerIsPlayer: boolean,
): {
    attacker: Combatant;
    defender: Combatant;
    logs: CombatLogMessage[];
    attackerDied: boolean;
    defenderDied: boolean;
} {
    const attackerSide = attackerIsPlayer ? 'player' : 'opponent' as const;
    const defenderSide = attackerIsPlayer ? 'opponent' : 'player' as const;
    const logs: CombatLogMessage[] = [];

    const statusResult = CombatEngine.applyStatusEffects(attacker);
    attacker = statusResult.updatedCombatant;
    logs.push(...statusResult.logs);

    if (attacker.hp <= 0) {
        logs.push({ type: 'defeated', side: attackerSide, name: attacker.name });
        return { attacker, defender, logs, attackerDied: true, defenderDied: false };
    }

    const result = CombatEngine.executeAbility(attacker, defender, abilityId);
    attacker = result.updatedAttacker;
    defender = result.updatedDefender;
    logs.push(...result.logs);

    const defenderDied = defender.hp <= 0;
    if (defenderDied) {
        logs.push({ type: 'defeated', side: defenderSide, name: defender.name });
    }

    return { attacker, defender, logs, attackerDied: false, defenderDied };
}

// ---------------------------------------------------------------------------
// Full round resolution
// ---------------------------------------------------------------------------

function resolveTurn(playerAbilityId: string): void {
    const state = get(combatStore);
    if (!state.player || !state.opponent || state.combatEnded) return;

    let player = state.player;
    let opponent = state.opponent;
    const turnNumber = state.turnNumber;
    const isArena = state.isArenaCombat;
    const roundLogs: CombatLogMessage[] = [{ type: 'turn_banner', turn: turnNumber }];

    const playerGoesFirst = (player.speed ?? 0) >= (opponent.speed ?? 0);

    let opponentAbilityId: string;
    if (isArena && isCombatant(opponent)) {
        opponentAbilityId = chooseArenaAbility(player, opponent, turnNumber);
        opponent = incrementUseCount(opponent, opponentAbilityId);
    } else {
        const { abilityId, element } = chooseOverworldAbility(player, opponent);
        opponentAbilityId = abilityId;
        opponent = { ...opponent, activeElement: element };
    }

    if (playerGoesFirst) {
        const r1 = executeAction(player, opponent, playerAbilityId, true);
        player = r1.attacker; opponent = r1.defender;
        roundLogs.push(...r1.logs);
        if (r1.defenderDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('win', player, opponent); return;
        }
        if (r1.attackerDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('lose', player, opponent); return;
        }

        const r2 = executeAction(opponent, player, opponentAbilityId, false);
        opponent = r2.attacker; player = r2.defender;
        roundLogs.push(...r2.logs);
        if (r2.defenderDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('lose', player, opponent); return;
        }
        if (r2.attackerDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('win', player, opponent); return;
        }

    } else {
        const r1 = executeAction(opponent, player, opponentAbilityId, false);
        opponent = r1.attacker; player = r1.defender;
        roundLogs.push(...r1.logs);
        if (r1.defenderDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('lose', player, opponent); return;
        }
        if (r1.attackerDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('win', player, opponent); return;
        }

        const r2 = executeAction(player, opponent, playerAbilityId, true);
        player = r2.attacker; opponent = r2.defender;
        roundLogs.push(...r2.logs);
        if (r2.defenderDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('win', player, opponent); return;
        }
        if (r2.attackerDied) {
            combatStore.update(s => ({ ...s, player, opponent, combatLog: [...s.combatLog, ...roundLogs], turnPhase: null }));
            endCombat('lose', player, opponent); return;
        }
    }

    combatStore.update(s => ({
        ...s, player, opponent,
        combatLog: [...s.combatLog, ...roundLogs],
        turnNumber: s.turnNumber + 1,
        turnPhase: 'player_selecting',
    }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function executePlayerAbility(abilityId: string): void {
    const state = get(combatStore);
    if (
        !state.isInCombat ||
        state.combatEnded ||
        state.turnPhase !== 'player_selecting' ||
        !state.player ||
        !state.opponent
    ) return;

    combatStore.update(s => ({ ...s, turnPhase: 'resolving' }));
    setTimeout(() => resolveTurn(abilityId), 50);
}

export function forceEndCombat(): void {
    const state = get(combatStore);
    if (state.player && !state.isArenaCombat) {
        playerStore.update(p => ({
            ...p,
            baseStats: { ...p.baseStats, hp: state.player!.hp, auraShield: state.player!.auraShield },
        }));
    }
    combatStore.resetCombat();
    closeCombatModal();
}

export function startCombat(opponentNpc: NPC): void {
    AchievementService.checkSighting(opponentNpc.id);

    const currentPlayer = get(playerStore);
    const currentPlayerStats = get(playerStats);

    if (currentPlayerStats.hp <= 0) {
        messageStore.addMessage('You are too weak to engage in combat.', ['Combat']);
        toastStore.warning('Cannot fight with ZERO HP. Heal up!');
        return;
    }

    const playerCopy: Player = JSON.parse(JSON.stringify(currentPlayer));
    const playerBaseStats = { ...currentPlayerStats, precision: currentPlayerStats.precision ?? 0 };

    const playerCombatant: Combatant = {
        id: 'player',
        name: 'Player',
        isPlayer: true,
        image: '',
        profileImage: currentPlayer.profile.avatar,
        baseStats: playerBaseStats,
        ...playerBaseStats,
        equipment: currentPlayer.equipment,
        elements: currentPlayer.equipment.weapon_slots
            .map(w => w?.element)
            .filter((e): e is string => !!e && e !== 'None'),
        abilities: allAbilities,
        statusEffects: resolvePlayerGearPassives(playerCopy),
        activeElement: currentPlayer.equipment.weapon_slots
            .map(w => w?.element)
            .find((e): e is string => !!e && e !== 'None') ?? 'None',
        gearPassives: [],
    };

    const opponentStats = getNpcCombatStats(opponentNpc);
    const opponentBaseStats = { ...opponentStats, precision: opponentStats.precision ?? 0 };
    const opponentAbilities = resolveAbilities(opponentNpc.abilityCycle);

    const opponentCombatant: Combatant = {
        id: opponentNpc.id,
        name: opponentNpc.name,
        isPlayer: false,
        image: opponentNpc.image,
        profileImage: opponentNpc.profileImage,
        baseStats: opponentBaseStats,
        ...opponentBaseStats,
        hp: opponentStats.hp ?? 50,
        maxHp: opponentStats.maxHp ?? 50,
        auraShield: opponentStats.maxAuraShield ?? 0,
        maxAuraShield: opponentStats.maxAuraShield ?? 0,
        elements: opponentNpc.types ?? [],
        abilities: opponentAbilities,
        statusEffects: [],
        activeElement: opponentNpc.types?.[0] ?? 'None',
    };

    combatStore.set({
        isInCombat: true,
        isArenaCombat: false,
        combatEnded: false,
        outcome: null,
        player: playerCombatant,
        opponent: opponentCombatant,
        combatLog: [{ type: 'system', text: `You are now fighting ${opponentNpc.name}!` }],
        turnPhase: 'player_selecting',
        turnNumber: 1,
        playerWeaponIndex: 0,
        drops: [],
        initialPlayerStats: { ...playerCombatant.baseStats },
        initialOpponentStats: { ...opponentCombatant.baseStats },
    });

    openCombatModal();
}