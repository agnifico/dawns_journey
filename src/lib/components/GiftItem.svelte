<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { playerStore } from '$lib/stores/playerStore';
    import { getAllItems } from '$lib/services/ItemDataService';

    export let npcId: string;

    const dispatch = createEventDispatcher();

    let selectedItemId: string | null = null;
    let selectedQuantity: number = 1;
    let maxQuantity = 1;

    const allItems = getAllItems();
    const itemMap = new Map(allItems.map((item) => [item.id, item]));
    let generalInventoryItems = [];
    $: {
        generalInventoryItems = $playerStore.inventory
            .map((invItem) => ({
                ...invItem,
                details: itemMap.get(invItem.itemId)
            }))
            .filter((item) => item.details && item.details.type === 'general');

        if (!selectedItemId && generalInventoryItems.length > 0) {
            selectedItemId = generalInventoryItems[0].itemId;
        }
    }

    $: {
        if (selectedItemId) {
            const selectedInvItem = generalInventoryItems.find((i) => i.itemId === selectedItemId);
            maxQuantity = selectedInvItem ? selectedInvItem.amount : 1;
            if (selectedQuantity > maxQuantity) {
                selectedQuantity = maxQuantity;
            }
        }
    }

    function handleGift() {
        if (!selectedItemId || selectedQuantity <= 0) return;
        dispatch('gift', {
            npcId,
            itemId: selectedItemId,
            quantity: selectedQuantity,
        });
    }

    function handleBack() {
        dispatch('back');
    }
</script>

<div class="gift-item-ui">
    {#if generalInventoryItems.length > 0}
        <div class="form-group">
            <select id="item-select" bind:value={selectedItemId}>
                {#each generalInventoryItems as invItem}
                    <option value={invItem.itemId}
                        >{invItem.details.name} (x{invItem.amount})</option
                    >
                {/each}
            </select>
            <input
                id="quantity-input"
                type="number"
                min="1"
                max={maxQuantity}
                bind:value={selectedQuantity}
            />
        </div>
        <div class="gift-confirm-buttons">
            <button on:click={handleGift}>Gift</button>
            <button on:click={handleBack}>Back</button>
        </div>
    {:else}
        <p>You have no general items to give.</p>
        <button on:click={handleBack}>Back</button>
    {/if}
</div>

<style>
    .gift-item-ui {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .gift-item-ui .form-group {
        display: flex;
        gap: 0.5rem;
    }
    .gift-item-ui select {
        flex-grow: 1;
    }
    .gift-item-ui input {
        width: 60px;
    }
    .gift-confirm-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }
</style>
