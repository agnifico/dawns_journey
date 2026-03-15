<script lang="ts">
    import type { ActiveEffect } from '$lib/types';
    import { statDefinitions } from "$lib/data/statDefinitions";

    export let effect: ActiveEffect;

    const isBuff = effect.value > 0;
    const valueDisplay = `${isBuff ? '+' : ''}${effect.value}${effect.type === 'percentage' ? '%' : ''}`;
</script>

<div class="buff-display" class:buff={isBuff} class:debuff={!isBuff} title={`${effect.name} from ${effect.source}`}>
    <img src={`/game_icons/${effect.stat}.png`} alt={effect.stat} class="stat-icon" />
    <span class="value">{statDefinitions[effect.stat].abbr}</span>
    {#if effect.stat === 'critChance' || effect.stat === 'critDamage'}
    <span class="value">{parseInt(valueDisplay,10)*100}</span>
    {:else if effect.type === 'percentage'}
    <span class="value">{parseFloat(valueDisplay)*100}%</span>
    {:else}
    <span class="value">{valueDisplay}</span>
      
    {/if}
    <!-- <img src={`/game_icons/${isBuff ? 'up' : 'down'}.png`} alt={isBuff ? 'Up' : 'Down'} class="direction-icon" /> -->
</div>

<style>
    .buff-display {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: var(--font-family-pixel);
        font-size: 0.8em;
        border: 1px solid;
        align-items: center;
    }
    span {
        font-weight: 400;
        font-size: .75rem;
    }
    .buff {
        background-color: var(--color-buff);
        border-color: #000000;
        color: hsla(0, 0%, 0%, 0.5);
        
        background-color: #00000056;
        border-color: var(--color-buff);
        color: var(--color-buff);
    }
    .debuff {
        background-color: var(--color-debuff);
        border-color: #000000;
        color: hsla(0, 0%, 0%, 0.5);

        background-color: #00000056;
        border-color: var(--color-debuff);
        color: var(--color-debuff);
    }
    .stat-icon, .direction-icon {
        width: 16px;
        height: 16px;
        image-rendering: pixelated;
        padding: 0;
    }
    .value {
        /* font-weight: bold; */
    }
</style>
