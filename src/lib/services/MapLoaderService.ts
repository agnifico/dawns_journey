import { mapStore } from '$lib/stores/mapStore';
import type { MapData } from '$lib/types';

// This would ideally be dynamic based on currentMapId, but for now, hardcode dragon_island
import dragonIslandMapData from '$lib/data/maps/final/dragon_island.json';
// import dragonIsl2MapData from '$lib/data/maps/final/dragonIsl2.json';

export async function loadMapData(mapId: string) {
    // In a real application, you would dynamically load the map data based on mapId
    // For now, we'll use the imported dragonIsl2MapData
    console.log(`Loading map data for: ${mapId}`);
    const mapData: MapData = dragonIslandMapData as MapData;
    // const mapData: MapData = dragonIsl2MapData as MapData;

    mapStore.setMapData(mapData);
}