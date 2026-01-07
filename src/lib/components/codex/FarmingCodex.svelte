<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import CropAlmanac from './CropAlmanac.svelte';
    import UpgradeTree from './UpgradeTree.svelte';

    const dispatch = createEventDispatcher();

    let activeTab: 'almanac' | 'skill_tree' = 'almanac';
</script>

<div class="codex-overlay">
    <div class="codex-modal">
        <header class="codex-header">
            <h2>Farming Codex</h2>
            <button class="close-button" on:click={() => dispatch('close')}>&times;</button>
        </header>
        <div class="codex-tabs">
            <button class:active={activeTab === 'almanac'} on:click={() => activeTab = 'almanac'}>
                Crop Almanac
            </button>
            <button class:active={activeTab === 'skill_tree'} on:click={() => activeTab = 'skill_tree'}>
                Skill Tree
            </button>
        </div>
        <div class="codex-content">
            {#if activeTab === 'almanac'}
                <CropAlmanac />
            {:else if activeTab === 'skill_tree'}
                <UpgradeTree />
            {/if}
        </div>
    </div>
</div>

<style>
    .codex-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .codex-modal {
        width: 90%;
        max-width: 1000px;
        height: 90vh;
        background-color: #2b2b2b;
        border: 2px solid #6d403b;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        color: white;
        font-family: sans-serif;
    }

    .codex-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 2px solid #6d403b;
    }

    .codex-header h2 {
        margin: 0;
        color: #61dafb;
    }

    .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        line-height: 1;
        cursor: pointer;
    }

    .codex-tabs {
        display: flex;
        border-bottom: 1px solid #444;
    }

    .codex-tabs button {
        flex-grow: 1;
        padding: 1rem;
        background-color: #333;
        border: none;
        color: white;
        font-size: 1.1rem;
        cursor: pointer;
        border-bottom: 3px solid transparent;
    }

    .codex-tabs button.active {
        background-color: #444;
        border-bottom-color: #61dafb;
    }

    .codex-content {
        flex-grow: 1;
        padding: 1rem;
        overflow-y: auto;
    }

    .placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 1.5rem;
        color: #888;
    }
</style>
