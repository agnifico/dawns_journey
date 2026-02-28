<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    export let value: number;
    export let max: number = 100;
    export let color: string = '#4ade80';
    export let isComplete: boolean = false;

    const progress = tweened(0, {
        duration: 400,
        easing: cubicOut,
    });

    $: $progress = value;

</script>

<div class="progress-bar-container" class:complete={isComplete}>
    <div class="progress-bar" style:width="{$progress}%" style:background-color={color}></div>
</div>

<style>
    .progress-bar-container {
        width: 100%;
        height: 10px;
        background-color: #333;
        border-radius: 5px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        transition: width 0.4s ease-in-out;
    }

    .progress-bar-container.complete {
        background-color: #555;
    }

    .progress-bar-container.complete .progress-bar {
        background-color: #777 !important;
    }
</style>
