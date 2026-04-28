import { get } from 'svelte/store';
import type { Player, Combatant, StatusEffect, GearPassive } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats, playerActiveSetBonuses } from '$lib/stores/playerStore';
import { openCombatModal } from '$lib/stores/uiStore';
import { getArenaNpc } from '$lib/data/arenaNpcs';
import { allAbilities, getAbilityById, getGearPassiveById } from '$lib/data/abilities';
import { abilityMode } from '$lib/stores/settingsStore';
import { playerAbilities, npcAbilities } from '$lib/data/abilities';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Collects every tagBonus the player has from active sources:
 * 1. Active set bonuses (each SetBonus.tagBonus, when piece-count met)
 * 2. Gear passives on equipped weapons + relics (each GearPassive.tagBonus)
 *
 * Multiple bonuses with the same tag stack multiplicatively at strike time
 * (handled by aggregateTagBonus in abilityEffects.ts).
 *
 * NPCs return an empty array — they don't carry equipment-driven bonuses.
 */
function collectPlayerTagBonuses(
    player: Player,
    activeSetBonuses: ReturnType<typeof get<typeof playerActiveSetBonuses>>,
): { tag: string; damageMultiplier: number }[] {
    const bonuses: { tag: string; damageMultiplier: number }[] = [];

    // Source 1: set bonuses
    for (const active of activeSetBonuses) {
        if (active.bonus.tagBonus) {
            bonuses.push(active.bonus.tagBonus);
        }
    }

    // Source 2: gear passives on equipped items
    const allEquipped = [
        ...(player.equipment.weapon_slots ?? []),
        ...(player.equipment.relic_slots ?? []),
    ].filter(Boolean);
    const seenPassiveIds = new Set<string>();
    for (const item of allEquipped) {
        for (const passiveId of (item?.gearPassives ?? []) as unknown as string[]) {
            // gearPassives on items is string[] — resolve via getGearPassiveById
            if (typeof passiveId !== 'string' || seenPassiveIds.has(passiveId)) continue;
            seenPassiveIds.add(passiveId);
            const passive = getGearPassiveById(passiveId);
            if (passive?.tagBonus) bonuses.push(passive.tagBonus);
        }
    }

    return bonuses;
}

function resolveAbilities(abilityCycle: string[] | undefined): NonNullable<ReturnType<typeof getAbilityById>>[] {
    if (!abilityCycle || abilityCycle.length === 0) {
        const fallback = getAbilityById('basic_slash');
        return fallback ? [fallback] : [];
    }
    return abilityCycle.reduce<NonNullable<ReturnType<typeof getAbilityById>>[]>((acc, id) => {
        const ability = getAbilityById(id);
        if (ability) {
            acc.push(ability);
        } else {
            console.warn(`[ArenaCombatService] Unknown ability id "${id}" in abilityCycle — skipped.`);
        }
        return acc;
    }, []);
}

/**
 * Converts a player's equipped gear passives into permanent StatusEffects
 * (inflictedBy: 'equipment', duration: 999) so every immunity check in the
 * engine finds them automatically without special-casing.
 */
