<script lang="ts">
    import TilePalette from '../../lib/components/map-editor/TilePalette.svelte';
    import BehaviorPalette from '../../lib/components/map-editor/BehaviorPalette.svelte';
    import MapGrid from '../../lib/components/map-editor/MapGrid.svelte';
    import JsonOutput from '../../lib/components/map-editor/JsonOutput.svelte';
    import oulierIslandMetadata from '../../lib/assets/data/maps/oulier_island_metadata.json';
    import oulierIslandData from '../../lib/assets/data/maps/oulier_island_data.json';
</script>

<div class="map-editor">
    <div class="left-panel">
        <TilePalette />
        <BehaviorPalette />
    </div>
    <div class="main-panel">
        <MapGrid />
    </div>
    <div class="right-panel">
        <h2>Metadata JSON</h2>
        <JsonOutput data={oulierIslandMetadata} />
        <h2>Data JSON</h2>
        <JsonOutput data={oulierIslandData} />
    </div>
</div>

<style>
    .map-editor {
        display: flex;
    }

    .left-panel {
        width: 200px;
        padding: 1em;
    }

    .main-panel {
        flex-grow: 1;
        padding: 1em;
    }

    .right-panel {
        width: 300px;
        padding: 1em;
        overflow-y: auto;
    }
</style>
