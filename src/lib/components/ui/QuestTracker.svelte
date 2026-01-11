<script lang="ts">
    import { questTrackerState, toggleQuestTracker } from '$lib/stores/uiStore';
    import { questStore } from '$lib/stores/questStore';
    import { questProgressStore } from '$lib/stores/questProgressStore';
    import { draggable } from '$lib/actions/draggable';
    import type { Quest } from '$lib/types';

    let activeQuests: Quest[] = [];
    $: {
        activeQuests = Object.values($questStore.quests).filter(q => q.state === 'ACTIVE');
    }
</script>

<div 
    class="widget-container" 
    use:draggable={{ storageKey: 'quest-tracker-position', initialPosition: { x: window.innerWidth - 300, y: window.innerHeight - 400 } }}
>
    <div class="widget-header drag-handle">
        <span>Active Quests</span>
        <button class="toggle-button" on:click|stopPropagation={toggleQuestTracker}>
            {$questTrackerState.isCollapsed ? '+' : '-'}
        </button>
    </div>

    {#if !$questTrackerState.isCollapsed}
        <div class="widget-body">
            {#if activeQuests.length > 0}
                {#each activeQuests as quest}
                    {@const currentStage = quest.stages[quest.currentStage]}
                    {@const status = $questProgressStore[quest.id]}
                    <div class="quest">
                        <p class="quest-title">{quest.title}</p>
                        {#if currentStage}
                        <ul>
                            <li class:ready={status === 'ready'} class:ongoing={status === 'ongoing'}>
                                {currentStage.objective}
                            </li>
                        </ul>
                        {/if}
                    </div>
                {/each}
            {:else}
                <p>No active quests.</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .ready {
        color: #4ade80; /* Tailwind Green 400 */
    }
    .ongoing {
        color: #facc15; /* Tailwind Yellow 400 */
    }
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

    .widget-body ul {
        padding-left: 1.2em;
        margin: 0.2em 0 0 0;
    }

    .quest {
        margin-bottom: 0.8em;
    }

    .quest-title {
        font-weight: bold;
        margin: 0 0 0.2em 0;
        color: var(--color-accent);
    }
</style>
