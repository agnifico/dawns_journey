<script lang="ts">
    import { fly } from 'svelte/transition';

    export let value: number;
    export let max: number;
</script>

<div class="pip-bar-container">
    {#each { length: max } as _, i}
        {#if i < value}
            <div class="pip active" in:fly={{ y: -5, duration: 300, delay: i * 50 }}></div>
        {/if}
    {/each}
</div>

<style>
    .pip-bar-container {
        display: flex;
        gap: 2px;
    }

    .pip {
        width: 8px;
        height: 10px;
        background-color: #555;
    }

    .pip.active {
        background-color: var(--color-primary);
    }
</style>
