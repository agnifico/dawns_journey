<script lang="ts">
    import PlayerStats from "$lib/components/PlayerStats.svelte";
    import FactionDisplay from "$lib/components/FactionDisplay.svelte";
    import Inventory from "$lib/components/Inventory.svelte";
    import Equipment from "$lib/components/Equipment.svelte";
    import MobileTabs from "$lib/components/MobileTabs.svelte";
    import Notification from '$lib/components/Notification.svelte';
    import CurrencyBar from '$lib/components/ui/CurrencyBar.svelte';
</script>

<main>
    <CurrencyBar />

    <div class="desktop-layout">
        <!-- Left: sticky reference column -->
        <aside class="left-column">
            <PlayerStats />
            <!-- <FactionDisplay /> -->
        </aside>

        <!-- Right: scrolling content column -->
        <div class="right-column">
            <Equipment />
            <Inventory />
        </div>
    </div>

    <!-- Mobile -->
    <div class="mobile-layout">
        <MobileTabs>
            <div slot="stats">
                <PlayerStats />
                <!-- <FactionDisplay /> -->
            </div>
            <div slot="equipment">
                <Equipment />
            </div>
        </MobileTabs>
        <Inventory />
    </div>

    <Notification />
</main>

<style>
    main {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1a1610;
        overflow: hidden;  /* outer page never scrolls — right col does */
    }

    /* ── Currency bar is sticky, handled inside the component ── */

    .desktop-layout {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: 480px 1fr;
        gap: 1rem;
        padding: 1rem;
        box-sizing: border-box;
        overflow: hidden;
    }

    /* Left column: sticky, scrolls independently if content overflows */
    .left-column {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        height: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #3a2a1a transparent;
    }

    /* Right column: Equipment above, Inventory below. Column scrolls. */
    .right-column {
        display: flex;
        /* flex-direction: column; */
        gap: 0.75rem;
        min-width: 0;
        height: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #3a2a1a transparent;
    }

    .mobile-layout { display: none; }

    @media (max-width: 900px) {
        .desktop-layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
        .desktop-layout { display: none; }
        .mobile-layout {
            display: block;
            background: #1a1610;
            overflow-y: auto;
            flex: 1;
        }
    }
</style>