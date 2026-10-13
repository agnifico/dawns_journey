import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { showEvent, clearEvent, eventScreen, setContextualActions, clearContextualActions } from '$lib/stores/uiStore';
import { isCellBlocked, getCellKind } from '$lib/stores/collisionStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { messageStore } from '$lib/stores/messageStore';
import { resourceStore } from '$lib/stores/resourceStore';
import { time, phase } from '$lib/stores/timeStore';
import { npcStore, getNpcData } from '$lib/stores/npcStore';
import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
import { locationEventDefinitions } from '$lib/data/locationEvents';
import { gainExperience } from '$lib/services/SkillService';
import { addItems } from '$lib/services/InventoryService';
import { triggerLocationEvent } from '$lib/services/LocationEventService';
import { resolveNpcPosition, getRegionForPosition } from '$lib/services/MapService';
import { fishingStore } from '$lib/stores/fishingStore';
import { describeSpot } from './FishingService';
import { game } from '$lib/game/game';
import { toastStore } from '$lib/stores/toastStore';
import { checkRequirement } from './QuestService';

// NPCs are not stepped on: they block movement and are talked to by facing
// them. Everything else still triggers when the player stands on it.
const STEP_ON = new Set(['resource', 'event', 'teleport']);
const NPC_ONLY = new Set(['npc']);

const DIRECTION_DELTAS: Record<string, { dx: number; dy: number }> = {
    up:    { dx: 0,  dy: -1 },
    down:  { dx: 0,  dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1,  dy: 0 },
};

/**
 * Finds the parent entity of one of `types` whose footprint contains (x, y).
 * NPC positions are resolved against the player's current tags and phase,
 * so moving NPCs are found at their new location.
 */
function getEntityAtPosition(x: number, y: number, objects: any[], types: Set<string> = STEP_ON): any | null {
    const player       = get(playerStore);
    const mapId        = get(mapStore).currentMapId;
    const tags         = player.worldTags ?? [];
    const currentPhase = get(phase) as 'Dawnrise' | 'Duskfall';
    const npcs         = get(npcStore).globalNpcs;

    for (const obj of objects) {
        if (!types.has(obj.type)) continue;

        let objX = obj.x;
        let objY = obj.y;

        if (obj.type === 'npc') {
            const npc = npcs[obj.npcId];
            if (!npc) continue; // undefined NPCs aren't rendered, so they mustn't block either
            if (npc.mapPositions) {
                const pos = resolveNpcPosition(npc, mapId, tags, currentPhase);
                if (!pos) continue; // NPC absent from this map right now
                objX = pos.x;
                objY = pos.y;
            }
        }

        const w = obj.width  ?? 1;
        const h = obj.height ?? 1;

        if (x >= objX && x < objX + w && y >= objY && y < objY + h) {
            return obj;
        }
    }
    return null;
}

