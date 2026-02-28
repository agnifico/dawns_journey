import { get } from 'svelte/store';
import { playerStore, playerExplorationAbilities } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { time } from '$lib/stores/timeStore';
import { messageStore } from '$lib/stores/messageStore';
import { clearEvent } from '$lib/stores/uiStore';
import { checkForTileInteraction } from './InteractionService';
import { checkForRandomEncounter } from './EncounterService';
import { getRegionForPosition } from './MapService';
import { processBuffs } from './BuffService';
import * as AchievementService from './AchievementService';
import type { MapData } from '$lib/types';

/**
 * Moves the player and triggers appropriate interactions or encounters.
 */
export async function movePlayer(dx: number, dy: number) {
    const mapStoreState = get(mapStore);
    const mapData = mapStoreState.maps[mapStoreState.currentMapId];
    if (!mapData) return;

    const player = get(playerStore);
    const newPosition = { x: player.position.x + dx, y: player.position.y + dy };

    // Check boundaries
    if (newPosition.x < 0 || newPosition.x >= mapData.width || newPosition.y < 0 || newPosition.y >= mapData.height) {
        return;
    }

    // Check unwalkable areas
    for (const area of mapData.unwalkable || []) {
        if (newPosition.x >= area.x && newPosition.x < area.x + area.width && newPosition.y >= area.y && newPosition.y < area.y + area.height) {
            return;
        }
    }

    // Check region gates
    const regionInfo = getRegionForPosition(newPosition, mapData);
    if (regionInfo && regionInfo.gates) {
        const abilities = get(playerExplorationAbilities);
        let canPass = false;
        for (const req of regionInfo.gates) {
            if (abilities[req.element] && abilities[req.element] >= req.level) {
                canPass = true;
                break;
            }
        }
        if (!canPass) {
            mapStore.showRegionNotification(regionInfo.name, regionInfo.gates.map(r => ({ name: r.element, level: r.level })));
            setTimeout(() => {
                mapStore.hideRegionNotification();
            }, 3000);
            return;
        }
    }

    // All checks passed, update player position
    const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    playerStore.update(p => ({
        ...p,
        position: newPosition,
        direction,
        isMoving: true,
        stepsTaken: p.stepsTaken + 1,
    }));
}