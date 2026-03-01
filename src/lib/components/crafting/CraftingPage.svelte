<script lang="ts">
	import { craftingRecipes, type CraftingRecipe } from '$lib/data/craftingRecipes';
	import { craft } from '$lib/services/CraftingService';
	import { playerStore } from '$lib/stores/playerStore';
	import { hasItem } from '$lib/services/InventoryService';
	import { itemDictionary } from '$lib/data/items';
	import Notification from '$lib/components/Notification.svelte';

	let recipes = craftingRecipes;

	function handleCraft(recipeId: string) {
		craft(recipeId);
	}

	function canCraft(recipe: CraftingRecipe): boolean {
		return recipe.ingredients.every((ing) =>
			hasItem($playerStore.inventory, ing.itemId, ing.quantity)
		);
	}
</script>

<div class="crafting-container">
	<h2>Crafting</h2>
	<div class="recipe-list">
		{#each recipes as recipe}
			<div class="recipe" class:can-craft={canCraft(recipe)}>
				<div class="recipe-header">
					<img
						src={recipe.image || itemDictionary[recipe.output.itemId].image}
						alt={recipe.name}
						class="recipe-image"
					/>
					<span class="recipe-name">{recipe.name}</span>
				</div>
				<p class="recipe-description">{recipe.description}</p>
				<div class="ingredients">
					<strong>Ingredients:</strong>
					<ul>
						{#each recipe.ingredients as ingredient}
							<li>
								<img
									src={itemDictionary[ingredient.itemId].image}
									alt={itemDictionary[ingredient.itemId].name}
									class="ingredient-image"
								/>
								{itemDictionary[ingredient.itemId].name} x {ingredient.quantity}
							</li>
						{/each}
					</ul>
				</div>
				<button on:click={() => handleCraft(recipe.id)} disabled={!canCraft(recipe)}>
					Craft
				</button>
			</div>
		{/each}
	</div>
</div>
<Notification />

<style>
	.crafting-container {
		padding: 1rem;
		background: #2a2a2a;
		border-radius: 8px;
		color: #eee;
	}
	h2 {
		text-align: center;
		margin-bottom: 1rem;
	}
	.recipe-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}
	.recipe {
		background: #3a3a3a;
		padding: 1rem;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	.recipe.can-craft {
		opacity: 1;
	}
	.recipe-header {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.recipe-image {
		width: 48px;
		height: 48px;
		margin-right: 1rem;
		image-rendering: pixelated;
	}
	.ingredient-image {
		width: 24px;
		height: 24px;
		margin-right: 0.5rem;
		vertical-align: middle;
		image-rendering: pixelated;
	}
	.recipe-name {
		font-weight: bold;
		font-size: 1.2rem;
	}
	.ingredients ul {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0;
	}
	button {
		margin-top: auto;
		padding: 0.5rem;
		background: #5a5a5a;
		color: #eee;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	button:disabled {
		background: #4a4a4a;
		color: #888;
		cursor: not-allowed;
	}
</style>
