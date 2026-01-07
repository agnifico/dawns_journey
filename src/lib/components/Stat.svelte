<script lang="ts">
    import { statDefinitions } from '$lib/data/statDefinitions';
    import type { StatDefinition } from '$lib/data/statDefinitions';

    export let statId: string;
    export let value: number | string;
    export let baseValue: number | undefined = undefined;
    export let view: 'short' | 'full' = 'short';

    let statDef: StatDefinition = statDefinitions[statId] || {
        id: statId,
        name: statId,
        abbr: statId.substring(0, 3).toUpperCase(),
        description: 'No description available.'
    };

    let bonus: number | undefined = undefined;
    let displayValue: string;

    $: {
        // Handle display value formatting
        if (statId === 'critChance' || statId === 'critDamage') {
            displayValue = `${(Number(value) * 100).toFixed(0)}%`;
        } else {
            displayValue = String(value);
        }

        // Handle bonus calculation
        if (baseValue !== undefined && typeof value === 'number') {
            const calculatedBonus = value - baseValue;
            if (calculatedBonus !== 0) {
                // For percentages, show the percentage point difference
                if (statId === 'critChance' || statId === 'critDamage') {
                    bonus = Math.round(calculatedBonus * 100);
                } else {
                    bonus = Math.round(calculatedBonus);
                }
            } else {
                bonus = undefined;
            }
        } else {
            bonus = undefined;
        }
    }
</script>

<div class="stat-line" title={statDef.description}>
    <img src={`./game_icons/${statId}.png`} alt={statDef.name} class="stat-icon" />
    <span class="stat-name" style="color: {statDef.color};">{view === 'full' ? statDef.name : statDef.abbr}</span>
    <span class="stat-value">
        {#if bonus !== undefined && bonus !== 0}
        <span class="bonus" class:buff={bonus > 0} class:debuff={bonus < 0}>
            ({bonus > 0 ? '+' : ''}{bonus}{statId === 'critChance' || statId === 'critDamage' ? '%' : ''})
        </span>
        {/if}
        {displayValue}
    </span>
</div>

<style>
    .stat-line {
        display: flex;
        align-items: center;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        padding: 4px 8px;
        /* cursor: help; */
        border-radius: 4px;
        background-color: #313131;
        /* border: 2px solid #208048; */
    }

    .stat-icon {
        width: 32px;
        height: 32px;
        margin-right: 6px;
        image-rendering: pixelated;
    }

    .stat-name {
        flex: 1;
        text-align: left;
        margin-right: 1em;
        color: var(--color-text-muted);
        text-wrap: nowrap;
        color: #7678ed;
    }

    .stat-value {
        color: var(--color-text);
        /* font-weight: bold; */
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: .75rem;
    }

    .bonus {
        font-size: 0.65rem;
    }

    .bonus.buff {
        color: var(--color-buff);
    }

    .bonus.debuff {
        color: var(--color-debuff);
    }
</style>