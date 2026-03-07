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

	let isPlanting = false;
	let showPlotActions = false;
	let selectedSeedId: string | null = null;
	let useCompost = false;

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
			// Stage has changed! Animate from previous value to 100, then 0 to new value.
			animatedProgress.set(100);
			isBlinking = true;
			setTimeout(() => {
				isShaking = true;
				setTimeout(() => {
					isShaking = false;
					isBlinking = false;
					animatedProgress.set(0);
					setTimeout(() => {
						animatedProgress.set($growthProgressInStage);
					}, 50); // Brief pause at 0
				}, 300); // Shake animation duration
			}, 450); // Progress bar animation duration + buffer
			previousStage = plot.crop.currentGrowthStage;
		} else {
			animatedProgress.set($growthProgressInStage);
		}
	}

	const yieldedItem = derived(cropDef, ($cropDef) => {
		if ($cropDef) {
			return getItemById($cropDef.yields);
		}
		return undefined;
	});

	function handlePlant() {
		if (selectedSeedId && plot.id) {
			const plantId = Object.values(cropDefinitions).find(
				(def) => def.seedItemId === selectedSeedId
			)?.id;
			if (plantId) {
				FarmingService.plantCrop(plot.id, plantId, useCompost);
				isPlanting = false;
				useCompost = false;
			}
		}
	}
</script>

