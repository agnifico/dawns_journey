<script lang="ts">
    import { homesteadStatusState, toggleHomesteadStatus } from '$lib/stores/uiStore';
    import { draggable } from '$lib/actions/draggable';
    import { playerStore } from '$lib/stores/playerStore';
    import { cropDefinitions } from '$lib/data/cropDefinitions';

    let cropsReady = 0;
    $: {
        cropsReady = $playerStore.homestead.farmPlots.filter(plot => {
            if (!plot.crop) return false;
            const cropDef = cropDefinitions[plot.crop.cropDefinitionId];
            if (!cropDef) return false;
            return plot.crop.currentGrowthStage >= cropDef.growthStages.length - 1;
        }).length;
    }
</script>

<div 
    class="widget-container" 
    use:draggable={{ storageKey: 'homestead-status-position', initialPosition: { x: window.innerWidth - 300, y: window.innerHeight - 200 } }}
>
    <div class="widget-header drag-handle">
        <span>Homestead</span>
        <button class="toggle-button" on:click|stopPropagation={toggleHomesteadStatus}>
            {$homesteadStatusState.isCollapsed ? '+' : '-'}
        </button>
    </div>

    {#if !$homesteadStatusState.isCollapsed}
        <div class="widget-body">
            {#if cropsReady > 0}
                <p>{cropsReady} crop(s) ready for harvest!</p>
            {:else}
                <p>All quiet on the farm.</p>
            {/if}
            <!-- We can add compost status here later -->
        </div>
    {/if}
</div>

<style>
    .widget-container {
        position: absolute;
        width: 250px;
        background-color: rgba(0, 0, 0, 0.7);
        border: 1px solid var(--color-border);
        border-radius: 5px;
        color: white;
        font-family: var(--font-family-pixel);
        font-size: 0.9em;
        backdrop-filter: blur(2px);
        z-index: 10;
    }

    .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.4em 0.6em;
        background-color: rgba(0, 0, 0, 0.5);
        cursor: grab;
        border-bottom: 1px solid var(--color-border);
    }

    .toggle-button {
        background: none;
        border: 1px solid var(--color-text-muted);
        color: var(--color-text-muted);
        cursor: pointer;
        width: 20px;
        height: 20px;
        line-height: 1;
        padding: 0;
    }

    .widget-body {
        padding: 0.6em;
    }
    .widget-body p {
        margin: 0;
    }
</style>
