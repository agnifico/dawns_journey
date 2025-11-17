import { get } from 'svelte/store';
import { playerStore, playerStats, playerExplorationAbilities, playerMastery, playerActiveElements } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { eventScreenStore } from '$lib/stores/eventScreenStore';
import { messageStore } from '$lib/stores/messageStore';
import { getEnemyById } from '$lib/stores/enemyStore';
import { getItemById } from '$lib/stores/itemStore';
import { getRegionForPosition } from './MapService';
import { addItem } from './ItemService';
import type { MapData } from '$lib/types';

/**
 * Checks for and handles random encounters in the player's current region.
 */
export function checkForRandomEncounter() {
    const player = get(playerStore);
    const mapData = get(mapStore).mapData;
    if (!mapData) return;

    const regionInfo = getRegionForPosition(player.position, mapData);
    if (!regionInfo) return;

    const roll = Math.random();
    const baseEnemyChance = mapData.enemyEncounterChance || 0;
    const baseItemChance = mapData.itemFindingChance || 0;

    if (roll < baseEnemyChance) {
        // Enemy Encounter
        if (get(playerStats).hp <= 0) {
            messageStore.addMessage('You are too weak to engage in combat.', ['Combat']);
            return;
        }

        const enemySpawns = regionInfo.enemies || [];
        if (enemySpawns.length === 0) return;
        
        const totalWeight = enemySpawns.reduce((sum, e) => sum + e.chance, 0);
        const pickRoll = Math.random() * totalWeight;
        let cumulativeChance = 0;

        for (const spawn of enemySpawns) {
            cumulativeChance += spawn.chance;
            if (pickRoll < cumulativeChance) {
                const enemyData = getEnemyById(spawn.id);
                if (!enemyData) break;

                eventScreenStore.show('enemy', enemyData.image, enemyData);
                messageStore.addMessage(`A wild ${enemyData.name} appears!`, ['World']);

                const currentMastery = get(playerMastery);
                const activeElements = get(playerActiveElements);
                let canDefeat = false;
                for (const [element, requiredLevel] of Object.entries(enemyData.masteryRequirements || {})) {
                    if (activeElements.includes(element) && currentMastery >= requiredLevel) {
                        canDefeat = true;
                        break;
                    }
                }

                if (canDefeat) {
                    messageStore.addMessage(`You overpowered the ${enemyData.name}!`, ['World']);
                    playerStore.update(p => {
                        let newPlayer = { ...p };
                        newPlayer.killCounts[enemyData.id] = (newPlayer.killCounts[enemyData.id] || 0) + 1;
                        
                        (enemyData.drops || []).forEach(drop => {
                            const droppedItem = getItemById(drop.itemId);
                            if (droppedItem) {
                                messageStore.addMessage(`You found ${drop.quantity} ${droppedItem.name}!`, ['World']);
                                newPlayer = addItem(newPlayer, drop.itemId, drop.quantity);
                            }
                        });
                        return newPlayer;
                    });
                } else {
                    const reqs = Object.entries(enemyData.masteryRequirements || {}).map(([e, l]) => `${l} ${e} Mastery`).join(' or ');
                    messageStore.addMessage(`The ${enemyData.name} is too strong. Requires: ${reqs}`, ['World', 'Help']);
                }
                break; 
            }
        }
    } else if (roll < baseEnemyChance + baseItemChance) {
        // Item Finding
        const itemDrops = regionInfo.items || [];
        if (itemDrops.length === 0) return;

        const totalWeight = itemDrops.reduce((sum, d) => sum + d.chance, 0);
        const pickRoll = Math.random() * totalWeight;
        let cumulativeChance = 0;

        for (const drop of itemDrops) {
            cumulativeChance += drop.chance;
            if (pickRoll < cumulativeChance) {
                const item = getItemById(drop.id);
                if (item) {
                    playerStore.update(p => {
                        return addItem(p, item.id, 1);
                    });
                    messageStore.addMessage(`You found a ${item.name}!`, ['World']);
                    eventScreenStore.show('item_found', `/general/${item.id}.png`, { item, quantity: 1 });
                }
                break;
            }
        }
    }
}