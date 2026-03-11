import { get } from 'svelte/store';
import type { Player, Item, Weapon, Relic, ActiveEffect } from '$lib/types';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { notificationStore } from '$lib/stores/notificationStore';
import { time } from '$lib/stores/timeStore';
import * as AchievementService from './AchievementService';
import { items } from '../data/items';
import { weapons } from '../data/weapons';
import { relics } from '../data/relics';
import { createItem, createItems } from './ItemFactory';
import { activeItem } from '$lib/stores/uiStore'; // Import activeItem
import { toastStore } from '$lib/stores/toastStore';

// ---------------------------------------------------------------------------
// Item data lookup (merged from ItemDataService)
// ---------------------------------------------------------------------------

const allItems: Item[] = [...items];
const itemMap = new Map(allItems.map(item => [item.id, item]));

/** Returns every item template in the game. */
export function getAllItems(): Item[] {
    return allItems;
}

/**
 * Returns the static item *template* for a given template ID.
 * This is the source-of-truth definition — it does NOT have an instanceId.
 * Use createItem() when you need a live inventory instance.
 */
export function getItemById(id: string): Item | undefined {
    return itemMap.get(id);
}

// ---------------------------------------------------------------------------
// Inventory read helpers
// ---------------------------------------------------------------------------

/**
 * Count how many instances of a template item the player carries.
 * Replaces the old `inventoryItem.amount` pattern.
 *
 * @example
 * const seedCount = countInventoryItem(player.inventory, 'wheat_seed');
 */
export function countInventoryItem(inventory: Item[], itemId: string): number {
    return inventory.filter(i => i.id === itemId).length;
}

/**
 * Returns true if the player has at least `amount` of the given item.
 *
 * @example
 * if (!hasItem(player.inventory, 'compost', 1)) { ... }
 */
export function hasItem(inventory: Item[], itemId: string, amount = 1): boolean {
    return countInventoryItem(inventory, itemId) >= amount;
}

/**
 * Returns all inventory instances of a given template ID.
 *
 * @example
 * const allSeeds = getInventoryItemsByTemplateId(player.inventory, 'wheat_seed');
 */
export function getInventoryItemsByTemplateId(inventory: Item[], itemId: string): Item[] {
    return inventory.filter(i => i.id === itemId);
}

/**
 * Returns the first inventory instance of a given template ID, or undefined.
 *
 * @example
 * const seed = getFirstInventoryItem(player.inventory, 'wheat_seed');
 */
export function getFirstInventoryItem(inventory: Item[], itemId: string): Item | undefined {
    return inventory.find(i => i.id === itemId);
}

/**
 * Returns a single inventory item by its unique instance ID.
 *
 * @example
 * const item = getInventoryItemByInstanceId(player.inventory, someInstanceId);
 */
export function getInventoryItemByInstanceId(inventory: Item[], instanceId: string): Item | undefined {
    return inventory.find(i => i.instanceId === instanceId);
}

// ---------------------------------------------------------------------------
// Inventory write helpers (pure — take and return Player)
// ---------------------------------------------------------------------------

/**
 * Adds `amount` new instances of `itemId` to the player's inventory.
 * Pass `showNotification = false` to suppress the pickup toast.
 */
export function addItems(player: Player, itemId: string, amount: number, showNotification = true): Player {
    const itemTemplate = getItemById(itemId);
    if (!itemTemplate) {
        console.warn(`[InventoryService.addItems] Unknown item template: ${itemId}`);
        return player;
    }

    if (showNotification) {
        notificationStore.add('item_received', itemTemplate, amount);
    }

    const newItems = createItems(itemId, amount);
    return { ...player, inventory: [...player.inventory, ...newItems] };
}

/**
 * Removes up to `amount` instances of `itemId` from the inventory (oldest first).
 * If fewer than `amount` exist, removes all of them without error.
 */
export function removeItemsByItemId(player: Player, itemId: string, amount: number): Player {
    let amountToRemove = amount;
    const newInventory = [...player.inventory];

    for (let i = newInventory.length - 1; i >= 0; i--) {
        if (amountToRemove === 0) break;
        if (newInventory[i].id === itemId) {
            newInventory.splice(i, 1);
            amountToRemove--;
        }
    }
    notificationStore.add('item_removed', player.inventory.find(i => i.id === itemId), amount);
    return { ...player, inventory: newInventory };
}

/**
 * Removes a single item instance by its unique instanceId.
 */
export function removeItemByInstanceId(player: Player, instanceId: string): Player {
    let inventoryItemIndex = player.inventory.findIndex(i => i.instanceId === instanceId);
    const itemToUse = player.inventory[inventoryItemIndex];
    notificationStore.add('item_removed', itemToUse, 1);
    // notificationStore.addBuff('lolcats', 50, 'applied');
    return { ...player, inventory: player.inventory.filter(i => i.instanceId !== instanceId) };
}

// ---------------------------------------------------------------------------
// Store-mutating actions (called from UI / game logic)
// ---------------------------------------------------------------------------

