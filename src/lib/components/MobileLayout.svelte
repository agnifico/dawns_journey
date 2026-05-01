<script lang="ts">
    import { eventScreen } from '$lib/stores/uiStore';
    import { currentMapData, landscapeImage } from '$lib/stores/mapStore';
    import { playerStore, playerStats } from '$lib/stores/playerStore';
    import { questStore } from '$lib/stores/questStore';
    import { rainEnabled } from '$lib/stores/weatherStore';

    import MapDisplay from '$lib/components/MapDisplay.svelte';
    import MessageLog from '$lib/components/MessageLog.svelte';
    import StatBar from '$lib/components/ui/StatBar.svelte';
    import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
    import MobileEventCard from '$lib/components/MobileEventCard.svelte';
    import MobileEventPanel from '$lib/components/MobileEventPanel.svelte';
    import NewItemNotif from './NewItemNotif.svelte';
    import WeaponWidget from '$lib/components/ui/WeaponWidget.svelte';
    import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
    import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
    import DPad from '$lib/components/ui/DPad.svelte';
    import MapEventNotif from './MapEventNotif.svelte';

    // ── POI highlight toggle (received from parent /map page) ───────────────
    export let showHighlights: boolean = false;
    export let onToggleHighlight: () => void = () => {};

    let hasUnread = false;

    // ── Event type routing ─────────────────────────────────────────────────
    $: isCardEvent  = $eventScreen.type === 'enemy' || $eventScreen.type === 'resource';
    $: isPanelEvent = $eventScreen.type === 'npc';

    // ── Drawers ────────────────────────────────────────────────────────────
    let questDrawerOpen = false;
    let logDrawerOpen   = false;
    let scoutOpen       = false;
    let eventCardsVisible = true;

    $: if (isCardEvent || isPanelEvent) questDrawerOpen = false;
    $: if (isCardEvent || isPanelEvent) scoutOpen = false;

    // ── DPad opacity (auto-fade when idle) ──────────────────────────────────
    let dpadActive = false;
    let dpadTimer: ReturnType<typeof setTimeout>;
    function onDpadTouch() {
        dpadActive = true;
        clearTimeout(dpadTimer);
        dpadTimer = setTimeout(() => (dpadActive = false), 3000);
    }

    $: activeQuestCount = Object.values($questStore.quests).filter(
        (q) => q.state === 'ACTIVE' || q.state === 'REPORT_PENDING'
    ).length;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="mobile-root"
    on:pointerdown={() => {
        if (dpadActive) {
            clearTimeout(dpadTimer);
            dpadTimer = setTimeout(() => (dpadActive = false), 2000);
        }
    }}
