<script lang="ts">
    import { onMount } from 'svelte';
    import { selectedTileType, selectedBehaviorType, activeBrush } from '../../stores/mapEditorStore';
    import oulierIslandMetadata from '../../assets/data/maps/oulier_island_metadata.json';
    import oulierIslandData from '../../assets/data/maps/oulier_island_data.json';

    let mapData = [];
    let metadata = {};
    let behaviorColors: { [key: string]: string } = {};

    onMount(() => {
        mapData = oulierIslandData;
        metadata = oulierIslandMetadata;
        for (const id in metadata.behaviorTypes) {
            behaviorColors[id] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        }
    });

    function getTileImage(tile) {
        if (!metadata.tileTypes || !tile) return '';
        const tileType = metadata.tileTypes[tile.tileTypeId];
        return tileType ? tileType.tileImage : '';
    }

    function handleTileClick(tile) {
        const newMapData = [...mapData];
        const index = newMapData.findIndex(t => t.x === tile.x && t.y === tile.y);
        if (index !== -1) {
            if ($activeBrush === 'tile' && $selectedTileType) {
                newMapData[index].tileTypeId = $selectedTileType;
            } else if ($activeBrush === 'behavior' && $selectedBehaviorType) {
                newMapData[index].behaviorTypeId = $selectedBehaviorType;
            }
            mapData = newMapData;
        }
    }
</script>

<div class="map-grid">
    <h2>Map Grid</h2>
    <div class="grid" style="grid-template-columns: repeat({metadata.mapWidth}, 40px);">
        {#each mapData as tile (tile.x + '-' + tile.y)}
            <div
                class="tile"
                on:click={() => handleTileClick(tile)}
                style="background-image: url({getTileImage(tile)}); background-color: {behaviorColors[tile.behaviorTypeId] || 'transparent'}; background-blend-mode: multiply;"
            >
            </div>
        {/each}
    </div>
</div>

<style>
    .grid {
        display: grid;
        gap: 1px;
        background-color: #ccc;
        border: 1px solid #ccc;
    }

    .tile {
        width: 40px;
        height: 40px;
        background-size: cover;
        background-position: center;
        image-rendering: pixelated;
        cursor: pointer;
    }
</style>
