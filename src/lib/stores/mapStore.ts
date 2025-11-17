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

export const mapStore = writable<MapState>(initialState);
