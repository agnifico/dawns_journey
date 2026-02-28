import { playerStore } from '$lib/stores/playerStore';
import { craftingRecipes } from '$lib/data/craftingRecipes';
import {
    addItems,
    countInventoryItem,
    hasItem,
    removeItemsByItemId
} from './InventoryService';
import { messageStore } from '$lib/stores/messageStore';
import { notificationStore } from '$lib/stores/notificationStore';
import type { Player } from '$lib/types';
import { itemDictionary } from '$lib/data/items';

/**
 * Attempts to craft the item specified by the recipe ID.
 * Checks inventory, consumes ingredients, and adds the output item.
 *
 * @param recipeId The ID of the crafting recipe to execute.
 */
export function craft(recipeId: string): void {
    const recipe = craftingRecipes.find(r => r.id === recipeId);
    if (!recipe) {
        messageStore.addMessage(`Invalid recipe.`, ['System']);
        console.warn(`[CraftingService.craft] Unknown recipe ID: ${recipeId}`);
        return;
    }

    playerStore.update((player: Player): Player => {
        // 1. Check if player has all required ingredients
        const hasAllIngredients = recipe.ingredients.every(ingredient =>
            hasItem(player.inventory, ingredient.itemId, ingredient.quantity)
        );

        if (!hasAllIngredients) {
            messageStore.addMessage(`You don\'t have the required ingredients for ${recipe.name}.`, ['System']);
            // notificationStore.add('item_removed', { name: 'Missing Ingredients' } as any, 0);
            return player; // Return original player state without changes
        }

        // 2. Consume ingredients
        let newPlayer = player;
        for (const ingredient of recipe.ingredients) {
            newPlayer = removeItemsByItemId(newPlayer, ingredient.itemId, ingredient.quantity);
        }

        // 3. Add output item
        const outputItem = itemDictionary[recipe.output.itemId];
        newPlayer = addItems(newPlayer, recipe.output.itemId, recipe.output.quantity);

        messageStore.addMessage(`You crafted ${recipe.name}!`, ['System']);
        // notificationStore.add('item_received', outputItem, recipe.output.quantity);
        return newPlayer;
    });
}
