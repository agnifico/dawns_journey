import { writable, derived } from 'svelte/store';
import type { Player, Item } from '$lib/types';
import player from '$lib/data/player';
import { getEquippedStats } from '../services/ItemService';

const initialState: Player = player;

export const playerStore = writable<Player>(initialState);

export const playerStats = derived(playerStore, ($player) => {
    return getEquippedStats($player);
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