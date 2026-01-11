import { writable } from 'svelte/store';
import type { MapData } from '$lib/types';

export interface MapState {
    currentMapId: string;
    mapData: MapData | null;
}

const initialState: MapState = {
    currentMapId: 'dragon_island',
    mapData: null,
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
        }
    };
}

export const mapStore = createMapStore();