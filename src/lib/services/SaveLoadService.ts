import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { playerStore } from '$lib/stores/playerStore';
import { npcStore } from '$lib/stores/npcStore';
import { mapStore } from '$lib/stores/mapStore';
import { messageStore } from '$lib/stores/messageStore';
import * as FarmingService from './FarmingService';
import { loadMap } from './MapService';
import { checkQuestTriggers } from './QuestService';
import { validateAllData } from './ValidationService';
import { questStore } from '$lib/stores/questStore';
import playerDefaults from '$lib/data/player';

const SAVE_KEY = 'dawn_journey_save_v2';

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    let output = { ...target } as T & U;
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

export function saveGame() {
    if (!browser) return; // Guard against server-side execution

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
    if (!browser) return; // Guard against server-side execution

    const savedDataString = localStorage.getItem(SAVE_KEY);
    if (!savedDataString) {
        messageStore.addMessage('No save data found to load.', ['System']);
        return;
    }

    try {
        const savedData = JSON.parse(savedDataString);

        if (savedData.player) {
            let loadedPlayer = deepMerge(playerDefaults, savedData.player);

            // Migration for player level
            if (loadedPlayer.level === undefined) {
                loadedPlayer.level = 1;
            }
            if (loadedPlayer.xp === undefined) {
                loadedPlayer.xp = 0;
            }

            // Call the correct function for offline growth calculation
            const updatedPlayer = FarmingService.calculateOfflineGrowth(loadedPlayer); 
            playerStore.set({ ...updatedPlayer, isInitialized: true });
        }
        
        if (savedData.mapStore) {
            mapStore.set(savedData.mapStore);
        }

        if (savedData.npcs) {
            await npcStore.initializeGlobalNpcs(); 
            npcStore.loadNpcs(savedData.npcs);
        }

        let player = get(playerStore);
        player = checkQuestTriggers(player);
        playerStore.set(player);

        validateAllData(get(questStore), get(npcStore));

        messageStore.addMessage('Game Loaded!', ['System']);
        goto('/map');

    } catch (error) {
        console.error("Error loading game:", error);
        messageStore.addMessage('Failed to load save data. The file may be corrupt.', ['System']);
    }
}

export function clearSave() {
    if (!browser) return; // Guard against server-side execution
    
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
}