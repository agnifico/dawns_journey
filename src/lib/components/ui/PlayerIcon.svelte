<script lang="ts">
    import type { Player } from "$lib/types";

    export let player: Player;
    export let FINAL_TILE_SIZE: number;

    $: top = player.position.y * FINAL_TILE_SIZE;
    $: left = player.position.x * FINAL_TILE_SIZE;

</script>

<div 
    class="player-icon"
    style="top: {top}px; left: {left}px; width: {FINAL_TILE_SIZE}px; height: {FINAL_TILE_SIZE}px;"
>
    <img src="./game_icons/player_icon.png" alt="Player" />
</div>

<style>
    .player-icon {
        position: absolute;
        z-index: 2;
        transition: top 0.1s linear, left 0.1s linear;
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
    }
</style>