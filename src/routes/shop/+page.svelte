<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
    import { getAllItems, addItems } from '$lib/services/InventoryService';
    import { messageStore } from '$lib/stores/messageStore';
    import type { Item } from '$lib/types';

    let activeTab: 'cafe' | 'grocery' = 'cafe';
    let shopItems: Item[] = [];

    // Filter items for the shop
    $: {
        const allGameItems = getAllItems();
        if (activeTab === 'cafe') {
            shopItems = allGameItems.filter(item => item.image?.startsWith('/cafe/'));
        } else {
            shopItems = allGameItems.filter(item => item.image?.startsWith('/grocery/'));
        }
    }

    function buyItem(item: Item) {
        if (!item.price) {
            messageStore.addMessage(`Item ${item.name} has no price.`, ['System', 'Error']);
            return;
        }

        playerStore.update(player => {
            if (player.baseStats.argentum < item.price!) {
                messageStore.addMessage(`Not enough Argentum to buy ${item.name}.`, ['System', 'Error']);
                return player;
            }

            // Deduct argentum
            player.baseStats.argentum -= item.price!;
            // Add item to inventory
            const newPlayer = addItems(player, item.id, 1, true);
            messageStore.addMessage(`Bought ${item.name} for ${item.price} Argentum.`, ['System']);
            return newPlayer;
        });
    }
</script>

<div class="shop-container">
    <h1>Shop</h1>

    <div class="tabs">
        <button class:active={activeTab === 'cafe'} on:click={() => (activeTab = 'cafe')}>Cafe</button>
        <button class:active={activeTab === 'grocery'} on:click={() => (activeTab = 'grocery')}>Grocery</button>
    </div>

    <div class="item-list">
        {#each shopItems as item (item.id)}
            <div class="shop-item">
                <img src={item.image} alt={item.name} class="item-image" />
                <div class="item-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p class="price">Price: {item.price} Argentum</p>
                    <button on:click={() => buyItem(item)}>Buy</button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .shop-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        background-color: #333;
        border-radius: 8px;
        color: #eee;
    }

    h1 {
        text-align: center;
        color: #fff;
        margin-bottom: 20px;
    }

    .tabs {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }

    .tabs button {
        background-color: #555;
        color: #fff;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 1em;
        border-radius: 5px;
        margin: 0 5px;
        transition: background-color 0.2s;
    }

    .tabs button:hover {
        background-color: #777;
    }

    .tabs button.active {
        background-color: #007bff;
    }

    .item-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    .shop-item {
        background-color: #444;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .item-image {
        width: 100px;
        height: 100px;
        object-fit: contain;
        margin-bottom: 10px;
    }

    .item-details h3 {
        margin: 0 0 5px 0;
        color: #fff;
    }

    .item-details p {
        margin: 0 0 10px 0;
        color: #ccc;
        font-size: 0.9em;
    }

    .price {
        font-weight: bold;
        color: #00ff00;
    }

    .shop-item button {
        background-color: #28a745;
        color: #fff;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-top: 10px;
    }

    .shop-item button:hover {
        background-color: #218838;
    }
</style>
