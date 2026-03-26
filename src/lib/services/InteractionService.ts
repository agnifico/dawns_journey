import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { showEvent } from '$lib/stores/uiStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { messageStore } from '$lib/stores/messageStore';
import { resourceStore } from '$lib/stores/resourceStore';
import { time } from '$lib/stores/timeStore';
import { npcStore, getNpcData } from '$lib/stores/npcStore';
import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
import { locationEventDefinitions } from '$lib/data/locationEvents';
import { gainExperience } from '$lib/services/SkillService';
import { addItems } from '$lib/services/InventoryService';
import { triggerLocationEvent } from '$lib/services/LocationEventService';
import { game } from '$lib/game/game';
import { toastStore } from '$lib/stores/toastStore';

/**
 * Finds the interactive parent entity whose footprint contains (x, y).
 * - Parent entities: type is 'npc' | 'resource' | 'event' | 'teleport'
 * - multi_tile_part objects are resolved to their parent automatically.
 * - Returns null if no entity covers the given tile.
 */
function getEntityAtPosition(x: number, y: number, objects: any[]): any | null {
    for (const obj of objects) {
        if (obj.type === 'multi_tile_part') continue;

        // Only match interactive types — skip anything unrecognised
        const INTERACTIVE = new Set(['npc', 'resource', 'event', 'teleport']);
        if (!INTERACTIVE.has(obj.type)) continue;   // ← add this line

        const w = obj.width  ?? 1;
        const h = obj.height ?? 1;
        if (x >= obj.x && x < obj.x + w && y >= obj.y && y < obj.y + h) {
            return obj;
        }
    }
    return null;
}

/**
 * Checks for and handles interactions with fixed objects on the current tile.
 * @returns {boolean} - True if an interaction occurred, false otherwise.
 */
export async function checkForTileInteraction(): Promise<boolean> {
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
            case 'npc': {
                const npcData = await getNpcData(mapObject.npcId);
                if (!npcData) {
                    console.warn(`No NPC data found for npcId: "${mapObject.npcId}" at (${mapObject.x}, ${mapObject.y})`);
                    break;
                }
                showEvent('npc', npcData.profileImage, { npcId: npcData.id, fullImage: npcData.image });
                return true;
            }

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
                    console.warn(`No event definition found for eventId: "${mapObject.eventId}" at (${mapObject.x}, ${mapObject.y}). Add it to locationEventDefinitions to activate this tile.`);
                    break; // don't crash — treat as empty tile until the event is written
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

    // No interaction — close dialogue if it was open from a previous tile
    const dialogue = get(dialogueStore);
    if (dialogue.isOpen && !dialogue.justClosed) {
        dialogueStore.closeDialogue();
    }

    return false;
}

/**
 * Handles the logic for a player attempting to gather a resource.
 */
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

    // Key off the parent's origin tile so all parts of a multi-tile node share one state
    const resourceNodeKey = `${get(mapStore).currentMapId}-${mapObject.x}-${mapObject.y}`;

    resourceStore.update(rs => {
        const currentTime = get(time);
        let currentState = rs.resourceNodeStates[resourceNodeKey] || { currentGatherCount: 0, cooldownEndTime: 0 };

        if (currentState.currentGatherCount >= node.maxGathers && currentState.cooldownEndTime <= currentTime) {
            const newResourceNodeStates = { ...rs.resourceNodeStates };
            newResourceNodeStates[resourceNodeKey] = { currentGatherCount: 0, cooldownEndTime: 0 };
            messageStore.addMessage(`The ${node.name} has respawned.`, ['World']);
            toastStore.info(`The ${node.name} has respawned.`);
            return { ...rs, resourceNodeStates: newResourceNodeStates };
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
        let newCooldownEndTime = currentState.cooldownEndTime;
        if (newGatherCount >= node.maxGathers) {
            newCooldownEndTime = currentTime + (node.cooldown * 50);
        }

        const newResourceNodeStates = { ...rs.resourceNodeStates };
        newResourceNodeStates[resourceNodeKey] = {
            currentGatherCount: newGatherCount,
            cooldownEndTime: newCooldownEndTime
        };

        playerStore.update(p => {
            let newPlayer = { ...p };
            const calculatedXP = Math.max(1, Math.floor(node.xpPerLevel / skill.level));
            newPlayer = gainExperience(newPlayer, node.skillId, calculatedXP);
            newPlayer = addItems(newPlayer, node.reward.itemId, node.reward.amount);
            return newPlayer;
        });

        messageStore.addMessage(node.dialogue.success, ['World']);
        return { ...rs, resourceNodeStates: newResourceNodeStates };
    });
}