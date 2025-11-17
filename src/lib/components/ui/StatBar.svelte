<script lang="ts">
    export let current: number;
    export let max: number;
    export let color: string = '#22c55e';

    let percentage = 0;
    $: {
        const clampedCurrent = Math.max(0, current);
        if (max > 0) {
            percentage = (clampedCurrent / max) * 100;
        } else {
            percentage = 0;
        }
    }
</script>

<div class="stat-bar-container" title={`${Math.max(0, current)} / ${max}`}>
    <div class="stat-bar-filled" style="width: {percentage}%; background-color: {color};"></div>
</div>

<style>
    .stat-bar-container {
        width: 100px;
        height: 12px;
        background-color: #333; /* Dark background for the empty part of the bar */
        border: 1px solid #555;
        border-radius: 3px;
        overflow: hidden; /* Ensures the filled bar stays within the rounded corners */
    }

    .stat-bar-filled {
        height: 100%;
        transition: width 0.3s ease-in-out; /* Smooth transition for width changes */
    }
</style>
