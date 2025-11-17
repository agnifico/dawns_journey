<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { playerStore } from '$lib/stores/playerStore';
    import { startComposting, claimCompost } from '$lib/services/CompostService';
    import { derived } from 'svelte/store';

    const dispatch = createEventDispatcher();

    let leavesToCommit = 0;
    let now = Date.now();
    let timer: any;

    const leavesInInventory = derived(playerStore, ($player) => {
        return $player.inventory.find(i => i.itemId === 'leaves')?.amount || 0;
    });

    const compostQueue = derived(playerStore, ($player) => {
        return $player.homestead.compostQueue.map(task => {
            const elapsed = now - task.startTime;
            const remaining = Math.max(0, task.duration - elapsed);
            const progress = Math.min(100, (elapsed / task.duration) * 100);
            return { ...task, remaining, progress };
        });
    });

    function adjustLeaves(amount: number) {
        const newValue = leavesToCommit + amount;
        if (newValue >= 0 && newValue <= $leavesInInventory) {
            leavesToCommit = newValue;
        }
    }

    function handleStartComposting() {
        if (leavesToCommit > 0) {
            startComposting(leavesToCommit);
            leavesToCommit = 0;
        }
    }

    function formatDuration(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    onMount(() => {
        timer = setInterval(() => {
            now = Date.now();
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(timer);
    });

</script>

<div class="codex-overlay">
    <div class="codex-modal">
        <header class="codex-header">
            <h2>Compost Manager</h2>
            <button class="close-button" on:click={() => dispatch('close')}>&times;</button>
        </header>
        
        <div class="codex-content">
            <div class="compost-maker">
                <h3>Add to Compost</h3>
                <div class="resource-display">
                    Available Leaves: <span class="resource-count">{$leavesInInventory}</span>
                </div>
                <div class="selector">
                    <button on:click={() => adjustLeaves(-5)} disabled={leavesToCommit < 5}>-5</button>
                    <button on:click={() => adjustLeaves(-1)} disabled={leavesToCommit < 1}>-</button>
                    <span class="commit-amount">{leavesToCommit}</span>
                    <button on:click={() => adjustLeaves(1)} disabled={leavesToCommit >= $leavesInInventory}>+</button>
                    <button on:click={() => adjustLeaves(5)} disabled={leavesToCommit + 5 > $leavesInInventory}>+5</button>
                </div>
                <button 
                    class="start-button" 
                    on:click={handleStartComposting} 
                    disabled={leavesToCommit === 0 || leavesToCommit % 5 !== 0}
                >
                    Start Composting ({leavesToCommit / 5} Compost)
                </button>
            </div>

            <div class="compost-queue">
                <h3>Active Queue</h3>
                {#if $compostQueue.length > 0}
                    <ul>
                        {#each $compostQueue as task (task.id)}
                            <li class="task-item">
                                <span class="task-info">Producing {task.compostToProduce} Compost</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: {task.progress}%"></div>
                                </div>
                                <span class="task-timer">{formatDuration(task.remaining)}</span>
                                <button class="claim-button" disabled={task.remaining > 0} on:click={() => claimCompost(task.id)}>Claim</button>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="empty-queue">No active composting tasks.</p>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Using the same overlay and modal styles as FarmingCodex for consistency */
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
        max-width: 600px; /* Smaller modal for this feature */
        height: auto;
        max-height: 90vh;
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

    .codex-content {
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .compost-maker {
        background-color: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }

    .resource-display {
        font-size: 1.1rem;
        margin-bottom: 1rem;
    }
    .resource-count {
        font-weight: bold;
        color: #81c784;
    }

    .selector {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .selector button {
        padding: 0.5rem 1rem;
    }

    .commit-amount {
        font-size: 1.5rem;
        font-weight: bold;
        min-width: 50px;
        text-align: center;
    }

    .start-button {
        padding: 0.8rem 1.5rem;
        font-size: 1.1rem;
        width: 100%;
    }

    .compost-queue {
        flex-grow: 1;
    }

    .compost-queue h3 {
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
    }

    .compost-queue ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .task-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 1rem;
        background-color: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: 5px;
    }

    .progress-bar-container {
        height: 10px;
        width: 100%;
        background-color: #555;
        border-radius: 5px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background-color: #4caf50;
        border-radius: 5px;
        transition: width 0.5s linear;
    }

    .task-timer {
        font-family: monospace;
        font-size: 1rem;
    }

    .empty-queue {
        color: #888;
        text-align: center;
        margin-top: 2rem;
    }
</style>
