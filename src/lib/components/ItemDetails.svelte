<script lang="ts">
    import type { Item } from "$lib/types";
    import { game } from "$lib/game/game";

    export let item: Item | null;

    const isConsumable = (item: Item) => item.type === 'general' && item.effects && item.effects.length > 0;
    const isEquippable = (item: Item) => item.type === 'weapon' || item.type === 'relic';
</script>

{#if item}
<div class="item-details-panel pixel-art-box">
    <h3>{item.name}</h3>
    <p class="item-type">Type: {item.type}</p>
    <p class="description">{item.description}</p>
    {#if item.type === 'weapon' && item.mastery}
        <p class="mastery">Mastery: {item.mastery}</p>
    {/if}
    {#if item.stats && item.stats.length > 0}
        <div class="stats-grid">
            {#each item.stats as stat}
                <div class="stat-line">
                    <span>{stat.name}:</span>
                    <span>{stat.value}</span>
                </div>
            {/each}
        </div>
    {/if}
    {#if item.effects && item.effects.length > 0}
        <p class="effects-label">Effects:</p>
        <ul class="effects-list">
            {#each item.effects as effect}
                <li>
                    {#if effect.hp}HP: {effect.hp}{/if}
                    {#if effect.auraShield}Aura Shield: {effect.auraShield}{/if}
                </li>
            {/each}
        </ul>
    {/if}
    <div class="buttons">
        {#if isConsumable(item)}
            <button class="action-button pixel-art-button" on:click={() => game.use(item.id)}>Use</button>
        {/if}
        {#if isEquippable(item)}
            <button class="action-button pixel-art-button" on:click={() => game.equip(item.id)}>Equip</button>
        {/if}
    </div>
</div>
{/if}

<style>
    .item-details-panel {
        flex-grow: 1;
        width: 240px;
        height: 120px;
        background-color: #2a2a2a;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .item-details-panel h3 {
        margin-top: 0;
        margin-bottom: 0.5em;
        color: white;
    }

    .item-details-panel p.description {
        font-size: 0.8em;
        color: #aaa;
        flex-grow: 1;
    }

    .item-details-panel .stats-grid {
        display: grid;
        grid-template-columns: auto auto;
        gap: 0.2em 1em;
        font-size: 0.8em;
        color: #eee;
    }

    .item-details-panel .buttons {
        display: flex;
        gap: 0.5em;
        margin-top: 0.5em;
    }
</style>