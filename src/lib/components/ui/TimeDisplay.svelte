<script lang="ts">
    import { phase, formattedTime } from '$lib/stores/timeStore';
    import Tooltip from './Tooltip.svelte';
</script>

<Tooltip text={$formattedTime} direction="down">
    <div class="time-display">
        {#if $phase === 'Dawnrise'}
            <img src="/game_icons/day.png" alt="Dawnrise" />
        {:else}
            <img src="/game_icons/night.png" alt="Duskfall" />
        {/if}
    </div>
</Tooltip>

<style>
    .time-display {
        background-color: #333;
        border: 2px solid #555;
        padding: 0.5em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: help;
    }
    .time-display:hover {
        background-color: #444;
        border-color: #777;
    }
    img {
        width: 24px;
        height: 24px;
        display: block;
    }
</style>
