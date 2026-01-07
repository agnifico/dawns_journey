<script lang="ts">
    import type { ActiveEffect } from '$lib/types';

    export let effect: ActiveEffect;

    const isBuff = effect.value > 0;
    const valueDisplay = `${isBuff ? '+' : ''}${effect.value}${effect.type === 'percentage' ? '%' : ''}`;
</script>

<div class="buff-display" class:buff={isBuff} class:debuff={!isBuff} title={`${effect.name} from ${effect.source}`}>
    <img src={`/game_icons/${effect.stat}.png`} alt={effect.stat} class="stat-icon" />
    <span class="value">{valueDisplay}</span>
    <img src={`/game_icons/${isBuff ? 'up' : 'down'}.png`} alt={isBuff ? 'Up' : 'Down'} class="direction-icon" />
</div>

<style>
    .buff-display {
        display: inline-flex;
        align-items: center;
        gap: 0.3em;
        padding: 0.2em 0.5em;
        border-radius: 5px;
        font-family: var(--font-family-pixel);
        font-size: 0.8em;
        border: 2px solid;
    }
    .buff {
        background-color: var(--color-buff);
        border-color: #000000;
        color: hsla(0, 0%, 0%, 0.5);
    }
    .debuff {
        background-color: var(--color-debuff);
        border-color: #000000;
        color: hsla(0, 0%, 0%, 0.5);
    }
    .stat-icon, .direction-icon {
        width: 20px;
        height: 20px;
        image-rendering: pixelated;
    }
    .value {
        font-weight: bold;
    }
</style>
