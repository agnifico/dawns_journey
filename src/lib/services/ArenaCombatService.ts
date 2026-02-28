import { get } from 'svelte/store';
import type { Player, Combatant, StatusEffect, GearPassive } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { openCombatModal } from '$lib/stores/uiStore';
import { getArenaNpc } from '$lib/data/arenaNpcs';
import { allAbilities, getAbilityById } from '$lib/data/abilities';

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
        if (ability) {
            acc.push(ability);
        } else {
            console.warn(`[ArenaCombatService] Unknown ability id "${id}" in abilityCycle — skipped.`);
        }
        return acc;
    }, []);
}

// ---------------------------------------------------------------------------
// Gear passives → StatusEffects
// ---------------------------------------------------------------------------

/**
 * Collects all GearPassives from equipped weapons and relics and converts them
 * into permanent StatusEffects (duration: 999) seeded into statusEffects for
 * the entire fight.
 *
 * Keeping them in statusEffects means every immunity check in the engine
 * (isImmuneToStatus, immuneToReduction, etc.) finds them with no special-casing.
 *
 * Items declare passives via:
 *   gearPassives: [{ id: 'poison_immunity', name: 'Poison Immunity', flags: ['immune_to_poison'] }]
 */
function resolvePlayerGearPassives(player: Player): StatusEffect[] {
    const allEquipped = [
        ...(player.equipment.weapon_slots ?? []),
        ...(player.equipment.relic_slots ?? []),
    ].filter(Boolean);

    const passiveMap = new Map<string, GearPassive>();

    for (const item of allEquipped) {
        for (const passive of item?.gearPassives ?? []) {
            // Deduplicate — two pieces granting the same passive is still one instance
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
        inflictedBy: 'equipment',
        flags: passive.flags,
    }));
}

// ---------------------------------------------------------------------------
// Arena combat entry point
// ---------------------------------------------------------------------------

export function startArenaCombat(opponentId: string): void {
    const opponentData = getArenaNpc(opponentId);
    if (!opponentData) {
        console.error(`Arena opponent "${opponentId}" not found!`);
        return;
    }

    const currentPlayer = get(playerStore);
    const currentPlayerStats = get(playerStats);

    // Deep-copy to avoid mutating the real player store
    const playerCopy: Player = JSON.parse(JSON.stringify(currentPlayer));

    const sandboxedStats = {
        ...currentPlayerStats,
        hp: currentPlayerStats.maxHp,
        auraShield: currentPlayerStats.maxAuraShield,
        precision: currentPlayerStats.precision ?? 0,
    };

    const playerCombatant: Combatant = {
        id: 'player',
        name: 'Player',
        isPlayer: true,
        image: '',
        profileImage: playerCopy.profile.avatar,
        baseStats: sandboxedStats,
        ...sandboxedStats,
        equipment: playerCopy.equipment,
        elements: (playerCopy.equipment.weapon_slots.map(w => w?.element).filter(Boolean) as string[]),
        abilities: allAbilities,
        // Gear passives (immunities etc.) seeded as permanent status effects
        statusEffects: resolvePlayerGearPassives(playerCopy),
        activeElement: playerCopy.equipment.weapon_slots[0]?.element ?? 'None',
    };

    // --- Build opponent combatant ---
    const opponentStats = {
        ...opponentData.baseStats,
        hp: opponentData.baseStats.maxHp,
        auraShield: opponentData.baseStats.maxAuraShield ?? 0,
        precision: opponentData.baseStats.precision ?? 0,
    };

    const opponentAbilities = resolveAbilities(opponentData.abilityCycle);

    // NPCs declare innate gearPassives for permanent traits (e.g. boss stun immunity)
    const npcPassiveStatusEffects: StatusEffect[] = (opponentData.gearPassives ?? []).map(passive => ({
        id: passive.id,
        name: passive.name,
        duration: 999,
        remainingTurns: 999,
        inflictedBy: 'innate',
        flags: passive.flags,
    }));

    const opponentCombatant: Combatant = {
        id: opponentData.id,
        name: opponentData.name,
        isPlayer: false,
        image: opponentData.image,
        profileImage: opponentData.profileImage,
        baseStats: opponentStats,
        ...opponentStats,
        elements: opponentData.elements ?? [],
        abilities: opponentAbilities,
        statusEffects: npcPassiveStatusEffects,
        activeElement: opponentData.elements?.[0] ?? 'None',
        equipment: undefined,
        arenaBehavior: opponentData.arenaBehavior,
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
        drops: opponentData.drops || [], // Pass opponent's drops to the store
    });

    openCombatModal();
}