export async function checkForTileInteraction(): Promise<boolean> {
    updateFacingActions();
    const player = get(playerStore);
    const mapStoreState = get(mapStore);
    const mapData = mapStoreState.maps[mapStoreState.currentMapId];
    if (!mapData) return false;

    const mapObject = getEntityAtPosition(
        player.position.x,
        player.position.y,
        mapData.objects || []
    );

    if (mapObject) {
        switch (mapObject.type) {
            case 'resource': {
                const node = resourceNodeDefinitions[mapObject.resourceId];
                if (!node) {
                    console.warn(`No resource definition found for resourceId: "${mapObject.resourceId}" at (${mapObject.x}, ${mapObject.y})`);
                    break;
                }
                showEvent('resource', node.image, mapObject);
                return true;
            }

            case 'event': {
                const eventData = locationEventDefinitions[mapObject.eventId];
                if (!eventData) {
                    console.warn(`No event definition for eventId: "${mapObject.eventId}" at (${mapObject.x}, ${mapObject.y}). Add to locationEventDefinitions to activate.`);
                    break;
                }
            
                const hasBeenCompleted = (player.locationEventHistory?.[eventData.id] || 0) > 0;
            
                if (hasBeenCompleted && !eventData.reusable) {
                    showEvent('location_event', eventData.afterImage || eventData.image, {
                        ...eventData,
                        shortDesc: eventData.afterDescription || 'You have already completed this event.',
                        actions: [],
                        effects: []
                    });
                    return true;
                }
            
                if (eventData.requirement) {
                    const globalNpcs = get(npcStore).globalNpcs;
                    const { met } = checkRequirement(
                        eventData.requirement,
                        player,
                        null,
                        globalNpcs,
                        true
                    );
            
                    if (!met) {
                        const lockedMsg = eventData.requirementNotMetMessage
                            ?? 'Something stops you from going further.';
                        const lockedEvent = {
                            ...eventData,
                            stepOnMessage: lockedMsg,
                            message: lockedMsg,
                            actions: [],
                            effects: [],
                            requirement: undefined
                        };
                        showEvent('location_event', eventData.image, lockedEvent);
                        triggerLocationEvent(lockedEvent);
                        return true;
                    }
                }
            
                // ← these two lines were missing from your version
                showEvent('location_event', eventData.image, eventData);
                triggerLocationEvent(eventData);
                return true;
            }

            case 'teleport': {
                game.switchMap(mapObject.targetMap, { x: mapObject.targetX, y: mapObject.targetY });
                return true;
            }
        }
    }

    if (await checkForFacingNpc()) return true;

    const dialogue = get(dialogueStore);
    if (dialogue.isOpen && !dialogue.justClosed) {
        dialogueStore.closeDialogue();
    }

    return false;
}

function currentMapObjects(): any[] {
    const mapStoreState = get(mapStore);
    return mapStoreState.maps[mapStoreState.currentMapId]?.objects ?? [];
}

/** The NPC whose (resolved) footprint covers (x, y), if any. */
export function getNpcAtPosition(x: number, y: number): any | null {
    return getEntityAtPosition(x, y, currentMapObjects(), NPC_ONLY);
}

/**
 * True when (x, y) is painted solid in the collision grid. Tiles under a
 * step-on entity (resource, event, teleport) are never solid, so things
 * placed on trees or rocks stay reachable.
 */
export function isTileSolid(x: number, y: number): boolean {
    if (!isCellBlocked(get(mapStore).currentMapId, x, y)) return false;
    return !getEntityAtPosition(x, y, currentMapObjects());
}

/** Opens the NPC's event screen, unless it's already showing that NPC. */
export async function interactWithNpc(mapObject: any): Promise<boolean> {
    const screen = get(eventScreen);
    if (screen.type === 'npc' && screen.data?.npcId === mapObject.npcId) return true;

    const npcData = await getNpcData(mapObject.npcId);
    if (!npcData) {
        console.warn(`No NPC data found for npcId: "${mapObject.npcId}"`);
        return false;
    }
    showEvent('npc', npcData.profileImage, { npcId: npcData.id, fullImage: npcData.image });
    return true;
}

/**
 * Talks to the NPC on the tile the player is facing, if there is one.
 * If not, closes an NPC screen left over from before the player turned away.
 */
export async function checkForFacingNpc(): Promise<boolean> {
    const player = get(playerStore);
    const delta = DIRECTION_DELTAS[player.direction];
    const npc = delta && getNpcAtPosition(player.position.x + delta.dx, player.position.y + delta.dy);
    if (npc) return interactWithNpc(npc);

    if (get(eventScreen).type === 'npc') clearEvent();
    return false;
}

/** The tile in front of the player. */
function facingTile(): { x: number; y: number } | null {
    const player = get(playerStore);
    const delta = DIRECTION_DELTAS[player.direction];
    return delta ? { x: player.position.x + delta.dx, y: player.position.y + delta.dy } : null;
}

/**
 * Context actions for what the player is facing (shown as a prompt above
 * the player, triggered with E). Currently: water → Fish.
 */
