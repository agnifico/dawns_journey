import type { Player } from '$lib/types';
import { messageStore } from '$lib/stores/messageStore';

/**
 * Processes the player's active effects, removing any that have expired.
 * @param player The current player object.
 * @param currentTime The current game time (total steps).
 * @returns The player object with expired buffs removed.
 */
export function processBuffs(player: Player, currentTime: number): Player {
    const newPlayer = { ...player };
    const activeEffects = newPlayer.activeEffects;
    const effectsToRemove: string[] = [];

    const remainingEffects = activeEffects.filter(effect => {
        if (effect.expiryTime && currentTime >= effect.expiryTime) {
            effectsToRemove.push(effect.name);
            return false;
        }
        return true;
    });

    if (effectsToRemove.length > 0) {
        newPlayer.activeEffects = remainingEffects;
        messageStore.addMessage(`${effectsToRemove.join(', ')} has worn off.`, ['System']);
    }

    return newPlayer;
}
