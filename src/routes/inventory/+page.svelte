<script lang="ts">
    import PlayerStats from "$lib/components/PlayerStats.svelte";
    import FactionDisplay from "$lib/components/FactionDisplay.svelte";
    import Inventory from "$lib/components/Inventory.svelte";
    import Equipment from "$lib/components/Equipment.svelte";
    import MobileTabs from "$lib/components/MobileTabs.svelte";
    import Notification from '$lib/components/Notification.svelte';
</script>

<main>
    <div class="desktop-layout">
        <div class="left-column">
            <PlayerStats />
            <FactionDisplay />
        </div>
        <div class="right-column">
            <Equipment />
            <Inventory />
        </div>
    </div>
    <div class="mobile-layout">
        <MobileTabs>
            <div slot="stats">
                <PlayerStats />
                <FactionDisplay />
            </div>
            <div slot="equipment">
                <Equipment />
            </div>
        </MobileTabs>
        <div class="inventory-column">
            <Inventory />
        </div>
    </div>
    <Notification />
</main>

<style>
    main {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: #1a1610;
    }

    .desktop-layout {
        height: 100%;
        flex-grow: 1;
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 1rem;
        padding: 1rem;
        align-items: start;
        box-sizing: border-box;
    }

    .left-column {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        position: sticky;
        top: 1rem;
        /* border: 1px solid white; */
    }

    .right-column {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
        /* overflow: hidden; */
    }

    .mobile-layout {
        display: none;
        align-items: center;
    }

    @media (max-width: 900px) {
        .desktop-layout {
            grid-template-columns: 1fr;
        }
        .left-column {
            position: static;
        }
    }

    @media (max-width: 768px) {
        .desktop-layout {
            display: none;
        }
        .mobile-layout {
            display: block;
            background-color: #1a1610;
        }
    }
</style>