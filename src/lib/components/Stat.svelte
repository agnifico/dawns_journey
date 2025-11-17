<script lang="ts">
    import { statDefinitions } from '$lib/data/statDefinitions';
    import type { StatDefinition } from '$lib/data/statDefinitions';

    export let statId: string;
    export let value: number | string;
    export let view: 'short' | 'full' = 'short';

    let statDef: StatDefinition = statDefinitions[statId] || {
        id: statId,
        name: statId,
        abbr: statId.substring(0, 3).toUpperCase(),
        description: 'No description available.'
    };

</script>

<div class="stat-line" title={statDef.description}>
    <img src={`./game_icons/${statId}.png`} alt={statDef.name} class="stat-icon" />
    <span class="stat-name">{view === 'full' ? statDef.name : statDef.abbr}</span>
    <span class="stat-value">{value}</span>
</div>

<style>
    .stat-line {
        display: flex;
        align-items: center;
        font-family: monospace;
        font-size: 1em;
        margin-bottom: 4px;
        max-width: 10rem;
        background-color: antiquewhite;
        border: 3px solid rgb(110, 100, 87);
        padding: 4px 8px;
        box-shadow: 4px 4px rgb(0, 0, 0);
        cursor: help;
    }

    .stat-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        image-rendering: pixelated;
    }

    .stat-name {
        flex: 1;
        color: #5f5f5f;
        text-align: left;
        font-family: "Silkscreen";
        font-size: .75em;
        margin-right: 1em;
    }

    .stat-value {
        color: #000000;
        font-weight: bold;
    }
</style>