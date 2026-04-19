<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
</script>

<div class="coordinate-display">
    <span class="axis">X</span>
    <span class="value">{$playerStore.position.x}</span>
    <span class="axis">Y</span>
    <span class="value">{$playerStore.position.y}</span>
</div>

<style>
    .coordinate-display {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 6px 10px;
        background-color: var(--surface-2);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 6px;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        line-height: 1;
        white-space: nowrap;
    }
    .axis {
        color: var(--text-muted, #888);
        font-weight: 600;
    }
    .value {
        color: var(--color-primary);
        font-weight: 600;
        min-width: 2ch;
        text-align: right;
    }
</style>