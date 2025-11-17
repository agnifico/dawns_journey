<script lang="ts">
    export let items: { id: any; name: string; image: string }[] = [];
    export let detailComponent: any;

    let selectedItem = items[0] || null;

    // When the items prop changes (e.g., filtering), reset selection
    $: {
        items; // dependency
        selectedItem = items[0] || null;
    }
</script>

<div class="browser-container">
    <div class="list-pane">
        <ul class="item-grid">
            {#each items as item (item.id)}
                <li on:click={() => selectedItem = item} class:selected={selectedItem?.id === item.id}>
                    <img src={item.image} alt={item.name} title={item.name} />
                </li>
            {/each}
        </ul>
    </div>
    <div class="detail-pane">
        {#if selectedItem}
            <svelte:component this={detailComponent} item={selectedItem} />
        {:else}
            <div class="no-selection">
                <p>Select an item to see its details.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .browser-container {
        display: flex;
        height: 100%;
        gap: 1rem;
    }

    .list-pane {
        width: 150px; /* 3 * 40px width + 2 * 10px gap + 2 * 5px padding */
        min-width: 150px;
        flex-shrink: 0;
        background-color: rgba(0,0,0,0.2);
        border-radius: 8px;
        padding: 5px;
        overflow-y: auto;
    }

    .item-grid {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(3, 40px);
        gap: 10px;
    }

    .item-grid li {
        width: 40px;
        height: 40px;
        background-color: rgba(0,0,0,0.3);
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px;
        box-sizing: border-box;
    }

    .item-grid li:hover {
        background-color: rgba(255,255,255,0.1);
    }
    
    .item-grid li.selected {
        background-color: rgba(97, 218, 251, 0.2);
        border-color: #61dafb;
        transform: scale(1.1);
    }

    .item-grid li img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
    }

    .detail-pane {
        flex-grow: 1;
        overflow-y: auto;
        padding: 0 1rem;
    }

    .no-selection {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #888;
        font-size: 1.2rem;
    }
</style>
