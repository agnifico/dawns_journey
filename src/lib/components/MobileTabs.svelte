<script lang="ts">
    let activeTab: 'stats' | 'equipment' = 'stats';
</script>

<div class="mobile-tabs">
    <div class="tabs">
        <button class="tab-button" class:active={activeTab === 'stats'} on:click={() => activeTab = 'stats'}>Stats</button>
        <button class="tab-button" class:active={activeTab === 'equipment'} on:click={() => activeTab = 'equipment'}>Equipment</button>
    </div>
    <div class="tab-content">
        {#if activeTab === 'stats'}
            <slot name="stats"></slot>
        {:else}
            <slot name="equipment"></slot>
        {/if}
    </div>
</div>

<style>
    .tabs {
        display: flex;
    }
    .tab-button {
        flex-grow: 1;
        padding: 1em;
        background-color: var(--color-surface-2);
        color: var(--color-text);
        border: none;
        cursor: pointer;
    }
    .tab-button.active {
        background-color: var(--color-surface-1);
    }
    .tab-content {
        /* padding: 1em; */
        background-color: var(--color-background);
    }
</style>
