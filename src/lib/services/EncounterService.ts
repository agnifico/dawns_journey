import { get } from 'svelte/store';
import { playerStore, playerStats, playerExplorationAbilities, playerMastery, playerActiveElements } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { showEvent, clearEvent } from '$lib/stores/uiStore';
import { messageStore } from '$lib/stores/messageStore';
import { getEnemyById } from '$lib/services/EnemyDataService';
import { getItemById } from '$lib/services/ItemDataService';
import { getRegionForPosition } from './MapService';
import { addItem } from './ItemService';
import { startCombat } from './CombatService'; // Import startCombat
import type { MapData, NPC } from '$lib/types'; // Import NPC type

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
    const enemyChance = regionInfo.enemyChance ?? mapData.enemyEncounterChance ?? 0;
    const itemChance = regionInfo.itemChance ?? mapData.itemFindingChance ?? 0;

    if (roll < enemyChance) {
        // Enemy Encounter
        if (get(playerStats).hp <= 0) {
            messageStore.addMessage('You are too weak to engage in combat.', ['Combat']);
            return;
        }

        const enemySpawns = regionInfo.enemies || [];
        if (enemySpawns.length === 0) return;
        
        const pickRoll = Math.random();
        let cumulativeChance = 0;

        for (const spawn of enemySpawns) {
            cumulativeChance += spawn.chance;
            if (pickRoll < cumulativeChance) {
                const enemyData = getEnemyById(spawn.id);
                if (!enemyData) break;

                messageStore.addMessage(`A wild ${enemyData.name} appears!`, ['World']);

                    // Regular Enemy Encounter - Mastery Check
                    showEvent('enemy', enemyData.image, enemyData);
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
                                const roll = Math.random();
                                if (!drop.chance || roll < drop.chance) {
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
    } else if (roll < enemyChance + itemChance) {
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
                        const newPlayer = addItem(p, item.id, 1);
                        return newPlayer;
                    });
                }
                break;
            }
        }
    }
}