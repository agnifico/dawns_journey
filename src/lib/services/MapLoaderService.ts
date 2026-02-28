import { loadMap } from './MapService';

export async function loadMapData(mapId: string) {
    console.log(`Loading map data for: ${mapId}`);
    await loadMap(mapId);
}
