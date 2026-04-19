<script lang="ts">
    import { tick } from 'svelte';
    import { questTrackerState, toggleQuestTracker, toggleSummarised } from '$lib/stores/uiStore';
    import { questStore } from '$lib/stores/questStore';
    import { questProgressStore } from '$lib/stores/questProgressStore';
    import { npcStore } from '$lib/stores/npcStore';
    import type { Quest } from '$lib/types';

    let activeQuests: Quest[] = [];
    $: {
        activeQuests = Object.values($questStore.quests).filter(
            (q) => q.state === 'ACTIVE' || q.state === 'REPORT_PENDING'
        );
    }

    function getQuestIcon(quest: Quest, status: string): string {
        if (quest.state === 'REPORT_PENDING') {
            if (quest.finalState === 'COMPLETED') return '/game_icons/expression_alerted.png';
            if (quest.finalState === 'FAILED')    return '/game_icons/expression_stress.png';
        }
        switch (status) {
            case 'ready':              return '/game_icons/expression_alerted.png';
            case 'ready_for_rank_up':  return '/game_icons/expression_love.png';
            default:                   return '/game_icons/expression_confused.png';
        }
    }

    // ── Mode cycling: collapsed → mini → full → collapsed ───────────────────
    function cycleMode() {
        if ($questTrackerState.isCollapsed) {
            // Collapsed → expand into whatever last mode was. If currently
            // summarised, we go to mini; else we go to full. Either way: open.
            toggleQuestTracker();
        } else if ($questTrackerState.isSummarised) {
            // Mini → Full
            toggleSummarised();
        } else {
            // Full → Collapsed
            toggleQuestTracker();
        }
    }

    function modeLabel(): string {
        if ($questTrackerState.isCollapsed)  return '▣';   // collapsed
        if ($questTrackerState.isSummarised) return '◐';   // mini
        return '◉';                                         // full
    }

    function modeTitle(): string {
        if ($questTrackerState.isCollapsed)  return 'Expand quest tracker';
        if ($questTrackerState.isSummarised) return 'Show full details';
        return 'Collapse';
    }

    // ── Pulse on objective state change ─────────────────────────────────────
    // Track previous status per quest id; flag changed ones briefly.
    let prevStatuses: Record<string, string> = {};
    let pulsedIds: Record<string, number> = {}; // id → timestamp

    $: {
        for (const q of activeQuests) {
            const cur = $questProgressStore[q.id];
            const prev = prevStatuses[q.id];
            if (prev !== undefined && prev !== cur) {
                pulsedIds = { ...pulsedIds, [q.id]: Date.now() };
                // Auto-clear after 2s
                setTimeout(() => {
                    pulsedIds = Object.fromEntries(
                        Object.entries(pulsedIds).filter(([id]) => id !== q.id)
                    );
                }, 2000);
            }
            prevStatuses[q.id] = cur;
        }
    }

    function isPulsed(id: string): boolean {
        return pulsedIds[id] !== undefined;
    }
</script>

