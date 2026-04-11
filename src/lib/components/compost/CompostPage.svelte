<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { playerStore } from '$lib/stores/playerStore';
    import { startComposting, claimCompost } from '$lib/services/CompostService';
    import { derived } from 'svelte/store';

    const dispatch = createEventDispatcher();

    let leavesToCommit = 0;
    let now = Date.now();
    let timer: any;

    const leavesInInventory = derived(playerStore, ($player) =>
        $player.inventory.find(i => i.id === 'leaves')?.amount ?? 0
    );

    const compostQueue = derived(playerStore, ($player) =>
        $player.homestead.compostQueue.map(task => {
            const elapsed   = now - task.startTime;
            const remaining = Math.max(0, task.duration - elapsed);
            const progress  = Math.min(100, (elapsed / task.duration) * 100);
            return { ...task, remaining, progress };
        })
    );

    function adjust(amount: number) {
        const next = leavesToCommit + amount;
        if (next >= 0 && next <= $leavesInInventory) leavesToCommit = next;
    }

    function handleStart() {
        if (leavesToCommit > 0) {
            startComposting(leavesToCommit);
            leavesToCommit = 0;
        }
    }

    function fmt(ms: number): string {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }

    $: compostOut = Math.floor(leavesToCommit / 5);
    $: canStart   = leavesToCommit > 0 && leavesToCommit % 5 === 0;

    onMount(()   => { timer = setInterval(() => { now = Date.now(); }, 1000); });
    onDestroy(() => { clearInterval(timer); });
</script>

