import { get } from 'svelte/store';
import { playerStore } from '../stores/playerStore';
import { mapStore } from '../stores/mapStore';
import { loadMap } from '../services/MapService';
import { movePlayer as movePlayerService } from '../services/PlayerMovementService';
import { gatherResource as gatherResourceService } from '../services/InteractionService';
import * as InventoryService from '../services/InventoryService';
import type { Position } from '$lib/types';
import { messageStore } from '$lib/stores/messageStore';

export const game = {
    /**
     * Initializes the game by loading the specified map and setting the player's starting position.
     */
    initializeGame: async (mapId?: string) => {
        const currentPlayer = get(playerStore);
        const mapToLoad = mapId || get(mapStore).currentMapId;
        const mapData = await loadMap(mapToLoad);
        if (mapData && !currentPlayer.isInitialized) {
            playerStore.update(p => ({ ...p, position: mapData.playerStart }));
            mapStore.setPlayerPosition(mapData.playerStart.x, mapData.playerStart.y);
        }
    },

    /**
     * Switches the current map and moves the player to the specified position.
     */
    switchMap: async (mapId: string, position: Position) => {
        await loadMap(mapId);
        playerStore.update(p => ({ ...p, position }));
    },

    /**
     * Moves the player by delegating to the PlayerMovementService.
     */
    movePlayer: async (dx: number, dy: number) => {
        messageStore.newSession();
        await movePlayerService(dx, dy);
    },

    /**
     * Attempts to gather a resource by delegating to the InteractionService.
     */
    gatherResource: () => {
        gatherResourceService();
    },

    /**
     * Unequips an item from an equipment slot.
     */
    unequipItem: (slotType: 'weapon_slots' | 'relic_slots', slotIndex: number) => {
        InventoryService.unequipItem(slotType, slotIndex);
    },

    /**
     * Equips an item from the inventory.
     */
    equipItem: (instanceId: string) => {
        InventoryService.equipItem(instanceId);
    },

    /**
     * Consumes an item, applying its effects and removing it from inventory.
     */
    useItem: (instanceId: string) => {
        InventoryService.useItem(instanceId);
    }
};