/**
 * Consumes an item from the player's inventory, applying its effects.
 * @param instanceId The unique instanceId of the item to use.
 */
export function useItem(instanceId: string) {
    playerStore.update(player => {
        const inventoryItemIndex = player.inventory.findIndex(i => i.instanceId === instanceId);
        if (inventoryItemIndex === -1) return player;

        const itemToUse = player.inventory[inventoryItemIndex];
        const hasInstantEffects = itemToUse?.effects && itemToUse.effects.length > 0;
        const hasActiveEffects = itemToUse?.activeEffects && itemToUse.activeEffects.length > 0;

        if (!itemToUse || (!hasInstantEffects && !hasActiveEffects)) {
            messageStore.addMessage(`${itemToUse?.name || 'Item'} has no effect.`, ['System']);
            return player;
        }

        const currentStats = get(playerStats);
        let newPlayer = { ...player };

        if (hasInstantEffects) {
            itemToUse.effects.forEach(effect => {
                if (effect.hp) newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + effect.hp);
                if (effect.auraShield) newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.auraShield);
            });
        }

        if (hasActiveEffects) {
            const currentTime = get(time);
            itemToUse.activeEffects.forEach(effect => {
                newPlayer.activeEffects = newPlayer.activeEffects.filter(e => e.id !== effect.id);
                const newEffect: ActiveEffect = { ...effect, expiryTime: currentTime + effect.duration };
                newPlayer.activeEffects.push(newEffect);
                messageStore.addMessage(`${effect.name} applied.`, ['System']);
                notificationStore.addBuff(effect.name,effect.duration,"applied");
            });
        }

        // In the instanced system every item is a single instance — always remove by instanceId.
        newPlayer = removeItemByInstanceId(newPlayer, instanceId);
        messageStore.addMessage(`Used ${itemToUse.name}.`, ['System']);
        
        // Update activeItem in uiStore after using an item
        const remainingItemsOfSameType = newPlayer.inventory.filter(i => i.id === itemToUse.id);
        if (remainingItemsOfSameType.length > 0) {
            activeItem.set(remainingItemsOfSameType[0]);
        } else {
            activeItem.set(null);
        }

        return newPlayer;
    });
}

/**
 * Equips an item from the inventory into the correct equipment slot.
 * @param instanceId The unique instanceId of the item to equip.
 */
export function equipItem(instanceId: string) {
    playerStore.update(player => {
        const inventoryItemIndex = player.inventory.findIndex(i => i.instanceId === instanceId);
        if (inventoryItemIndex === -1) return player;

        const itemToEquip = player.inventory[inventoryItemIndex];
        if (itemToEquip.type !== 'weapon' && itemToEquip.type !== 'relic') return player;

        // Flag conflict check
        if (itemToEquip.flags && itemToEquip.flags.length > 0) {
            const specialFlags = ['24px', 'legendary', 'special'];
            let equippedFlags = player.equipment.relic_slots
                .filter(Boolean)
                .flatMap(r => r.flags || [])
                .filter(f => !specialFlags.includes(f));

            const conflict = itemToEquip.flags.some(flag => equippedFlags.includes(flag));
            if (conflict) {
                messageStore.addMessage(`You can only equip one ${itemToEquip.flags.join(', ')} at a time.`, ['System']);
                toastStore.warning(`You can only equip one ${itemToEquip.flags.join(', ')} at a time.`);
                return player;
            }
        }

        let newPlayer = { ...player };
        newPlayer.inventory.splice(inventoryItemIndex, 1);

        let unequippedItem: Item | null = null;
        const slots = itemToEquip.type === 'weapon'
            ? newPlayer.equipment.weapon_slots
            : newPlayer.equipment.relic_slots;
        const emptySlotIndex = slots.findIndex(slot => slot === null);

        if (emptySlotIndex !== -1) {
            slots[emptySlotIndex] = itemToEquip as any;
        } else {
            unequippedItem = slots[0];
            slots[0] = itemToEquip as any;
        }

        if (unequippedItem) {
            newPlayer.inventory.push(unequippedItem);
            notificationStore.add('item_unequipped', unequippedItem, 1);
        }

        messageStore.addMessage(`Equipped ${itemToEquip.name}.`, ['System', 'Player']);
        notificationStore.add('item_equipped', itemToEquip, 1);

        return newPlayer;
    });
    AchievementService.checkCollection();
}

/**
 * Unequips an item from an equipment slot back into inventory.
 */
export function unequipItem(slotType: 'weapon_slots' | 'relic_slots', slotIndex: number) {
    playerStore.update(player => {
        const equippedItem = player.equipment[slotType][slotIndex];
        if (!equippedItem) return player;

        let newPlayer = { ...player };
        newPlayer.equipment[slotType][slotIndex] = null;
        newPlayer.inventory.push(equippedItem);

        messageStore.addMessage(`Unequipped ${equippedItem.name}.`, ['System']);
        notificationStore.add('item_unequipped', equippedItem, 1);

        return newPlayer;
    });
}