function resolvePlayerGearPassives(player: Player): StatusEffect[] {
    const allEquipped = [
        ...(player.equipment.weapon_slots ?? []),
        ...(player.equipment.relic_slots ?? []),
    ].filter(Boolean);

    const passiveMap = new Map<string, GearPassive>();
    for (const item of allEquipped) {
        for (const passiveId of (item?.gearPassives ?? []) as unknown as string[]) {
            if (typeof passiveId !== 'string' || passiveMap.has(passiveId)) continue;
            const passive = getGearPassiveById(passiveId);
            if (passive) passiveMap.set(passiveId, passive);
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

/** Converts an NPC's declared gearPassives into innate permanent StatusEffects. */
function resolveNpcGearPassives(gearPassives: string[] | undefined): StatusEffect[] {
    return (gearPassives ?? [])
        .map(id => getGearPassiveById(id))
        .filter((p): p is NonNullable<ReturnType<typeof getGearPassiveById>> => !!p)
        .map(passive => ({
            id: passive.id,
            name: passive.name,
            duration: 999,
            remainingTurns: 999,
            inflictedBy: 'innate' as const,
            flags: passive.flags,
        }));
}

// ---------------------------------------------------------------------------
// Arena combat entry point
// ---------------------------------------------------------------------------

export function startArenaCombat(opponentId: string): void {
    const mode = get(abilityMode);
    const availableAbilities = mode === 'dev'
        ? [...playerAbilities, ...npcAbilities]
        : playerAbilities;
    const opponentData = getArenaNpc(opponentId);
    if (!opponentData) {
        console.error(`[ArenaCombatService] Arena opponent "${opponentId}" not found!`);
        return;
    }

    const currentPlayer = get(playerStore);
    const currentPlayerStats = get(playerStats);

    // Deep-copy to avoid mutating the real player store during combat
    const playerCopy: Player = JSON.parse(JSON.stringify(currentPlayer));

    const sandboxedStats = {
        ...currentPlayerStats,
        hp: currentPlayerStats.maxHp,
        auraShield: currentPlayerStats.maxAuraShield,
        precision: currentPlayerStats.precision ?? 0,
    };

    // Collect weapon elements, filtering out empty/None slots
    const playerElements = playerCopy.equipment.weapon_slots
        .map(w => w?.element)
        .filter((e): e is string => !!e && e !== 'None');

    const playerCombatant: Combatant = {
        id: 'player',
        name: 'Player',
        isPlayer: true,
        image: '',
        profileImage: playerCopy.profile.avatar,
        baseStats: sandboxedStats,
        ...sandboxedStats,
        equipment: playerCopy.equipment,
        elements: playerElements,
        abilities: availableAbilities,
        statusEffects: resolvePlayerGearPassives(playerCopy),
        activeElement: playerElements[0] ?? 'None',
        gearPassives: [],
        tagBonuses: collectPlayerTagBonuses(playerCopy, get(playerActiveSetBonuses)),
    };

    // --- Build opponent combatant ---
    const opponentStats = {
        ...opponentData.baseStats,
        hp: opponentData.baseStats.maxHp,
        auraShield: opponentData.baseStats.maxAuraShield ?? 0,
        precision: opponentData.baseStats.precision ?? 0,
    };

    // Arena NPCs may use `elements` or `types` depending on the data source —
    // fall back through both so either convention works.
    const opponentElements: string[] = opponentData.types ?? (opponentData as any).types ?? [];

    const opponentCombatant: Combatant = {
        id: opponentData.id,
        name: opponentData.name,
        isPlayer: false,
        image: opponentData.image,
        profileImage: opponentData.profileImage,
        baseStats: opponentStats,
        ...opponentStats,
        types: opponentElements,
        abilities: resolveAbilities(opponentData.abilityCycle),
        statusEffects: resolveNpcGearPassives(opponentData.gearPassives),
        activeElement: opponentElements[0] ?? 'None',
        equipment: undefined,
        arenaBehavior: opponentData.arenaBehavior,
        gearPassives: [],
        tagBonuses: [],
    };

    combatStore.set({
        isInCombat: true,
        isArenaCombat: true,
        combatEnded: false,
        outcome: null,
        player: playerCombatant,
        opponent: opponentCombatant,
        combatLog: [{ type: 'system', text: `Arena Battle! You vs. ${opponentData.name}!` }],
        turnPhase: 'player_selecting',
        turnNumber: 1,
        playerWeaponIndex: 0,
        drops: opponentData.drops ?? [],
        initialPlayerStats: { ...playerCombatant.baseStats },
        initialOpponentStats: { ...opponentCombatant.baseStats },
    });

    openCombatModal();
}