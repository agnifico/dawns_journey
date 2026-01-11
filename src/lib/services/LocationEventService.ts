import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { questStore } from '$lib/stores/questStore';
import { openFactionChoiceModal } from '$lib/stores/uiStore';
import type { GameEffect, Player } from '$lib/types';
import { get } from 'svelte/store';
import { addItem, removeItem } from './ItemService';
import { getItemById } from '$lib/services/ItemDataService';

export function triggerEventEffect(eventId: string, effects: GameEffect[], message: string) {
    if (!effects) return;

    playerStore.update(player => {
        let newPlayer = { ...player };
        const currentStats = get(playerStats);
        let messageSent = false; // To ensure message is sent only once
        let allEffectsApplied = true;

        for (const effect of effects) {
            let effectApplied = false;
            switch (effect.type) {
                case 'RESTORE_HP':
                    if (newPlayer.baseStats.hp < currentStats.maxHp) {
                        newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + effect.value);
                        effectApplied = true;
                    }
                    break;
                case 'RESTORE_HP_FULL':
                    if (newPlayer.baseStats.hp < currentStats.maxHp) {
                        newPlayer.baseStats.hp = currentStats.maxHp;
                        effectApplied = true;
                    }
                    break;
                case 'RESTORE_AURA':
                    if (newPlayer.baseStats.auraShield < currentStats.maxAuraShield) {
                        newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.value);
                        effectApplied = true;
                    }
                    break;
                case 'GIVE_ITEM':
                case 'give_item':
                    newPlayer = addItem(newPlayer, effect.itemId, effect.quantity);
                    effectApplied = true;
                    break;
                case 'TAKE_ITEM':
                    const inventoryItem = newPlayer.inventory.find(i => i.itemId === effect.itemId);
                    if (inventoryItem && inventoryItem.amount >= effect.quantity) {
                        newPlayer = removeItem(newPlayer, effect.itemId, effect.quantity);
                        effectApplied = true;
                    } else {
                        allEffectsApplied = false;
                        const itemDetails = getItemById(effect.itemId);
                        messageStore.addMessage(`You don't have ${effect.quantity} ${itemDetails?.name || 'item'}.`, ['System']);
                    }
                    break;
                case 'SWAP_ITEM':
                    const itemToTake = newPlayer.inventory.find(i => i.itemId === effect.takeItemId);
                    if (itemToTake && itemToTake.amount >= effect.takeQuantity) {
                        newPlayer = removeItem(newPlayer, effect.takeItemId, effect.takeQuantity);
                        newPlayer = addItem(newPlayer, effect.giveItemId, effect.giveQuantity);
                        effectApplied = true;
                    } else {
                        allEffectsApplied = false;
                        const itemDetails = getItemById(effect.takeItemId);
                        messageStore.addMessage(`You don't have ${effect.takeQuantity} ${itemDetails?.name || 'item'} to swap.`, ['System']);
                    }
                    break;
                case 'trigger_faction_choice':
                    openFactionChoiceModal();
                    effectApplied = true;
                    break;
                case 'add_tag':
                    if (!newPlayer.worldTags.includes(effect.tag)) {
                        newPlayer.worldTags.push(effect.tag);
                    }
                    effectApplied = true;
                    break;
                case 'complete_quest_stage':
                    questStore.advanceQuestStage(get(questStore).activeQuestId);
                    effectApplied = true;
                    break;
            }
            if (effectApplied && !messageSent && allEffectsApplied) {
                messageStore.addMessage(message, ['System']);
                messageSent = true;
            }
        }

        if (allEffectsApplied) {
            if (!newPlayer.locationEventHistory) {
                newPlayer.locationEventHistory = {};
            }
            const currentCount = newPlayer.locationEventHistory[eventId] || 0;
            newPlayer.locationEventHistory[eventId] = currentCount + 1;
        }

        return newPlayer;
    });
}

export function handleFactionChoice(faction: 'Solis Saints' | 'Shadowhand') {
    playerStore.update(player => {
        let newPlayer = { ...player };
        
        if (faction === 'Solis Saints') {
            newPlayer.factionReputation['Solis Saints'] = (newPlayer.factionReputation['Solis Saints'] || 0) + 10;
            questStore.setQuestState('guinevere_sword_4', 'COMPLETED');
            questStore.setQuestState('akari_sword_2', 'FAILED');
            if (!newPlayer.worldTags.includes('chose_solis_saints')) {
                newPlayer.worldTags.push('chose_solis_saints');
            }
            messageStore.addMessage('You have sided with the Solis Saints.', ['World', 'Update']);

        } else if (faction === 'Shadowhand') {
            newPlayer.factionReputation['Shadowhand'] = (newPlayer.factionReputation['Shadowhand'] || 0) + 10;
            questStore.setQuestState('akari_sword_2', 'COMPLETED');
            questStore.setQuestState('guinevere_sword_4', 'FAILED');
            if (!newPlayer.worldTags.includes('chose_shadowhand')) {
                newPlayer.worldTags.push('chose_shadowhand');
            }
            messageStore.addMessage('You have sided with the Shadowhand.', ['World', 'Update']);
        }

        return newPlayer;
    });
}
