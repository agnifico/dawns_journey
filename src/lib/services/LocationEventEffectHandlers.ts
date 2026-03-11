import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { questStore } from '$lib/stores/questStore';
import type { GameEffect, Player } from '$lib/types';
import { get } from 'svelte/store';
import { addItems, removeItemsByItemId } from './InventoryService';
import { getItemById } from '$lib/services/InventoryService';
import { game } from '$lib/game/game';
import { increaseFactionScore, decreaseFactionScore } from './FactionService';
import { toastStore } from '$lib/stores/toastStore';
import { notificationStore } from '$lib/stores/notificationStore';

type EffectHandler = (player: Player, effect: GameEffect, currentStats: any) => { newPlayer: Player, effectApplied: boolean, allEffectsApplied: boolean };

export const effectHandlers: { [key: string]: EffectHandler } = {
    RESTORE_HP: (player, effect, currentStats) => {
        let newPlayer = { ...player };
        let effectApplied = false;
        if (newPlayer.baseStats.hp < currentStats.maxHp) {
            newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + effect.value);
            effectApplied = true;
        }
        return { newPlayer, effectApplied, allEffectsApplied: true };
    },
    RESTORE_HP_FULL: (player, effect, currentStats) => {
        let newPlayer = { ...player };
        let effectApplied = false;
        if (newPlayer.baseStats.hp < currentStats.maxHp) {
            newPlayer.baseStats.hp = currentStats.maxHp;
            effectApplied = true;
        }
        return { newPlayer, effectApplied, allEffectsApplied: true };
    },
    RESTORE_AURA: (player, effect, currentStats) => {
        let newPlayer = { ...player };
        let effectApplied = false;
        if (newPlayer.baseStats.auraShield < currentStats.maxAuraShield) {
            newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.value);
            effectApplied = true;
        }
        return { newPlayer, effectApplied, allEffectsApplied: true };
    },
    give_item: (player, effect) => {
        const newPlayer = addItems(player, effect.itemId, effect.quantity);
        return { newPlayer, effectApplied: true, allEffectsApplied: true };
    },
    TAKE_ITEM: (player, effect) => {
        let newPlayer = { ...player };
        let allEffectsApplied = true;
        const matchingItems = newPlayer.inventory.filter(i => i.id === effect.itemId);
        if (matchingItems.length >= effect.quantity) {
            newPlayer = removeItemsByItemId(newPlayer, effect.itemId, effect.quantity);
            return { newPlayer, effectApplied: true, allEffectsApplied };
        } else {
            allEffectsApplied = false;
            const itemDetails = getItemById(effect.itemId);
            messageStore.addMessage(`You don't have ${effect.quantity} ${itemDetails?.name || 'item'}.`, ['System']);
            toastStore.warning(`You don't have ${effect.quantity} ${itemDetails?.name || 'item'}.`);
            return { newPlayer, effectApplied: false, allEffectsApplied };
        }
    },
    SWAP_ITEM: (player, effect) => {
        let newPlayer = { ...player };
        let allEffectsApplied = true;
        const matchingItems = newPlayer.inventory.filter(i => i.id === effect.takeItemId);
        if (matchingItems.length >= effect.takeQuantity) {
            newPlayer = removeItemsByItemId(newPlayer, effect.takeItemId, effect.takeQuantity);
            newPlayer = addItems(newPlayer, effect.giveItemId, effect.giveQuantity);
            return { newPlayer, effectApplied: true, allEffectsApplied };
        } else {
            allEffectsApplied = false;
            const itemDetails = getItemById(effect.takeItemId);
            messageStore.addMessage(`You don't have ${effect.takeQuantity} ${itemDetails?.name || 'item'} to swap.`, ['System']);
            toastStore.warning(`You don't have ${effect.quantity} ${itemDetails?.name || 'item'}.`);
            return { newPlayer, effectApplied: false, allEffectsApplied };
        }
    },
    add_tag: (player, effect) => {
        let newPlayer = { ...player };
        if (!newPlayer.worldTags.includes(effect.tag)) {
            newPlayer.worldTags.push(effect.tag);
        }
        return { newPlayer, effectApplied: true, allEffectsApplied: true };
    },
    complete_quest_stage: (player) => {
        questStore.advanceQuestStage(get(questStore).activeQuestId);
        return { newPlayer: player, effectApplied: true, allEffectsApplied: true };
    },
    set_quest_state: (player, effect) => {
        if (effect.state === 'COMPLETED' || effect.state === 'FAILED') {
            questStore.setQuestState(effect.questId, 'REPORT_PENDING', effect.state);
        } else {
            questStore.setQuestState(effect.questId, effect.state);
        }
        return { newPlayer: player, effectApplied: true, allEffectsApplied: true };
    },
    add_reputation: (player, effect) => {
        // Route through FactionService so rival penalties, rank-up checks,
        // and notifications all fire correctly.
        if (effect.amount > 0) {
            increaseFactionScore(effect.faction, effect.amount);
        } else if (effect.amount < 0) {
            decreaseFactionScore(effect.faction, Math.abs(effect.amount));
        }
        return { newPlayer: player, effectApplied: true, allEffectsApplied: true };
    },
    switch_map: (player, effect) => {
        game.switchMap(effect.mapId, { x: effect.x, y: effect.y });
        return { newPlayer: player, effectApplied: true, allEffectsApplied: true };
    },
    add_world_resonance: (player, effect) => {
        const newPlayer = {
            ...player,
            worldResonance: (player.worldResonance ?? 0) + effect.amount,
        };
        // notificationStore.addWorldResonance(effect.amount);
        toastStore.success(`World Resonance +${effect.amount}`);
        messageStore.addMessage(`+${effect.amount} World Resonance.`, ['World']);
        return { newPlayer, effectApplied: true, allEffectsApplied: true };
    },
};