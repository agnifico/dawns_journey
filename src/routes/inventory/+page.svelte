<script lang="ts">
    // Inventory page — three columns that fill the screen:
    //   character (stats as a full-name list) · gear (equipment + selected item)
    //   · inventory grid (full height and width).
    // The original layout lives in ClassicLayout.svelte; open
    // /inventory?layout=classic to see it.
    import { onMount } from 'svelte';
    import PlayerStats from "$lib/components/PlayerStats.svelte";
    import Inventory from "$lib/components/Inventory.svelte";
    import Equipment from "$lib/components/Equipment.svelte";
    import ItemDetailPanel from "$lib/components/ItemDetailPanel.svelte";
    import MobileTabs from "$lib/components/MobileTabs.svelte";
    import Notification from '$lib/components/Notification.svelte';
    import CurrencyBar from '$lib/components/ui/CurrencyBar.svelte';
    import ClassicLayout from './ClassicLayout.svelte';
    import ExploBubble_OLD from '$lib/components/ExploBubble_OLD.svelte';
    import { activeItem } from '$lib/stores/uiStore';
    import { playerExplorationAbilities } from '$lib/stores/playerStore';

    // Read on the client: the page is prerendered, so the query isn't available at build time
    let classic = false;
    onMount(() => {
        classic = new URLSearchParams(window.location.search).get('layout') === 'classic';
    });
</script>

{#if classic}
    <ClassicLayout />
{:else}
<main>
    <CurrencyBar>
        <!-- Exploration levels live in the top bar here, freeing the gear column -->
        <div slot="end" class="bar-explo">
            {#if Object.keys($playerExplorationAbilities).length > 0}
                <span class="bar-explo-label">Exploration</span>
                {#each Object.entries($playerExplorationAbilities) as [name, level]}
                    <ExploBubble_OLD {name} {level} />
                {/each}
            {/if}
        </div>
    </CurrencyBar>

    <div class="desktop-layout">
        <aside class="column character-column">
            <PlayerStats statsLayout="list" showSkills={false} />
        </aside>

        <section class="column gear-column">
            <Equipment showExploration={false} />
            <div class="detail-card">
                {#if $activeItem}
                    <ItemDetailPanel item={$activeItem} wide />
                {:else}
                    <div class="detail-empty">
                        <span class="detail-empty-title">No item selected</span>
                        <span class="detail-empty-hint">Select an item to see its stats and effects here. Right-click an item for a quick Use / Equip.</span>
                    </div>
                {/if}
            </div>
        </section>

        <section class="column inventory-column">
            <Inventory showDrawer={false} />
        </section>
    </div>

    <!-- Mobile (unchanged from the classic layout) -->
    <div class="mobile-layout">
        <MobileTabs>
            <div slot="stats">
                <PlayerStats />
            </div>
            <div slot="equipment">
                <Equipment />
            </div>
        </MobileTabs>
        <Inventory />
    </div>

    <Notification />
</main>
{/if}

<style>
    main {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1a1610;
        overflow: hidden;
    }

    .desktop-layout {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(340px, 380px) minmax(440px, 1fr) minmax(400px, 1.15fr);
        gap: 1rem;
        padding: 1rem;
        box-sizing: border-box;
        overflow: hidden;
    }

    .column {
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #3a2a1a transparent;
    }

    .character-column :global(.player-stats) {
        padding-inline: 0;
    }

    /* Gear: equipment on top, the selected item fills the rest */
    .gear-column {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .gear-column :global(.equipment-panel) {
        padding: 0;
    }

    /* Exploration chips in the top bar */
    .bar-explo {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .bar-explo-label {
        font-family: var(--font-family-pixel);
        font-size: 0.5rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(200, 169, 110, 0.4);
        margin-right: 4px;
    }
    .bar-explo :global(.explo-bubble) {
        margin: 0;
    }
    .detail-card {
        flex: 1;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        padding: 12px;
        border-radius: 10px;
        border: 1px solid rgba(200, 169, 110, 0.15);
        background: rgba(22, 16, 10, 0.95);
        overflow: hidden; /* the panel's details area scrolls, the actions stay put */
    }
    .detail-empty {
        margin: auto;
        max-width: 280px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
    }
    .detail-empty-title {
        font-family: var(--font-family-pixel);
        font-size: 0.8rem;
        color: rgba(200, 169, 110, 0.55);
    }
    .detail-empty-hint {
        font-family: 'Lexend';
        font-size: 0.8rem;
        line-height: 1.3;
        color: var(--text-muted);
    }

    /* Inventory: grid uses the full column */
    .inventory-column {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .mobile-layout { display: none; }

    /* Narrower desktops: character on the left, gear above inventory on the
       right; the page scrolls and the inventory keeps a fixed height. */
    @media (max-width: 1280px) {
        .desktop-layout {
            grid-template-columns: minmax(320px, 360px) 1fr;
            grid-auto-rows: max-content;
            align-content: start;
            overflow-y: auto;
        }
        .character-column { grid-row: 1 / span 2; height: auto; overflow: visible; }
        .gear-column { height: auto; min-height: auto; overflow: visible; }
        .inventory-column { height: min(640px, 80vh); }
        .detail-card { flex: none; min-height: 0; }
    }

    @media (max-width: 900px) {
        .desktop-layout { grid-template-columns: 1fr; }
        .character-column { grid-row: auto; }
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
