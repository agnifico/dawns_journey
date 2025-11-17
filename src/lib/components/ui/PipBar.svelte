<script lang="ts">
    export let value: number; // Current stage (0-indexed)
    export let max: number; // Total stages
    export let activeColor: string = '#facc15'; // Yellow for active pips
    export let inactiveColor: string = '#6d403b'; // Brown for inactive pips
</script>

<div class="pip-bar-container" title={`Stage ${value + 1} / ${max}`}>
    {#each { length: max } as _, i}
        <div class="pip" style="background-color: {i <= value ? activeColor : inactiveColor};"></div>
    {/each}
</div>

<style>
    .pip-bar-container {
        display: flex;
        gap: 2px;
        height: 10px; /* Adjust height as needed */
        width: 100%;
    }
    .pip {
        flex-grow: 1;
        height: 100%;
        border-radius: 1px;
    }
</style>
