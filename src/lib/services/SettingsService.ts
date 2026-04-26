import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { npcStore } from '$lib/stores/npcStore';
import { questStore } from '$lib/stores/questStore';
import { time } from '$lib/stores/timeStore';
import { getAllItems, addItems } from '$lib/services/InventoryService';
import { playerDev, devNpcState, devQuestState } from '$lib/data/player.dev';
import { checkQuestTriggers } from '../services/QuestService';
import * as AchievementService from './AchievementService';
import type { Item, ActiveEffect } from '$lib/types';
import { notificationStore } from '$lib/stores/notificationStore';
import { buildPresets } from '$lib/data/buildPresets';
import { createItem } from './ItemFactory';

/**
 * Replaces the player's inventory with a full set of all items in the game.
 */
export function addAllItems() {
    playerStore.update(p => {
        let newPlayer = { ...p, inventory: [] }; // Clear existing inventory
        const allItems = getAllItems();

        for (const item of allItems) {
            if (item.flags?.includes('stackable')) {
                newPlayer = addItems(newPlayer, item.id, 99, false);
            } else {
                newPlayer = addItems(newPlayer, item.id, 1, false);
            }
        }
        return newPlayer;
    });

    AchievementService.checkCollection();
}

/**
 * Loads a specific developer state for testing quests.
 */
export function loadTestState() {
    // 1. Force-set the stores with the complete dev state
    playerStore.set(playerDev);
    npcStore.set(devNpcState);
    questStore.set(devQuestState);

    // 2. After loading the new state, re-evaluate all quest triggers
    let player = get(playerStore);
    player = checkQuestTriggers(player);
    playerStore.set(player);
}

/**
 * Applies a powerful, temporary stat buff to the player for testing.
 */
export function applyDevBuff() {
    const currentTime = get(time);
    const duration = 999;

    const devBuffs: ActiveEffect[] = [
        { id: 'dev_phys_atk', name: 'God Mode', stat: 'physicalAttack', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_phys_def', name: 'God Mode', stat: 'physicalDefence', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_elem_atk', name: 'God Mode', stat: 'elementalAttack', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_elem_def', name: 'God Mode', stat: 'elementalDefence', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_crit', name: 'God Mode', stat: 'critChance', type: 'flat', value: 1, duration, source: 'Developer', expiryTime: currentTime + duration },
    ];
    notificationStore.addBuff('GodMode : Phy. ATK +1000', duration, "applied");
    notificationStore.addBuff('GodMode : Phy. DEF +1000', duration, "applied");
    notificationStore.addBuff('GodMode : Ele. ATK +1000', duration, "applied");
    notificationStore.addBuff('GodMode : Ele. DEF +1000', duration, "applied");
    notificationStore.addBuff('GodMode : Crit Chance +100%', duration, "applied");

    playerStore.update(p => {
        // Remove any existing dev buffs before applying new ones
        const existingEffects = p.activeEffects.filter(e => !e.id.startsWith('dev_'));
        return {
            ...p,
            activeEffects: [...existingEffects, ...devBuffs],
        };
    });
}

export function applyBuildPreset(presetId: string) {
    const preset = buildPresets.find(p => p.id === presetId);
    if (!preset) {
        console.error(`Build preset ${presetId} not found`);
        return;
    }

    playerStore.update(player => {
        const weaponItems = preset.weapons
            .map(id => createItem(id))
            .filter(w => w?.type === 'weapon');
        const relicItems = preset.relics
            .map(id => createItem(id))
            .filter(r => r?.type === 'relic');

        return {
            ...player,
            equipment: {
                weapon_slots: [
                    ...weaponItems,
                    ...Array(Math.max(0, 2 - weaponItems.length)).fill(null),
                ],
                relic_slots: [
                    ...relicItems,
                    ...Array(Math.max(0, 4 - relicItems.length)).fill(null),
                ],
            },
        };
    });

    notificationStore.addBuff(`Build: ${preset.name}`, 999, 'applied');
}
