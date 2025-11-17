import { get } from 'svelte/store';
import type { Player, Item, Weapon, Relic } from '$lib/types';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { getItemById } from '$lib/stores/itemStore';

/**
 * Consumes an item, applying its effects and removing it from inventory.
 */
export function useItem(itemId: string) {
    playerStore.update(player => {
        const itemToUse = getItemById(itemId);
        if (!itemToUse || !itemToUse.effects || !Array.isArray(itemToUse.effects) || itemToUse.effects.length === 0) {
            messageStore.addMessage(`${itemToUse?.name || 'Item'} has no effect.`, ['System']);
            return player;
        }

        const currentStats = get(playerStats);
        let newPlayer = { ...player };

        itemToUse.effects.forEach(effect => {
            if (effect.hp) {
                newPlayer.baseStats.hp = Math.min(currentStats.maxHp, newPlayer.baseStats.hp + effect.hp);
            }
            if (effect.auraShield) {
                newPlayer.baseStats.auraShield = Math.min(currentStats.maxAuraShield, newPlayer.baseStats.auraShield + effect.auraShield);
            }
        });

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
        }

        messageStore.addMessage(`Equipped ${itemToEquip.name}.`, ['System']);
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
        }
        return newPlayer;
    });
}

export const getEquippedStats = (player: Player): Player['baseStats'] => {
    const baseStats = player.baseStats;
    const equippedBonuses = {
        maxHp: 0,
        maxAuraShield: 0,
        physicalAttack: 0,
        physicalDefence: 0,
        elementalAttack: 0,
        elementalDefence: 0,
        speed: 0,
        evasion: 0,
        critChance: 0,
        critDamage: 0,
    };

    const allEquipment: (Item | null)[] = [...player.equipment.weapon_slots, ...player.equipment.relic_slots];

    for (const item of allEquipment) {
        if (item && item.stats) {
            for (const stat of item.stats) {
                const statName = stat.name as keyof typeof equippedBonuses;
                if (equippedBonuses[statName] !== undefined) {
                    (equippedBonuses[statName] as number) += stat.value;
                }
            }
        }
    }

    return {
        hp: baseStats.hp, // Keep current HP
        auraShield: baseStats.auraShield, // Keep current Aura Shield
        maxHp: baseStats.maxHp + equippedBonuses.maxHp,
        maxAuraShield: baseStats.maxAuraShield + equippedBonuses.maxAuraShield,
        physicalAttack: baseStats.physicalAttack + equippedBonuses.physicalAttack,
        physicalDefence: baseStats.physicalDefence + equippedBonuses.physicalDefence,
        elementalAttack: baseStats.elementalAttack + equippedBonuses.elementalAttack,
        elementalDefence: baseStats.elementalDefence + equippedBonuses.elementalDefence,
        speed: baseStats.speed + equippedBonuses.speed,
        evasion: baseStats.evasion + equippedBonuses.evasion,
        critChance: baseStats.critChance + equippedBonuses.critChance,
        critDamage: baseStats.critDamage + equippedBonuses.critDamage,
    };
};

export function addItem(player: Player, itemId: string, amount: number): Player {
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
