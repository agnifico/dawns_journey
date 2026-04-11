<script lang="ts">
    import { getItemById } from '$lib/services/InventoryService';
    import type { CropDefinition } from '$lib/types';

    export let item: CropDefinition;

    $: yieldItem = getItemById(item.yields);
    $: totalGrowTime = item.growthStages.reduce((sum, s) => sum + s.duration, 0);
    $: timePerStage = item.growthStages[0].duration / (60 * 1000);
    $: totalMinutes = totalGrowTime / (60 * 1000);
</script>

<div class="detail">
    <!-- Header -->
    <div class="detail-header">
        <div class="crop-img-wrap">
            {#if yieldItem}
                <img src={yieldItem.image} alt={item.name} />
            {/if}
        </div>
        <div class="header-text">
            <h2 class="crop-name">{item.name}</h2>
            {#if item.idealSeason}
                <span class="season-badge">{item.idealSeason}</span>
            {:else}
                <span class="season-badge any">Any Season</span>
            {/if}
        </div>
    </div>

    <p class="description">{item.description}</p>

    <!-- Stats grid -->
    <div class="info-grid">
        <div class="info-card">
            <span class="info-label">Season Bonus</span>
            <span class="info-value highlight">{item.idealSeasonYieldMultiplier}× Yield</span>
        </div>
        <div class="info-card">
            <span class="info-label">Watering</span>
            <span class="info-value">{item.wateringRequirementValue} × {item.wateringRequirementType === 'lifetime_based' ? 'total' : 'per stage'}</span>
        </div>
        <div class="info-card">
            <span class="info-label">Growth Stages</span>
            <span class="info-value">{item.growthStages.length} stages</span>
        </div>
        <div class="info-card">
            <span class="info-label">Time / Stage</span>
            <span class="info-value">{timePerStage} min</span>
        </div>
        <div class="info-card">
            <span class="info-label">Total Grow Time</span>
            <span class="info-value">{totalMinutes} min</span>
        </div>
        <div class="info-card">
            <span class="info-label">XP Yield</span>
            <span class="info-value highlight">{item.xpYield} XP</span>
        </div>
        <div class="info-card">
            <span class="info-label">Unlock Level</span>
            <span class="info-value">Lv {item.unlockLevel ?? 1}</span>
        </div>
        {#if item.requiredTechs && item.requiredTechs.length > 0}
            <div class="info-card wide">
                <span class="info-label">Required Tech</span>
                <div class="tech-chip-row">
                    {#each item.requiredTechs as tech}
                        <span class="tech-chip">{tech.replace('tech_', '').replace(/_/g, ' ')}</span>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .detail {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
    }

    /* Header */
    .detail-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #2a4a2a;
    }

    .crop-img-wrap {
        width: 60px;
        height: 60px;
        min-width: 60px;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        border: 2px solid #2a4a2a;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .crop-img-wrap img {
        width: 44px;
        height: 44px;
        image-rendering: pixelated;
        object-fit: contain;
    }

    .header-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .crop-name {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 400;
        color: #d0e8d0;
        letter-spacing: 0.06em;
    }

    .season-badge {
        display: inline-block;
        font-size: 0.75rem;
        color: #1a1008;
        background: linear-gradient(135deg, #f0d060, #c88020);
        border-radius: 3px;
        padding: 2px 8px;
        box-shadow: 0 2px 0 #7a4a08, inset 0 1px 0 rgba(255,255,200,0.3);
        letter-spacing: 0.06em;
        width: fit-content;
    }

    .season-badge.any {
        background: #2a4a2a;
        color: #8aaa8a;
        box-shadow: 0 2px 0 #1a2a1a;
    }

    .description {
        font-size: 0.85rem;
        color: #8aaa8a;
        line-height: 1.6;
        margin: 0;
        font-style: italic;
    }

    /* Info grid */
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
    }

    .info-card {
        background: rgba(0,0,0,0.22);
        border: 1px solid #2a4a2a;
        border-radius: 6px;
        padding: 0.7rem 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-shadow: rgba(0,0,0,0.4) 0 -2px 0 0 inset;
    }

    .info-card.wide {
        grid-column: 1 / -1;
    }

    .info-label {
        font-size: 0.75rem;
        color: #5a7a5a;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .info-value {
        font-size: 0.9rem;
        color: #c0e0c0;
    }

    .info-value.highlight {
        color: #80d880;
    }

    .tech-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 2px;
    }

    .tech-chip {
        font-size: 0.75rem;
        color: #6aaa7a;
        background: rgba(0,0,0,0.3);
        border: 1px solid #3a6a4a;
        border-radius: 3px;
        padding: 2px 7px;
        text-transform: capitalize;
    }
</style>