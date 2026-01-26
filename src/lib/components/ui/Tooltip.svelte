<script lang="ts">
    export let text = '';
    export let direction = 'up';
</script>

<div class="tooltip-container">
    <slot />
    <div class="tooltip" class:down={direction === 'down'}>
        {text}
    </div>
</div>

<style>
    .tooltip-container {
        position: relative;
        display: inline-block;
    }

    .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        min-width: 150px;
        transform: translateX(0%);
        background-color: #333;
        color: white;
        padding: 0.5em 1em;
        border-radius: 5px;
        white-space: pre-wrap;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 10;
    }

    .tooltip.down {
        bottom: auto;
        top: 100%;
    }

    .tooltip-container:hover .tooltip {
        opacity: 1;
    }
</style>
