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
    import { mapStore } from '$lib/stores/mapStore';
    import { collisionStore, TILE_KINDS } from '$lib/stores/collisionStore';
    import { contextualActions } from '$lib/stores/uiStore';

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
    // Depth-sorted against NPCs (MapObject uses 100 + 2 * feetRow): the odd
    // offset puts the player in front of anything on the same row.
    $: zIndex = 100 + player.position.y * 2 + 1;

    // Inside a forest / up a tree the sprite would be drawn over the canopy, so
    // the player becomes a tile cursor instead. Reads the grid reactively.
    $: tileChar = $collisionStore[$mapStore.currentMapId]?.[player.position.y]?.[player.position.x] ?? '.';
    $: asCursor = !!TILE_KINDS[tileChar]?.cursor;
    $: tileLeft = player.position.x * FINAL_TILE_SIZE;
    $: tileTop  = player.position.y * FINAL_TILE_SIZE;
</script>

{#if asCursor}
    <div
        class="tile-cursor"
        style="top: {tileTop}px; left: {tileLeft}px; width: {FINAL_TILE_SIZE}px; height: {FINAL_TILE_SIZE}px; z-index: {zIndex};"
        aria-label="Player (in the trees)"
    >
        <span class="corner tl"></span><span class="corner tr"></span>
        <span class="corner bl"></span><span class="corner br"></span>
    </div>
{:else}
    <div
        class="player-icon"
        style="top: {top}px; left: {left}px; width: {spriteSize}px; height: {spriteSize}px; z-index: {zIndex};"
    >
        <img src={spriteSrc} alt="Player" />
    </div>
{/if}

<!-- What the player can do with the tile they're facing (E, or tap) -->
{#if $contextualActions.length > 0}
    <div
        class="action-prompt"
        style="top: {(asCursor ? tileTop : top) - 6}px; left: {tileLeft + FINAL_TILE_SIZE / 2}px; z-index: {zIndex + 1};"
    >
        {#each $contextualActions as a (a.text)}
            <button class="action-btn" on:click={a.action}>
                <span class="action-key">{a.hotkey}</span>{a.text}
            </button>
        {/each}
    </div>
{/if}

<!-- Keep every sprite decoded so the walk/idle swap is instant -->
<div class="preload" aria-hidden="true">
    {#each [...Object.values(WALK), ...Object.values(IDLE)] as src (src)}
        <img {src} alt="" />
    {/each}
</div>

<style>
    .player-icon {
        position: absolute;
        transition: top 0.1s linear, left 0.1s linear;
        pointer-events: none;
    }
    .player-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
    }
    /* ── Tile cursor (in trees) ── */
    .tile-cursor {
        position: absolute;
        pointer-events: none;
        transition: top 0.1s linear, left 0.1s linear;
        animation: cursor-pulse 1.1s ease-in-out infinite;
    }
    .corner {
        position: absolute;
        width: 32%;
        height: 32%;
        border: 0 solid #fff6d0;
        filter: drop-shadow(0 0 1px #000) drop-shadow(0 0 1px #000);
    }
    .corner.tl { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; }
    .corner.tr { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; }
    .corner.bl { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; }
    .corner.br { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; }
    @keyframes cursor-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%      { transform: scale(0.88); opacity: 0.75; }
    }

    /* ── Context action prompt ── */
    .action-prompt {
        position: absolute;
        transform: translate(-50%, -100%);
        display: flex;
        gap: 4px;
        pointer-events: auto;
    }
    .action-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 2px 7px 3px 3px;
        border-radius: 5px;
        border: 2px solid rgba(0, 0, 0, 0.6);
        background: rgba(28, 22, 14, 0.92);
        color: #f2e3bd;
        font-family: var(--font-family-pixel);
        font-size: 0.7rem;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: #00000056 0 -2px 0 0 inset;
    }
    .action-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 15px;
        height: 15px;
        border-radius: 3px;
        background: #c8a96e;
        color: #1a1610;
        font-size: 0.6rem;
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
