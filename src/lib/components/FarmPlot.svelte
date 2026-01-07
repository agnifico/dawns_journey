<script lang="ts">
    import type { FarmPlot, CropDefinition, Item } from '../types';
    import { cropDefinitions } from '../data/cropDefinitions';
    import { getItemById } from '../services/ItemDataService';
    import { playerStore } from '../stores/playerStore';
    import * as FarmingService from '../services/FarmingService';
    import { onMount } from 'svelte';
    import SeedSelector from '$lib/components/homestead/SeedSelector.svelte';

    export let plot: FarmPlot;

    let cropDef: CropDefinition | undefined;
    let seedItem: Item | undefined;
    let isPlanting = false;
    let selectedSeedId: string | null = null;

    $: if (plot.crop) {
        cropDef = cropDefinitions[plot.crop.cropDefinitionId];
    } else {
        cropDef = undefined;
    }

    $: growthPercentage = plot.crop && cropDef && cropDef.growthStages.length > 0
        ? ((Date.now() - plot.crop.plantedTimestamp) / cropDef.growthStages[plot.crop.currentGrowthStage].duration) * 100
        : 0;

    $: availableSeeds = $playerStore.inventory
        .filter(invItem => {
            const item = getItemById(invItem.itemId);
            return item && item.flags && item.flags.includes('seed');
        })
        .map(invItem => ({
            ...invItem,
            details: getItemById(invItem.itemId)
        }));

    onMount(() => {
        if (availableSeeds.length > 0 && !selectedSeedId) {
            selectedSeedId = availableSeeds[0].itemId;
        }
    });

    function handlePlant() {
        if (selectedSeedId && plot.id) {
            const cropId = Object.values(cropDefinitions).find(def => def.seedItemId === selectedSeedId)?.id;
            if (cropId) {
                FarmingService.plantCrop(plot.id, cropId);
                isPlanting = false;
            }
        }
    }

    function handleWater() {
        FarmingService.waterCrop(plot.id);
    }

    function handleHarvest() {
        FarmingService.harvestCrop(plot.id);
    }

    // TODO: Implement growth stage display and watering status
</script>

<div class="farm-plot">
    {#if plot.crop && cropDef}
        <div class="crop-display">
            <img src={cropDef.growthStages[plot.crop.currentGrowthStage].imagePath} alt={cropDef.name} class="crop-image" />
            <p>{cropDef.name}</p>
            <div class="growth-info">
                <div class="growth-bar-container">
                    <div class="growth-bar-filled" style="width: {growthPercentage}%;"></div>
                </div>
                <p class="growth-stage">Stage {plot.crop.currentGrowthStage + 1} / {cropDef.growthStages.length}</p>
            </div>
            <div class="watering-info">
                {#if cropDef.wateringRequirementType === 'stage_based'}
                    <p>Watered: {plot.crop.wateredCount} / {cropDef.wateringRequirementValue}</p>
                {:else}
                    <p>Watered: {plot.crop.wateredCount} / {cropDef.wateringRequirementValue}</p>
                {/if}
            </div>
            {#if plot.crop.currentGrowthStage === cropDef.growthStages.length - 1}
                <button on:click={handleHarvest}>Harvest</button>
            {:else}
                <button on:click={handleWater}>Water</button>
            {/if}
        </div>
    {:else if isPlanting}
        <div class="planting-ui">
            <SeedSelector seeds={availableSeeds} bind:selectedSeedId={selectedSeedId} />
            <button on:click={handlePlant} disabled={!selectedSeedId}>Plant</button>
            <button on:click={() => isPlanting = false}>Cancel</button>
        </div>
    {:else}
        <div class="empty-plot" on:click={() => isPlanting = true}>
            <p>Empty Plot</p>
            <button>Plant Seed</button>
        </div>
    {/if}
</div>

<style>
    .farm-plot {
        width: 150px;
        height: 200px;
        border: 2px solid #6d403b;
        background-color: #a0522d;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: white;
        font-family: sans-serif;
        position: relative;
    }

    .empty-plot {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .empty-plot:hover {
        background-color: #8b4513;
    }

    .crop-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 5px;
        box-sizing: border-box;
    }

    .crop-image {
        width: 64px;
        height: 64px;
        object-fit: contain;
        image-rendering: pixelated;
    }

    .growth-info {
        width: 100%;
        margin-top: 5px;
    }

    .growth-bar-container {
        width: 100%;
        height: 8px;
        background-color: #555;
        border-radius: 4px;
        overflow: hidden;
    }

    .growth-bar-filled {
        height: 100%;
        background-color: #4caf50;
        transition: width 0.5s ease-in-out;
    }

    .growth-stage {
        font-size: 0.7em;
        margin-top: 2px;
    }

    .watering-info {
        font-size: 0.7em;
        margin-top: 5px;
    }

    .planting-ui {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
    }

    .planting-ui select, .planting-ui button {
        width: 90px;
    }
</style>