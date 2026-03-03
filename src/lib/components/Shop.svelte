<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import {
		getAllItems,
		addItems,
		countInventoryItem,
		removeItemsByItemId
	} from '$lib/services/InventoryService';
	import { messageStore } from '$lib/stores/messageStore';
	import type { Item } from '$lib/types';

	let activeTab: 'cafe' | 'grocery' = 'cafe';
	let shopItems: Item[] = [];
	let argentum: number = 0;

	// Filter items for the shop
	$: {
		const allGameItems = getAllItems();
		if (activeTab === 'cafe') {
			shopItems = allGameItems.filter((item) => item.flags?.includes('cafe'));
		} else {
			shopItems = allGameItems.filter((item) => item.flags?.includes('grocery'));
		}
	}

	// Subscribe to player store to get argentum count
	playerStore.subscribe((player) => {
		argentum = countInventoryItem(player.inventory, 'argentum');
	});

	function buyItem(item: Item) {
		if (!item.price) {
			messageStore.addMessage(`Item ${item.name} has no price.`, ['System', 'World']);
			return;
		}

		playerStore.update((player) => {
			if (countInventoryItem(player.inventory, 'argentum') < item.price!) {
				messageStore.addMessage(`Not enough Argentum to buy ${item.name}.`, ['System', 'World']);
				return player;
			}

			// Deduct argentum
			let newPlayer = removeItemsByItemId(player, 'argentum', item.price!);
			// Add item to inventory
			newPlayer = addItems(newPlayer, item.id, 1, true);
			messageStore.addMessage(`Bought ${item.name} for ${item.price} Argentum.`, [
				'System',
				'World'
			]);
			return newPlayer;
		});
	}
</script>

<div class="shop-container">
	<div class="header">
		<h1>Shop</h1>
		<div class="currency">
			<span>Argentum: {argentum}</span>
		</div>
	</div>

	<div class="tabs">
		<button class:active={activeTab === 'cafe'} on:click={() => (activeTab = 'cafe')}>Cafe</button>
		<button class:active={activeTab === 'grocery'} on:click={() => (activeTab = 'grocery')}
			>Grocery</button
		>
	</div>

	<div class="item-grid">
		{#each shopItems as item (item.id)}
			<div class="item-card">
				<div class="item-image-container">
					<img src={item.image} alt={item.name} class="item-image" />
				</div>
				<div class="item-info">
					<h3>{item.name}</h3>
					<p>{item.description}</p>
					<div class="item-actions">
						<span class="price">{item.price} Arg.</span>
						<button on:click={() => buyItem(item)}>Buy</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.shop-container {
		padding-inline: 2rem;
		display: flex;
		flex-direction: column;
		background-color: #141414;
		color: var(--color-text);
		font-family: var(--font-family-pixel);
        height: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* margin-bottom: 2rem; */
	}

	h1 {
		font-family: 'Lexend', monospace;
		text-transform: uppercase;
		/* font-weight: 600; */
		color: #e9d9ca;
		font-size: 2.5rem;
	}

	.currency {
		font-size: 1.2rem;
		color: var(--orange);
	}

	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.tabs button {
		font-family: var(--font-family-pixel);
		background-color: var(--surface-2);
		color: var(--color-text);
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	.tabs button.active {
		background-color: #cd804d;
		color: #222;
	}

	.item-grid {
		flex-grow: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
        overflow: auto;
        padding-right: .5rem;
	}

	.item-card {
		border-radius: 18px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		padding: 1rem;
		display: flex;
		/* flex-direction: column; */
		justify-content: flex-start;
        align-items: center;
		background-color: var(--surface-3);
		background-color: var(--green-srf);

	}

	.item-image-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
	}

	.item-image {
		width: 96px;
		height: 96px;
		image-rendering: pixelated;
		object-fit: contain;
        margin: 0;
	}

	.item-info h3 {
		font-size: .9rem;
		margin-bottom: 0.5rem;
        color: #f3aa79;
	}
    
	.item-info p {
        font-size: 0.75rem;
        color: var(--beige);
	}
    
	.item-actions {
        display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}
    
	.price {
        /* font-weight: bold; */
        font-size: 0.9rem;
		margin-right: 1rem;
	}

	.item-actions button {
		font-family: var(--font-family-pixel);
		background-color: var(--orange);
		background-color: var(--green-srf-dark);
		color: var(--text-white);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		box-shadow: #00000056 0 -3px 0 3px inset;
		transition: 150ms all ease-in-out;
	}

	.item-actions button:hover {
		transform: translateY(3px);
		box-shadow: #00000056 0 -2px 0 2px inset;
	}
</style>
