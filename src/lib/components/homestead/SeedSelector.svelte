<script lang="ts">
    import type { FarmPlot as FarmPlotType } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { cropDefinitions } from '$lib/data/cropDefinitions';
    import { derived, writable } from 'svelte/store'; // Import writable
    import { getItemById } from '$lib/services/ItemDataService';

    

    export let plot: FarmPlotType;
    export let useCompost: boolean;
    export let selectedSeedId: string | null = null;

    // Create a local writable store for useCompost to make it reactive
    const _useCompost = writable(useCompost);

    // Update the local store whenever the prop changes
    $: _useCompost.set(useCompost);

    // Get all possible seeds from the crop definitions, now also reactive to _useCompost
    const allPossibleSeedsWithPlantability = derived([playerStore, _useCompost], ([$playerStore, $currentUseCompost]) => {
        return Object.values(cropDefinitions).map(def => {
            const itemDetails = getItemById(def.seedItemId);
            const inventoryItem = $playerStore.inventory.find(i => i.itemId === def.seedItemId);

            // Re-evaluate canPlant for each seed whenever playerStore or _useCompost changes
            const plantCheck = canPlant(def.seedItemId, $playerStore, $currentUseCompost);

            return {
                itemId: def.seedItemId,
                amount: inventoryItem ? inventoryItem.amount : 0,
                details: itemDetails,
                canPlant: plantCheck.can,
                reason: plantCheck.reason
            };
        });
    });

    // canPlant now takes player and useCompost as explicit arguments
    function canPlant(seedItemId: string, player: any, currentUseCompost: boolean): { can: boolean, reason: string } {
        const cropDef = Object.values(cropDefinitions).find(c => c.seedItemId === seedItemId);
        
        if (!cropDef) return { can: false, reason: 'Crop data not found.' };
        if (!plot) return { can: false, reason: 'No plot selected.' };

        // Check Environment
        if (!cropDef.requiredEnvironment.includes(plot.environment)) {
            const requiredEnvNames = cropDef.requiredEnvironment.map(e => e.replace('env_', '').replace('_', ' ')).join(' or ');
            return { can: false, reason: `Requires: ${requiredEnvNames}` };
        }

        // Check Plot Tech
        const hasAllTech = cropDef.requiredTech.every(tech => {
            if (tech === 'tech_compost_bin') {
                return currentUseCompost; // Use the passed currentUseCompost
            }
            return plot.appliedTech.includes(tech);
        });
        if (!hasAllTech) {
            const requiredTechNames = cropDef.requiredTech.map(t => t.replace('tech_', '').replace('_', ' ')).join(', ');
            return { can: false, reason: `Requires: ${requiredTechNames}` };
        }

        // Check Global Upgrades
        const hasAllUpgrades = (cropDef.requiredUpgrades || []).every(upgrade => 
            player.unlockedTech.includes(upgrade)
        );
        if (!hasAllUpgrades) {
            const requiredUpgradeNames = (cropDef.requiredUpgrades || []).map(u => u.replace('upgrade_', '').replace('_', ' ')).join(', ');
            return { can: false, reason: `Requires Global Upgrade: ${requiredUpgradeNames}` };
        }

        return { can: true, reason: '' };
    }
</script>

<div class="seed-selector">
    <h4>Select a Seed</h4>
    <div class="seed-list">
        {#each $allPossibleSeedsWithPlantability as seed (seed.itemId)}
            {#if seed.details}
                {@const hasSeeds = seed.amount > 0}
                <button 
                    class="seed-item" 
                    class:selected={selectedSeedId === seed.itemId}
                    class:disabled={!seed.canPlant || !hasSeeds} 
                    title={seed.canPlant ? (hasSeeds ? seed.details.name : 'You have no seeds of this type.') : seed.reason}
                    on:click={() => { if(seed.canPlant && hasSeeds) selectedSeedId = seed.itemId }}
                    disabled={!seed.canPlant || !hasSeeds}
                >
                    <img src={seed.details.image} alt={seed.details.name} />
                    <span>{seed.details.name} (x{seed.amount})</span>
                </button>
            {/if}
        {:else}
            <p>No seeds defined in the game.</p>
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
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 120px;
        overflow-y: auto;
        padding-right: 5px;
    }
    .seed-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        background-color: #444;
        border: 1px solid #666;
        border-radius: 4px;
        width: 100%;
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
        width: 24px;
        height: 24px;
        image-rendering: pixelated;
    }
</style>