export function updateFacingActions() {
    const tile = facingTile();
    const kind = tile && getCellKind(get(mapStore).currentMapId, tile.x, tile.y);
    if (kind?.water && !getNpcAtPosition(tile!.x, tile!.y)) {
        setContextualActions([{ text: 'Fish', hotkey: 'E', action: startFishing }]);
    } else {
        clearContextualActions();
    }
}

/** Opens the fishing minigame for the water the player is facing. */
function startFishing() {
    const tile = facingTile();
    const mapData = get(mapStore).maps[get(mapStore).currentMapId];
    if (!tile || !mapData) return;
    const region = getRegionForPosition(tile, mapData);
    fishingStore.set(describeSpot(region?.id ?? mapData.defaultRegion));
}

export function gatherResource() {
    const player = get(playerStore);
    const mapStoreState = get(mapStore);
    const mapData = mapStoreState.maps[mapStoreState.currentMapId];
    if (!mapData) return;

    const mapObject = getEntityAtPosition(
        player.position.x,
        player.position.y,
        mapData.objects || []
    );

    if (!mapObject || mapObject.type !== 'resource') {
        messageStore.addMessage('There is nothing to gather here.', ['World']);
        return;
    }

    const node = resourceNodeDefinitions[mapObject.resourceId];
    if (!node) {
        console.warn(`Resource node definition not found for resourceId: "${mapObject.resourceId}"`);
        return;
    }

    const skill = player.skills.find(s => s.id === node.skillId);
    if (!skill || skill.level < node.requiredLevel) {
        messageStore.addMessage(`You need level ${node.requiredLevel} ${node.skillId} to gather this.`, ['World', 'Help']);
        toastStore.warning(`You need level ${node.requiredLevel} ${node.skillId} to gather this.`);
        return;
    }

    const resourceNodeKey = `${get(mapStore).currentMapId}-${mapObject.x}-${mapObject.y}`;

    resourceStore.update(rs => {
        const currentTime = get(time);
        const currentState = rs.resourceNodeStates[resourceNodeKey] || { currentGatherCount: 0, cooldownEndTime: 0 };

        if (currentState.currentGatherCount >= node.maxGathers && currentState.cooldownEndTime <= currentTime) {
            const newStates = { ...rs.resourceNodeStates, [resourceNodeKey]: { currentGatherCount: 0, cooldownEndTime: 0 } };
            messageStore.addMessage(`The ${node.name} has respawned.`, ['World']);
            toastStore.info(`The ${node.name} has respawned.`);
            return { ...rs, resourceNodeStates: newStates };
        }

        if (currentState.cooldownEndTime > currentTime) {
            messageStore.addMessage(node.dialogue.failure, ['World', 'Help']);
            toastStore.warning('Node depleted. Please come back later.');
            return rs;
        }
        if (currentState.currentGatherCount >= node.maxGathers) {
            messageStore.addMessage(node.dialogue.failure, ['World', 'Help']);
            toastStore.warning('Node depleted. Please come back later.');
            return rs;
        }

        const newGatherCount = currentState.currentGatherCount + 1;
        const newCooldownEndTime = newGatherCount >= node.maxGathers
            ? currentTime + (node.cooldown * 50)
            : currentState.cooldownEndTime;

        const newStates = {
            ...rs.resourceNodeStates,
            [resourceNodeKey]: { currentGatherCount: newGatherCount, cooldownEndTime: newCooldownEndTime }
        };

        playerStore.update(p => {
            let newPlayer = { ...p };
            const calculatedXP = Math.max(1, Math.floor(node.xpPerLevel / skill.level));
            newPlayer = gainExperience(newPlayer, node.skillId, calculatedXP);
            newPlayer = addItems(newPlayer, node.reward.itemId, node.reward.amount);
            return newPlayer;
        });

        messageStore.addMessage(node.dialogue.success, ['World']);
        return { ...rs, resourceNodeStates: newStates };
    });
}