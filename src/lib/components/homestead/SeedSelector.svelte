<script lang="ts">
	import type { FarmPlot as FarmPlotType } from '$lib/types';
	import { playerStore } from '$lib/stores/playerStore';
	import { cropDefinitions } from '$lib/data/cropDefinitions';
	import { derived } from 'svelte/store';
	import { getItemById, countInventoryItem } from '$lib/services/InventoryService';

	export let plot: FarmPlotType;
	export let selectedSeedId: string | null = null;

	const allPossibleSeedsWithPlantability = derived(playerStore, ($playerStore) => {
		return Object.values(cropDefinitions)
			.map((def) => {
				const yieldItem  = getItemById(def.yields);
				const amount     = countInventoryItem($playerStore.inventory, def.seedItemId);
				const plantCheck = canPlant(def.seedItemId, $playerStore);
				return {
					itemId:      def.seedItemId,
					cropName:    def.name.replace(' Plant', '').replace(' Seed', ''),
					amount,
					yieldItem,
					canPlant:    plantCheck.can,
					reason:      plantCheck.reason,
					idealSeason: def.idealSeason,
				};
			})
			.filter((s) => s.canPlant); // Only show crops the player can actually plant here
	});

	function canPlant(seedItemId: string, player: any): { can: boolean; reason: string } {
		const cropDef = Object.values(cropDefinitions).find((c) => c.seedItemId === seedItemId);
		if (!cropDef) return { can: false, reason: 'Crop data not found.' };
		if (!plot)    return { can: false, reason: 'No plot selected.' };

		// Farming level gate
		if (player.farmingLevel < cropDef.unlockLevel) {
			return { can: false, reason: `Requires Farming Lv${cropDef.unlockLevel}` };
		}

		// Environment check
		if (!cropDef.requiredEnvironment.includes(plot.environment)) {
			return { can: false, reason: 'Wrong environment' };
		}

		// Required plot techs (excluding compost — handled separately)
		// TODO: Re-wire compost check once compost system is redesigned
		const hasAllTech = cropDef.requiredTechs
			.filter((t) => t !== 'tech_compost_bin')
			.every((tech) => plot.appliedTech.includes(tech));
		if (!hasAllTech) {
			const names = cropDef.requiredTechs
				.filter((t) => t !== 'tech_compost_bin')
				.map((t) => t.replace('tech_', '').replace(/_/g, ' '))
				.join(', ');
			return { can: false, reason: `Requires: ${names}` };
		}

		return { can: true, reason: '' };
	}
</script>

<div class="seed-selector">
	{#if $allPossibleSeedsWithPlantability.length === 0}
		<p class="no-seeds">No crops available for this plot.</p>
	{:else}
		<div class="seed-grid">
			{#each $allPossibleSeedsWithPlantability as seed (seed.itemId)}
				{@const hasSeeds = seed.amount > 0}
				<button
					class="seed-card"
					class:selected={selectedSeedId === seed.itemId}
					class:no-stock={!hasSeeds}
					disabled={!hasSeeds}
					title={hasSeeds ? seed.cropName : 'No seeds in inventory'}
					on:click={() => { if (hasSeeds) selectedSeedId = seed.itemId; }}
				>
					<div class="seed-img-wrap">
						{#if seed.yieldItem}
							<img src={seed.yieldItem.image} alt={seed.cropName} />
						{:else}
							<span class="seed-fallback">?</span>
						{/if}
					</div>
					<span class="seed-name">{seed.cropName}</span>
					<span class="seed-count" class:zero={!hasSeeds}>×{seed.amount}</span>
					{#if seed.idealSeason}
						<span class="season-dot" title="Ideal: {seed.idealSeason}">{seed.idealSeason[0]}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.seed-selector {
		width: 100%;
	}

	.no-seeds {
		font-family: var(--font-family-pixel);
		font-size: 0.7rem;
		color: #6a8a74;
		text-align: center;
		padding: 1.5rem 0;
		font-style: italic;
	}

	.seed-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 6px;
		max-height: 200px;
		overflow-y: auto;
		padding: 2px;
		scrollbar-width: thin;
		scrollbar-color: #2a3e2a transparent;
	}

	.seed-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px 6px 6px;
		background-color: #2a3e2a;
		border: 2px solid #1a2e1a;
		border-radius: 8px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		box-shadow: #000 0 -3px 0 0 inset;
		transition: 0.1s all ease-in;
	}

	.seed-card:hover:not(:disabled) {
		background-color: #354a35;
		border-color: var(--color-secondary, #5a9a6a);
		transform: translateY(-1px);
		box-shadow: #000 0 -5px 0 0 inset;
	}

	.seed-card:active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: #000 0 -1px 0 0 inset;
	}

	.seed-card.selected {
		border-color: #f0d060;
		background-color: #3a5030;
		box-shadow: #000 0 -3px 0 0 inset, 0 0 8px rgba(240, 208, 96, 0.35);
	}

	.seed-card.no-stock {
		opacity: 0.38;
		cursor: not-allowed;
	}

	.seed-img-wrap {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.seed-img-wrap img {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
		object-fit: contain;
	}

	.seed-fallback {
		font-size: 1.1rem;
		color: #6a8a74;
	}

	.seed-name {
		font-size: 0.5rem;
		text-align: center;
		line-height: 1.3;
		color: #b0c8b0;
		text-transform: capitalize;
		word-break: break-word;
	}

	.seed-count {
		font-size: 0.6rem;
		color: #80c880;
	}
	.seed-count.zero { color: #6a5a5a; }

	/* Ideal season dot — top-right corner badge */
	.season-dot {
		position: absolute;
		top: 3px;
		right: 4px;
		font-size: 0.45rem;
		color: #1a1008;
		background: linear-gradient(135deg, #f0d060, #c88020);
		border-radius: 2px;
		padding: 1px 3px;
		letter-spacing: 0.05em;
		font-family: var(--font-family-pixel);
		box-shadow: 0 1px 0 #7a4a08;
	}
</style>