<script lang="ts">
    import type { Effect } from '$lib/types';

    export let effect: Effect;

    let statId: 'hp' | 'auraShield' = 'hp';
    let value: number = 0;

    if (effect.hp) {
        statId = 'hp';
        value = effect.hp;
    } else if (effect.auraShield) {
        statId = 'auraShield';
        value = effect.auraShield;
    }
</script>

<div class="instant-effect-display" title={`Instantly restores ${value} ${statId === 'hp' ? 'Health' : 'Aura'}`}>
    <img src={`/game_icons/${statId}.png`} alt={statId} class="stat-icon" />
    <span class="value">+{value}</span>
</div>

<style>
    .instant-effect-display {
        display: inline-flex;
        align-items: center;
        gap: 0.3em;
        padding: 0.2em 0.5em;
        border-radius: 5px;
        font-family: var(--font-family-pixel);
        font-size: 0.8em;
        border: 2px solid var(--color-secondary);
        background-color: var(--color-surface-1);
        color: var(--color-secondary);
    }
    .stat-icon {
        width: 20px;
        height: 20px;
        image-rendering: pixelated;
    }
    .value {
        font-weight: bold;
    }
</style>
