<script lang="ts">
	import { scale } from "svelte/transition";
    import type { Item } from "../types";
    import ItemDetails from "./ItemDetails.svelte";

    export let item: Item;
    export let viewSize: 'small' | 'medium' | 'large' = 'medium';

    let size: number;
    let background: string = '';
    let showDetails = false;
    export let hoverEnabled:boolean = false;
    if (item?.flags?.includes("crop")) {
        // background = '#2f3e46;'
    }

    $: {
        if (viewSize === 'small') {
            size = 40;
            // background = `url(${base}/game_icons/slot_empty.png)`;
        } else if (viewSize === 'large') {
            size = 120;
            // background = `url(${base}/game_icons/slot_empty.png)`;
        } else {
            size = 60;
            // background = `url(${base}/game_icons/slot_empty.png)`;
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="item-box"
    style="width: {size}px; height: {size}px; min-width: {size}px; min-height: {size}px;"
    on:mouseenter={() => (showDetails = true)}
    on:mouseleave={() => (showDetails = false)}
    
    >
    <img src={item.image} alt="{item.name}" style:scale={item.flags.includes('24px') ? Math.round(size/30) : Math.round(size/40)} style:background-color={background}/>
    {#if item.amount && item.amount > 1}
        <span class="item-amount">{item.amount}</span>
    {/if}

    {#if showDetails && hoverEnabled}
        <ItemDetails item={item} />
    {/if}
</div>

<style>
    .item-box {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: cover;
        image-rendering: pixelated;
    }
    
    .item-box img {
        position: relative;
        top: -2px;
        max-width: 32px;
        max-height: 32px;
        image-rendering: pixelated;
        border-color: transparent;
        box-sizing: border-box;
    }

    .item-amount {
        position: absolute;
        bottom: -2px;
        right: -2px;
        background-color: hsla(0, 0%, 0%, 0.4);
        color: white;
        font-size: 0.5rem;
        padding: 4px;
        border-radius: 3px;
        font-family: var(--font-family-pixel);
        color: rgba(255, 255, 255, 0.7);
    }
</style>
