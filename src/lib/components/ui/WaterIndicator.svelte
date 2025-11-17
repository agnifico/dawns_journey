<script lang="ts">
    export let value: number;
    export let required: number;
</script>

<div class="water-indicator" title={`Watered ${value} / ${required} times`}>
    {#each { length: required } as _, i}
        <span class:filled={i < value}>💧</span>
    {/each}
</div>

<style>
    .water-indicator {
        display: flex;
        gap: 0.25rem;
    }
    span {
        font-size: 1.2rem;
        opacity: 0.3;
    }
    span.filled {
        opacity: 1;
    }
</style>
