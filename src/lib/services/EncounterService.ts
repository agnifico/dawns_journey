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

// ---------------------------------------------------------------------------
// Wild encounter flavour lines — keyed by weapon element
// ---------------------------------------------------------------------------
const ENCOUNTER_FLAVOUR: Record<string, string[]> = {
    Fire: [
        'You unleash a torrent of flame, and the {enemy} retreats through the smoke.',
        'A surge of fire from your weapon scorches the {enemy} into submission.',
        "The air ignites around the {enemy} — it doesn't wait to see what comes next.",
        'You drive the {enemy} back with a blazing arc that lights up the terrain.',
    ],
    Water: [
        'You loose a volley of ice shards, and the {enemy} staggers back through the frost.',
        'A crashing wave surges from your weapon, sweeping the {enemy} aside.',
        'You encase the {enemy} in a shell of ice, then shatter it — they scatter.',
        'A freezing mist rolls out from your strike, leaving the {enemy} sluggish and retreating.',
    ],
    Wind: [
        'You summon a howling gale that sends the {enemy} tumbling across the ground.',
        'Thunder splits the air above the {enemy} — the shockwave does the rest.',
        "A spiral of cutting wind shreds through the {enemy}'s defences.",
        'You call down a squall, and the {enemy} is swallowed by the storm.',
    ],
    Earth: [
        'A tangle of vines erupts from the ground, binding the {enemy} until it gives up the fight.',
        'You strike with a leaf-blade storm, and the {enemy} disappears into the whirlwind.',
        'Toxic spores flood the air around the {enemy}, sapping every last bit of their resolve.',
        'The ground cracks and heaves beneath the {enemy}, and they decide elsewhere is safer.',
    ],
    Light: [
        'Divine light breaks open above the {enemy}, leaving it dazed and retreating.',
        'You conjure a blinding illusion — the {enemy} flees something that isn\'t there.',
        'A beam of searing light pins the {enemy} in place, then releases it, broken.',
        'The sky opens on your command, and the {enemy} is subdued by what falls through.',
    ],
    Dark: [
        'Dark clouds swallow the {enemy} whole — when they clear, it\'s already gone.',
        'You unleash a tide of nightmares, and the {enemy} buckles under visions only it can see.',
        'Toxic fumes billow from your weapon, and the {enemy} staggers away delirious.',
        'You dissolve into shadow and strike from everywhere at once — the {enemy} doesn\'t know where to run.',
    ],
    Normal: [
        'You meet the {enemy} with measured, precise force — it never stood a chance.',
        "You don't flinch. The {enemy} does. That's the whole story.",
        'The {enemy} comes in loud. You end it quietly.',
        "Steady, controlled, and utterly decisive — the {enemy} retreats before it even understands what hit it.",
    ],
};

function getEncounterFlavourLine(element: string, enemyName: string): string {
    const pool = ENCOUNTER_FLAVOUR[element] ?? ENCOUNTER_FLAVOUR['Normal'];
    const line = pool[Math.floor(Math.random() * pool.length)];
    return line.replace(/\{enemy\}/g, enemyName);
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
                    const activeElements = get(playerActiveElements);
                    const winningElement = activeElements.find(el => {
                        const req = enemyData.masteryRequirements?.[el];
                        return req !== undefined && get(playerMastery) >= req;
                    }) ?? 'Normal';

                    const message = getEncounterFlavourLine(winningElement, enemyData.name);
                    messageStore.addMessage(message, ['World', 'Help', 'Combat']);
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
                        messageStore.addMessage(`You lose ${enemyData.hpCost} HP from the encounter.`, ['World', 'Combat']);

                        return newPlayer;
                    });
                } else {
                    messageStore.addMessage("You escape the stronger enemy...for now.", ['World', 'Combat']);

                    // Apply HP cost even on failure
                    playerStore.update(p => {
                        let newPlayer = { ...p };
                        newPlayer.baseStats.hp = Math.max(0, newPlayer.baseStats.hp - enemyData.hpCost);
                        messageStore.addMessage(`You lose ${enemyData.hpCost} HP from the encounter.`, ['World', 'Combat']);
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
