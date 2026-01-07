<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
    import { seasonStore, type Season } from '$lib/stores/seasonStore';
    import FarmPlot from './FarmPlot.svelte';
    import * as FarmingService from '$lib/services/FarmingService';
    import * as SkillService from '$lib/services/SkillService';
    import { derived, writable } from 'svelte/store';
    import { currentEnvironment, type HomesteadEnvironment } from '$lib/stores/environmentStore';
    import MapGrid from './MapGrid.svelte';
    import { selectedPlotId } from '$lib/stores/uiStore';
    import { tick } from 'svelte';

    let selectedSeason: Season;
	$: selectedSeason = $seasonStore;

    const availableEnvironments = derived(playerStore, ($playerStore) => {
        const environments = [
            { id: 'env_open_field', name: 'Open Field', unlocked: true }, // Always unlocked
            { id: 'env_greenhouse', name: 'Greenhouse', unlocked: $playerStore.unlockedTech.includes('env_greenhouse') },
            { id: 'env_forest_floor', name: 'Forest Floor', unlocked: $playerStore.unlockedTech.includes('env_forest_floor') },
        ];
        return environments;
    });

    const plotsInCurrentEnvironment = derived([playerStore, currentEnvironment], ([$playerStore, $currentEnvironment]) => {
        return $playerStore.homestead.farmPlots.filter(plot => 
            plot.environment === $currentEnvironment &&
            $playerStore.farmingLevel >= plot.requiredLevel
        );
    });

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

    $: showBottomHalf = $currentEnvironment === 'env_greenhouse' || $currentEnvironment === 'env_forest_floor';

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
    <div class="header-controls">
        <h2>Farming Area</h2>
        <div class="season-controls">
            <span>Season:</span>
            <strong>{$seasonStore}</strong>
            <select bind:value={selectedSeason}>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
            </select>
            <button on:click={handleSaveSeason}>Set (Test)</button>
        </div>
        <div class="test-controls">
            <label>
                <input type="checkbox" on:change={handleLevelTest} bind:checked={isLevel99} />
                Set Farming Lvl 99
            </label>
        </div>
        <button on:click={() => FarmingService.refreshHomestead()}>Refresh Crops</button>
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

    <div class="map-info-container">
        <div class="map-viewport">
            <img src="/farmingHomestead.png" alt="Farming Area Map" class="map" class:pan-down={showBottomHalf}>
            <MapGrid />
        </div>
        <div class="plots-grid">
            {#each $plotsInCurrentEnvironment as plot (plot.id)}
                <div id="plot-wrapper-{plot.mapObjectId}">
                    <FarmPlot {plot} />
                </div>
            {/each}
        </div>
    </div>

</div>

<style>
    .farming-area-container {
        padding: 2rem;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 1rem; /* Reduced gap */
        background-color: #1d6962;
        color: white;
        font-family: sans-serif;
    }

    .header-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: 8px;
    }

    .season-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .environment-tabs {
        display: flex;
        gap: 0.5rem;
    }

    .environment-tabs button {
        padding: 0.5rem 1rem;
        background-color: #555;
        color: white;
        border: none;
        border-radius: 4px;
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
        display: flex;
        gap: 2rem;
        width: 100%;
        flex-grow: 1; /* Allow container to grow */
        min-height: 0; /* Prevent flexbox overflow issues */
    }

    .map-viewport {
        width: 50%;
        max-width: 480px; /* Set max-width to image's native size */
        aspect-ratio: 2 / 1; /* Viewport is half the height of the map */
        overflow: hidden;
        position: relative;
        border: 4px solid #6d403b;
        border-radius: 8px;
        max-height: 240px;
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
        width: 50%;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
        align-content: flex-start; /* Align items to the start */
        overflow-y: auto;
        flex-grow: 1;
        padding: 1rem;
        background-color: rgba(0,0,0,0.1);
        border-radius: 8px;
    }
</style>