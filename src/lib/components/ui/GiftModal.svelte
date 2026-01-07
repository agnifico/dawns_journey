<script lang="ts">
    import { isGiftModalOpen, closeGiftModal, giftTargetNpcId } from '$lib/stores/uiStore';
    import { playerStore } from '$lib/stores/playerStore';
    import { npcStore } from '$lib/stores/npcStore';
    import { getAllItems } from '$lib/services/ItemDataService';
    import { fade } from 'svelte/transition';
    import type { GiftingOption } from '$lib/types';

    const allItems = getAllItems();
    const itemMap = new Map(allItems.map((item) => [item.id, item]));

    let giftingOptions: GiftingOption[] = [];
    let npcName = '';

    $: {
        if ($giftTargetNpcId && $npcStore.globalNpcs[$giftTargetNpcId]) {
            const npc = $npcStore.globalNpcs[$giftTargetNpcId];
            npcName = npc.name;
            const heartRankData = npc.heartRanks[npc.heartRank];
            giftingOptions = heartRankData?.giftingOptions || [];
        } else {
            giftingOptions = [];
            npcName = '';
        }
    }

    function handleConfirm(option: GiftingOption) {
        if (!$giftTargetNpcId) return;
        npcStore.fulfillGiftingOption($giftTargetNpcId, option);
        // Maybe close the modal or update the view depending on desired UX
    }

    function handleCancel() {
        closeGiftModal();
    }

    function playerHasItems(option: GiftingOption): boolean {
        const itemInInventory = $playerStore.inventory.find(i => i.itemId === option.itemId);
        return itemInInventory ? itemInInventory.amount >= option.quantity : false;
    }
</script>

{#if $isGiftModalOpen}
    <div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click={handleCancel}>
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3>Give Gift to {npcName}</h3>
                <button class="close-button" on:click={handleCancel}>X</button>
            </div>
            <div class="modal-body">
                {#if giftingOptions.length > 0}
                    <ul class="gifting-options-list">
                        {#each giftingOptions as option}
                            {@const itemDetails = itemMap.get(option.itemId)}
                            <li class="gifting-option">
                                <div class="item-info">
                                    <img src={itemDetails?.image} alt={itemDetails?.name} class="item-icon" />
                                    <span>
                                        {itemDetails?.name} x {option.quantity}
                                        <br/>
                                        <small>+ {option.value} Affinity</small>
                                    </span>
                                </div>
                                <button 
                                    class="give-button"
                                    on:click={() => handleConfirm(option)} 
                                    disabled={!playerHasItems(option)}>
                                    Give
                                </button>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p>There are no specific gifts {npcName} desires at this time.</p>
                {/if}
            </div>
            <div class="modal-footer">
                <button on:click={handleCancel}>Close</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .modal {
        background-color: #1a1a1a;
        border: 1px solid #444;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
    }
    .modal-header {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #444;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .modal-header h3 {
        margin: 0;
        font-family: 'Silkscreen';
    }
    .close-button {
        background: none;
        border: none;
        color: #aaa;
        font-size: 1.5rem;
    }
    .modal-body {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .gifting-options-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .gifting-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #2a2a2a;
        padding: 0.5rem;
        border-radius: 4px;
    }
    .item-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .item-icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }
    .give-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .modal-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid #444;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }
</style>
