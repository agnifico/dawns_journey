import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { time } from '$lib/stores/timeStore';
import { items as baseItems } from '$lib/data/items';
import { generalItems } from '$lib/data/generalItems';
import { playerDev } from '$lib/data/player.dev';
import type { InventoryItem, ActiveEffect } from '$lib/types';

/**
 * Replaces the player's inventory with a full set of all items in the game.
 */
...
    }));
}

/**
 * Loads a specific developer state for testing quests.
 */
export function loadTestState() {
    playerStore.set(playerDev);
}

/**
 * Applies a powerful, temporary stat buff to the player for testing.
 */
export function applyDevBuff() {
    const currentTime = get(time);
...
    const duration = 999;

    const devBuffs: ActiveEffect[] = [
        { id: 'dev_phys_atk', name: 'Dev Buff', stat: 'physicalAttack', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_phys_def', name: 'Dev Buff', stat: 'physicalDefence', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_elem_atk', name: 'Dev Buff', stat: 'elementalAttack', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_elem_def', name: 'Dev Buff', stat: 'elementalDefence', type: 'flat', value: 1000, duration, source: 'Developer', expiryTime: currentTime + duration },
        { id: 'dev_crit', name: 'Dev Buff', stat: 'critChance', type: 'percentage', value: 1, duration, source: 'Developer', expiryTime: currentTime + duration },
    ];

    playerStore.update(p => {
        // Remove any existing dev buffs before applying new ones
        const existingEffects = p.activeEffects.filter(e => !e.id.startsWith('dev_'));
        return {
            ...p,
            activeEffects: [...existingEffects, ...devBuffs],
        };
    });
}