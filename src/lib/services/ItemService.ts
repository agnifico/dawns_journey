import { get } from 'svelte/store';
import type { Player, Item, Weapon, Relic, ActiveEffect } from '$lib/types';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { notificationStore } from '$lib/stores/notificationStore';
import { getItemById } from '$lib/services/ItemDataService';
import { time } from '$lib/stores/timeStore';

/**
 * Consumes an item, applying its effects and removing it from inventory.
 */
export function useItem(itemId: string) {
    playerStore.update(player => {
        const itemToUse = getItemById(itemId);
        const hasInstantEffects = itemToUse?.effects && itemToUse.effects.length > 0;
        const hasActiveEffects = itemToUse?.activeEffects && itemToUse.activeEffects.length > 0;

        if (!itemToUse || (!hasInstantEffects && !hasActiveEffects)) {
            messageStore.addMessage(`${itemToUse?.name || 'Item'} has no effect.`, ['System']);
            return player;
        }

        const currentStats = get(playerStats);
        let newPlayer = { ...player };

        // Handle instant effects (e.g., healing)
        if (hasInstantEffects) {
            itemToUse.effects.forEach(effect => {
                if (effect.hp) {
                    newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + effect.hp);
                }
                if (effect.auraShield) {
                    newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.auraShield);
                }
            });
        }

        // Handle active effects (buffs/debuffs)
        if (hasActiveEffects) {
            const currentTime = get(time);
            itemToUse.activeEffects.forEach(effect => {
                // Remove any existing buff with the same ID to refresh duration
                newPlayer.activeEffects = newPlayer.activeEffects.filter(e => e.id !== effect.id);

                // Add the new effect with its expiry time
                const newEffect: ActiveEffect = {
                    ...effect,
                    expiryTime: currentTime + effect.duration,
                };
                newPlayer.activeEffects.push(newEffect);
                messageStore.addMessage(`${effect.name} applied.`, ['System']);
            });
        }

        // Remove item from inventory
        const newInventory = [...newPlayer.inventory];
        const inventoryItemIndex = newInventory.findIndex(i => i.itemId === itemId);
        if (inventoryItemIndex !== -1) {
            if (newInventory[inventoryItemIndex].amount > 1) {
                newInventory[inventoryItemIndex].amount -= 1;
            } else {
                newInventory.splice(inventoryItemIndex, 1);
            }
            newPlayer.inventory = newInventory;
            messageStore.addMessage(`Used ${itemToUse.name}.`, ['System']);
            notificationStore.add('item_used', itemToUse, 1);
        }

        return newPlayer;
    });
}

/**
 * Equips an item from the inventory.
 */
export function equipItem(itemId: string) {
    playerStore.update(player => {
        const itemToEquip = getItemById(itemId);
        if (!itemToEquip || (itemToEquip.type !== 'weapon' && itemToEquip.type !== 'relic')) {
            return player;
        }

        let newPlayer = { ...player };
        let newInventory = [...newPlayer.inventory];

        const inventoryItemIndex = newInventory.findIndex(i => i.itemId === itemId);
        if (inventoryItemIndex === -1) return player;

        if (newInventory[inventoryItemIndex].amount > 1) {
            newInventory[inventoryItemIndex].amount -= 1;
        } else {
            newInventory.splice(inventoryItemIndex, 1);
        }
        newPlayer.inventory = newInventory;

        let unequippedItem: Item | null = null;
        if (itemToEquip.type === 'weapon') {
            const emptySlotIndex = newPlayer.equipment.weapon_slots.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1) {
                newPlayer.equipment.weapon_slots[emptySlotIndex] = itemToEquip as Weapon;
            } else {
                unequippedItem = newPlayer.equipment.weapon_slots[0];
                newPlayer.equipment.weapon_slots[0] = itemToEquip as Weapon;
            }
        } else if (itemToEquip.type === 'relic') {
            const emptySlotIndex = newPlayer.equipment.relic_slots.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1) {
                newPlayer.equipment.relic_slots[emptySlotIndex] = itemToEquip as Relic;
            } else {
                unequippedItem = newPlayer.equipment.relic_slots[0];
                newPlayer.equipment.relic_slots[0] = itemToEquip as Relic;
            }
        }

        if (unequippedItem) {
            const existingStackIndex = newPlayer.inventory.findIndex(i => i.itemId === unequippedItem.id);
            if (existingStackIndex !== -1) {
                newPlayer.inventory[existingStackIndex].amount += 1;
            } else {
                newPlayer.inventory.push({ itemId: unequippedItem.id, amount: 1 });
            }
            notificationStore.add('item_unequipped', unequippedItem, 1);
        }

        messageStore.addMessage(`Equipped ${itemToEquip.name}.`, ['System']);
        notificationStore.add('item_equipped', itemToEquip, 1);
        return newPlayer;
    });
}

/**
 * Unequips an item from an equipment slot.
 */
export function unequipItem(slotType: 'weapon_slots' | 'relic_slots', slotIndex: number) {
    playerStore.update(player => {
        let newPlayer = { ...player };
        const equippedItem = newPlayer.equipment[slotType][slotIndex];

        if (equippedItem) {
            const existingItemIndex = newPlayer.inventory.findIndex(i => i.itemId === equippedItem.id);
            if (existingItemIndex !== -1) {
                newPlayer.inventory[existingItemIndex].amount += 1;
            } else {
                newPlayer.inventory.push({ itemId: equippedItem.id, amount: 1 });
            }

            newPlayer.equipment[slotType][slotIndex] = null;

            messageStore.addMessage(`Unequipped ${equippedItem.name}.`, ['System']);
            notificationStore.add('item_unequipped', equippedItem, 1);
        }
        return newPlayer;
    });
}



export function addItem(player: Player, itemId: string, amount: number): Player {
    const item = getItemById(itemId);
    if (item) {
        notificationStore.add('item_received', item, amount);
    }

    const newInventory = [...player.inventory];
    const existingItemIndex = newInventory.findIndex(i => i.itemId === itemId);

    if (existingItemIndex !== -1) {
        newInventory[existingItemIndex].amount += amount;
    } else {
        newInventory.push({ itemId, amount });
    }

    return { ...player, inventory: newInventory };
}

export function removeItem(player: Player, itemId: string, amount: number): Player {
    const item = getItemById(itemId);
    if (item) {
        notificationStore.add('item_used', item, amount);
    }

    const newInventory = [...player.inventory];
    const existingItemIndex = newInventory.findIndex(i => i.itemId === itemId);

    if (existingItemIndex !== -1) {
        newInventory[existingItemIndex].amount -= amount;
        if (newInventory[existingItemIndex].amount <= 0) {
            // Remove the item stack if amount is zero or less
            newInventory.splice(existingItemIndex, 1);
        }
    }

    return { ...player, inventory: newInventory };
}
