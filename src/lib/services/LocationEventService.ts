import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import type { GameEffect } from '$lib/types';
import { get } from 'svelte/store';
import { checkQuestTriggers } from './QuestService';
import { effectHandlers } from './LocationEventEffectHandlers';

export function triggerEventEffect(eventId: string, effects: GameEffect[], message: string) {
    if (!effects) return;

    playerStore.update(player => {
        let newPlayer = { ...player };
        const currentStats = get(playerStats);
        let messageSent = false;
        let allEffectsApplied = true;

        for (const effect of effects) {
            const handler = effectHandlers[effect.type];
            if (handler) {
                const result = handler(newPlayer, effect, currentStats);
                newPlayer = result.newPlayer;
                if (result.effectApplied && !messageSent && result.allEffectsApplied && message) {
                    messageStore.addMessage(message, ['System']);
                    messageSent = true;
                }
                if (!result.allEffectsApplied) {
                    allEffectsApplied = false;
                }
            }
        }

        if (allEffectsApplied) {
            if (!newPlayer.locationEventHistory) {
                newPlayer.locationEventHistory = {};
            }
            const currentCount = newPlayer.locationEventHistory[eventId] || 0;
            newPlayer.locationEventHistory[eventId] = currentCount + 1;
        }
        
        newPlayer = checkQuestTriggers(newPlayer);

        return newPlayer;
    });
}
