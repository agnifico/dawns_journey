import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { playerStore } from '$lib/stores/playerStore';
import { npcStore } from '$lib/stores/npcStore';
import { mapStore } from '$lib/stores/mapStore';
import { messageStore } from '$lib/stores/messageStore';
import * as FarmingService from './FarmingService';
import { loadMap } from './MapService';

const SAVE_KEY = 'dawn_journey_save_v2';

export function saveGame() {
    try {
        const playerData = { ...get(playerStore), lastPlayedTimestamp: Date.now() };
        const npcData = get(npcStore).globalNpcs;
        const mapState = get(mapStore);

        const saveData = {
            player: playerData,
            npcs: npcData,
            mapStore: mapState,
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        messageStore.addMessage('Game Saved!', ['System']);
    } catch (error) {
        console.error("Error saving game:", error);
        messageStore.addMessage('An error occurred while saving your game.', ['System']);
    }
}

export async function loadGame() {
    const savedDataString = localStorage.getItem(SAVE_KEY);
    if (!savedDataString) {
        messageStore.addMessage('No save data found to load.', ['System']);
        return;
    }

    try {
        const savedData = JSON.parse(savedDataString);

        if (savedData.player) {
            const loadedPlayer = savedData.player;
            // Call the correct function for offline growth calculation
            const updatedPlayer = FarmingService.calculateGrowthOnLoad(loadedPlayer); 
            playerStore.set({ ...updatedPlayer, isInitialized: true });
        }
        // NEW: Load map data if available in save
        if (savedData.mapStore) {
            const mapToLoadId = savedData.mapStore.currentMapId;
            const loadedMapData = await loadMap(mapToLoadId);
            if (loadedMapData) {
                mapStore.set({ currentMapId: mapToLoadId, mapData: loadedMapData });
            }
        }
        if (savedData.npcs) {
            await npcStore.initializeGlobalNpcs(); 
            npcStore.loadNpcs(savedData.npcs);
        }

        messageStore.addMessage('Game Loaded!', ['System']);
        goto('/map');

    } catch (error) {
        console.error("Error loading game:", error);
        messageStore.addMessage('Failed to load save data. The file may be corrupt.', ['System']);
    }
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
}
