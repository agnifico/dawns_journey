<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
    import { getFirstInventoryItem, useItem } from '$lib/services/InventoryService';
    import { toastStore } from '$lib/stores/toastStore';
    import ItemBox from '../ItemBox.svelte';

    $: breadCount = $playerStore.inventory.filter((i) => i.id === 'bread').length;
    $: breadLow = breadCount > 0 && breadCount <= 2;
    $: breadOut = breadCount === 0;

    function eatBread() {
        const bread = getFirstInventoryItem($playerStore.inventory, 'bread');
        if (bread?.instanceId) {
            useItem(bread.instanceId);
            toastStore.success('Ate some Bread. Helth maxx!!');
        } else {
            toastStore.warning("OH FUCK WE'RE OUT OF BREAD!! GET SOME BREAD!");
        }
    }
</script>

<div class="weapons-dock">
    <div class="weapons-slots">
        {#each $playerStore.equipment.weapon_slots as item}
            {#if item}
                <ItemBox {item} viewSize="small" hoverEnabled={true} />
            {/if}
        {/each}
    </div>

    <div class="divider"></div>

    <button
        class="bread-btn"
        class:low={breadLow}
        class:out={breadOut}
        on:click={eatBread}
        title="Eat Bread (B)"
    >
        <img src="/general/bread.png" alt="Bread" />
        <span class="bread-count">{breadCount}</span>
    </button>
</div>

<style>
    .weapons-dock {
        display: flex;
        align-items: stretch;
        gap: 0.25rem;
        padding: 0.4rem 0.5rem;
        background-color: var(--surface-2);
        border: 4px solid #00000056;
        box-shadow: #00000056 0 -6px 0 0px inset;
        border-radius: 12px;
        padding-bottom: calc(0.4rem + 6px); /* breathe room for the inset ledge */
    }

    .weapons-slots {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .divider {
        width: 2px;
        background-color: #00000056;
        border-radius: 1px;
        margin: 4px 4px;
        flex-shrink: 0;
    }

    /* ── Bread hotkey button ─────────────────────────────────────────────── */
    .bread-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        padding: 0;
        cursor: pointer;
        background-color: var(--surface-3);
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
        border-radius: 6px;
        transition: 100ms transform ease-in-out, 100ms box-shadow ease-in-out;
    }

    .bread-btn:hover {
        background-color: color-mix(in srgb, var(--surface-3) 80%, var(--color-primary));
    }

    .bread-btn:active {
        /* Bottom edge stays planted: shadow collapses, button moves down to fill it. */
        transform: translateY(3px);
        box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.4),
            #00000056 0 0 0 0px inset;
    }

    .bread-btn img {
        width: 28px;
        height: 28px;
        image-rendering: pixelated;
        object-fit: contain;
    }

    /* ── Bread count badge ───────────────────────────────────────────────── */
    .bread-count {
        position: absolute;
        bottom: -6px;
        right: -6px;
        min-width: 22px;
        padding: 2px 5px;
        background-color: var(--color-buff, #6a994e);
        border: 2px solid #00000056;
        box-shadow: #00000056 0 -2px 0 0px inset;
        border-radius: 5px;
        font-family: var(--font-family-pixel);
        font-size: 0.75rem;
        color: white;
        line-height: 1;
        text-align: center;
        text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
    }

    .bread-btn.low .bread-count {
        background-color: #d4a017;
        animation: pulse-low 1.6s ease-in-out infinite;
    }

    .bread-btn.out .bread-count {
        background-color: #8b1e1e;
        color: #ffd0d0;
    }

    .bread-btn.out img {
        filter: grayscale(1) brightness(0.6);
    }

    @keyframes pulse-low {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
    }
</style>