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
import type { MapData } from '$lib/types';

/**
 * Moves the player and triggers appropriate interactions or encounters.
 */
export async function movePlayer(dx: number, dy: number) {
    const mapData = get(mapStore).mapData;
    if (!mapData) return;

    let player = get(playerStore);
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
            messageStore.addMessage('You shall not pass.', ['World', 'Help'], undefined, regionInfo.gates.map(r => ({ name: r.element, level: r.level })));
            return;
        }
    }

    // Process buffs before updating time and position
    const nextTime = get(time) + 1;
    player = processBuffs(player, nextTime);

    // Update player position and time
    const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    playerStore.update(p => ({ ...player, position: newPosition, direction, isMoving: true }));
    time.update(t => t + 1);
    clearEvent();

    // Check for interactions and encounters
    const interactionOccurred = await checkForTileInteraction();
    if (!interactionOccurred) {
        checkForRandomEncounter();
    }
}