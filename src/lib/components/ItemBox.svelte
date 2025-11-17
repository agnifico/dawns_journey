<script lang="ts">
	import { scale } from "svelte/transition";
    import type { Item } from "../types";
    import ItemDetails from "./ItemDetails.svelte";

    export let item: Item;
    export let viewSize: 'small' | 'medium' | 'large' = 'medium';
    export let base: string = '';

    let size: number;
    let background: string = '';
    let showDetails = false;

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
    style="width: {size}px; height: {size}px; min-width: {size}px; min-height: {size}px; background-image: {background};"
    on:mouseenter={() => (showDetails = true)}
    on:mouseleave={() => (showDetails = false)}
>
    <img src={item.image} alt="{item.name}" style="scale: {Math.round(size/40)};"/>
    {#if item.amount && item.amount > 1}
        <span class="item-amount">{item.amount}</span>
    {/if}

    <!-- {#if showDetails}
        <ItemDetails item={item} />
    {/if} -->
</div>

<style>
    .item-box {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: cover;
        image-rendering: pixelated;
        /* background-color: antiquewhite; */
        /* border: 3px solid grey; */
        /* border-radius: 20px; */
    }

    .item-box img {
        max-width: 100%;
        max-height: 100%;
        image-rendering: pixelated;
    }

    .item-amount {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 0.7em;
        padding: 2px;
        border-radius: 3px;
    }
</style>
