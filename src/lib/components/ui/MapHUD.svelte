<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { eventScreen, showEventScreen } from '$lib/stores/uiStore';
    import { rainEnabled } from '$lib/stores/weatherStore';
    import { phase } from '$lib/stores/timeStore';
    import { playerStore, playerStats, playerActiveElements } from '$lib/stores/playerStore';
    import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
    import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
    import DPad from '$lib/components/ui/DPad.svelte';
    import WeaponWidget from './WeaponWidget.svelte';
    import RegionNotification from '../RegionNotification.svelte';
    import NewItemNotif from '../NewItemNotif.svelte';
    import MapEventNotif from '../MapEventNotif.svelte';
    import ChoiceMenu from './ChoiceMenu.svelte';
    import EventScreen from '../EventScreen.svelte';
    import HPBar from '../HPBar.svelte';
    import WRHeader from '../WRHeader.svelte';

    // ── Highlight toggle (POI) ───────────────────────────────────────────────
    export let showHighlights: boolean = false;
    export let onToggleHighlight: () => void = () => {};

    // ── Hotkeys ──────────────────────────────────────────────────────────────
    function handleKey(e: KeyboardEvent) {
        // Skip if user is typing into a field
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        const key = e.key.toLowerCase();
        if (key === 'h') { onToggleHighlight(); }
        else if (key === 'e') { showEventScreen.update((v) => !v); }
        else if (key === 'r') { rainEnabled.set(!$rainEnabled); }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKey);
    });
    onDestroy(() => {
        window.removeEventListener('keydown', handleKey);
    });

    // ── Player elements (for WRHeader) ──────────────────────────────────────
    // Pull whatever the player has chosen to channel. Adjust the source to
    // your actual store field if the path differs.
    $: wrElements = ($playerStore.activeElements ?? $playerStore.elements ?? []) as string[];
    $: worldResonance = $playerStore.worldResonance ?? 0;

    // ── Draggable EventScreen ────────────────────────────────────────────────
    let esEl: HTMLElement;
    let dragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let esX = 16;
    let esY = 75;

    function onDragStart(e: MouseEvent) {
        if ((e.target as HTMLElement).closest('button')) return;
        dragging = true;
        dragOffsetX = e.clientX - esX;
        dragOffsetY = e.clientY - esY;
        e.preventDefault();
    }

    function onDragMove(e: MouseEvent) {
        if (!dragging || !esEl) return;
        const parent = esEl.parentElement!;
        const pr = parent.getBoundingClientRect();
        const er = esEl.getBoundingClientRect();
        esX = Math.min(Math.max(0, e.clientX - dragOffsetX - pr.left), pr.width - er.width);
        esY = Math.min(Math.max(0, e.clientY - dragOffsetY - pr.top),  pr.height - er.height);
    }

    function onDragEnd() { dragging = false; }

    $: showChoiceMenu =
        $eventScreen.type === 'npc' ||
        ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) ||
        $eventScreen.type === 'resource' ||
        ($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary);
</script>

<svelte:window on:mousemove={onDragMove} on:mouseup={onDragEnd} />

