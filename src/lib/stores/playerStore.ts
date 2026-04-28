import { writable, derived } from 'svelte/store';
import type { Player, Item, Weapon, Relic, ActiveEffect, SetBonus, Stat, DualWeaponBonus } from '$lib/types';
import player from '$lib/data/player';
import { sets } from '$lib/data/sets';

const initialState: Player = player;

export const playerStore = writable<Player>(initialState);

// ── Dual-weapon element bonuses ──────────────────────────────────────────────
// When both equipped weapons share an element, the player gets a passive
// reflecting that element's stat theme. Mirrors the per-element weapon
// archetypes (Fire = precision, Earth = pDef+HP, etc.).
const DUAL_WEAPON_BONUSES: Record<string, DualWeaponBonus> = {
    Fire: {
        element: 'Fire',
        name: 'Dual Fire Resonance',
        description: 'Wielding two Fire weapons. +25 Precision.',
        stats: [{ name: 'precision', value: 25 }],
    },
    Earth: {
        element: 'Earth',
        name: 'Dual Earth Resonance',
        description: 'Wielding two Earth weapons. +200 Max HP, +50 Physical Defence.',
        stats: [{ name: 'maxHp', value: 200 }, { name: 'physicalDefence', value: 75 }],
    },
    Water: {
        element: 'Water',
        name: 'Dual Water Resonance',
        description: 'Wielding two Water weapons. +200 Max HP, +50 Elemental Defence.',
        stats: [{ name: 'maxHp', value: 200 }, { name: 'elementalDefence', value: 75 }],
    },
    Wind: {
        element: 'Wind',
        name: 'Dual Wind Resonance',
        description: 'Wielding two Wind weapons. +20 Evasion, +20 Speed.',
        stats: [{ name: 'evasion', value: 20 }, { name: 'speed', value: 20 }],
    },
    Light: {
        element: 'Light',
        name: 'Dual Light Resonance',
        description: 'Wielding two Light weapons. +25% Critical Chance.',
        stats: [{ name: 'critChance', value: 0.25 }],
    },
    Dark: {
        element: 'Dark',
        name: 'Dual Dark Resonance',
        description: 'Wielding two Dark weapons. +50% Critical Damage.',
        stats: [{ name: 'critDamage', value: 0.5 }],
    },
};

/**
 * Returns the active dual-weapon bonus when both equipped weapons share a
 * non-empty, non-Normal element. Otherwise null.
 */
export const playerDualWeaponBonus = derived(playerStore, ($player): DualWeaponBonus | null => {
    if (!$player?.equipment?.weapon_slots) return null;
    const slots = $player.equipment.weapon_slots;
    if (slots.length < 2 || !slots[0] || !slots[1]) return null;
    const e1 = slots[0].element;
    const e2 = slots[1].element;
    if (!e1 || !e2 || e1 === 'None' || e1 === 'none' || e1 !== e2) return null;
    return DUAL_WEAPON_BONUSES[e1] ?? null;
});

export interface ActiveSetBonus {
    setName: string;
    equippedPieces: number;
    totalPieces: number;
    bonus: SetBonus;
}

export const playerActiveSetBonuses = derived(playerStore, ($player): ActiveSetBonus[] => {
    if (!$player || !$player.equipment) return [];
    const activeBonuses: ActiveSetBonus[] = [];
    const equippedRelicIds = $player.equipment.relic_slots
        .filter((relic): relic is Relic => relic !== null)
        .map(relic => relic.id);

    if (equippedRelicIds.length === 0) return [];

    for (const set of sets) {
        const equippedPieces = set.relicIds.filter(id => equippedRelicIds.includes(id)).length;
        if (equippedPieces > 0) {
            for (const bonus of set.bonuses) {
                if (equippedPieces >= bonus.pieces) {
                    activeBonuses.push({ setName: set.name, equippedPieces, totalPieces: set.relicIds.length, bonus });
                }
            }
        }
    }
    return activeBonuses;
});

