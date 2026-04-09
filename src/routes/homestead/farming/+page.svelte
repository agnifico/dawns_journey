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
	import Notification from '$lib/components/Notification.svelte';

	// TODO: Season system — wire season into crop growth bonuses, season transitions, and UI.
	// The selectedSeason / handleSaveSeason below are dev-only overrides.
	let selectedSeason: Season;
	$: selectedSeason = $seasonStore;

	let showCodex   = false;
	let showCompost = false;
	let showDevTools = false;

	const availableEnvironments = derived(playerStore, ($playerStore) => [
		{ id: 'env_open_field',  name: 'Open Field',   unlocked: true },
		{ id: 'env_greenhouse',  name: 'Greenhouse',   unlocked: $playerStore.unlockedTech.includes('env_greenhouse') },
		{ id: 'env_forest_floor', name: 'Forest Floor', unlocked: $playerStore.unlockedTech.includes('env_forest_floor') },
	]);

	const plotsInCurrentEnvironment = derived(
		[playerStore, currentEnvironment],
		([$playerStore, $currentEnvironment]) =>
			$playerStore.homestead.farmPlots.filter(
				(plot) =>
					plot.environment === $currentEnvironment &&
					$playerStore.farmingLevel >= plot.requiredLevel
			)
	);

	function handleSaveSeason() { seasonStore.setSeason(selectedSeason); }

	function handleLevelTest(event: Event) {
		const isChecked = (event.target as HTMLInputElement).checked;
		SkillService.setSkillLevel('farming', isChecked ? 99 : 1);
	}

	function selectEnvironment(envId: HomesteadEnvironment) {
		currentEnvironment.set(envId);
		selectedPlotId.set(null);
	}

	$: showBottomHalf =
		$currentEnvironment === 'env_greenhouse' || $currentEnvironment === 'env_forest_floor';

	let isLevel99: boolean;
	$: isLevel99 = $playerStore.farmingLevel > 1;

	$: if ($selectedPlotId !== null) {
		const scrollToPlot = async () => {
			await tick();
			const element = document.getElementById(`plot-wrapper-${$selectedPlotId}`);
			if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		};
		scrollToPlot();
	}
</script>

