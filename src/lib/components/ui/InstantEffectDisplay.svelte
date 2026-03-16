<script lang="ts">
    import type { Effect } from '$lib/types';
    import { statDefinitions } from '$lib/data/statDefinitions';
	import type { StatDefinition } from '$lib/data/statDefinitions';

    export let effect: Effect;

    // let statId: 'hp' | 'auraShield' = 'hp';
    let statId;
    let value: number = 0;
    let color = '';
    let bg = '';

    $: if (effect.hp) {
        statId = 'maxHp';
        value = effect.hp;
        color = statDefinitions.hp.color;
    } else if (effect.auraShield) {
        statId = 'maxAuraShield';
        value = effect.auraShield;
        color = statDefinitions.auraShield.color;
    }
</script>

<div class="instant-effect-display" title={`Instantly restores ${value} ${statId === 'hp' ? 'Health' : 'Aura'}`} style:--statColor={color}>
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
        padding: 2px 5px;
		background-color: rgba(0,0,0,0.42);
        border: 1px solid var(--statColor);
        color: #48db80;
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
