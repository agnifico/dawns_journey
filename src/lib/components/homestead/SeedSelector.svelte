<script lang="ts">
	import type { FarmPlot as FarmPlotType } from '$lib/types';
	import { playerStore } from '$lib/stores/playerStore';
	import { cropDefinitions } from '$lib/data/cropDefinitions';
	import { derived, writable } from 'svelte/store';
	import { getAllItems, getItemById, countInventoryItem } from '$lib/services/InventoryService';

	export let plot: FarmPlotType;
	export let useCompost: boolean;
	export let selectedSeedId: string | null = null;

	const _useCompost = writable(useCompost);
	$: _useCompost.set(useCompost);

	const allItems = getAllItems();

	// Reactive list of seeds with plantability — updates when inventory or useCompost changes
	const allPossibleSeedsWithPlantability = derived(
		[playerStore, _useCompost],
		([$playerStore, $currentUseCompost]) => {
			return Object.values(cropDefinitions).map((def) => {
				const itemDetails = getItemById(def.seedItemId);
				// In the instanced system, count instances rather than reading .amount
				const amount = countInventoryItem($playerStore.inventory, def.seedItemId);
				const plantCheck = canPlant(def.seedItemId, $playerStore, $currentUseCompost);

				return {
					itemId: def.seedItemId,
					amount,
					details: itemDetails,
					canPlant: plantCheck.can,
					reason: plantCheck.reason
				};
			});
		}
	);

	function canPlant(
		seedItemId: string,
		player: any,
		currentUseCompost: boolean
	): { can: boolean; reason: string } {
		const cropDef = Object.values(cropDefinitions).find((c) => c.seedItemId === seedItemId);

		if (!cropDef) return { can: false, reason: 'Crop data not found.' };
		if (!plot) return { can: false, reason: 'No plot selected.' };

		// Check Environment
		if (!cropDef.requiredEnvironment.includes(plot.environment)) {
			const requiredEnvNames = cropDef.requiredEnvironment
				.map((e) => e.replace('env_', '').replace('_', ' '))
				.join(' or ');
			return { can: false, reason: `Requires: ${requiredEnvNames}` };
		}

		// Check Plot Tech
		const hasAllTech = cropDef.requiredTechs.every((tech) => {
			if (tech === 'tech_compost_bin') {
				return currentUseCompost;
			}
			return plot.appliedTech.includes(tech);
		});
		if (!hasAllTech) {
			const requiredTechNames = cropDef.requiredTechs
				.map((t) => t.replace('tech_', '').replace('_', ' '))
				.join(', ');
			return { can: false, reason: `Requires: ${requiredTechNames}` };
		}

		// Check Global Upgrades (unlockedTech)
		const hasAllUpgrades = (cropDef.requiredTechs || []).every((upgrade) =>
			player.unlockedTech.includes(upgrade)
		);
		if (!hasAllUpgrades) {
			const requiredUpgradeNames = (cropDef.requiredTechs || [])
				.map((u) => u.replace('upgrade_', '').replace('_', ' '))
				.join(', ');
			return { can: false, reason: `Requires Global Upgrade: ${requiredUpgradeNames}` };
		}

		return { can: true, reason: '' };
	}
</script>

<div class="seed-selector">
	<div class="seed-list">
		{#each $allPossibleSeedsWithPlantability as seed (seed.itemId)}
			{#if seed.canPlant}
				{#if seed.details}
					{@const hasSeeds = seed.amount > 0}
					<button
						class="seed-item"
						class:selected={selectedSeedId === seed.itemId}
						class:disabled={!hasSeeds}
						title={hasSeeds ? seed.details.name : 'You have no seeds of this type.'}
						on:click={() => {
							if (hasSeeds) selectedSeedId = seed.itemId;
						}}
						disabled={!hasSeeds}
					>
						<img src={seed.details.image} alt={seed.details.name} />
						<span>{seed.details.name.replace(' Seed', '')} (x{seed.amount})</span>
					</button>
				{/if}
			{/if}
		{:else}
			<p>No seeds available for this plot.</p>
		{/each}
	</div>
</div>

<style>
	.seed-selector {
		width: 100%;
	}
	h4 {
        margin: 0 0 0.5rem 0;
		text-align: center;
	}
	.seed-list {
        display: grid;
		max-height: 60px;
		overflow-y: auto;
        padding: .25rem .5rem;
        grid-template-columns: 1fr 1fr;
        gap: .25rem;
	}
	.seed-item {
        display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: #444;
		border: 1px solid #666;
		border-radius: 4px;
		cursor: pointer;
		color: white;
		text-align: left;
	}
	.seed-item:hover {
		background-color: #555;
	}
	.seed-item.selected {
		border-color: yellow;
	}
	.seed-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		border-color: #666;
	}
	.seed-item.disabled:hover {
		background-color: #444;
	}
	.seed-item img {
        position: relative;
		width: 24px;
		height: 24px;
		image-rendering: pixelated;
	}
    span {
    }
</style>