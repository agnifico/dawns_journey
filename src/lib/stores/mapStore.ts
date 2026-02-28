import { writable, derived } from 'svelte/store';
import type { MapData, Position, LandscapeData, ExplorationRequirement } from '$lib/types';

export interface RegionNotificationData {
	regionName: string;
	requirements?: ExplorationRequirement[];
	visible: boolean;
}

export interface MapState {
	currentMapId: string;
	maps: { [mapId: string]: MapData };
	playerX: number;
	playerY: number;
	regionNotification: RegionNotificationData;
	landscape: LandscapeData | null;
}

const initialState: MapState = {
	currentMapId: 'dragon_island',
	maps: {},
	playerX: 0,
	playerY: 0,
	regionNotification: {
		regionName: '',
		requirements: [],
		visible: false
	},
	landscape: null
};

function createMapStore() {
	const { subscribe, update, set } = writable<MapState>(initialState);

	return {
		subscribe,
		set,
		update,
		addObject: (object: any) => {
			update((state) => {
				const mapData = state.maps[state.currentMapId];
				if (!mapData) return state;

				const objectExists = mapData.objects.some((o) => o.x === object.x && o.y === object.y);
				if (objectExists) return state;

				const newObjects = [...mapData.objects, object];
				const newMapData = { ...mapData, objects: newObjects };
				const newMaps = { ...state.maps, [state.currentMapId]: newMapData };
				return { ...state, maps: newMaps };
			});
		},
		setMapData: (mapId: string, newMapData: MapData) => {
			update((state) => ({
				...state,
				maps: { ...state.maps, [mapId]: newMapData },
			}));
		},
		setPlayerPosition: (x: number, y: number) => {
			update((state) => ({
				...state,
				playerX: x,
				playerY: y
			}));
		},
		showRegionNotification: (regionName: string, requirements?: ExplorationRequirement[]) => {
			update((state) => ({
				...state,
				regionNotification: {
					regionName,
					requirements,
					visible: true
				}
			}));
		},
		hideRegionNotification: () => {
			update((state) => ({
				...state,
				regionNotification: {
					...state.regionNotification,
					visible: false
				}
			}));
		}
	};
}

export const mapStore = createMapStore();

export const currentMapData = derived(mapStore, ($mapStore) => {
	return $mapStore.maps[$mapStore.currentMapId] ?? null;
});

export const landscapeImage = derived([mapStore, currentMapData], ([$mapStore, $currentMapData]) => {
	const { playerX, playerY } = $mapStore;
	if (!$currentMapData) return '';

	let currentLandscape;
	for (const landscape of $currentMapData.landscapes) {
		if (
			playerX >= landscape.x &&
			playerX < landscape.x + landscape.width &&
			playerY >= landscape.y &&
			playerY < landscape.y + landscape.height
		) {
			currentLandscape = landscape.landscape;
			break;
		}
	}

	const landscapeId = currentLandscape || $currentMapData.defaultLandscape;
	return landscapeId ? `/locations/${landscapeId}.jpg` : '';
});