import { get } from 'svelte/store';
import type { Player, Combatant, StatusEffect, GearPassive } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { openCombatModal } from '$lib/stores/uiStore';
import { getArenaNpc } from '$lib/data/arenaNpcs';
import { allAbilities, getAbilityById } from '$lib/data/abilities';
import { abilityMode } from '$lib/stores/settingsStore';
import { playerAbilities, npcAbilities } from '$lib/data/abilities';


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
        for (const passive of item?.gearPassives ?? []) {
            if (!passiveMap.has(passive.id)) passiveMap.set(passive.id, passive);
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
function resolveNpcGearPassives(gearPassives: GearPassive[] | undefined): StatusEffect[] {
    return (gearPassives ?? []).map(passive => ({
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
    const opponentElements: string[] = opponentData.elements ?? (opponentData as any).types ?? [];

    const opponentCombatant: Combatant = {
        id: opponentData.id,
        name: opponentData.name,
        isPlayer: false,
        image: opponentData.image,
        profileImage: opponentData.profileImage,
        baseStats: opponentStats,
        ...opponentStats,
        elements: opponentElements,
        abilities: resolveAbilities(opponentData.abilityCycle),
        statusEffects: resolveNpcGearPassives(opponentData.gearPassives),
        activeElement: opponentElements[0] ?? 'None',
        equipment: undefined,
        arenaBehavior: opponentData.arenaBehavior,
        gearPassives: [],
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