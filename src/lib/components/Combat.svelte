<script lang="ts">
    import { combatStore } from '$lib/stores/combatStore';
    import * as CombatService from '$lib/services/CombatService';
    import StatBar from './ui/StatBar.svelte';
    import { afterUpdate } from 'svelte';
    import { getItemById } from '$lib/services/ItemDataService';

    let logContainer: HTMLDivElement;

    afterUpdate(() => {
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    });
</script>

{#if $combatStore.isInCombat && $combatStore.player && $combatStore.opponent}
    <div class="combat-screen">
        <div class="hp-bars-container">
            <div class="hp-bar-wrapper">
                <div class="character-name">{$combatStore.player.name || 'Player'}</div>
                <StatBar 
                    current={$combatStore.player.hp} 
                    max={$combatStore.player.maxHp} 
                    color="#28a745" 
                />
                <!-- above is fine -->
            </div>
            <div class="hp-bar-wrapper opponent">
                <div class="character-name">{$combatStore.opponent.name}</div>
                <StatBar 
                    current={$combatStore.opponent.hp} 
                    max={$combatStore.opponent.maxHp} 
                    color="#dc3545" 
                />
            </div>
        </div>

        <div class="log-content" bind:this={logContainer}>
            {#each $combatStore.combatLog as entry}
                {#if entry.center}
                    <div class="log-row-center {entry.class || ''}">
                        {entry.center}
                    </div>
                {:else}
                    <div class="log-row">
                        <div class="log-left {entry.left?.class || ''}">{entry.left?.text || ''}</div>
                        <div class="log-right {entry.right?.class || ''}">{entry.right?.text || ''}</div>
                    </div>
                {/if}
            {/each}
        </div>

        <div class="combat-actions">
            {#if !$combatStore.combatEnded}
                <button on:click={CombatService.processTurn}>
                    Next Turn
                </button>
            {:else}
                <div class="final-result">
                    {#if $combatStore.outcome === 'win'}
                        <h2>You are victorious!</h2>
                        {#if $combatStore.drops && $combatStore.drops.length > 0}
                            <div class="drops-log">
                                <span>Drops:</span>
                                <div class="drops-grid">
                                    {#each $combatStore.drops as drop}
                                        {@const item = getItemById(drop.itemId)}
                                        {#if item}
                                            <div class="drop-item-slot">
                                                <img src={item.image} alt={item.name} class="drop-item-thumbnail" title={item.name}/>
                                                {#if drop.quantity > 1}
                                                    <span class="drop-item-quantity">x{drop.quantity}</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    {:else}
                        <h2>You were defeated!</h2>
                    {/if}
                </div>
            {/if}

            <button class="close-button" on:click={CombatService.forceEndCombat}>
                Close
            </button>
        </div>
    </div>
{/if}

<style>
    .combat-screen {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #2a2a2a;
        padding: 20px;
        box-sizing: border-box;
    }

    /* HP Bars */
    .hp-bars-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        gap: 20px;
        flex-shrink: 0;
    }
    .hp-bar-wrapper { flex: 1; }
    .hp-bar-wrapper.opponent {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    .character-name { font-weight: bold; margin-bottom: 5px; color: #eee; }

    /* Log Area */
    .log-content {
        flex-grow: 1;
        overflow-y: auto;
        background-color: #1e1e1e;
        border: 1px solid #444;
        padding: 10px;
        margin-bottom: 15px;
        font-family: monospace;
        color: #eee;
        border-radius: 4px;
        min-height: 0;
    }
    .log-row, .log-row-center {
        display: flex;
        margin: 2px 0;
    }
    .log-row-center { 
        justify-content: center; 
        font-weight: bold; 
        padding: 5px 0;
        border-bottom: 1px solid #555;
        margin-bottom: 10px;
    }
    .log-left, .log-right {
        flex: 1;
        padding: 4px 8px;
        border-radius: 3px;
        min-height: 24px;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
    }
    .log-left { text-align: left; }
    .log-right { text-align: right; }

    .log-left.physical-attack { border-left-color: #ff9933; }
    .log-left.elemental-attack { border-left-color: #cc66ff; }
    .log-left.evasion { border-left-color: #28a745; }
    .log-left.heal { border-left-color: #28a745; }
    .log-left.crit { border-left-color: #ff4d4d; }

    .log-right.physical-attack { border-right-color: #ff9933; }
    .log-right.elemental-attack { border-right-color: #cc66ff; }
    .log-right.evasion { border-right-color: #28a745; }
    .log-right.heal { border-right-color: #28a745; }
    .log-right.crit { border-right-color: #ff4d4d; }

    /* Action Button */
    .combat-actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
    }
    .combat-actions button {
        padding: 10px 20px;
        font-size: 1.2em;
        font-family: 'Silkscreen', sans-serif;
        background-color: #4caf50;
        color: white;
        border: 2px solid #388e3c;
        border-radius: 5px;
        cursor: pointer;
    }
    .combat-actions button.close-button {
        background-color: #dc3545;
        border-color: #b02a37;
    }

    .final-result {
        text-align: center;
        flex-grow: 1;
    }
    .final-result h2 {
        margin: 0;
        color: #facc15;
    }
    .drops-log { margin-top: 1rem; }
    .drops-log span { color: #a7f0c3; display: block; margin-bottom: 5px; }
    .drops-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    .drop-item-slot {
        position: relative;
        width: 50px;
        height: 50px;
        background-color: rgba(0,0,0,0.3);
        border: 1px solid #555;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .drop-item-thumbnail {
        width: 80%;
        height: 80%;
        object-fit: contain;
    }
    .drop-item-quantity {
        position: absolute;
        bottom: 0px;
        right: 0px;
        background-color: black;
        color: white;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 0.7em;
        font-weight: bold;
    }

    /* Color Coding Classes */
    .physical-attack { background-color: rgba(255, 153, 51, 0.1); }
    .elemental-attack { background-color: rgba(204, 102, 255, 0.1); }
    .block { background-color: rgba(167, 216, 240, 0.1); }
    .evasion { background-color: rgba(40, 167, 69, 0.1); }
    .heal { background-color: rgba(40, 167, 69, 0.1); }
    .crit { font-weight: bold; color: #ff4d4d; }
</style>