<div class="overlay">
    <div class="modal">
        <header class="modal-header">
            <h2 class="modal-title">Compost Manager</h2>
            <button class="close-btn" on:click={() => dispatch('close')}>✕</button>
        </header>

        <div class="modal-content">

            <!-- Input section -->
            <section class="section">
                <div class="section-header">
                    <span class="section-title">Add to Compost</span>
                    <div class="leaves-count">
                        <img src="/general/leaves.png" alt="Leaves" class="leaf-icon" />
                        <span class="leaves-num">{$leavesInInventory}</span>
                        <!-- <span class="leaves-label">leaves available</span> -->
                    </div>
                </div>

                <!-- Stepper -->
                <div class="stepper-row">
                    <button class="step-btn" on:click={() => adjust(-5)}  disabled={leavesToCommit < 5}>−5</button>
                    <button class="step-btn" on:click={() => adjust(-1)}  disabled={leavesToCommit < 1}>−</button>

                    <div class="commit-display">
                        <span class="commit-num">{leavesToCommit}</span>
                        <span class="commit-label">leaves</span>
                    </div>

                    <button class="step-btn" on:click={() => adjust(1)}   disabled={leavesToCommit >= $leavesInInventory}>+</button>
                    <button class="step-btn" on:click={() => adjust(5)}   disabled={leavesToCommit + 5 > $leavesInInventory}>+5</button>
                </div>

                <!-- Output preview -->
                {#if leavesToCommit > 0}
                    <div class="preview-row">
                        <span class="preview-eq">{leavesToCommit} leaves → </span>
                        <span class="preview-out" class:invalid={leavesToCommit % 5 !== 0}>
                            {#if leavesToCommit % 5 === 0}
                                {compostOut} Compost
                            {:else}
                                needs multiple of 5
                            {/if}
                        </span>
                    </div>
                {/if}

                <button class="start-btn" disabled={!canStart} on:click={handleStart}>
                    Start Composting
                </button>
            </section>

            <!-- Queue section -->
            <section class="section">
                <div class="section-header">
                    <span class="section-title">Active Queue</span>
                    {#if $compostQueue.length > 0}
                        <span class="queue-count">{$compostQueue.length} task{$compostQueue.length > 1 ? 's' : ''}</span>
                    {/if}
                </div>

                {#if $compostQueue.length > 0}
                    <div class="queue-list">
                        {#each $compostQueue as task (task.id)}
                            {@const done = task.remaining === 0}
                            <div class="task-row" class:done>
                                <div class="task-left">
                                    <span class="task-name">🌱 {task.compostToProduce} Compost</span>
                                    <div class="task-bar-wrap">
                                        <div class="task-bar-track">
                                            <div class="task-bar-fill" class:done style="width: {task.progress}%" />
                                        </div>
                                        <span class="task-timer">{done ? 'Ready' : fmt(task.remaining)}</span>
                                    </div>
                                </div>
                                <button
                                    class="claim-btn"
                                    class:ready={done}
                                    disabled={!done}
                                    on:click={() => claimCompost(task.id)}
                                >Claim</button>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="empty-msg">No active composting tasks.</p>
                {/if}
            </section>

        </div>
    </div>
</div>

<style>
    /* ── Overlay + modal ── */
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        width: 90%;
        max-width: 520px;
        max-height: 90vh;
        background: #1e2a20;
        border: 3px solid #3a5a3a;
        border-radius: 12px;
        box-shadow:
            0 0 0 1px #0a1a0a,
            rgba(0,0,0,0.6) 0 -8px 0 0 inset,
            0 24px 60px rgba(0,0,0,0.7);
        display: flex;
        flex-direction: column;
        font-family: var(--font-family-pixel, monospace);
        color: #d0e8d0;
        overflow: hidden;
    }

    /* Header */
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.9rem 1.25rem;
        background: rgba(0,0,0,0.3);
        border-bottom: 2px solid #2a4a2a;
        flex-shrink: 0;
    }

    .modal-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 400;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8acc8a;
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
    }
    .close-btn:hover { background: rgba(180,60,60,0.25); border-color: #8a3a3a; color: #ffaaaa; }
    .close-btn:active { transform: translateY(2px); box-shadow: none; }

    /* Content */
    .modal-content {
        overflow-y: auto;
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        scrollbar-width: thin;
        scrollbar-color: #2a4a2a transparent;
    }

    /* Section */
    .section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: rgba(0,0,0,0.18);
        border: 1px solid #2a4a2a;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: rgba(0,0,0,0.4) 0 -3px 0 0 inset;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .section-title {
        font-size: 0.85rem;
        color: #8acc8a;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* Leaves count */
    .leaves-count {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .leaf-icon {
        width: 32px;
        height: 32px;
        image-rendering: pixelated;
    }
    .leaves-num {
        font-size: 1.3rem;
        color: #80d880;
    }
    .leaves-label {
        font-size: 0.75rem;
        color: #4a6a4a;
    }

    /* Stepper */
    .stepper-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .step-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.85rem;
        padding: 6px 12px 10px;
        border-radius: 5px;
        border: 2px solid #2a4a2a;
        background: #253525;
        color: #8aaa8a;
        cursor: pointer;
        box-shadow: rgba(0,0,0,0.5) 0 -4px 0 0 inset;
        transition: 0.1s all ease-in;
        min-width: 38px;
    }
    .step-btn:hover:not(:disabled) {
        background: #2e4a2e;
        color: #c0e8c0;
        padding-bottom: 6px;
        box-shadow: rgba(0,0,0,0.5) 0 -1px 0 0 inset;
    }
    .step-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none; padding-bottom: 6px; }
    .step-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .commit-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;
    }
    .commit-num {
        font-size: 1.4rem;
        color: #d0e8d0;
        line-height: 1;
    }
    .commit-label {
        font-size: 0.75rem;
        color: #4a6a4a;
        margin-top: 2px;
    }

    /* Preview */
    .preview-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.85rem;
    }
    .preview-eq    { color: #5a7a5a; }
    .preview-out   { color: #80d880; }
    .preview-out.invalid { color: #c06060; }

    /* Start button */
    .start-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.85rem;
        padding: 9px 1.5rem 13px;
        border-radius: 6px;
        border: 2px solid #3a6a2a;
        background: #2a4a1a;
        color: #a0d860;
        cursor: pointer;
        box-shadow: rgba(0,0,0,0.5) 0 -4px 0 0 inset;
        transition: 0.1s all ease-in;
        width: 100%;
        letter-spacing: 0.06em;
    }
    .start-btn:hover:not(:disabled) {
        background: #355a22;
        color: #c0f070;
        padding-bottom: 9px;
        box-shadow: rgba(0,0,0,0.5) 0 -1px 0 0 inset;
    }
    .start-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none; padding-bottom: 9px; }
    .start-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    /* Queue */
    .queue-count {
        font-size: 0.75rem;
        color: #5a7a5a;
        letter-spacing: 0.06em;
    }

    .queue-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .task-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(0,0,0,0.2);
        border: 1px solid #2a3a2a;
        border-radius: 6px;
        padding: 8px 10px;
        box-shadow: rgba(0,0,0,0.35) 0 -2px 0 0 inset;
        transition: border-color 0.2s;
    }
    .task-row.done { border-color: #3a6a3a; }

    .task-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
    }

    .task-name {
        font-size: 0.85rem;
        color: #a0c8a0;
    }

    .task-bar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .task-bar-track {
        flex: 1;
        height: 12px;
        background: #c1c1c1;
        border-radius: 3px;
        border: 2px solid #000;
        box-shadow: rgba(0,0,0,0.5) 0 -2px 0 0 inset;
        overflow: hidden;
    }

    .task-bar-fill {
        height: 100%;
        background: linear-gradient(225deg, #166383 0%, #399e80 40%, #74d496 100%);
        box-shadow: rgba(0,0,0,0.4) 0 -1px 0 0 inset;
        transition: width 0.5s linear;
    }

    .task-bar-fill.done {
        background: linear-gradient(90deg, #c88020, #f0d060);
    }

    .task-timer {
        font-size: 0.75rem;
        color: #6a8a6a;
        white-space: nowrap;
        min-width: 52px;
        text-align: right;
    }

    /* Claim button */
    .claim-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        padding: 5px 10px 8px;
        border-radius: 4px;
        border: 2px solid #253525;
        background: #1a2a1a;
        color: #4a6a4a;
        cursor: not-allowed;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
        transition: 0.1s all ease-in;
        flex-shrink: 0;
    }
    .claim-btn.ready {
        cursor: pointer;
        background: linear-gradient(180deg, #e8b840 0%, #a06010 100%);
        border-color: #6a3a05;
        color: #1a0e00;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset, inset 0 1px 0 rgba(255,240,160,0.3);
    }
    .claim-btn.ready:hover {
        filter: brightness(1.12);
        padding-bottom: 5px;
        box-shadow: rgba(0,0,0,0.5) 0 -1px 0 0 inset;
    }
    .claim-btn.ready:active { transform: translateY(2px); box-shadow: none; padding-bottom: 5px; }

    /* Empty state */
    .empty-msg {
        font-size: 0.85rem;
        color: #3a5a3a;
        text-align: center;
        font-style: italic;
        padding: 0.5rem 0;
    }
</style>