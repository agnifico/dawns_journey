<script lang="ts">
    export let value: number;
    export let max: number;
    export let type: 'growth' | 'water' = 'growth';

    $: pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
</script>

<div class="bar-track" title="{value} / {max}">
    <div class="bar-fill {type}" style="width: {pct}%" />
    <span class="bar-text">{value}/{max}</span>
</div>

<style>
    .bar-track {
        position: relative;
        width: 100%;
        height: 14px;
        background-color: #c1c1c1;
        border-radius: 4px;
        border: 2px solid #000;
        box-shadow: #00000056 0 -2px 0 0 inset;
        overflow: hidden;
    }

    .bar-fill {
        position: absolute;
        inset: 0;
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease-in-out;
    }

    .bar-fill.growth {
        background: linear-gradient(225deg, #166383 0%, #237f7e 20%, #399e80 40%, #55bc88 60%, #74d496 80%, #94e3a8 100%);
        box-shadow:
            #00000056 0 -2px 0 0 inset,
            hsla(0, 0%, 0%, 0.2) -2px 0 2px 0 inset;
    }

    .bar-fill.water {
        background: linear-gradient(90deg, #399dcd 0%, #2b7eb8 25%, #226098 50%, #214973 75%, #273d51 100%);
        box-shadow:
            #00000056 0 -2px 0 0 inset,
            hsla(0, 0%, 0%, 0.2) -2px 0 2px 0 inset;
    }

    .bar-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.55rem;
        color: #fff;
        text-shadow: 0 1px 2px #000, 0 0 4px #000;
        pointer-events: none;
        letter-spacing: 0.04em;
        font-family: var(--font-family-pixel);
    }
</style>