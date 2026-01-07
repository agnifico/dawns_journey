import { writable, derived } from 'svelte/store';
import type { Player, Item, Weapon, Relic, ActiveEffect, SetBonus, Stat } from '$lib/types';
import player from '$lib/data/player';
import { sets } from '$lib/data/sets';

const initialState: Player = player;

export const playerStore = writable<Player>(initialState);

export interface ActiveSetBonus {
    setName: string;
    equippedPieces: number;
    totalPieces: number;
    bonus: SetBonus;
}

export const playerActiveSetBonuses = derived(playerStore, ($player): ActiveSetBonus[] => {
    const activeBonuses: ActiveSetBonus[] = [];
    const equippedRelicIds = $player.equipment.relic_slots
        .filter((relic): relic is Relic => relic !== null)
        .map(relic => relic.id);

    if (equippedRelicIds.length === 0) {
        return [];
    }

    for (const set of sets) {
        const equippedPieces = set.relicIds.filter(id => equippedRelicIds.includes(id)).length;

        if (equippedPieces > 0) {
            for (const bonus of set.bonuses) {
                if (equippedPieces >= bonus.pieces) {
                    activeBonuses.push({
                        setName: set.name,
                        equippedPieces,
                        totalPieces: set.relicIds.length,
                        bonus: bonus,
                    });
                }
            }
        }
    }
    return activeBonuses;
});


/**
 * Calculates the player's final stats by combining base stats, equipment bonuses, and active effects (buffs/debuffs).
 * @param player The player object.
 * @returns The player's final, calculated stats.
 */
const calculateFinalStats = (player: Player, activeSetBonuses: ActiveSetBonus[]): Player['baseStats'] => {
    const baseStats = player.baseStats;

    // 1. Start with base stats + equipment bonuses
    const statsFromEquipment = {
        maxHp: 0, maxAuraShield: 0, physicalAttack: 0, physicalDefence: 0,
        elementalAttack: 0, elementalDefence: 0, speed: 0, evasion: 0,
        critChance: 0, critDamage: 0,
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

    // 2. Add set bonuses
    for (const activeBonus of activeSetBonuses) {
        for (const stat of activeBonus.bonus.stats) {
            const statName = stat.name as keyof typeof statsFromEquipment;
            if (statsFromEquipment[statName] !== undefined) {
                (statsFromEquipment[statName] as number) += stat.value;
            }
        }
    }

    let finalStats: Player['baseStats'] = {
        hp: baseStats.hp, // Current HP is carried over
        auraShield: baseStats.auraShield, // Current Aura Shield is carried over
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
    };

    // 3. Apply active effects (buffs/debuffs)
    const flatBuffs = player.activeEffects.filter(e => e.type === 'flat');
    const percentageBuffs = player.activeEffects.filter(e => e.type === 'percentage');

    for (const buff of flatBuffs) {
        const statName = buff.stat as keyof Player['baseStats'];
        if (finalStats[statName] !== undefined) {
            (finalStats[statName] as number) += buff.value;
        }
    }

    for (const buff of percentageBuffs) {
        const statName = buff.stat as keyof Player['baseStats'];
        if (finalStats[statName] !== undefined) {
            (finalStats[statName] as number) *= (1 + buff.value);
        }
    }

    // Ensure stats don't fall below zero where it makes sense
    finalStats.physicalAttack = Math.max(0, finalStats.physicalAttack);
    finalStats.physicalDefence = Math.max(0, finalStats.physicalDefence);
    finalStats.elementalAttack = Math.max(0, finalStats.elementalAttack);
    finalStats.elementalDefence = Math.max(0, finalStats.elementalDefence);
    finalStats.speed = Math.max(0, finalStats.speed);

    return finalStats;
};

export const playerStats = derived([playerStore, playerActiveSetBonuses], ([$player, $activeSetBonuses]) => {
    return calculateFinalStats($player, $activeSetBonuses);
});


export const playerActiveElements = derived(playerStore, ($player) => {
    const elements: string[] = [];
    $player.equipment.weapon_slots.forEach(weapon => {
        if (weapon && weapon.element) {
            elements.push(weapon.element);
        }
    });
    return elements;
});

export const playerExplorationAbilities = derived(playerStore, ($player) => {
    const abilities: { [key: string]: number } = {};

    const processItem = (item: Item | null) => {
        if (item && item.exploration) {
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

export const playerMastery = derived(playerStore, ($player) => {
    let totalMastery = 0;
    $player.equipment.weapon_slots.forEach(weapon => {
        if (weapon && weapon.mastery) {
            totalMastery += weapon.mastery;
        }
    });
    return totalMastery;
});
