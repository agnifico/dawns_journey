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
        <div class="player-stats-column">
            <PlayerStats />
            <FactionDisplay />
        </div>
        <div class="equipment-column">
            <Equipment />
        </div>
        <div class="inventory-column">
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
</main>
<!-- <Notification /> -->

<style>
    main {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .desktop-layout {
        height: 100%;
        flex-grow: 1;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2rem;
        padding: 1rem 2rem;
    }

    .player-stats-column, .equipment-column, .inventory-column {
        /* overflow-y: auto; */
        /* background-color: transparent; */
        /* border: 6px solid var(--color-border); */
        border-radius: 12px;
        min-height: 0;
        /* box-shadow: var(--color-border) 4px 4px; */
        height: fit-content;
        /* height: 80%; */
    }

    .mobile-layout {
        display: none;
    }

    @media (max-width: 768px) {
        .desktop-layout {
            display: none;
        }
        .mobile-layout {
            display: block;
        }
    }
</style>
