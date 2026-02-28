<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { seasonStore, type Season } from '$lib/stores/seasonStore';
	import FarmPlot from '$lib/components/homestead/FarmPlot.svelte';
	import * as FarmingService from '$lib/services/FarmingService';
	import * as SkillService from '$lib/services/SkillService';
	import { derived, writable } from 'svelte/store';
	import { currentEnvironment, type HomesteadEnvironment } from '$lib/stores/environmentStore';
	import MapGrid from '$lib/components/homestead/MapGrid.svelte';
	import { selectedPlotId } from '$lib/stores/uiStore';
	import { tick } from 'svelte';
	import FarmingCodex from '$lib/components/codex/FarmingCodex.svelte';
	import CompostPage from '$lib/components/compost/CompostPage.svelte';

	let selectedSeason: Season;
	$: selectedSeason = $seasonStore;
	let showCodex = false;
	let showCompost = false;

	const availableEnvironments = derived(playerStore, ($playerStore) => {
		const environments = [
			{ id: 'env_open_field', name: 'Open Field', unlocked: true }, // Always unlocked
			{
				id: 'env_greenhouse',
				name: 'Greenhouse',
				unlocked: $playerStore.unlockedTech.includes('env_greenhouse')
			},
			{
				id: 'env_forest_floor',
				name: 'Forest Floor',
				unlocked: $playerStore.unlockedTech.includes('env_forest_floor')
			}
		];
		return environments;
	});

	const plotsInCurrentEnvironment = derived(
		[playerStore, currentEnvironment],
		([$playerStore, $currentEnvironment]) => {
			return $playerStore.homestead.farmPlots.filter(
				(plot) =>
					plot.environment === $currentEnvironment &&
					$playerStore.farmingLevel >= plot.requiredLevel
			);
		}
	);

	function handleSaveSeason() {
		seasonStore.setSeason(selectedSeason);
	}

	function handleLevelTest(event: Event) {
		const isChecked = (event.target as HTMLInputElement).checked;
		SkillService.setSkillLevel('farming', isChecked ? 99 : 1);
	}

	function selectEnvironment(envId: HomesteadEnvironment) {
		currentEnvironment.set(envId); // Update the store
		selectedPlotId.set(null); // Deselect any plot when changing environment
	}

	$: showBottomHalf =
		$currentEnvironment === 'env_greenhouse' || $currentEnvironment === 'env_forest_floor';

	// Bind the checkbox state to the player's level
	let isLevel99: boolean;
	$: isLevel99 = $playerStore.farmingLevel > 1;

	// Scrolling logic
	$: if ($selectedPlotId !== null) {
		// This code runs whenever selectedPlotId changes
		const scrollToPlot = async () => {
			await tick(); // Wait for the DOM to update
			const element = document.getElementById(`plot-wrapper-${$selectedPlotId}`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		};
		scrollToPlot();
	}
</script>

<div class="farming-area-container">
	<div class="top-half">
		<div class="map-info-container">
			<div class="map-viewport">
				<img
					src="/farmingHomestead.png"
					alt="Farming Area Map"
					class="map"
					class:pan-down={showBottomHalf}
				/>
				<MapGrid />
			</div>
		</div>
		<div class="dashboard">

			<div class="season-controls">
				<div class="season-dropdown">
					<select bind:value={selectedSeason}>
						<option value="Spring">Spring</option>
						<option value="Summer">Summer</option>
						<option value="Autumn">Autumn</option>
						<option value="Winter">Winter</option>
					</select>
					<button on:click={handleSaveSeason}
						><img src="/game_icons/confirm.png" alt="" srcset="" /></button
					>
				</div>
				<strong>It's {$seasonStore}!</strong>
			</div>

			<div class="controls">
				<button on:click={() => FarmingService.refreshHomestead()} class="refresh">
					<!-- Refresh Crops -->
					<img src="/game_icons/refresh.svg" alt="" srcset="" />
				</button>
				<div class="tray1">
					<button class="green-btn" on:click={() => (showCompost = true)}>Compost</button>
					<button class="green-btn" on:click={() => (showCodex = true)}>Farming Codex</button>
				</div>
				<label>
					<input type="checkbox" on:change={handleLevelTest} bind:checked={isLevel99} />
					Farming: Lv99
				</label>
			</div>

			<div class="environment-tabs">
				{#each $availableEnvironments as env}
					<button
						class:active={$currentEnvironment === env.id}
						disabled={!env.unlocked}
						on:click={() => selectEnvironment(env.id)}
					>
						{env.name}
					</button>
				{/each}
			</div>
		</div>
	</div>
	<div class="plots-grid">
		{#each $plotsInCurrentEnvironment as plot (plot.id)}
			<div id="plot-wrapper-{plot.mapObjectId}">
				<FarmPlot {plot} />
			</div>
		{/each}
	</div>

	{#if showCodex}
		<FarmingCodex on:close={() => (showCodex = false)} />
	{/if}

	{#if showCompost}
		<CompostPage on:close={() => (showCompost = false)} />
	{/if}
</div>

<style>
	.farming-area-container {
		/* padding: 2rem; */
		width: 100%;
		min-height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1rem; /* Reduced gap */
		background-color: #1d6962;
		color: white;
		font-family: sans-serif;
		/* border: 1px solid white; */
	}

	.top-half {
		display: flex;
	}

	.dashboard {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.2);
		/* padding: 1rem; */
		border-radius: 8px;
		margin: 1rem;
		/* padding-top: 1rem; */
		button img {
			width: 20px;
			height: 20px;
		}
	}

	.controls {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		/* justify-content: space-between; */
		/* margin: 0; */
		/* padding: 1rem; */
		/* background-color: #777; */
		/* padding-inline: 1rem; */
	}
	.tray1 {
		padding: .5rem;
	}
	.green-btn {
		color: #9baaa4;
		padding: 0;
		box-sizing: border-box;
		border: 3px solid var(--color-secondary);
		/* border: none; */
		font-family: var(--font-family-pixel);
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		font-family: var(--font-family-pixel);
		border-radius: 0.5rem;
		box-shadow: #313131 0 -6px 0 0px inset;
		background-color: #435e52;
		transition: .1s all ease-in;
		&:hover {
			box-shadow: #313131 0 -6px 0px -4px inset;
			color: #ffffff;
			transform: translateY(-2px);
		}
		&:active {
			transform: translateY(0px);
			color: #9baaa4;
		}
	}
	.refresh {
		margin: 1rem;
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: .5rem;
		margin: 1rem;
		border-radius: 0;
		border: none;
		background-color: #5e948f;
		transition: .1s all ease-in-out;
		img {
			filter: invert();
			scale: 1;
		}
		&:hover {
			background-color: #40ada2;
			img {
				scale: 1.3;
				transform: rotateZ(45deg);
			}
		}
	}

	.season-controls {
		width: 100%;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 0.25rem;
		background-color: rgba(0, 0, 0, 0.3);
		padding: 0.5rem;
		box-sizing: border-box;
		button {
			border: none;
			background-color: transparent;
			margin-right: auto;
			&:hover {
				filter: brightness(1.3);
				cursor: pointer;
			}
		}
		strong {
			font-family: var(--font-family-pixel);
			font-weight: 400;
		}

		select {
			background-color: rgb(210, 210, 210);
			border-radius: 0;
			border: 3px solid white;
			font-family: var(--font-family-pixel);
		}
	}

	.season-dropdown {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}

	.environment-tabs {
		display: flex;
		/* gap: 0.5rem; */
		margin-top: auto;
	}

	.environment-tabs button {
		padding: 0.5rem 1rem;
		background-color: #555;
		color: white;
		border: none;
		cursor: pointer;
	}

	.environment-tabs button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.environment-tabs button.active {
		background-color: #777;
	}

	.map-info-container {
		position: relative;
		display: flex;
		gap: 2rem;
		/* width: 100%; */
		flex-grow: 1;
		min-height: 0;
		/* border: 1px solid white; */
	}

	.map-viewport {
		width: 100%;
		max-width: 600px;
		aspect-ratio: 2 / 1;
		overflow: hidden;
		position: relative;
		border: 4px solid #6d403b;
		border-radius: 8px;
		max-height: 300px;
		scale: 1;
	}

	.map {
		width: 100%;
		height: auto;
		image-rendering: pixelated;
		transition: transform 0.5s ease-in-out;
		transform: translateY(0); /* Default position */
	}

	.map.pan-down {
		transform: translateY(-50%); /* Move map up to show bottom half */
	}

	.plots-grid {
		flex-grow: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 1rem;
		padding: 1rem;
		background-color: rgba(0, 0, 0, 0.1);
		background-color: #5b7d6d;
		/* overflow-y: auto; */
	}
</style>
