<script lang="ts">
    import { getHomesteadPlots, type HomesteadPlots, type PlotData } from '$lib/services/HomesteadDataService';
    import { currentEnvironment, type HomesteadEnvironment } from '$lib/stores/environmentStore';
    import { derived } from 'svelte/store';
    import { selectedPlotId } from '$lib/stores/uiStore';

    const homesteadPlots = getHomesteadPlots();

    const environmentKeyMap: Record<HomesteadEnvironment, keyof HomesteadPlots> = {
        env_open_field: 'open_field',
        env_greenhouse: 'greenhouse',
        env_forest_floor: 'forest_floor'
    };

    const currentPlots = derived(
        currentEnvironment,
        ($currentEnvironment) => {
            const key = environmentKeyMap[$currentEnvironment];
            return homesteadPlots[key] || [];
        }
    );

    function handlePlotClick(plot: PlotData) {
        // If the same plot is clicked again, deselect it. Otherwise, select the new plot.
        if ($selectedPlotId === plot.id) {
            selectedPlotId.set(null);
        } else {
            selectedPlotId.set(plot.id);
        }
    }

    $: showBottomHalf = $currentEnvironment === 'env_greenhouse' || $currentEnvironment === 'env_forest_floor';
</script>

<div class="map-grid-overlay" class:pan-down={showBottomHalf}>
    {#each $currentPlots as plot (plot.id)}
        <div
            class="plot-area"
            class:selected={$selectedPlotId === plot.id}
            style="left: {plot.x}px; top: {plot.y}px; width: {plot.width}px; height: {plot.height}px;"
            on:click={() => handlePlotClick(plot)}
            title="Plot #{plot.plotNumber}"
        >
            <span class="plot-number">{plot.plotNumber}</span>
        </div>
    {/each}
</div>

<style>
    .map-grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 200%; /* Make overlay twice as high to match the full map image */
        pointer-events: none; /* Allow clicks to pass through the container */
        transition: transform 0.5s ease-in-out;
        transform: translateY(0);
    }

    .map-grid-overlay.pan-down {
        transform: translateY(-50%);
    }

    .plot-area {
        position: absolute;
        background-color: rgba(76, 175, 80, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.7);
        box-sizing: border-box;
        pointer-events: all; /* Enable clicks on the plots themselves */
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .plot-area:hover {
        background-color: rgba(139, 195, 74, 0.6);
    }

    .plot-area.selected {
        background-color: rgba(255, 235, 59, 0.5);
        border-color: #FFF;
    }

    .plot-number {
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }
</style>
