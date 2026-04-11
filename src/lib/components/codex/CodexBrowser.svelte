<script lang="ts">
    export let items: { id: any; name: string; image: string }[] = [];
    export let detailComponent: any;

    let selectedItem = items[0] || null;
    $: { items; selectedItem = items[0] || null; }
</script>

<div class="browser-container">
    <!-- Left: icon + name list -->
    <div class="list-pane">
        {#each items as item (item.id)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="list-item"
                class:selected={selectedItem?.id === item.id}
                on:click={() => selectedItem = item}
                title={item.name}
            >
                <div class="item-img-wrap">
                    <img src={item.image} alt={item.name} />
                </div>
                <span class="item-name">{item.name.replace(' Plant', '').replace(' Seed', '')}</span>
            </div>
        {/each}
    </div>

    <!-- Right: detail panel -->
    <div class="detail-pane">
        {#if selectedItem}
            <svelte:component this={detailComponent} item={selectedItem} />
        {:else}
            <div class="no-selection">Select a crop to view details.</div>
        {/if}
    </div>
</div>

<style>
    .browser-container {
        display: flex;
        height: 100%;
    }

    /* ── List pane ── */
    .list-pane {
        width: 140px;
        min-width: 140px;
        flex-shrink: 0;
        border-right: 2px solid #2a4a2a;
        overflow-y: auto;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        scrollbar-width: thin;
        scrollbar-color: #2a4a2a transparent;
    }

    .list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        border-radius: 6px;
        border: 2px solid transparent;
        cursor: pointer;
        background: rgba(0,0,0,0.15);
        transition: 0.12s all ease;
        box-shadow: rgba(0,0,0,0.4) 0 -3px 0 0 inset;
    }

    .list-item:hover {
        background: rgba(255,255,255,0.06);
        border-color: #3a5a3a;
    }

    .list-item.selected {
        background: #253a28;
        border-color: #5aaa5a;
        box-shadow: rgba(0,0,0,0.3) 0 -1px 0 0 inset, 0 0 8px rgba(90, 170, 90, 0.2);
    }

    .item-img-wrap {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.4);
    }

    .item-img-wrap img {
        width: 28px;
        height: 28px;
        image-rendering: pixelated;
        object-fit: contain;
    }

    .item-name {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        color: #8aaa8a;
        text-align: center;
        line-height: 1.2;
        word-break: break-word;
    }

    .list-item.selected .item-name { color: #c0e8c0; }

    /* ── Detail pane ── */
    .detail-pane {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem 1.5rem;
        scrollbar-width: thin;
        scrollbar-color: #2a4a2a transparent;
    }

    .no-selection {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.85rem;
        color: #4a6a4a;
        font-style: italic;
    }
</style>