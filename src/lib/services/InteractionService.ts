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
import { addItem } from '$lib/services/ItemService';
import { triggerEventEffect } from '$lib/services/LocationEventService';

/**
 * Checks for and handles interactions with fixed objects on the current tile.
 * @returns {boolean} - True if an interaction occurred, false otherwise.
 */
export async function checkForTileInteraction(): Promise<boolean> {
    const player = get(playerStore);
    const mapData = get(mapStore).mapData;
    if (!mapData) return false;

    const mapObject = (mapData.objects || []).find(obj => obj.x === player.position.x && obj.y === player.position.y);

    if (mapObject) {
        switch (mapObject.type) {
            case 'npc':
                const npcData = await getNpcData(mapObject.npcId);
                if (npcData) {
                    showEvent('npc', npcData.profileImage, { npcId: npcData.id, fullImage: npcData.image });
                    return true;
                }
                break;
            case 'resource':
                const node = resourceNodeDefinitions[mapObject.resourceId];
                if (node) {
                    showEvent('resource', node.image, mapObject);
                    return true;
                }
                break;
            case 'event':
                const eventData = locationEventDefinitions[mapObject.eventId];
                if (eventData) {
                    showEvent('location_event', eventData.image, eventData);
                    if (!eventData.actions) {
                        triggerEventEffect(eventData.effects, eventData.message);
                    }
                    return true;
                }
            // Add other cases for different object types here
        }
    }
    
    // If no object is found, or the object is not interactive in a way that opens a UI,
    // ensure the dialogue is closed.
    if (get(dialogueStore).isOpen) {
        dialogueStore.closeDialogue();
    }
    
    return false;
}

/**
 * Handles the logic for a player attempting to gather a resource.
 */
export function gatherResource() {
    console.log("gatherResource called at", new Date().getTime());
    const player = get(playerStore);
    const mapData = get(mapStore).mapData;
    if (!mapData) {
        return;
    }

    const mapObject = (mapData.objects || []).find(obj => obj.x === player.position.x && obj.y === player.position.y);
    if (!mapObject || mapObject.type !== 'resource') {
        messageStore.addMessage('There is nothing to gather here.', ['World']);
        return;
    }

    const node = resourceNodeDefinitions[mapObject.resourceId];
    if (!node) {
        console.error(`Resource node definition not found for ${mapObject.resourceId}`);
        return;
    }

    const skill = player.skills.find(s => s.id === node.skillId);
    if (!skill || skill.level < node.requiredLevel) {
        messageStore.addMessage(`You need level ${node.requiredLevel} ${node.skillId} to gather this.`, ['World', 'Help']);
        return;
    }

    const resourceNodeKey = `${get(mapStore).currentMapId}-${mapObject.x}-${mapObject.y}`;
    
    resourceStore.update(rs => {
        const currentTime = get(time);
        let currentState = rs.resourceNodeStates[resourceNodeKey] || { currentGatherCount: 0, cooldownEndTime: 0 };

        // If the node is depleted but the cooldown has passed, reset it and do nothing else.
        if (currentState.currentGatherCount >= node.maxGathers && currentState.cooldownEndTime <= currentTime) {
            const newResourceNodeStates = { ...rs.resourceNodeStates };
            newResourceNodeStates[resourceNodeKey] = { currentGatherCount: 0, cooldownEndTime: 0 };
            messageStore.addMessage(`The ${node.name} has respawned.`, ['World']);
            return { ...rs, resourceNodeStates: newResourceNodeStates };
        }

        // Check cooldown and gather count again inside the update to prevent race conditions
        if (currentState.cooldownEndTime > currentTime) {
            messageStore.addMessage(node.dialogue.failure, ['World', 'Help']);
            return rs; // Return original state
        }
        if (currentState.currentGatherCount >= node.maxGathers) {
            messageStore.addMessage(node.dialogue.failure, ['World', 'Help']);
            return rs; // Return original state
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

        // Only update player if the gather was successful
        playerStore.update(p => {
            let newPlayer = { ...p };
            const calculatedXP = Math.max(1, Math.floor(node.xpPerLevel / skill.level));
            newPlayer = gainExperience(newPlayer, node.skillId, calculatedXP);
            newPlayer = addItem(newPlayer, node.reward.itemId, node.reward.amount);
            return newPlayer;
        });

        messageStore.addMessage(node.dialogue.success, ['World']);

        return { ...rs, resourceNodeStates: newResourceNodeStates };
    });
}
