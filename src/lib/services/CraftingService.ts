import { playerStore } from '$lib/stores/playerStore';
import { craftingRecipes } from '$lib/data/craftingRecipes';
import { materialRecipes } from '$lib/data/materialRecipes';
import {
    addItems,
    hasItem,
    removeItemsByItemId
} from './InventoryService';
import { gainExperience } from './SkillService';
import { messageStore } from '$lib/stores/messageStore';
import { notificationStore } from '$lib/stores/notificationStore';
import type { Player } from '$lib/types';
import { itemDictionary } from '$lib/data/items';
import { toastStore } from '$lib/stores/toastStore';

/**
 * Returns the player's level in a given skill, or 1 as a safe default.
 */
function getSkillLevel(player: Player, skillId: string): number {
    return player.skills.find((s: any) => s.id === skillId)?.level ?? 1;
}

/**
 * Attempts to craft the item specified by the recipe ID.
 *
 * Checks:
 *   1. Recipe exists.
 *   2. Player meets the crafting level requirement (requiredLevel, default 1).
 *   3. Player has all required ingredients.
 *
 * On success:
 *   - Consumes ingredients.
 *   - Adds output item to inventory.
 *   - Awards crafting XP (xpYield, default 0).
 *
 * @param recipeId The ID of the crafting recipe to execute.
 */
export function craft(recipeId: string): void {
    const recipe = craftingRecipes.find(r => r.id === recipeId) || materialRecipes.find(r => r.id === recipeId);
    if (!recipe) {
        messageStore.addMessage(`Invalid recipe.`, ['System']);
        console.warn(`[CraftingService.craft] Unknown recipe ID: ${recipeId}`);
        return;
    }

    const requiredLevel = recipe.requiredLevel ?? 1;
    const xpYield = recipe.xpYield ?? 0;
    const skillId = recipe.skillId ?? 'crafting';

    playerStore.update((player: Player): Player => {
        // 1. Level check
        const skillLevel = getSkillLevel(player, skillId);
        if (skillLevel < requiredLevel) {
            messageStore.addMessage(
                `You need Crafting level ${requiredLevel} to craft ${recipe.name}.`,
                ['System']
            );
            return player;
        }

        // 2. Ingredient check
        const hasAllIngredients = recipe.ingredients.every(ingredient =>
            hasItem(player.inventory, ingredient.itemId, ingredient.quantity)
        );

        if (!hasAllIngredients) {
            messageStore.addMessage(
                `You don't have the required ingredients for ${recipe.name}.`,
                ['System']
            );
            return player;
        }

        // 3. Consume ingredients
        let newPlayer = player;
        for (const ingredient of recipe.ingredients) {
            newPlayer = removeItemsByItemId(newPlayer, ingredient.itemId, ingredient.quantity);
        }

        // 4. Add output item
        const outputItem = itemDictionary[recipe.output.itemId];
        newPlayer = addItems(newPlayer, recipe.output.itemId, recipe.output.quantity);
        // if (outputItem) {
        //     notificationStore.add('item_received', outputItem, recipe.output.quantity);
        // }

        messageStore.addMessage(`You crafted ${recipe.name}!`, ['World']);
        toastStore.success(`You crafted ${recipe.name}!`);

        // 5. Award skill XP (routes to the correct skill via recipe.skillId)
        if (xpYield > 0) {
            newPlayer = gainExperience(newPlayer, skillId, xpYield);
        }

        return newPlayer;
    });
}