<div class="map-hud-container">

    <!-- ═══ TOP-LEFT DOCK ═══════════════════════════════════════════════
         POI toggle · Event toggle · Weather toggle · Day/Night · Coords -->
    <div class="top-left">
        <div class="hud-dock">
            <button
                class="dock-btn"
                class:active={showHighlights}
                on:click={onToggleHighlight}
                title="Toggle Points of Interest (H)"
            >
                <span class="dock-icon">{showHighlights ? '◉' : '◎'}</span>
                <span class="dock-label">POI</span>
                <span class="dock-key">H</span>
            </button>

            <button
                class="dock-btn"
                class:active={$showEventScreen}
                on:click={() => showEventScreen.update((v) => !v)}
                title="Toggle Event Panel (E)"
            >
                <img src="/game_icons/map.png" alt="" class="dock-img" />
                <span class="dock-label">Event</span>
                <span class="dock-key">E</span>
            </button>

            <button
                class="dock-btn"
                class:active={$rainEnabled}
                on:click={() => rainEnabled.set(!$rainEnabled)}
                title="Toggle Rain for areas that have rainfall (R)"
            >
                <img src="/game_icons/rain.png" alt="" class="dock-img" />
                <span class="dock-label">Rain</span>
                <span class="dock-key">R</span>
            </button>

            <div class="dock-sep"></div>

            <div class="dock-static">
                <TimeDisplay />
            </div>

            <CoordinateDisplay />
        </div>
    </div>

    <!-- ═══ TOP-RIGHT ════════════════════════════════════════════════════
         WRHeader · Day/Night (mirror) · HP/Aura -->
    <div class="top-right">
        <!-- <div class="wr-wrap">
            <WRHeader value={worldResonance} elements={$playerActiveElements} />
        </div> -->
        <div class="row-flex">
            <div class="stat-bars">
                <HPBar type="hp"   current={$playerStats.hp}        max={$playerStats.maxHp} />
                <HPBar type="aura" current={$playerStats.auraShield} max={$playerStats.maxAuraShield} />
            </div>
        </div>
        <MapEventNotif />
    </div>

    <!-- ═══ TOP-CENTER ══════════════════════════════════════════════════ -->
    <div class="top-center">
        <RegionNotification />
    </div>

    <!-- ═══ BOTTOM-LEFT — item pickups (self-positioned via its own css) ══ -->
    <NewItemNotif />

    <!-- ═══ BOTTOM-CENTER — weapons + bread (one module) ═══════════════ -->
    <div class="bottom-center">
        <WeaponWidget />
    </div>

    <!-- ═══ BOTTOM-RIGHT — DPad ════════════════════════════════════════ -->
    <div class="bottom-right">
        <DPad />
    </div>

    {#if $showEventScreen}
        <div
            class="es-wrapper"
            class:dragging
            style="left: {esX}px; top: {esY}px;"
            bind:this={esEl}
        >
            <div class="drag-handle" on:mousedown={onDragStart} role="presentation">
                <span class="drag-dots">⠿</span>
            </div>
            <EventScreen />
            {#if showChoiceMenu}
                <ChoiceMenu />
            {/if}
        </div>
    {/if}
</div>

<style>
    .map-hud-container {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 10;
    }
    .map-hud-container > * {
        pointer-events: all;
        position: absolute;
    }

    /* ═══ HUD Dock (top-left) — console-block style, sibling to LCP ═══ */
    .hud-dock {
        display: flex;
        align-items: stretch;
        gap: 0.35rem;
        padding: 0.4rem 0.5rem;
        padding-bottom: calc(0.4rem + 6px); /* leave the inset ledge breathing room */
        background-color: var(--surface-3);
        border: 4px solid #00000056;
        box-shadow: #00000056 0 -6px 0 0px inset;
        border-radius: 12px;
    }

    .dock-btn {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 6px 10px;
        background-color: var(--surface-3);
        color: var(--text-header);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 6px;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out, 120ms background-color ease;
    }

    .dock-btn:hover {
        background-color: color-mix(in srgb, var(--surface-3) 75%, var(--color-primary));
    }

    .dock-btn:active {
        /* Press-down: bottom line stays planted, top moves down,
           shadow collapses, contrasty inset border takes over. */
        transform: translateY(3px);
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }

    .dock-btn.active {
        background-color: var(--color-buff, #6a994e);
        color: #fff;
    }

    .dock-icon {
        font-size: 0.95rem;
        line-height: 1;
    }
    .dock-img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        image-rendering: pixelated;
    }
    .dock-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .dock-key {
        opacity: 0.5;
        font-size: 0.75rem;
        padding: 1px 4px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    }

    .dock-sep {
        width: 2px;
        background-color: #00000056;
        border-radius: 1px;
        margin: 2px 2px;
        flex-shrink: 0;
    }

    /* TimeDisplay drops its own background when inside the dock. */
    .dock-static :global(.time-display) {
        background-color: transparent;
    }

    /* ═══ Draggable event panel ═══════════════════════════════════════ */
    .es-wrapper {
        min-width: 200px;
        max-width: 400px;
        width: fit-content;
        position: absolute;
        user-select: none;
        transition: left 0.15s ease, top 0.15s ease;
    }
    .es-wrapper.dragging {
        transition: none;
        cursor: grabbing;
        opacity: 0.95;
    }
    .drag-handle {
        height: 18px;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .drag-handle:active { cursor: grabbing; }
    .drag-dots {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.25);
        letter-spacing: 2px;
    }

    /* ═══ Fixed HUD zones ═════════════════════════════════════════════ */
    .row-flex {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .top-left {
        top: 1rem; left: 1rem;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .top-right {
        top: 1rem; right: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
        max-width: 360px;
    }
    .wr-wrap {
        width: 320px;
        max-width: 100%;
    }
    .top-center {
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
    }
    .bottom-center {
        display: flex;
        gap: 1rem;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
    }
    .bottom-right {
        bottom: 1rem; right: 1rem;
    }
    .stat-bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 0.5rem;
        border-radius: 8px;
        width: 200px;
    }

    @media (max-width: 768px) {
        /* .bottom-left { display: none; } */
        .top-left, .top-right { margin-top: 2rem; }
        .wr-wrap { width: 240px; }
    }
</style>