<div class="farm-plot" class:selected={$selectedPlotId === plot.mapObjectId}>
	{#if plot.crop && $cropDef && $yieldedItem}
		<div class="crop-display">
			<div class="thumbnail">
				<img src={$yieldedItem.image} alt={$yieldedItem.name} />
				{#if plot.crop.currentGrowthStage < $cropDef.growthStages.length - 1}
					<img
						src={`/crops/${$cropDef.growthStages.length}-stage${plot.crop.currentGrowthStage + 1}.png`}
						alt={$cropDef.name}
						class="growth-image"
						class:blink={isBlinking}
					/>
				{/if}
			</div>
			<div class="bars">
				<p class="crop-name">{$cropDef.name}</p>
				<div class="info-section">
					<span>Stage:</span>
					<div class="cont" class:shake={isShaking}>
						<AnimatedPipBar
							value={plot.crop.currentGrowthStage}
							max={$cropDef.growthStages.length}
						/>
						<AnimatedProgressBar
							value={$animatedProgress}
							isComplete={plot.crop.currentGrowthStage >= $cropDef.growthStages.length - 1}
							color="#4ade80"
						/>
					</div>
				</div>

				<div class="info-section">
					<span>Water:</span>
					<ProgressBar
						value={plot.crop.wateredCount}
						max={$cropDef.wateringRequirementValue}
						color="#3b82f6"
					/>
				</div>
				{#if plot.appliedTech.length > 0}
					<div class="applied-tech">
						Applied Techs: <br />
						{#each plot.appliedTech as tech}
							{tech.replace('tech_', '').replace('_', ' ')},&nbsp;
						{/each}
					</div>
				{/if}
			</div>

			<div class="actions">
				{#if plot.crop.currentGrowthStage >= $cropDef.growthStages.length - 1}
					<button class="action-button harvest" on:click={() => FarmingService.harvestCrop(plot.id)}
						>Harvest</button
					>
				{:else}
					<button class="action-button water" on:click={() => FarmingService.waterCrop(plot.id)}
						>Water</button
					>
				{/if}
			</div>
		</div>
	{:else if isPlanting}
		<div class="planting-ui">
			<div class="compost-option">
				<label>
					<input type="checkbox" bind:checked={useCompost} />
					Use Compost
				</label>
			</div>
			<SeedSelector {plot} bind:selectedSeedId {useCompost} />

			<div class="plant-actions">
				<button on:click={handlePlant} disabled={!selectedSeedId}>Plant</button>
				<button
					on:click={() => {
						isPlanting = false;
						useCompost = false;
					}}>Cancel</button
				>
			</div>
		</div>
	{:else if showPlotActions}
		<div class="plot-actions-ui">
			<PlotActions {plot} />
			<button class="action-button back" on:click={() => (showPlotActions = false)}>Back</button>
		</div>
	{:else}
		<div class="empty-plot">
			<div class="empty-left">
				{#if plot.appliedTech.length > 0}
					<div class="applied-tech">
						<span> Applied Techs: </span> <br />
						{#each plot.appliedTech as tech}
							{tech.replace('tech_', '').replace('_', ' ')} <br />
						{/each}
					</div>
				{/if}
				<button
					class="action-button techs"
					on:click|stopPropagation={() => (showPlotActions = true)}>Actions</button
				>
			</div>
			<button class="plant-button" on:click={() => (isPlanting = true)}>
				<span class="plus-icon">+</span>
				<span class="pc">Plant Crop</span>
			</button>
		</div>
	{/if}
</div>

<style>
	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-2px);
		}
		50% {
			transform: translateX(2px);
		}
		75% {
			transform: translateX(-2px);
		}
		100% {
			transform: translateX(0);
		}
	}

	.shake {
		animation: shake 0.3s ease-in-out;
	}

	@keyframes blink {
		50% {
			opacity: 0.5;
		}
	}

	.blink {
		animation: blink 0.3s 2;
	}

	.farm-plot {
		position: relative;
		width: 100%;
		height: 100%;
		/* background-color: #2b2b2b; */
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		font-family: sans-serif;
		transition: border-color 0.2s ease;
		/* border: 2px solid black; */
		padding: 0.5rem;
		padding: 0.5rem;
		padding-bottom: 1rem;
		box-sizing: border-box;
		background-color: #435e52;
		border-radius: 18px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		box-sizing: border-box;
		&:hover {
			background-color: #34453d;
			.techs {
				background-color: #ffffff56;
			}
		}
	}

	.farm-plot.selected {
		border-color: #fff;
	}

	.empty-plot {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 4px;
		gap: 0.5rem;
	}
	.empty-left {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.plant-button {
		position: relative;
		border-radius: 0.75rem;
		width: 100%;
		flex-grow: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		background: none;
		color: #313131;
		padding: 0;
		box-sizing: border-box;
		border: 3px solid var(--color-secondary);
		/* border: none; */
		font-family: var(--font-family-pixel);
		box-sizing: border-box;
		height: fit-content;
		padding: 1rem;
		font-family: var(--font-family-pixel);
		border-radius: 1rem;
		box-shadow: #313131 0 -6px 0 0px inset;
		background-color: #435e52;
		transition: .1s all ease-in;
	}
	.plant-button:hover {
		transform: translateY(2px);
		box-shadow: #313131 0 -6px 0px -4px inset;
		/* background-color: var(--color-accent); */
		span {
			color: #ffffff;
		}
	}
	.applied-tech {
		padding: 0.5rem;
		min-height: 50%;
		font-size: 0.7rem;
		font-family: var(--font-family-pixel);
		color: #ccc;
		text-align: left;
		text-transform: capitalize;
		display: flex;
		flex-direction: column;
		/* justify-content: flex-end; */
		span {
			color: var(--color-primary);
			/* font-weight: bold; */
		}
	}
	.plus-icon {
		font-size: 10rem;
		line-height: 5rem;
		/* font-weight: bold; */
		font-family: var(--font-family-main);
		color: #313131;
	}
	.pc {
		font-size: 1rem;
		text-transform: uppercase;
		color: #9d9d9d;
	}

	.crop-display {
		display: flex;
		align-items: center;
		height: 100%;
		width: 100%;
		position: relative;
		gap: 0.5rem;
	}
	.thumbnail {
		width: min-content;
		padding: 0.5rem;
		img {
			height: 32px;
			width: 32px;
		}
		.growth-image {
			width: 16px;
			height: 16px;
			object-fit: contain;
			image-rendering: pixelated;
		}
	}
	.crop-name {
		margin: 0;
		font-weight: bold;
	}
	.bars {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex-grow: 1;
		padding: 0.5rem;
		p {
			margin: 0;
			padding: 0;
			font-family: var(--font-family-pixel);
			font-weight: 400;
			font-size: 0.75rem;
			word-break: none;
		}
	}
	.actions {
		display: flex;
		margin-right: 0;
		height: 100%;
	}
	.info-section {
		min-width: 100%;
		font-size: 0.8rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-top: 0.5rem;
	}
	.cont {
		width: 100%;
		height: fit-content;
		gap: 0;
	}
	.action-button {
		position: relative;
		margin-top: auto;
		width: 100%;
		/* flex-grow: 1; */
		border-radius: 0;
		border: none;
		color: #313131;
	}
	.techs, .harvest, .water {
		background-color: var(--color-accent);
		border: 3px solid #313131;
		color: var(--color-secondary);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		padding-bottom: .75rem;
		font-family: var(--font-family-pixel);
		border-radius: 0.5rem;
		box-shadow: #313131 0 -6px 0 0px inset;
		width: fit-content;
		transition: .1s all ease-in;
		&:hover {
			padding-bottom: .5rem;
			/* transform: translateY(2px); */
			box-shadow: #313131 0 -6px 0px -4px inset;
		}
	}

	.water {
		background-color: var(--notification-equipped);
		color: var(--text-white);
	}
	.harvest {
		background-color: var(--orange);
		color: var(--text-white);
	}

	.planting-ui,
	.plot-actions-ui {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		.action-button {
			background-color: #5eb48d;
			width: 100%;
		}
	}
	.compost-option {
		margin-top: 0.5rem;
		text-align: center;
	}
	.plant-actions {
		margin-top: auto;
		display: flex;
		gap: 0.5rem;
	}
	.plant-actions button {
		flex-grow: 1;
	}
</style>
