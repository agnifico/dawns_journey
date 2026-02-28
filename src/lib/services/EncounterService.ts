import { get } from 'svelte/store';
import { playerStore, playerStats, playerExplorationAbilities, playerMastery, playerActiveElements } from '$lib/stores/playerStore';
import { mapStore } from '$lib/stores/mapStore';
import { showEvent, clearEvent } from '$lib/stores/uiStore';
import { messageStore } from '$lib/stores/messageStore';
import { getEnemyById } from '$lib/services/EnemyDataService';
import { getItemById } from '$lib/services/InventoryService';
import { getRegionForPosition } from './MapService';
import { addItems } from './InventoryService';
import { gainExperience } from './PlayerLevelService';
import { startCombat } from './CombatService';
import type { MapData, NPC, Enemy, Item } from '$lib/types';

// Helper to convert an Enemy to a combat-ready NPC
function enemyToNpc(enemy: Enemy): NPC {
    return {
        id: enemy.id,
        name: enemy.name,
        image: enemy.image,
        profileImage: enemy.thumbnailImage || enemy.image,
        isCombatant: true,
        baseStats: enemy.baseStats,
        swordRank: 1,
        heartRank: 1,
        affinity: 0,
        swordState: 'NOT_STARTED',
        heartState: 'NOT_STARTED',
        swordRanks: [],
        heartRanks: [],
        statGrowth: [],
        battleAftermathsBySwordRank: [],
        types: enemy.types,
        abilityCycle: [], // Legendary enemies might have special abilities, but we'll handle that later
    };
}

/**
 * Checks for and handles random encounters in the player's current region.
 */
export function checkForRandomEncounter() {
    const player = get(playerStore);
    const mapStoreState = get(mapStore);
    const mapData = mapStoreState.maps[mapStoreState.currentMapId];
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
                    const message = enemyData.isLegendary ? `You defeated ${enemyData.name}.` : `You defeated the ${enemyData.name}.`;
                    messageStore.addMessage(message, ['World']);
                    playerStore.update(p => {
                        let newPlayer = { ...p };
                        newPlayer.killCounts[enemyData.id] = (newPlayer.killCounts[enemyData.id] || 0) + 1;

                        // Grant XP
                        newPlayer = gainExperience(newPlayer, enemyData.xp);

                        // Grant drops
                        (enemyData.drops || []).forEach(drop => {
                            const roll = Math.random();
                            if (!drop.chance || roll < drop.chance) {
                                newPlayer = addItems(newPlayer, drop.itemId, drop.quantity);
                                const item = getItemById(drop.itemId);
                            }
                        });

                        // Apply HP cost
                        newPlayer.baseStats.hp = Math.max(0, newPlayer.baseStats.hp - enemyData.hpCost);
                        messageStore.addMessage(`You lose ${enemyData.hpCost} HP from the encounter.`, ['Combat']);

                        return newPlayer;
                    });
                } else {
                    messageStore.addMessage("You escape the stronger enemy...for now.", ['World', 'Help']);
                    
                    // Apply HP cost even on failure
                    playerStore.update(p => {
                        let newPlayer = { ...p };
                        newPlayer.baseStats.hp = Math.max(0, newPlayer.baseStats.hp - enemyData.hpCost);
                        messageStore.addMessage(`You lose ${enemyData.hpCost} HP from the encounter.`, ['Combat']);
                        return newPlayer;
                    });
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
                        const newPlayer = addItems(p, item.id, 1);
                        return newPlayer;
                    });
                    // showEvent('item_found', item.image, { item, quantity: 1 });
                }
                break;
            }
        }
    }
}
