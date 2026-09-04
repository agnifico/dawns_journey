<script lang="ts">
    // PlayerIcon.svelte
    // Renders the player as a 64×64px LPC-format sprite, matching NpcSprite's
    // conventions: the sprite is 2 tiles tall, horizontally centred on the
    // player's tile and bottom-anchored to it, so it overhangs the tile above
    // exactly like the 1×2 NPC footprints do.
    //
    // While walking we show the directional walk GIF; standing still we show a
    // single frame extracted from that same GIF so the player doesn't march in
    // place. Both are preloaded so swapping src never flashes.

    import type { Player } from "$lib/types";

    export let player: Player;
    export let FINAL_TILE_SIZE: number;

    const SPRITE_TILES = 2; // sprite height in tiles

    const WALK: Record<string, string> = {
        up:    '/images/sprites/walk-up.gif',
        down:  '/images/sprites/walkd-down.gif',
        left:  '/images/sprites/walk-left.gif',
        right: '/images/sprites/walk-right.gif',
    };

    const IDLE: Record<string, string> = {
        up:    '/images/sprites/idle-up.png',
        down:  '/images/sprites/idle-down.png',
        left:  '/images/sprites/idle-left.png',
        right: '/images/sprites/idle-right.png',
    };

    $: direction  = WALK[player.direction] ? player.direction : 'down';
    $: spriteSrc  = player.isMoving ? WALK[direction] : IDLE[direction];

    $: spriteSize = FINAL_TILE_SIZE * SPRITE_TILES;
    $: top  = player.position.y * FINAL_TILE_SIZE - (spriteSize - FINAL_TILE_SIZE);
    $: left = player.position.x * FINAL_TILE_SIZE - (spriteSize - FINAL_TILE_SIZE) / 2;
</script>

<div
    class="player-icon"
    style="top: {top}px; left: {left}px; width: {spriteSize}px; height: {spriteSize}px;"
>
    <img src={spriteSrc} alt="Player" />
</div>

<!-- Keep every sprite decoded so the walk/idle swap is instant -->
<div class="preload" aria-hidden="true">
    {#each [...Object.values(WALK), ...Object.values(IDLE)] as src (src)}
        <img {src} alt="" />
    {/each}
</div>

<style>
    .player-icon {
        position: absolute;
        z-index: 11;
        transition: top 0.1s linear, left 0.1s linear;
        pointer-events: none;
    }
    .player-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
    }
    .preload {
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
    }
</style>
