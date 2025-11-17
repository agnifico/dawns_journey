<script lang="ts">
    import type { CropDefinition } from '$lib/types';

    export let item: CropDefinition;
</script>

<div class="detail-container">
    <div class="detail-header">
        <img src={item.growthStages[item.growthStages.length - 1].imagePath} alt={item.name} class="detail-image" />
        <h1>{item.name}</h1>
    </div>
    <p class="description">{item.description}</p>
    <div class="info-grid">
        <div class="info-item">
            <span class="info-label">Ideal Season</span>
            <span class="info-value">{item.idealSeason || 'Any'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Season Bonus</span>
            <span class="info-value">{item.growthMultiplierInIdealSeason}x Growth</span>
        </div>
        <div class="info-item">
            <span class="info-label">Watering</span>
            <span class="info-value">{item.wateringRequirementValue} per {item.wateringRequirementType === 'lifetime_based' ? 'lifetime' : 'stage'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Growth Stages</span>
            <span class="info-value">{item.growthStages.length}</span>
        </div>
        <div class="info-item">
            <span class="info-label">XP Yield</span>
            <span class="info-value">{item.xpYield}</span>
        </div>
         <div class="info-item">
            <span class="info-label">Unlock Level</span>
            <span class="info-value">{item.unlockLevel || 1}</span>
        </div>
    </div>
</div>

<style>
    .detail-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .detail-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #444;
    }

    .detail-image {
        width: 64px;
        height: 64px;
        min-width: 64px;
        image-rendering: pixelated;
        background-color: rgba(0,0,0,0.2);
        border-radius: 8px;
        padding: 0.5rem;
    }

    .detail-header h1 {
        margin: 0;
        font-size: 2rem;
    }

    .description {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.6;
        color: #ddd;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background-color: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: 8px;
    }

    .info-label {
        font-weight: bold;
        color: #888;
        font-size: 0.9rem;
        text-transform: uppercase;
    }

    .info-value {
        font-size: 1.2rem;
    }
</style>
