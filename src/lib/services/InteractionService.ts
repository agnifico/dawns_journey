import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { showEvent } from '$lib/stores/uiStore';
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
import { resolveNpcPosition } from '$lib/services/MapService';
import { game } from '$lib/game/game';
import { toastStore } from '$lib/stores/toastStore';

const INTERACTIVE = new Set(['npc', 'resource', 'event', 'teleport']);

/**
 * Finds the interactive parent entity whose footprint contains (x, y).
 * NPC positions are resolved against the player's current tags and phase,
 * so moving NPCs trigger correctly at their new location.
 */
function getEntityAtPosition(x: number, y: number, objects: any[]): any | null {
    const player       = get(playerStore);
    const mapId        = get(mapStore).currentMapId;
    const tags         = player.worldTags ?? [];
    const currentPhase = get(phase) as 'Dawnrise' | 'Duskfall';
    const npcs         = get(npcStore).globalNpcs;

    for (const obj of objects) {
        if (obj.type === 'multi_tile_part') continue;
        if (!INTERACTIVE.has(obj.type)) continue;

        let objX = obj.x;
        let objY = obj.y;

        if (obj.type === 'npc') {
            const npc = npcs[obj.npcId];
            if (npc?.mapPositions) {
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
                    console.warn(`No NPC data found for npcId: "${mapObject.npcId}"`);
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

    const dialogue = get(dialogueStore);
    if (dialogue.isOpen && !dialogue.justClosed) {
        dialogueStore.closeDialogue();
    }

    return false;
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