const calculateFinalStats = (
    player: Player,
    activeSetBonuses: ActiveSetBonus[],
    dualWeaponBonus: DualWeaponBonus | null,
): Player['baseStats'] => {
    if (!player || !player.equipment) {
        console.warn('[calculateFinalStats] Received a player object without an equipment property. Using base stats only.');
        return player.baseStats;
    }

    const baseStats = player.baseStats;
    const statsFromEquipment = {
        maxHp: 0, maxAuraShield: 0, physicalAttack: 0, physicalDefence: 0,
        elementalAttack: 0, elementalDefence: 0, speed: 0, evasion: 0,
        critChance: 0, critDamage: 0, precision: 0,
    };

    const allEquipment: (Item | null)[] = [...player.equipment.weapon_slots, ...player.equipment.relic_slots];
    for (const item of allEquipment) {
        if (item?.stats) {
            for (const stat of item.stats) {
                const statName = stat.name as keyof typeof statsFromEquipment;
                if (statsFromEquipment[statName] !== undefined) {
                    (statsFromEquipment[statName] as number) += stat.value;
                }
            }
        }
    }

    for (const activeBonus of activeSetBonuses) {
        // Always-on stats
        if (activeBonus.bonus.stats) {
            for (const stat of activeBonus.bonus.stats) {
                const statName = stat.name as keyof typeof statsFromEquipment;
                if (statsFromEquipment[statName] !== undefined) {
                    (statsFromEquipment[statName] as number) += stat.value;
                }
            }
        }
        // Conditional element-scoped stats: apply if any equipped weapon
        // matches the bonus element. Stacks additively with always-on stats.
        if (activeBonus.bonus.elementalBonus) {
            const requiredElement = activeBonus.bonus.elementalBonus.element;
            const hasMatchingWeapon = player.equipment.weapon_slots.some(
                w => w?.element === requiredElement,
            );
            if (hasMatchingWeapon) {
                for (const stat of activeBonus.bonus.elementalBonus.stats) {
                    const statName = stat.name as keyof typeof statsFromEquipment;
                    if (statsFromEquipment[statName] !== undefined) {
                        (statsFromEquipment[statName] as number) += stat.value;
                    }
                }
            }
        }
    }

    // Dual-weapon element bonus
    if (dualWeaponBonus) {
        for (const stat of dualWeaponBonus.stats) {
            const statName = stat.name as keyof typeof statsFromEquipment;
            if (statsFromEquipment[statName] !== undefined) {
                (statsFromEquipment[statName] as number) += stat.value;
            }
        }
    }

    let finalStats: Player['baseStats'] = {
        hp: baseStats.hp,
        auraShield: baseStats.auraShield,
        maxHp: baseStats.maxHp + statsFromEquipment.maxHp,
        maxAuraShield: baseStats.maxAuraShield + statsFromEquipment.maxAuraShield,
        physicalAttack: baseStats.physicalAttack + statsFromEquipment.physicalAttack,
        physicalDefence: baseStats.physicalDefence + statsFromEquipment.physicalDefence,
        elementalAttack: baseStats.elementalAttack + statsFromEquipment.elementalAttack,
        elementalDefence: baseStats.elementalDefence + statsFromEquipment.elementalDefence,
        speed: baseStats.speed + statsFromEquipment.speed,
        evasion: baseStats.evasion + statsFromEquipment.evasion,
        critChance: baseStats.critChance + statsFromEquipment.critChance,
        critDamage: baseStats.critDamage + statsFromEquipment.critDamage,
        precision: baseStats.precision + statsFromEquipment.precision,
    };

    if (player.activeEffects) {
        for (const buff of player.activeEffects.filter(e => e.type === 'flat')) {
            const statName = buff.stat as keyof Player['baseStats'];
            if (finalStats[statName] !== undefined) (finalStats[statName] as number) += buff.value;
        }
        for (const buff of player.activeEffects.filter(e => e.type === 'percentage')) {
            const statName = buff.stat as keyof Player['baseStats'];
            if (finalStats[statName] !== undefined) (finalStats[statName] as number) *= (1 + buff.value);
        }
    }

    finalStats.physicalAttack  = Math.max(0, finalStats.physicalAttack);
    finalStats.physicalDefence = Math.max(0, finalStats.physicalDefence);
    finalStats.elementalAttack = Math.max(0, finalStats.elementalAttack);
    finalStats.elementalDefence = Math.max(0, finalStats.elementalDefence);
    finalStats.speed = Math.max(0, finalStats.speed);

    return finalStats;
};

export const playerStats = derived(
    [playerStore, playerActiveSetBonuses, playerDualWeaponBonus],
    ([$player, $activeSetBonuses, $dualWeaponBonus]) =>
        calculateFinalStats($player, $activeSetBonuses, $dualWeaponBonus)
);

export const playerActiveElements = derived(playerStore, ($player) => {
    if (!$player || !$player.equipment) return [];
    const elements: string[] = [];
    $player.equipment.weapon_slots.forEach(weapon => {
        if (weapon?.element) elements.push(weapon.element);
    });
    return elements;
});

export const playerExplorationAbilities = derived(playerStore, ($player) => {
    if (!$player || !$player.equipment) return {};
    const abilities: { [key: string]: number } = {};
    const processItem = (item: Item | null) => {
        if (item?.exploration) {
            for (const exploration of item.exploration) {
                if (!abilities[exploration.name] || abilities[exploration.name] < exploration.level) {
                    abilities[exploration.name] = exploration.level;
                }
            }
        }
    };
    $player.equipment.weapon_slots.forEach(processItem);
    $player.equipment.relic_slots.forEach(processItem);
    return abilities;
});

export const playerWorldResonance = derived(playerStore, ($player) => $player?.worldResonance ?? 0);
export const playerLevelPoints    = derived(playerStore, ($player) => $player?.levelPoints ?? 0);

// ── Derived: player's display name (falls back to 'Traveller' if unset) ──────
export const playerName = derived(
    playerStore,
    ($player) => $player?.profile?.name?.trim() || 'Traveller'
);

// ── Actions ───────────────────────────────────────────────────────────────────

export const setAvatar = (avatar: string) => {
    playerStore.update(p => ({ ...p, profile: { ...p.profile, avatar } }));
};

export const setPlayerName = (name: string) => {
    const trimmed = name.trim().slice(0, 24); // max 24 chars
    playerStore.update(p => ({ ...p, profile: { ...p.profile, name: trimmed } }));
};