>
    <!-- ════════════════════════════════════════════════════════════════
         TOP STRIP — sits below the now-visible global navbar.
         HP/Aura · POI · Rain · Event · Time · Coords
         ════════════════════════════════════════════════════════════════ -->
    <div class="top-strip">
        <div class="hp-stack">
            <StatBar current={$playerStats.hp}         max={$playerStats.maxHp}         color="#6a994e" />
            <StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#a98467" />
        </div>

        <div class="strip-controls">
            <button
                class="strip-btn"
                class:active={showHighlights}
                on:click={onToggleHighlight}
                title="Points of Interest"
            >
                <span class="g">{showHighlights ? '◉' : '◎'}</span>
            </button>

            <button
                class="strip-btn"
                class:active={$rainEnabled}
                on:click={() => rainEnabled.set(!$rainEnabled)}
                title="Rain"
            >
                <img src="/game_icons/rain.png" alt="" />
            </button>

            <button
                class="strip-btn"
                class:active={eventCardsVisible}
                on:click={() => (eventCardsVisible = !eventCardsVisible)}
                title="Event Panel"
            >
                <img src="/game_icons/map.png" alt="" />
            </button>

            <TimeDisplay />
            <CoordinateDisplay />
        </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         MAP AREA
         ════════════════════════════════════════════════════════════════ -->
    <div class="map-area">
        {#if $currentMapData && $playerStore.position}
            <MapDisplay
                mapData={$currentMapData}
                player={$playerStore}
                {showHighlights}
            />
            <NewItemNotif />
            <MapEventNotif />
        {:else}
            <div class="loading">Loading map...</div>
        {/if}

        {#if eventCardsVisible}
            <MobileEventCard />
            <MobileEventPanel />
        {/if}

        <!-- Quest drawer -->
        <div class="drawer quest-drawer" class:open={questDrawerOpen}>
            <div class="drawer-handle" on:click={() => (questDrawerOpen = false)}>
                <span>Active Quests</span><span>▼</span>
            </div>
            <div class="drawer-content"><QuestTracker /></div>
        </div>

        <!-- Log drawer -->
        <div class="drawer log-drawer" class:open={logDrawerOpen}>
            <div class="drawer-handle" on:click={() => (logDrawerOpen = false)}>
                <span>Message Log</span><span>▼</span>
            </div>
            <div class="drawer-content log-content"><MessageLog /></div>
        </div>

        {#if questDrawerOpen}
            <div class="drawer-backdrop" on:click={() => (questDrawerOpen = false)} role="presentation"></div>
        {/if}

        <!-- DPad -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="dpad-float" class:active={dpadActive} on:pointerdown|stopPropagation={onDpadTouch}>
            <DPad />
        </div>

        <!-- Scout view -->
        {#if scoutOpen && $landscapeImage}
            <div class="scout-overlay" on:click={() => (scoutOpen = false)} role="presentation">
                <img src={$landscapeImage} alt="landscape" class="scout-img" />
                <button class="scout-close">▼ tap to dismiss</button>
            </div>
        {/if}
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         BOTTOM DOCK — landscape thumb · weapons+bread · log
         ════════════════════════════════════════════════════════════════ -->
    <div class="bottom-dock">
        <button
            class="scout-thumb"
            on:click={() => (scoutOpen = !scoutOpen)}
            title="Scout view"
        >
            {#if $landscapeImage}
                <img src={$landscapeImage} alt="landscape" />
            {:else}
                <div class="scout-placeholder">⚑</div>
            {/if}
        </button>

        <div class="dock-weapons">
            <WeaponWidget />
        </div>

        <button
            class="log-btn"
            class:active={questDrawerOpen}
            on:click={() => {
                questDrawerOpen = !questDrawerOpen;
                logDrawerOpen = false;
            }}
            title="Quests"
        >
            <img src="/game_icons/expression_confused.png" alt="Quests" />
            {#if activeQuestCount > 0}<span class="dot quest-dot">{activeQuestCount}</span>{/if}
        </button>

        <button
            class="log-btn"
            on:click={() => {
                logDrawerOpen = !logDrawerOpen;
                questDrawerOpen = false;
                hasUnread = false;
            }}
            title="Messages"
        >
            <img src="/game_icons/message.png" alt="Log" />
            {#if hasUnread}<span class="dot"></span>{/if}
        </button>
    </div>
</div>

<style>
    .mobile-root {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #111;
        overflow: hidden;
        /* Leave room at top for the global navbar (50px). */
        padding-top: 50px;
        box-sizing: border-box;
    }

    /* ── Top strip ───────────────────────────────────────────────────── */
    .top-strip {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 6px 8px;
        background-color: var(--surface-2, #2a2a2a);
        border-bottom: 3px solid #00000056;
        z-index: 30;
    }
    .hp-stack {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        min-width: 0;
        max-width: 140px;
    }
    .strip-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
    }
    .strip-controls::-webkit-scrollbar { display: none; }

    .strip-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 5px 7px;
        background-color: var(--surface-3);
        color: var(--text-header);
        border: 2px solid #00000056;
        box-shadow: #00000056 0 -2px 0 0px inset;
        border-radius: 5px;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        line-height: 1;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out;
    }
    .strip-btn:active {
        transform: translateY(2px);
        box-shadow:
            inset 0 0 0 1.5px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }
    .strip-btn.active {
        background-color: var(--color-buff, #6a994e);
        color: #fff;
    }
    .strip-btn .g {
        font-size: 0.85rem;
        line-height: 1;
    }
    .strip-btn img {
        width: 14px;
        height: 14px;
        object-fit: contain;
        image-rendering: pixelated;
    }
    .log-btn.active {
        background-color: var(--color-buff, #6a994e);
    }
    .quest-dot {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 15px;
        height: 15px;
        background: #facc15;
        color: #111;
        border-radius: 50%;
        border: 1.5px solid #111;
        font-family: var(--font-family-pixel);
        font-size: 0.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    /* ── Map area ────────────────────────────────────────────────────── */
    .map-area {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        width: 100%;
    }
    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #aaa;
        font-family: monospace;
    }

    /* ── DPad float ──────────────────────────────────────────────────── */
    .dpad-float {
        position: absolute;
        bottom: 0.75rem;
        right: 0.75rem;
        z-index: 100;
        opacity: 0.25;
        filter: saturate(0) blur(4px) brightness(0.7);
        transition: all 0.4s ease;
    }
    .dpad-float.active {
        opacity: 1;
        filter: none;
    }
    .dpad-float :global(.mobile-d-pad) {
        background: transparent;
        padding: 0;
        width: auto;
    }
    .dpad-float :global(.action-buttons) {
        display: none;
    }

    /* ── Scout view ──────────────────────────────────────────────────── */
    .scout-overlay {
        position: absolute;
        inset: 0;
        z-index: 90;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: fade-in 0.2s ease;
    }
    @keyframes fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    .scout-img {
        max-width: 100%;
        max-height: 80%;
        object-fit: contain;
        border: 4px solid #00000056;
        box-shadow: #00000056 0 -8px 0 0px inset, 0 0 32px rgba(0, 0, 0, 0.6);
        border-radius: 8px;
    }
    .scout-close {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--surface-3);
        color: var(--text-header);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 6px;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        cursor: pointer;
    }

    /* ── Drawers ─────────────────────────────────────────────────────── */
    .drawer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 50;
        background-color: var(--surface-3, #1a1a1a);
        border-top: 2px solid #444;
        transform: translateY(100%);
        transition: transform 0.25s ease;
        border-radius: 16px 16px 0 0;
        display: flex;
        flex-direction: column;
        max-height: 55%;
    }
    .drawer.open { transform: translateY(0); }
    .drawer-handle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid #333;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        color: #aaa;
        cursor: pointer;
        flex-shrink: 0;
    }
    .drawer-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0.5rem;
    }
    .log-content { display: flex; flex-direction: column; padding: 0; }
    .drawer-backdrop {
        position: absolute;
        inset: 0;
        z-index: 49;
        background: transparent;
    }
    .quest-drawer { max-height: 55%; }
    .log-drawer   { max-height: 60%; z-index: 45; }

    /* ── Bottom dock ─────────────────────────────────────────────────── */
    .bottom-dock {
        flex-shrink: 0;
        display: flex;
        align-items: stretch;
        gap: 0.5rem;
        padding: 0.5rem 0.6rem;
        background-color: var(--surface-2, #2a2a2a);
        border-top: 3px solid #00000056;
        z-index: 30;
    }
    .scout-thumb {
        flex-shrink: 0;
        width: 64px;
        height: 64px;
        padding: 0;
        background-color: var(--surface-3);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out;
    }
    .scout-thumb:active {
        transform: translateY(3px);
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }
    .scout-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .scout-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #555;
    }
    .dock-weapons {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .log-btn {
        position: relative;
        flex-shrink: 0;
        width: 48px;
        height: 64px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--surface-3);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 8px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out;
    }
    .log-btn:active {
        transform: translateY(3px);
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }
    .log-btn img {
        width: 28px;
        height: 28px;
        image-rendering: pixelated;
    }
    .log-btn .dot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        background: #e63946;
        border-radius: 50%;
        border: 1.5px solid #111;
    }
</style>