<script lang="ts">
    import { phase, formattedTime } from '$lib/stores/timeStore';
    import Tooltip from './Tooltip.svelte';
</script>

<Tooltip text={$formattedTime} direction="down">
    {#if $phase === 'Dawnrise'}
        <div class="time-display" style:background-color="#4eacea">
            <img src="/game_icons/day.png" alt="Dawnrise" />
        </div>
    {:else}
        <div class="time-display" style:background-color="#4f2475" style:border="2px solid black">
            <img src="/game_icons/night.png" alt="Duskfall" />
        </div>
    {/if}
</Tooltip>

<style>
    .time-display {
        background-color: #4f2475;
        border: 2px solid #0f6495;
        padding: 0.25em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: help;
    }
    .time-display:hover {
        background-color: #ffffff;
        /* border-color: #777; */
    }
    img {
        width: 24px;
        height: 24px;
        display: block;
    }
</style>
