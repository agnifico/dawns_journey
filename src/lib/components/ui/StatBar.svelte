<script lang="ts">
    export let current: number;
    export let max: number;
    export let color: string = 'var(--color-primary)';

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

<div class="stat-bar-container" title={`${Math.max(0, current)} / ${max}`} style="background-color: color-mix(in srgb, {color} 20%, black)">
    <div class="stat-bar-filled" style="width: {percentage}%; background-color: {color};"></div>
</div>

<style>
    .stat-bar-container {
        width: 100px;
        height: 10px;
        border: 2px solid rgba(205, 205, 205, 1);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: black 2px 2px;
    }

    .stat-bar-filled {
        height: 100%;
        transition: width 0.3s ease-in-out;
    }
</style>
