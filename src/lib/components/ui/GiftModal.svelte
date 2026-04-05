<script lang="ts">
	import { isGiftModalOpen, closeGiftModal, giftTargetNpcId } from '$lib/stores/uiStore';
	import { playerStore } from '$lib/stores/playerStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { getAllItems, countInventoryItem } from '$lib/services/InventoryService';
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
	}

	function handleCancel() {
		closeGiftModal();
	}

	function playerHasItems(option: GiftingOption): boolean {
		return countInventoryItem($playerStore.inventory, option.itemId) >= option.quantity;
	}
</script>

{#if $isGiftModalOpen}
	<div class="modal-backdrop" transition:fade={{ duration: 150 }} on:click={handleCancel}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>Gift to <span>{npcName}</span></h3>
			</div>
			<div class="modal-body">
				{#if giftingOptions.length > 0}
					<ul class="gifting-options-list">
						{#each giftingOptions as option}
							{@const itemDetails = itemMap.get(option.itemId)}
							<li class="gifting-option">
								<div class="item-info">
									<img src={itemDetails?.image} alt={itemDetails?.name} class="item-icon" />
									<div class="details">
										<p class="item-name">
											{itemDetails?.name} <span>x{option.quantity}</span>
										</p>
										<small>+ {option.value} Affinity</small>
									</div>
								</div>
								<button
									class="give-button"
									on:click={() => handleConfirm(option)}
									disabled={!playerHasItems(option)}
								>
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
		border-radius: 8px;
		width: 100%;
		max-width: 600px;
		display: flex;
		flex-direction: column;
		box-shadow: #00000056 0 -6px 0 6px inset;
		background-color: var(--surface-2);
		border-radius: 18px;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		padding: 1.5rem;
		font-family: var(--font-family-pixel);
		color: var(--color-text);
	}
	.modal-header {
		/* padding: 0.75rem 1rem; */
		border-bottom: 1px solid #444;
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* border: 1px solid wheat; */
		padding-inline: 0.75rem;
	}
	.modal-header h3 {
		margin: 0;
		font-family: 'Silkscreen';
		display: flex;
		flex-direction: column;
		font-size: 0.75rem;
		margin: 0;
		padding: 0;
		span {
			font-family: 'DePixel';
			/* font-weight: bold; */
			color: var(--color-primary);
			font-size: 1.3rem;
		}
	}
	.modal-body {
		padding-inline: 0.5rem;
		display: flex;
		flex-direction: column;
		/* gap: 1rem; */
	}
	.gifting-options-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.gifting-option {
		display: flex;
		/* flex-direction: column; */
		justify-content: space-between;
		align-items: center;
		background-color: var(--surface-3);
		padding: 0.5rem;
		border-radius: 4px;
	}
	.item-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.item-icon {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}
	.details {
		color: var(--orange);
		font-size: 1rem;
		gap: 1rem;
		span {
			font-size: .75rem;
			color: rgba(255, 255, 255, 0.3);
		}
	}
	.item-name {
		gap: 2rem;
	}
	.item-info small {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.give-button {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.5rem 0.5rem;
		background-color: var(--color-secondary);
		background-color: #2e2e2e;
		color: var(--orange);
		box-shadow: #00000056 0 -3px 0 3px inset;
		border: none;
		border-radius: 6px;
		font-family: 'Silkscreen', sans-serif;
		text-align: left;
		font-size: 0.9rem;
		transition: 0.1s all ease-in-out;
	}
	.give-button:hover {
		transform: translateY(2px);
		box-shadow: #00000056 0 -1px 0 3px inset;
	}
	.give-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.modal-footer {
		position: relative;
		padding: 0.75rem 1rem;
		border-top: 1px solid #444;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		button {
			position: relative;
			background-color: var(--color-debuff);
			color: var(--color-secondary);
			display: flex;
			align-items: center;
			padding: 0.25rem 0.5rem 0.5rem;
			box-shadow: #00000056 0 -3px 0 3px inset;
			border: none;
			border-radius: 6px;
			font-family: 'Silkscreen', sans-serif;
			text-align: left;
			font-size: 0.9rem;
			transition: 0.1s all ease-in-out;
			&:hover {
				transform: translateY(2px);
				box-shadow: #00000056 0 -1px 0 3px inset;
			}
		}
	}
</style>
