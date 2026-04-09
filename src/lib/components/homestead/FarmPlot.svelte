<script lang="ts">
	import type { FarmPlot as FarmPlotType } from '$lib/types';
	import { cropDefinitions } from '$lib/data/cropDefinitions';
	import { playerStore } from '$lib/stores/playerStore';
	import * as FarmingService from '$lib/services/FarmingService';
	import { derived, writable } from 'svelte/store';
	import SeedSelector from './SeedSelector.svelte';
	import AnimatedProgressBar from '../ui/AnimatedProgressBar.svelte';
	import ProgressBar from '../ui/ProgressBar.svelte';
	import AnimatedPipBar from '../ui/AnimatedPipBar.svelte';
	import PlotActions from './PlotActions.svelte';
	import { selectedPlotId } from '$lib/stores/uiStore';
	import { getItemById } from '$lib/services/InventoryService';

	export let plot: FarmPlotType;

	let isPlanting      = false;
	let showPlotActions = false;
	let selectedSeedId: string | null = null;

	// TODO: Compost integration — pass compost flag to plantCrop once redesigned
	let previousStage: number | undefined = undefined;
	let animatedProgress = writable(0);
	let isShaking = false;
	let isBlinking = false;

	const cropDef = derived(playerStore, () => {
		if (plot.crop) {
			return Object.values(cropDefinitions).find((c) => c.id === plot.crop.plantId);
		}
		return undefined;
	});

	const growthProgressInStage = derived(playerStore, () => {
		if (plot.crop && $cropDef) {
			const stageDef = $cropDef.growthStages[plot.crop.currentGrowthStage];
			if (!stageDef) return 0;
			const timeElapsedInStage = Date.now() - plot.crop.stageStartedTimestamp;
			return Math.min(100, (timeElapsedInStage / stageDef.duration) * 100);
		}
		return 0;
	});

	$: if (plot.crop) {
		if (previousStage === undefined) {
			previousStage = plot.crop.currentGrowthStage;
			animatedProgress.set($growthProgressInStage);
		} else if (previousStage !== plot.crop.currentGrowthStage) {
			animatedProgress.set(100);
			isBlinking = true;
			setTimeout(() => {
				isShaking = true;
				setTimeout(() => {
					isShaking = false;
					isBlinking = false;
					animatedProgress.set(0);
					setTimeout(() => { animatedProgress.set($growthProgressInStage); }, 50);
				}, 300);
			}, 450);
			previousStage = plot.crop.currentGrowthStage;
		} else {
			animatedProgress.set($growthProgressInStage);
		}
	}

	const yieldedItem = derived(cropDef, ($cropDef) => {
		if ($cropDef) return getItemById($cropDef.yields);
		return undefined;
	});

	$: isHarvestable = plot.crop && $cropDef
		? plot.crop.currentGrowthStage >= $cropDef.growthStages.length - 1
		: false;

	function handlePlant() {
		if (selectedSeedId && plot.id) {
			const plantId = Object.values(cropDefinitions).find(
				(def) => def.seedItemId === selectedSeedId
			)?.id;
			if (plantId) {
				// TODO: Pass compost flag once compost system is redesigned
				FarmingService.plantCrop(plot.id, plantId, false);
				isPlanting = false;
			}
		}
	}
</script>