<div class="farming-area-container">
	<div class="top-half">

		<!-- Map viewport -->
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

		<!-- Dashboard -->
		<div class="dashboard">

			<!-- Season banner -->
			<div class="season-banner">
				<span class="season-label">It's</span>
				<strong class="season-name">{$seasonStore}</strong>
			</div>

			<!-- Primary actions -->
			<div class="action-tray">
				<button class="forge-btn" on:click={() => (showCompost = true)}>Compost</button>
				<button class="forge-btn" on:click={() => (showCodex = true)}>Farming Codex</button>
				<button class="refresh-btn" on:click={() => FarmingService.refreshHomestead()} title="Refresh crops">
					<img src="/game_icons/refresh.svg" alt="Refresh" />
				</button>
			</div>

			<!-- Environment tabs -->
			<div class="environment-tabs">
				{#each $availableEnvironments as env}
					<button
						class="env-tab"
						class:active={$currentEnvironment === env.id}
						disabled={!env.unlocked}
						on:click={() => selectEnvironment(env.id)}
					>
						{env.name}
					</button>
				{/each}
			</div>

			<!-- Dev tools (collapsed by default) -->
			<div class="dev-tools">
				<button class="dev-toggle" on:click={() => (showDevTools = !showDevTools)}>
					<span>DEV</span>
					<span class="dev-chevron" class:open={showDevTools}>›</span>
				</button>
				{#if showDevTools}
					<div class="dev-panel">
						<label class="dev-row">
							<input type="checkbox" on:change={handleLevelTest} bind:checked={isLevel99} />
							<span>Farming Lv99</span>
						</label>
						<!-- TODO: Season system — replace with proper season mechanic -->
						<div class="dev-row season-row">
							<select bind:value={selectedSeason}>
								<option value="Spring">Spring</option>
								<option value="Summer">Summer</option>
								<option value="Autumn">Autumn</option>
								<option value="Winter">Winter</option>
							</select>
							<button class="dev-confirm" on:click={handleSaveSeason}>✓</button>
						</div>
						<span class="dev-note">// season system pending</span>
					</div>
				{/if}
			</div>

		</div>
	</div>

	<!-- Plots grid -->
	<div class="plots-grid">
		{#each $plotsInCurrentEnvironment as plot (plot.id)}
			<div id="plot-wrapper-{plot.mapObjectId}">
				<FarmPlot {plot} />
			</div>
		{/each}
	</div>

	{#if showCodex}   <FarmingCodex on:close={() => (showCodex = false)} />   {/if}
	{#if showCompost} <CompostPage  on:close={() => (showCompost = false)} /> {/if}
	<Notification />
</div>

<style>
	/* ── Page ── */
	.farming-area-container {
		width: 100%;
		min-height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background-color: #1d6962;
		color: white;
		font-family: var(--font-family-pixel, monospace);
	}

	.top-half {
		display: flex;
		align-items: stretch;
	}

	/* ── Map ── */
	.map-info-container {
		position: relative;
		display: flex;
		flex-grow: 1;
		min-height: 0;
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
	}
	.map {
		width: 100%;
		height: auto;
		image-rendering: pixelated;
		transition: transform 0.5s ease-in-out;
		transform: translateY(0);
	}
	.map.pan-down { transform: translateY(-50%); }

	/* ── Dashboard ── */
	.dashboard {
		display: flex;
		flex-direction: column;
		background-color: rgba(0, 0, 0, 0.22);
		border-radius: 8px;
		margin: 0.75rem;
		overflow: hidden;
		min-width: 200px;
	}

	/* Season banner */
	.season-banner {
		display: flex;
		align-items: baseline;
		gap: 5px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.3);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.season-label {
		font-size: 0.6rem;
		color: #7aaa8a;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.season-name {
		font-size: 0.85rem;
		font-weight: 400;
		color: #e0f0e0;
		letter-spacing: 0.06em;
	}

	/* Primary action tray */
	.action-tray {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px;
		flex-grow: 1;
	}

	/* Forge buttons */
	.forge-btn {
		color: #9baaa4;
		box-sizing: border-box;
		border: 3px solid var(--color-secondary, #5a8a6a);
		font-family: var(--font-family-pixel);
		font-size: 0.7rem;
		padding: 0.45rem 0.75rem 0.7rem;
		border-radius: 0.5rem;
		box-shadow: #313131 0 -6px 0 0 inset;
		background-color: #435e52;
		cursor: pointer;
		transition: 0.1s all ease-in;
	}
	.forge-btn:hover {
		box-shadow: #313131 0 -2px 0 0 inset;
		color: #ffffff;
		transform: translateY(2px);
	}
	.forge-btn:active {
		transform: translateY(3px);
		box-shadow: none;
	}

	/* Refresh */
	.refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		border-radius: 6px;
		border: 2px solid rgba(0, 0, 0, 0.3);
		background-color: #5e948f;
		box-shadow: rgba(0,0,0,0.35) 0 -3px 0 0 inset;
		cursor: pointer;
		transition: 0.15s all ease-in-out;
	}
	.refresh-btn img {
		width: 18px;
		height: 18px;
		filter: invert();
		transition: transform 0.3s ease;
	}
	.refresh-btn:hover {
		background-color: #40ada2;
	}
	.refresh-btn:hover img {
		transform: rotate(90deg);
	}

	/* ── Environment tabs ── */
	.environment-tabs {
		display: flex;
		border-top: 1px solid rgba(0, 0, 0, 0.25);
	}
	.env-tab {
		flex: 1;
		padding: 8px 4px 11px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		letter-spacing: 0.04em;
		color: #7aaa8a;
		background: rgba(0, 0, 0, 0.2);
		border: none;
		border-right: 1px solid rgba(0, 0, 0, 0.2);
		cursor: pointer;
		box-shadow: rgba(0,0,0,0.4) 0 -4px 0 0 inset;
		transition: 0.1s all ease-in;
	}
	.env-tab:last-child { border-right: none; }
	.env-tab:hover:not(:disabled):not(.active) {
		background: rgba(0, 0, 0, 0.1);
		color: #c0e0c0;
		padding-bottom: 8px;
		box-shadow: rgba(0,0,0,0.4) 0 -1px 0 0 inset;
	}
	.env-tab.active {
		background: #3a5a48;
		color: #e0f0e0;
		padding-bottom: 8px;
		box-shadow: rgba(0,0,0,0.3) 0 -1px 0 0 inset;
		cursor: default;
	}
	.env-tab:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	/* ── Dev tools ── */
	.dev-tools {
		border-top: 1px solid rgba(255, 255, 255, 0.04);
	}
	.dev-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 5px 10px;
		background: rgba(0, 0, 0, 0.3);
		border: none;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: #4a6a4a;
		letter-spacing: 0.15em;
		transition: color 0.15s;
	}
	.dev-toggle:hover { color: #7a9a7a; }

	.dev-chevron {
		font-size: 1rem;
		line-height: 1;
		transition: transform 0.2s;
	}
	.dev-chevron.open { transform: rotate(90deg); }

	.dev-panel {
		padding: 8px 10px;
		background: rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.dev-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: #6a8a6a;
		cursor: pointer;
	}
	.dev-row input[type="checkbox"] {
		accent-color: #5a8a5a;
		width: 13px;
		height: 13px;
	}
	.season-row select {
		flex: 1;
		background: #1a2a1a;
		border: 1px solid #3a5a3a;
		border-radius: 4px;
		color: #8aaa8a;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		padding: 2px 4px;
	}
	.dev-confirm {
		background: #2a4a2a;
		border: 1px solid #3a6a3a;
		border-radius: 4px;
		color: #8aaa8a;
		font-size: 0.7rem;
		padding: 2px 6px;
		cursor: pointer;
	}
	.dev-confirm:hover { background: #3a5a3a; color: #c0e0c0; }
	.dev-note {
		font-size: 0.48rem;
		color: #3a5a3a;
		font-style: italic;
		letter-spacing: 0.06em;
	}

	/* ── Plots grid ── */
	.plots-grid {
		flex-grow: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 1rem;
		padding: 1rem;
		background-color: #4e7062;
	}
</style>