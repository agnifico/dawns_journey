import { get } from 'svelte/store';
import { playerStore } from '../stores/playerStore';
import { mapStore } from '../stores/mapStore';
import { loadMap } from '../services/MapService';
import { movePlayer as movePlayerService } from '../services/PlayerMovementService';
import { gatherResource as gatherResourceService } from '../services/InteractionService';

export const game = {
    /**
     * Initializes the game by loading the specified map and setting the player's starting position.
     */
    initializeGame: async (mapId?: string) => {
        const currentPlayer = get(playerStore);
        const mapToLoad = mapId || get(mapStore).currentMapId;
        const mapData = await loadMap(mapToLoad);
        if (mapData) {
            if (!currentPlayer.isInitialized) {
                playerStore.update(p => ({ ...p, position: mapData.playerStart }));
            }
            mapStore.set({ currentMapId: mapToLoad, mapData });
        }
    },

    /**
     * Moves the player by delegating to the PlayerMovementService.
     */
    movePlayer: async (dx: number, dy: number) => {
        await movePlayerService(dx, dy);
    },

    /**
     * Attempts to gather a resource by delegating to the InteractionService.
     */
    gatherResource: () => {
        gatherResourceService();
    },
};
