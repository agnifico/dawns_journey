import { get } from 'svelte/store';
import { playerStore, playerStats, playerExplorationAbilities, playerWorldResonance, playerActiveElements } from '$lib/stores/playerStore';
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
import { toastStore } from '$lib/stores/toastStore';
import { notificationStore } from '$lib/stores/notificationStore';

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
            // toastStore.warning('Cannot fight with ZERO HP. Heal up!');
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

                const currentResonance = get(playerWorldResonance);
                const resonanceRequirement = enemyData.resonanceRequirement ?? 0;
                const canDefeat = currentResonance >= resonanceRequirement;

                // --- Prepare Encounter Result ---
                const encounterResult = {
                    outcome: canDefeat ? 'win' : 'loss',
                    hpLost: enemyData.hpCost,
                    xpGained: canDefeat ? enemyData.xp : 0,
                    drops: [] as { item: Item; quantity: number }[],
                    reason: ''
                };

                if (canDefeat) {
                    const winningElement = get(playerActiveElements)[0] ?? 'Normal';
                    const message = getEncounterFlavourLine(winningElement, enemyData.name);
                    messageStore.addMessage(message, ['World', 'Help', 'Combat']);

                    playerStore.update(p => {
                        let newPlayer = { ...p };

                        const previousKills = newPlayer.killCounts[enemyData.id] ?? 0;
                        newPlayer.killCounts[enemyData.id] = previousKills + 1;

                        // First kill bonus — +5 World Resonance, one time only
                        if (previousKills === 0) {
                            const FIRST_KILL_RESONANCE = 5;
                            newPlayer.worldResonance = (newPlayer.worldResonance ?? 0) + FIRST_KILL_RESONANCE;
                            // notificationStore.addWorldResonance(FIRST_KILL_RESONANCE, true); // true = isFirstKill
                            toastStore.success(`World Resonance +${FIRST_KILL_RESONANCE}`); // true = isFirstKill
                            messageStore.addMessage(
                                `First encounter with ${enemyData.name}! +${FIRST_KILL_RESONANCE} World Resonance.`,
                                ['World']
                            );
                        }

                        // Grant XP
                        newPlayer = gainExperience(newPlayer, encounterResult.xpGained);

                        // Grant drops
                        (enemyData.drops || []).forEach(drop => {
                            const roll = Math.random();
                            if (!drop.chance || roll < drop.chance) {
                                const item = getItemById(drop.itemId);
                                if (item) {
                                    newPlayer = addItems(newPlayer, drop.itemId, drop.quantity);
                                    encounterResult.drops.push({ item, quantity: drop.quantity });
                                }
                            }
                        });

                        // Apply HP cost
                        newPlayer.baseStats.hp = Math.max(0, newPlayer.baseStats.hp - encounterResult.hpLost);
                        messageStore.addMessage(`You lose ${encounterResult.hpLost} HP from the encounter.`, ['World', 'Combat']);

                        return newPlayer;
                    });
                } else {
                    encounterResult.reason = 'You World Resonance too low.';
                    messageStore.addMessage("You escaped the enemy for now.", ['World', 'Combat']);

                    // Apply HP cost even on failure
                    playerStore.update(p => {
                        let newPlayer = { ...p };
                        newPlayer.baseStats.hp = Math.max(0, newPlayer.baseStats.hp - encounterResult.hpLost);
                        messageStore.addMessage(`You lose ${encounterResult.hpLost} HP from the encounter.`, ['World', 'Combat']);
                        return newPlayer;
                    });
                }

                // Show event with enemy data and the result
                showEvent('enemy', enemyData.image, { ...enemyData, encounterResult });


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
