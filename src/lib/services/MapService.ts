import type { MapData } from '../types';
import { regionDefinitions } from '$lib/data/regionDefinitions';

export const loadMap = async (mapId: string): Promise<MapData | null> => {
    try {
        const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
        const mapPath = `/src/lib/data/maps/final/${mapId}.json`;

        if (!mapModules[mapPath]) {
            throw new Error(`Map with id '${mapId}' not found.`);
        }

        const mapModule = await mapModules[mapPath]();
        const mapData = mapModule.default as MapData;

        // Ensure the objects array exists
        if (!mapData.objects) {
            mapData.objects = [];
        }

        return mapData;
    } catch (error) {
        console.error(`Failed to load map: ${mapId}`, error);
        return null;
    }
};

export function getRegionForPosition(position: { x: number, y: number }, mapData: MapData) {
    const region = (mapData.regions || []).find(r => 
        position.x >= r.x && position.x < r.x + r.width &&
        position.y >= r.y && position.y < r.y + r.height
    );
    const regionType = region ? region.regionType : mapData.defaultRegion;
    return regionDefinitions[regionType];
}