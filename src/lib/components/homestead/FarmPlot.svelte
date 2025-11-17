<script lang="ts">
    import type { FarmPlot as FarmPlotType } from '$lib/types';
    import { cropDefinitions } from '$lib/data/cropDefinitions';
    import { playerStore } from '$lib/stores/playerStore';
    import * as FarmingService from '$lib/services/FarmingService';
    import { derived } from 'svelte/store';
    import SeedSelector from './SeedSelector.svelte';
    import ProgressBar from '../ui/ProgressBar.svelte';
    import PipBar from '../ui/PipBar.svelte';
    import PlotActions from './PlotActions.svelte';
    import { selectedPlotId } from '$lib/stores/selectionStore';

    export let plot: FarmPlotType;

    let isPlanting = false;
    let showPlotActions = false;
    let selectedSeedId: string | null = null;
    let useCompost = false; // State for the compost checkbox

    const cropDef = derived(playerStore, () => {
        if (plot.crop) {
            return Object.values(cropDefinitions).find(c => c.id === plot.crop.cropDefinitionId);
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

    function handlePlant() {
        if (selectedSeedId && plot.id) {
            const cropId = Object.values(cropDefinitions).find(def => def.seedItemId === selectedSeedId)?.id;
            if (cropId) {
                // Pass the useCompost state to the service
                FarmingService.plantCrop(plot.id, cropId, useCompost);
                isPlanting = false;
                useCompost = false; // Reset after planting
            }
        }
    }
</script>

<div class="farm-plot" class:selected={$selectedPlotId === plot.mapObjectId}>
    {#if plot.crop && $cropDef}
        <div class="crop-display">
            <img src={$cropDef.growthStages[plot.crop.currentGrowthStage].imagePath} alt={$cropDef.name} class="crop-image" />
            <p class="crop-name">{$cropDef.name}</p>
            
            <div class="info-section">
                <span>Stage:</span>
                <PipBar value={plot.crop.currentGrowthStage} max={$cropDef.growthStages.length} />
            </div>

            <div class="info-section">
                <span>Growth:</span>
                <ProgressBar value={$growthProgressInStage} max={100} color="#4ade80" />
            </div>

            <div class="info-section">
                <span>Water:</span>
                <ProgressBar value={plot.crop.wateredCount} max={$cropDef.wateringRequirementValue} color="#3b82f6" />
            </div>

            {#if plot.appliedTech.length > 0}
                <div class="applied-tech">
                    Applied: {#each plot.appliedTech as tech} {tech.replace('tech_', '').replace('_', ' ')} {/each}
                </div>
            {/if}

            {#if plot.crop.currentGrowthStage >= $cropDef.growthStages.length - 1}
                <button class="action-button" on:click={() => FarmingService.harvestCrop(plot.id)}>Harvest</button>
            {:else}
                <button class="action-button" on:click={() => FarmingService.waterCrop(plot.id)}>Water</button>
            {/if}
        </div>
    {:else if isPlanting}
        <div class="planting-ui">
            <div class="compost-option">
                <label>
                    <input type="checkbox" bind:checked={useCompost} />
                    Use Compost
                </label>
            </div>
            <!-- SeedSelector now receives useCompost as a prop -->
            <SeedSelector {plot} bind:selectedSeedId {useCompost} />

            <div class="plant-actions">
                <button on:click={handlePlant} disabled={!selectedSeedId}>Plant</button>
                <button on:click={() => { isPlanting = false; useCompost = false; }}>Cancel</button>
            </div>
        </div>
    {:else if showPlotActions}
        <div class="plot-actions-ui">
            <PlotActions {plot} />
            <button class="action-button" on:click={() => showPlotActions = false}>Back</button>
        </div>
    {:else}
        <div class="empty-plot">
            <button class="plant-button" on:click={() => isPlanting = true}>
                <span class="plus-icon">+</span>
                <span>Plant Crop</span>
            </button>
            
            {#if plot.appliedTech.length > 0}
                <div class="applied-tech">
                    Applied: {#each plot.appliedTech as tech} {tech.replace('tech_', '').replace('_', ' ')} {/each}
                </div>
            {/if}
            <button class="action-button" on:click|stopPropagation={() => showPlotActions = true}>Actions</button>
        </div>
    {/if}
</div>

<style>
    .farm-plot {
        width: 160px;
        height: 240px; /* Increased height for compost checkbox */
        border: 2px solid #6d403b;
        background-color: #2b2b2b;
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        box-sizing: border-box;
        color: white;
        font-family: sans-serif;
        gap: 0.5rem;
        transition: border-color 0.2s ease;
    }

    .farm-plot.selected {
        border-color: #FFF;
    }

    .empty-plot {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Adjusted for spacing */
        align-items: center;
        border-radius: 4px;
    }
    .plant-button {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 2px dashed #6d403b;
        background: none;
        color: white;
        padding: 0;
        margin-bottom: 0.5rem;
    }
    .plant-button:hover {
        background-color: #5eb48d;
    }
    .plus-icon {
        font-size: 2rem;
        font-weight: bold;
        color: #bdbdbd;
    }

    .crop-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        width: 100%;
    }
    .crop-image {
        width: 80px;
        height: 80px;
        object-fit: contain;
        image-rendering: pixelated;
        margin-bottom: 0.5rem;
    }
    .crop-name {
        margin: 0;
        font-weight: bold;
    }
    .info-section {
        width: 100%;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    .action-button {
        margin-top: auto;
        width: 100%;
    }
    .planting-ui, .plot-actions-ui {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
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
    .applied-tech {
        font-size: 0.7rem;
        color: #ccc;
        text-align: center;
        text-transform: capitalize;
    }
</style>