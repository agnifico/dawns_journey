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
            <h2 class="codex-title">Farming Codex</h2>
            <button class="close-btn" on:click={() => dispatch('close')}>✕</button>
        </header>

        <div class="codex-tabs">
            <button
                class="tab-btn"
                class:active={activeTab === 'almanac'}
                on:click={() => activeTab = 'almanac'}
            >Crop Almanac</button>
            <button
                class="tab-btn"
                class:active={activeTab === 'skill_tree'}
                on:click={() => activeTab = 'skill_tree'}
            >Skill Tree</button>
        </div>

        <div class="codex-content">
            {#if activeTab === 'almanac'}
                <CropAlmanac />
            {:else}
                <UpgradeTree />
            {/if}
        </div>
    </div>
</div>

<style>
    .codex-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .codex-modal {
        width: 90%;
        max-width: 1000px;
        height: 90vh;
        background: #1e2a20;
        border: 3px solid #3a5a3a;
        border-radius: 12px;
        box-shadow:
            0 0 0 1px #0a1a0a,
            rgba(0,0,0,0.6) 0 -8px 0 0 inset,
            0 24px 60px rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        color: #d0e8d0;
        font-family: var(--font-family-pixel, monospace);
        overflow: hidden;
    }

    /* Header */
    .codex-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.9rem 1.25rem;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 2px solid #2a4a2a;
        flex-shrink: 0;
    }

    .codex-title {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8acc8a;
        font-weight: 400;
    }

    .close-btn {
        background: rgba(0,0,0,0.25);
        border: 2px solid #3a5a3a;
        border-radius: 6px;
        color: #7aaa7a;
        font-size: 0.85rem;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
        transition: 0.1s all ease-in;
        line-height: 1;
    }
    .close-btn:hover { background: rgba(180,60,60,0.25); border-color: #8a3a3a; color: #ffaaaa; }
    .close-btn:active { transform: translateY(2px); box-shadow: none; }

    /* Tabs */
    .codex-tabs {
        display: flex;
        flex-shrink: 0;
        border-bottom: 2px solid #2a4a2a;
    }

    .tab-btn {
        flex: 1;
        padding: 0.75rem 1rem 0.9rem;
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.85rem;
        letter-spacing: 0.06em;
        color: #6a8a6a;
        background: rgba(0,0,0,0.2);
        border: none;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        box-shadow: rgba(0,0,0,0.4) 0 -4px 0 0 inset;
        transition: 0.1s all ease-in;
        padding-bottom: 0px;
    }
    .tab-btn:hover:not(.active) {
        color: #a0c8a0;
        background: rgba(0,0,0,0.1);
        padding-bottom: 0.75rem;
        box-shadow: rgba(0,0,0,0.4) 0 -4px 0 0 inset;
    }
    .tab-btn.active {
        color: #c0e8c0;
        background: #1e2a20;
        border-bottom-color: #5aaa5a;
        padding-bottom: 0.75rem;
        box-shadow: none;
        cursor: default;
    }

    /* Content */
    .codex-content {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #2a4a2a transparent;
    }
</style>