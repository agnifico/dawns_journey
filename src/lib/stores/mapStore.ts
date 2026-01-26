import { writable } from 'svelte/store';
import type { MapData, Position, LandscapeData } from '$lib/types'; // Import Position and LandscapeData

export interface MapState {
    currentMapId: string;
    mapData: MapData | null;
    playerX: number; // Added
    playerY: number; // Added
}

const initialState: MapState = {
    currentMapId: 'dragon_island',
    mapData: null,
    playerX: 0, // Initial default
    playerY: 0, // Initial default
};

function createMapStore() {
    const { subscribe, update, set } = writable<MapState>(initialState);

    return {
        subscribe,
        set,
        update,
        addObject: (object: any) => {
            update(state => {
                if (!state.mapData) return state;
                // Prevent adding duplicates
                const objectExists = state.mapData.objects.some(o => o.x === object.x && o.y === object.y);
                if (objectExists) return state;

                const newObjects = [...state.mapData.objects, object];
                const newMapData = { ...state.mapData, objects: newObjects };
                return { ...state, mapData: newMapData };
            });
        },
        setMapData: (newMapData: MapData) => { // Added function
            update(state => ({
                ...state,
                mapData: newMapData,
                playerX: newMapData.playerStart.x, // Set initial player position from map data
                playerY: newMapData.playerStart.y, // Set initial player position from map data
            }));
        },
        setPlayerPosition: (x: number, y: number) => { // Added function
            update(state => ({
                ...state,
                playerX: x,
                playerY: y,
            }));
        }
    };
}

export const mapStore = createMapStore();