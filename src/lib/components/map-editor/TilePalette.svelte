<script lang="ts">
    import { onMount } from 'svelte';
    import { selectedTileType, activeBrush } from '../../stores/mapEditorStore';
    import oulierIslandMetadata from '../../assets/data/maps/oulier_island_metadata.json';

    let tileTypes = {};

    onMount(() => {
        tileTypes = oulierIslandMetadata.tileTypes;
    });

    function selectTileType(tileTypeId: string) {
        if ($selectedTileType === tileTypeId && $activeBrush === 'tile') {
            selectedTileType.set(null);
            activeBrush.set(null);
        } else {
            selectedTileType.set(tileTypeId);
            activeBrush.set('tile');
        }
    }
</script>

<div class="tile-palette">
    <h2>Tile Palette</h2>
    <div class="tiles">
        {#each Object.entries(tileTypes) as [id, type] (id)}
            <div class="tile" class:active={$selectedTileType === id && $activeBrush === 'tile'} on:click={() => selectTileType(id)}>
                <img src={type.tileImage} alt={id} />
            </div>
        {/each}
    </div>
</div>

<style>
    .tile-palette {
        margin-bottom: 1em;
    }

    .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: 5px;
    }

    .tile {
        width: 40px;
        height: 40px;
        cursor: pointer;
        border: 1px solid #ccc;
    }

    .tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .tile.active {
        border: 2px solid blue;
    }
</style>
