<script lang="ts">
    import type { MapData, Player } from '$lib/types';
    import { phase } from '$lib/stores/timeStore';
    import PlayerIcon from './ui/PlayerIcon.svelte';
    import { onMount } from 'svelte';

    export let mapData: MapData;
    export let player: Player;

    const TILE_SIZE = 16;
    const RENDER_SCALE = 3; // Using your preferred scale
    const FINAL_TILE_SIZE = TILE_SIZE * RENDER_SCALE;

    let windowWidth: number;
    let windowHeight: number;

    // These values will move the map around inside the window
    $: mapTranslateX = -(player.position.x * FINAL_TILE_SIZE) + (windowWidth / 2) - (FINAL_TILE_SIZE / 2);
    $: mapTranslateY = -(player.position.y * FINAL_TILE_SIZE) + (windowHeight / 2) - (FINAL_TILE_SIZE / 2);

</script>

<div 
    class="map-window"
    bind:clientWidth={windowWidth}
    bind:clientHeight={windowHeight}
>
    <div 
        class="map-world"
        style="
            width: {mapData.width * FINAL_TILE_SIZE}px; 
            height: {mapData.height * FINAL_TILE_SIZE}px;
            transform: translate({mapTranslateX}px, {mapTranslateY}px);
        "
    >
        <div 
            class="map-background"
            style="background-image: url({mapData.image});"
        ></div>
        
        <PlayerIcon {player} {FINAL_TILE_SIZE} />

        <div class="day-night-overlay" class:night={$phase === 'Duskfall'}></div>
    </div>
</div>

<style>
    .map-window {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
        background-color: #000;
    }

    .map-world {
        position: absolute;
        transition: transform 0.1s linear; /* Smooth movement */
    }

    .map-background {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-repeat: no-repeat;
        image-rendering: pixelated; /* Crucial for pixel art */
    }

    .day-night-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0);
        transition: background-color 1s ease;
        pointer-events: none;
        z-index: 3;
    }

    .day-night-overlay.night {
        background-color: rgba(0, 0, 50, 0.3);
    }
</style>