<div class="qt-container">
    <div class="qt-header">
        <span class="qt-title">Active Quests</span>
        {#if activeQuests.length > 0}
            <span class="qt-count">{activeQuests.length}</span>
        {/if}
        <div class="qt-controls">
            <button
                class="qt-mode-btn"
                on:click|stopPropagation={cycleMode}
                title={modeTitle()}
            >
                <span class="mode-glyph">{modeLabel()}</span>
            </button>
        </div>
    </div>

    {#if !$questTrackerState.isCollapsed}
        <div class="qt-body">
            {#if activeQuests.length > 0}
                {#each activeQuests as quest (quest.id)}
                    {@const currentStage = quest.stages[quest.currentStage]}
                    {@const status = $questProgressStore[quest.id]}
                    {@const giverName = $npcStore.globalNpcs[quest.giver]?.name || 'Unknown'}
                    {@const icon = getQuestIcon(quest, status)}
                    <div class="quest" class:pulse={isPulsed(quest.id)}>
                        {#if !$questTrackerState.isSummarised}
                            <div class="quest-title">
                                <img src={icon} alt="icon" class="quest-icon" />
                                <div class="cont">
                                    <span class="giver">{giverName}</span>
                                    <span class="title">{quest.title}</span>
                                </div>
                            </div>
                        {/if}
                        <div class="objectives">
                            {#if currentStage}
                                <ul>
                                    <li
                                        class:ready={status === 'ready' ||
                                            (quest.state === 'REPORT_PENDING' && quest.finalState === 'COMPLETED')}
                                        class:ongoing={status === 'ongoing'}
                                        class:failed={quest.state === 'REPORT_PENDING' && quest.finalState === 'FAILED'}
                                    >
                                        {currentStage.objective}
                                    </li>
                                </ul>
                            {/if}
                        </div>
                    </div>
                {/each}
            {:else}
                <p class="empty">No active quests.</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .qt-container {
        width: 100%;
        background-color: var(--surface-2);
        border: 4px solid #00000056;
        box-shadow: #00000056 0 -6px 0 0px inset;
        border-radius: 12px;
        color: white;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        box-sizing: border-box;
        overflow: hidden;
        padding-bottom: 6px; /* leave the inset ledge breathing room */
    }

    /* ── Header ─────────────────────────────────────────────────────── */
    .qt-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background-color: rgba(0, 0, 0, 0.25);
        border-bottom: 3px solid #00000056;
    }
    .qt-title {
        flex: 1;
        color: var(--text-header);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.75rem;
    }
    .qt-count {
        background-color: var(--color-buff, #6a994e);
        color: white;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 4px;
        line-height: 1;
        text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
    }
    .qt-controls {
        display: flex;
        gap: 0.25rem;
    }
    .qt-mode-btn {
        background-color: var(--surface-3);
        color: var(--text-header);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 5px;
        cursor: pointer;
        width: 28px;
        height: 26px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-size: 0.85rem;
        line-height: 1;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out;
    }
    .qt-mode-btn:hover {
        background-color: color-mix(in srgb, var(--surface-3) 75%, var(--color-primary));
    }
    .qt-mode-btn:active {
        transform: translateY(3px);
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }
    .mode-glyph {
        opacity: 0.85;
    }

    /* ── Body ───────────────────────────────────────────────────────── */
    .qt-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px;
    }

    .empty {
        margin: 0;
        padding: 0.5rem 0.25rem;
        color: var(--text-muted, #888);
        text-align: center;
        font-size: 0.75rem;
    }

    .quest {
        position: relative;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 6px;
        border-left: 3px solid transparent;
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    .quest-title {
        display: flex;
        align-items: flex-start;
        padding: 0.4rem 0.5rem 0.25rem;
        gap: 0.4rem;
    }
    .quest-icon {
        height: 1rem;
        width: 1rem;
        flex-shrink: 0;
        margin-top: 2px;
    }
    .cont {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        gap: 1px;
        min-width: 0;
    }
    .giver {
        color: var(--text-header);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .title {
        color: var(--text-item-name, #d8c8a0);
        font-size: 0.75rem;
    }

    .objectives ul {
        list-style: '- ';
        list-style-position: inside;
        padding: 0.25rem 0.5rem 0.4rem;
        margin: 0;
    }
    .objectives li {
        line-height: 1.4;
    }
    .ready    { color: #4ade80; }
    .ongoing  { color: #facc15; }
    .failed   { color: #f87171; text-decoration: line-through; }

    /* ── Pulse: objective transitioned (e.g. ongoing → ready) ──────── */
    .quest.pulse {
        animation: quest-pulse 1.2s ease-in-out 2;
        border-left-color: var(--color-primary, #c8a96e);
    }
    @keyframes quest-pulse {
        0%, 100% {
            background-color: rgba(0, 0, 0, 0.4);
            box-shadow: none;
        }
        50% {
            background-color: rgba(200, 169, 110, 0.18);
            box-shadow: inset 0 0 0 1px rgba(200, 169, 110, 0.4);
        }
    }
</style>