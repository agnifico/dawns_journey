import { get } from 'svelte/store';
import { playerStore, playerExplorationAbilities } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { time } from '$lib/stores/timeStore';
import { messageStore } from '$lib/stores/messageStore';
import { clearEvent } from '$lib/stores/uiStore';
import { checkForTileInteraction, checkForFacingNpc, getNpcAtPosition, isTileSolid, updateFacingActions } from './InteractionService';
import { checkForRandomEncounter } from './EncounterService';
import { getRegionForPosition } from './MapService';
import { processBuffs } from './BuffService';
import * as AchievementService from './AchievementService';
import type { MapData } from '$lib/types';

// How long the walk animation keeps playing after the last step. Slightly
// longer than the fastest repeat rate (DPad holds at 110ms) so continuous
// walking never drops back to the idle frame mid-stride.
const WALK_ANIM_LINGER_MS = 200;
let walkAnimTimer: ReturnType<typeof setTimeout> | null = null;

function markMoving() {
    if (walkAnimTimer) clearTimeout(walkAnimTimer);
    walkAnimTimer = setTimeout(() => {
        walkAnimTimer = null;
        playerStore.update(p => ({ ...p, isMoving: false }));
    }, WALK_ANIM_LINGER_MS);
}

/**
 * Turns the player in place without taking a step (no time passes). Used when
 * a move is blocked, so walking into a wall or an NPC still faces it.
 */
function turnPlayer(direction: string) {
    if (get(playerStore).direction !== direction) {
        playerStore.update(p => ({ ...p, direction }));
    }
    checkForFacingNpc();
    updateFacingActions();
}

/**
 * Moves the player and triggers appropriate interactions or encounters.
 */
export async function movePlayer(dx: number, dy: number) {
    const mapStoreState = get(mapStore);
    const mapData = mapStoreState.maps[mapStoreState.currentMapId];
    if (!mapData) return;

    const player = get(playerStore);
    const newPosition = { x: player.position.x + dx, y: player.position.y + dy };
    const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';

    // Check boundaries
    if (newPosition.x < 0 || newPosition.x >= mapData.width || newPosition.y < 0 || newPosition.y >= mapData.height) {
        return turnPlayer(direction);
    }

    // NPCs are solid; bumping into one talks to them
    if (getNpcAtPosition(newPosition.x, newPosition.y)) {
        return turnPlayer(direction);
    }

    // Solid scenery from the collision grid. Skipped while standing on a solid
    // tile (old saves, teleports) so the player can always walk out.
    if (isTileSolid(newPosition.x, newPosition.y) && !isTileSolid(player.position.x, player.position.y)) {
        return turnPlayer(direction);
    }

    // Check unwalkable areas
    for (const area of mapData.unwalkable || []) {
        if (newPosition.x >= area.x && newPosition.x < area.x + area.width && newPosition.y >= area.y && newPosition.y < area.y + area.height) {
            return turnPlayer(direction);
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
            return turnPlayer(direction);
        }
    }

    // All checks passed, update player position
    playerStore.update(p => ({
        ...p,
        position: newPosition,
        direction,
        isMoving: true,
        stepsTaken: p.stepsTaken + 1,
    }));
    updateFacingActions();
    markMoving();
}