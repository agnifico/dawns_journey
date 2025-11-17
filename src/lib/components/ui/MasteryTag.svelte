<script lang="ts">
    export let element: string;
    export let level: number;

    const elementColors = {
        Fire: '#FF6347',
        Water: '#276b9f',
        Earth: '#2d7645',
        Wind: '#39cac8',
        Light: '#F0E68C',
        Dark: '#A9A9A9',
        default: '#6b7280'
    };

    $: color = elementColors[element] || elementColors.default;
</script>

<div class="mastery-tag" style="--tag-color: {color}">
    <span class="level">{level}</span>
    <span class="element">{element}</span>
</div>

<style>
    .mastery-tag {
        display: inline-flex;
        align-items: center;
        background-color: var(--tag-color);
        color: #fff;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 0.8em;
        text-shadow: 1px 1px 1px #000;
        border: 1px solid rgba(0,0,0,0.5);
    }
    .level {
        font-weight: bold;
        margin-right: 4px;
    }
</style>