<div class="farm-plot" class:selected={$selectedPlotId === plot.mapObjectId}>

	{#if plot.crop && $cropDef && $yieldedItem}
		<!-- ── Crop growing ─────────────────────────────── -->
		<div class="crop-header">
			<span class="crop-name">{$cropDef.name}</span>
			{#if $cropDef.idealSeason}
				<span class="season-badge">{$cropDef.idealSeason}</span>
			{/if}
		</div>

		<div class="crop-body" class:shake={isShaking}>
			<!-- Left: yield image + stage pips -->
			<div class="crop-visual">
				<div class="yield-img-wrap">
					<img
						src={$yieldedItem.image}
						alt={$yieldedItem.name}
						class="yield-img"
						class:blink={isBlinking}
					/>
				</div>
				<AnimatedPipBar
					value={plot.crop.currentGrowthStage}
					max={$cropDef.growthStages.length}
					isComplete={isHarvestable}
				/>
			</div>

			<!-- Right: bars + tech chips -->
			<div class="crop-bars">
				<div class="bar-row">
					<span class="bar-label">Growth</span>
					<AnimatedProgressBar
						value={$animatedProgress}
						isComplete={isHarvestable}
						type="growth"
					/>
				</div>
				<div class="bar-row">
					<span class="bar-label">Water</span>
					<ProgressBar
						value={plot.crop.wateredCount}
						max={$cropDef.wateringRequirementValue}
						type="water"
					/>
				</div>
				{#if plot.appliedTech.length > 0}
					<div class="tech-chips">
						{#each plot.appliedTech as tech}
							<span class="tech-chip">{tech.replace('tech_', '').replace(/_/g, ' ')}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Action -->
		<div class="crop-action">
			{#if isHarvestable}
				<button class="action-btn harvest" on:click={() => FarmingService.harvestCrop(plot.id)}>
					Harvest
				</button>
			{:else}
				<button class="action-btn water-btn" on:click={() => FarmingService.waterCrop(plot.id)}>
					Water
				</button>
			{/if}
		</div>

	{:else if isPlanting}
		<!-- ── Planting UI ──────────────────────────────── -->
		<div class="planting-ui">
			<span class="panel-title">Choose a Crop</span>
			<SeedSelector {plot} bind:selectedSeedId />
			<div class="plant-actions">
				<button class="action-btn plant-btn" on:click={handlePlant} disabled={!selectedSeedId}>
					Plant
				</button>
				<button class="action-btn cancel-btn" on:click={() => { isPlanting = false; }}>
					Cancel
				</button>
			</div>
		</div>

	{:else if showPlotActions}
		<!-- ── Plot actions / tech ─────────────────────── -->
		<div class="plot-actions-ui">
			<span class="panel-title">Plot Tech</span>
			<PlotActions {plot} />
			<button class="action-btn back-btn" on:click={() => (showPlotActions = false)}>
				← Back
			</button>
		</div>

	{:else}
		<!-- ── Empty plot ───────────────────────────────── -->
		<div class="empty-plot">
			<div class="empty-left">
				{#if plot.appliedTech.length > 0}
					<div class="tech-chips">
						{#each plot.appliedTech as tech}
							<span class="tech-chip">{tech.replace('tech_', '').replace(/_/g, ' ')}</span>
						{/each}
					</div>
				{/if}
				<button class="action-btn techs-btn" on:click|stopPropagation={() => (showPlotActions = true)}>
					Actions
				</button>
			</div>
			<button class="plant-button" on:click={() => (isPlanting = true)}>
				<span class="plus-icon">+</span>
				<span class="plant-label">Plant Crop</span>
			</button>
		</div>
	{/if}
</div>

<style>
	/* ── Animations ── */
	@keyframes shake {
		0%   { transform: translateX(0); }
		25%  { transform: translateX(-2px); }
		50%  { transform: translateX(2px); }
		75%  { transform: translateX(-2px); }
		100% { transform: translateX(0); }
	}
	@keyframes blink {
		50% { opacity: 0.5; }
	}
	.shake { animation: shake 0.3s ease-in-out; }
	.blink { animation: blink 0.3s 2; }

	/* ── Plot card ── */
	.farm-plot {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px 12px 14px;
		box-sizing: border-box;
		background-color: #435e52;
		border-radius: 16px;
		border: 3px solid rgba(0, 0, 0, 0.35);
		box-shadow: rgba(0, 0, 0, 0.35) 0 -6px 0 0 inset;
		font-family: var(--font-family-pixel);
		transition: background-color 0.15s;
	}
	.farm-plot:hover   { background-color: #3c5449; }
	.farm-plot.selected { border-color: rgba(255, 255, 255, 0.55); }

	/* ── Crop header ── */
	.crop-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}
	.crop-name {
		font-size: 0.75rem;
		color: #dff0df;
		letter-spacing: 0.04em;
	}
	.season-badge {
		font-size: 0.5rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1a1008;
		background: linear-gradient(135deg, #f0d060, #c88020);
		border-radius: 3px;
		padding: 2px 6px;
		box-shadow: 0 1px 0 #7a4a08, inset 0 1px 0 rgba(255, 255, 200, 0.3);
		flex-shrink: 0;
	}

	/* ── Crop body ── */
	.crop-body {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}
	.crop-visual {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}
	.yield-img-wrap {
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.28);
		border-radius: 6px;
		border: 2px solid rgba(0, 0, 0, 0.35);
		box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.35);
	}
	.yield-img {
		width: 36px;
		height: 36px;
		image-rendering: pixelated;
		object-fit: contain;
	}
	.crop-bars {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		justify-content: center;
	}
	.bar-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.bar-label {
		font-size: 0.5rem;
		color: #8aaa8a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* Tech chips */
	.tech-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		margin-top: 2px;
	}
	.tech-chip {
		font-size: 0.75rem;
		color: #6aaa7a;
		background: rgba(0, 0, 0, 0.22);
		border: 1px solid rgba(106, 170, 122, 0.25);
		border-radius: 3px;
		padding: 2px 6px;
		text-transform: capitalize;
		letter-spacing: 0.04em;
	}

	/* ── Action buttons (shared base) ── */
	.action-btn {
		font-family: var(--font-family-pixel);
		cursor: pointer;
		border-radius: 6px;
		padding: 6px 14px 10px;
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		border: 2px solid rgba(0, 0, 0, 0.45);
		box-shadow: rgba(0, 0, 0, 0.45) 0 -4px 0 0 inset;
		transition: 0.1s all ease-in;
		width: 100%;
	}
	.action-btn:hover:not(:disabled) {
		padding-bottom: 6px;
		box-shadow: rgba(0, 0, 0, 0.45) 0 -1px 0 0 inset;
	}
	.action-btn:active:not(:disabled) {
		padding-bottom: 6px;
		transform: translateY(2px);
		box-shadow: none;
	}
	.action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.crop-action { display: flex; }

	.water-btn   { background: #2b6cb0; color: #c8e8ff; border-color: #1a4a80; }
	.water-btn:hover:not(:disabled) { background: #3a7cc0; }

	.harvest { background: linear-gradient(180deg, #d4850a 0%, #a85c08 100%); color: #ffe8c0; border-color: #6a3a05; }
	.harvest:hover:not(:disabled) { filter: brightness(1.12); }

	.plant-btn  { background: #3a6a3a; color: #c0e0c0; border-color: #1a3a1a; }
	.plant-btn:hover:not(:disabled) { background: #4a7a4a; }

	.cancel-btn { background: #333a33; color: #8a9a8a; border-color: #1a201a; }
	.cancel-btn:hover:not(:disabled) { background: #404a40; }

	.back-btn   { background: #2a3a2a; color: #8aaa8a; border-color: #1a2a1a; width: auto; padding: 5px 12px 8px; }
	.back-btn:hover:not(:disabled) { background: #384838; }

	.techs-btn  { background: rgba(0,0,0,0.2); color: #9abaaa; border-color: rgba(0,0,0,0.3); width: auto; padding: 4px 10px 7px; }
	.techs-btn:hover:not(:disabled) { background: rgba(0,0,0,0.35); }

	/* ── Empty plot ── */
	.empty-plot {
		display: flex;
		align-items: stretch;
		gap: 8px;
		min-height: 90px;
	}
	.empty-left {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 6px;
	}
	.plant-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding: 1rem 0.5rem;
		background-color: #354e44;
		border-radius: 12px;
		border: 3px solid rgba(0, 0, 0, 0.3);
		box-shadow: rgba(0, 0, 0, 0.35) 0 -6px 0 0 inset;
		cursor: pointer;
		transition: 0.1s all ease-in;
	}
	.plant-button:hover {
		background-color: #3e5a4e;
		box-shadow: rgba(0, 0, 0, 0.35) 0 -2px 0 0 inset;
		transform: translateY(2px);
	}
	.plus-icon {
		font-size: 2.5rem;
		line-height: 2rem;
		color: #2a3e32;
		font-family: var(--font-family-main, sans-serif);
	}
	.plant-label {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		text-transform: uppercase;
		color: #7a9a8a;
		letter-spacing: 0.1em;
	}

	/* ── Planting + Plot actions UI ── */
	.planting-ui,
	.plot-actions-ui {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}
	.panel-title {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #7a9a8a;
	}
	.plant-actions {
		display: flex;
		gap: 6px;
		margin-top: 2px;
	}
</style>