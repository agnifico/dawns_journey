<script lang="ts">
    export let name: string;
    export let level: number | undefined = undefined; // Make level optional
    export let hotkey: string | undefined = undefined;

    const elementColors = {
        Fire: '#FF6347',
        Water: '#276b9f',
        Earth: '#2d7645',
        Wind: '#39cac8',
        Light: '#F0E68C',
        Dark: '#A9A9A9',
    };

    $: color = elementColors[name] || '#FFFFFF';
</script>

<div class="explo-bubble" style="--color: {color}">
    <span class="name">{name}</span>
    {#if level !== undefined}
        <span class="level">{level}</span>
    {/if}
    {#if hotkey}
        <span class="hotkey">({hotkey.toUpperCase()})</span>
    {/if}
</div>

<style>
    .explo-bubble {
        display: inline-flex;
        align-items: center;
        border-radius: 12px;
        padding: 2px 6px;
        font-size: 0.75em;
        background-color: var(--color);
        border: 1px solid var(--color);
        color: white;
        margin-right: 4px;
        margin-bottom: 4px;
    }

    .name {
        margin-right: 4px;
    }

    .level {
        background-color: #ffffff;
        color: var(--color);
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
    }

    .hotkey {
        margin-left: 4px;
        font-weight: bold;
    }
</style>