import { get } from 'svelte/store';
import type { GameEvent } from '$lib/types';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import events from '$lib/data/events.json';

export function handleEvent(eventId: string) {
    const event = (events.events as GameEvent[]).find(e => e.id === eventId);
    if (!event) {
        console.error(`Event with id ${eventId} not found.`);
        return;
    }

    messageStore.addMessage(event.message, ['World']);

    playerStore.update(player => {
        let newPlayer = { ...player };
        const currentStats = get(playerStats);

        for (const effect of event.effects) {
            switch (effect.type) {
                case 'restore_hp_percentage':
                    newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + (currentStats.maxHp * effect.value));
                    break;
                case 'give_aura':
                    newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.value);
                    break;
                // Add other event effects here
            }
        }
        return newPlayer;
    });
}