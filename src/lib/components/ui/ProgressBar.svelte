<script lang="ts">
    export let value: number;
    export let max: number;
    export let color: string = '#4ade80'; // Green

    $: percentage = max > 0 ? (value / max) * 100 : 0;
</script>

<div class="progress-bar-container" title={`${value} / ${max}`}>
    <div class="progress-bar-filled" style="width: {percentage}%; background-color: {color};"></div>
</div>

<style>
    .progress-bar-container {
        width: 100%;
        height: 16px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar-filled {
        height: 100%;
        transition: width 0.3s ease-in-out;
    }
</style>
