import { get } from 'svelte/store';
import { playerStore } from '../stores/playerStore';
import { messageStore } from '../stores/messageStore';
import { cropDefinitions } from '../data/cropDefinitions';
import {
    getItemById,
    addItems,
    removeItemsByItemId,
    hasItem,
} from './InventoryService';
import { gainExperience } from './SkillService';
import type { Player, Crop, FarmPlot, CropDefinition } from '../types';
import { seasonStore } from '../stores/seasonStore';
import { notificationStore } from '$lib/stores/notificationStore';
import { toastStore } from '$lib/stores/toastStore';

const FARMING_SKILL_ID = 'farming';

/**
 * Returns the player's current farming skill level, or 1 as a safe default.
 */
function getFarmingLevel(player: Player): number {
    return player.skills.find(s => s.id === FARMING_SKILL_ID)?.level ?? player.farmingLevel ?? 1;
}

/**
 * Checks whether a crop's watering requirement is satisfied for advancing
 * a stage, given its definition and current state.
 *
 * - lifetime_based: wateredCount must have reached the threshold at least once
 *   across the entire lifecycle. The count is never reset, so this is a
 *   one-time gate.
 * - stage_based: wateredCount must reach the threshold since the last stage
 *   advance. The count resets to 0 each time a stage advances.
 */
function isWateringMet(crop: Crop, plantDef: CropDefinition): boolean {
    return crop.wateredCount >= plantDef.wateringRequirementValue;
}

/**
 * Plants a crop in a specified farm plot.
 */
export function plantCrop(plotId: string, plantId: string, useCompost: boolean) {
    playerStore.update(player => {
        let newPlayer = { ...player };
        const plot = newPlayer.homestead.farmPlots.find(p => p.id === plotId);

        if (!plot) {
            messageStore.addMessage('Farm plot not found.', ['System']);
            return player;
        }
        if (plot.crop) {
            messageStore.addMessage('This plot is already occupied.', ['System']);
            return player;
        }

        const plantDef = cropDefinitions[plantId];
        if (!plantDef) {
            messageStore.addMessage('Plant definition not found.', ['System']);
            return player;
        }

        // Level gate
        const farmingLevel = getFarmingLevel(newPlayer);
        if (farmingLevel < plantDef.unlockLevel) {
            messageStore.addMessage(
                `You need Farming level ${plantDef.unlockLevel} to plant ${plantDef.name}.`,
                ['System']
            );
            return player;
        }

        // Environment check
        if (plantDef.requiredEnvironment.length > 0 && !plantDef.requiredEnvironment.includes(plot.environment)) {
            messageStore.addMessage(
                `${plantDef.name} cannot be grown in this environment.`,
                ['System']
            );
            return player;
        }

        // Compost requirement: crop must require it AND the plot must have the tech applied
        if (plantDef.requiredTechs.includes('tech_compost_bin')) {
            if (!plot.appliedTech.includes('tech_compost_bin')) {
                messageStore.addMessage(`This plot needs a Compost Bin applied before planting ${plantDef.name}.`, ['System']);
                return player;
            }
            if (!useCompost) {
                messageStore.addMessage(`${plantDef.name} requires compost.`, ['System']);
                return player;
            }
            if (!hasItem(newPlayer.inventory, 'compost', 1)) {
                messageStore.addMessage('You do not have any compost.', ['System']);
                toastStore.warning('You do not have any compost.');
                return player;
            }
            newPlayer = removeItemsByItemId(newPlayer, 'compost', 1);
            messageStore.addMessage('Used 1 Compost.', ['World']);
            toastStore.info('Used 1 Compost.');
        }

        const seedItem = getItemById(plantDef.seedItemId);
        if (!seedItem) {
            messageStore.addMessage('Seed item not found.', ['System']);
            return player;
        }

        if (!hasItem(newPlayer.inventory, plantDef.seedItemId, 1)) {
            messageStore.addMessage(`You don't have any ${plantDef.name} seeds.`, ['System']);
            return player;
        }

        // Consume seed
        newPlayer = removeItemsByItemId(newPlayer, plantDef.seedItemId, 1);

        const now = Date.now();
        const newCrop: Crop = {
            id: `${plantId}-${now}`,
            plantId: plantId,
            plantedTimestamp: now,
            stageStartedTimestamp: now,
            currentGrowthStage: 0,
            lastWateredTimestamp: 0,
            wateredCount: 0,
            needsWater: false,
        };

        plot.crop = newCrop;

        // Auto irrigation: if player has tech_irrigation, satisfy watering
        // requirement immediately on plant so the crop never blocks on water.
        if (newPlayer.unlockedTech.includes('tech_irrigation')) {
            plot.crop.wateredCount = plantDef.wateringRequirementValue;
            plot.crop.lastWateredTimestamp = Date.now();
            messageStore.addMessage(`The ${plantDef.name} was automatically watered.`, ['World']);
        }

        messageStore.addMessage(`You planted a ${plantDef.name}.`, ['World']);
        toastStore.success(`You planted a ${plantDef.name}.`);
        newPlayer.skills = gainExperience(newPlayer, FARMING_SKILL_ID, 5).skills;

        return newPlayer;
    });
}

/**
 * Waters a crop in a specified farm plot.
 * After watering, immediately attempts a growth check so that stage-based
 * crops which were time-ready but blocked on water advance right away.
 */
export function waterCrop(plotId: string) {
    playerStore.update(player => {
        const newPlayer = { ...player };
        const plot = newPlayer.homestead.farmPlots.find(p => p.id === plotId);

        if (!plot || !plot.crop) {
            messageStore.addMessage('No crop to water here.', ['System']);
            return player;
        }

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return player;

        if (plot.crop.currentGrowthStage >= plantDef.growthStages.length - 1) {
            messageStore.addMessage(`The ${plantDef.name} is already fully grown — harvest it!`, ['System']);
            return player;
        }

        plot.crop.wateredCount++;
        plot.crop.lastWateredTimestamp = Date.now();
        // Clear the flag — we'll re-evaluate it in calculateOfflineGrowth below
        plot.crop.needsWater = false;

        messageStore.addMessage(`You watered the ${plantDef.name}.`, ['World']);
        toastStore.info(`You watered the ${plantDef.name}.`);

        // Run a growth check immediately so a stage-based crop that was
        // time-ready but blocked on water advances without a page reload.
        return calculateOfflineGrowth(newPlayer);
    });
}

/**
 * Harvests a fully grown crop from a specified farm plot.
 */
export function harvestCrop(plotId: string) {
    playerStore.update(player => {
        let newPlayer = { ...player };
        const plot = newPlayer.homestead.farmPlots.find(p => p.id === plotId);

        if (!plot || !plot.crop) return player;

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return player;

        if (plot.crop.currentGrowthStage < plantDef.growthStages.length - 1) {
            messageStore.addMessage(`The ${plantDef.name} is not yet fully grown.`, ['System']);
            return player;
        }


        let totalYieldMultiplier = 1;
        const currentSeason = get(seasonStore);

        if (newPlayer.unlockedTech.includes('decree_of_gaia')) {
            totalYieldMultiplier *= 3;
        }

        if (plantDef.idealSeason === currentSeason) {
            totalYieldMultiplier *= plantDef.idealSeasonYieldMultiplier;
            messageStore.addMessage(`Bonus yield for harvesting in the ideal season!`, ['World']);
            toastStore.success(`Bonus yield for harvesting in the ideal season!`);
        }

        const amount = Math.floor(plantDef.yieldsAmount * totalYieldMultiplier);
        const yieldedItem = getItemById(plantDef.yields);
        if (yieldedItem) {
            newPlayer = addItems(newPlayer, plantDef.yields, amount, false);
            notificationStore.add('item_received', yieldedItem, amount);
        }

        // Add leaves to inventory
        if (plantDef.leavesYield > 0) {
            const leavesItem = getItemById('leaves');
            if (leavesItem) {
                newPlayer = addItems(newPlayer, 'leaves', plantDef.leavesYield, false);
                notificationStore.add('item_received', leavesItem, plantDef.leavesYield);
            }
        }

        newPlayer.skills = gainExperience(newPlayer, FARMING_SKILL_ID, plantDef.xpYield).skills;
        newPlayer.cropsHarvested = (newPlayer.cropsHarvested ?? 0) + 1;
        plot.crop = null;

        return newPlayer;
    });
}

/**
 * Core offline growth simulation. Called automatically on app load and after
 * watering. Advances crops through as many stages as time and watering allow.
 *
 * Design rules:
 * - Time and watering must BOTH be satisfied for a stage to advance.
 * - lifetime_based crops: wateredCount accumulates forever; once the threshold
 *   is reached the gate is open for all future stages.
 * - stage_based crops: wateredCount resets to 0 on every stage advance;
 *   the player must re-water for each new stage.
 * - If time has passed but watering is not met, the crop is marked
 *   `needsWater: true` and the loop stops — the stage is locked until watered.
 * - Timestamp correction uses actual overflow time, not an approximation,
 *   so multiple offline stage advances don't accumulate drift.
 */
export function calculateOfflineGrowth(player: Player): Player {
    const now = Date.now();
    const currentSeason = get(seasonStore);
    const newPlayer = { ...player };

    newPlayer.homestead.farmPlots.forEach(plot => {
        if (!plot.crop) return;

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return;

        const finalStage = plantDef.growthStages.length - 1;
        if (plot.crop.currentGrowthStage >= finalStage) return;

        let tempCrop = { ...plot.crop };
        let advanced = false;

        while (tempCrop.currentGrowthStage < finalStage) {
            const stageDef = plantDef.growthStages[tempCrop.currentGrowthStage];

            const growthMultiplier =
                plantDef.idealSeason === currentSeason
                    ? plantDef.growthMultiplierInIdealSeason
                    : 1;

            const timeElapsedInStage = now - tempCrop.stageStartedTimestamp;
            // Scale elapsed time by the multiplier — a 2× multiplier means
            // the crop experiences time twice as fast.
            const effectiveTimeElapsed = timeElapsedInStage * growthMultiplier;

            // Gate 1: has enough time passed?
            if (effectiveTimeElapsed < stageDef.duration) break;

            // Gate 2: is the watering requirement satisfied?
            if (!isWateringMet(tempCrop, plantDef)) {
                // Time is ready but the player hasn't watered — flag it and stop.
                tempCrop.needsWater = true;
                break;
            }

            // Both gates passed — advance the stage.
            tempCrop.needsWater = false;
            advanced = true;
            tempCrop.currentGrowthStage++;

            // Precise timestamp correction: carry forward only the time that
            // actually elapsed in this stage (accounting for the multiplier),
            // so the next stage timer starts from the exact moment this one
            // completed rather than from "now". This prevents drift across
            // multiple offline stage advances.
            const realDurationForStage = stageDef.duration / growthMultiplier;
            tempCrop.stageStartedTimestamp += realDurationForStage;

            // stage_based crops reset their watering count on advance so
            // the player must water again for the next stage.
            if (plantDef.wateringRequirementType === 'stage_based') {
                tempCrop.wateredCount = 0;
            }
            // lifetime_based: wateredCount is never reset — once watered enough,
            // it stays satisfied for the whole lifecycle.
        }

        if (advanced || tempCrop.needsWater !== plot.crop.needsWater) {
            plot.crop = tempCrop;
            if (advanced) {
                const stageLabel = tempCrop.currentGrowthStage >= finalStage
                    ? 'fully grown'
                    : `stage ${tempCrop.currentGrowthStage + 1}`;
                messageStore.addMessage(
                    `The ${plantDef.name} is now ${stageLabel}!`,
                    ['World']
                );
            }
        }
    });

    newPlayer.lastPlayedTimestamp = now;
    return newPlayer;
}

/**
 * Called on app load. Simulates offline growth automatically — no button
 * needed for this path.
 */
export function initHomesteadOnLoad() {
    playerStore.update(player => calculateOfflineGrowth(player));
}

/**
 * Mid-session sync triggered by the "Check crops" button on the farming page.
 * Only fires after the player has been playing for a while and wants to see
 * if anything has advanced without reloading the page.
 */
export function syncHomestead() {
    playerStore.update(player => calculateOfflineGrowth(player));
}

/**
 * Applies a technology to a specific farm plot.
 */
export function applyTechToPlot(plotId: string, techId: string) {
    playerStore.update(player => {
        const newPlayer = { ...player };
        const plot = newPlayer.homestead.farmPlots.find(p => p.id === plotId);

        if (!plot) {
            messageStore.addMessage('Farm plot not found.', ['System']);
            return player;
        }

        if (newPlayer.unlockedTech.includes(techId) && !plot.appliedTech.includes(techId)) {
            plot.appliedTech.push(techId);
            messageStore.addMessage(`Applied ${techId} to plot ${plotId}.`, ['World']);
            toastStore.info(`Applied ${techId} to plot ${plotId}.`);
        } else {
            messageStore.addMessage(`Could not apply ${techId} to plot ${plotId}.`, ['System']);
            toastStore.warning(`Could not apply ${techId} to plot ${plotId}.`);
        }

        return newPlayer;
    });
}

export function harvestAll() {
    playerStore.update(player => {
        let newPlayer = { ...player };
        let harvested = 0;

        newPlayer.homestead.farmPlots.forEach(plot => {
            if (!plot.crop) return;
            const plantDef = cropDefinitions[plot.crop.plantId];
            if (!plantDef) return;
            if (plot.crop.currentGrowthStage < plantDef.growthStages.length - 1) return;

            // Same logic as harvestCrop but inline so we can batch the playerStore update
            let totalYieldMultiplier = 1;
            const currentSeason = get(seasonStore);

            // decree_of_gaia: permanent 3x yield multiplier
            if (newPlayer.unlockedTech.includes('decree_of_gaia')) {
                totalYieldMultiplier *= 3;
            }

            if (plantDef.idealSeason === currentSeason) {
                totalYieldMultiplier *= plantDef.idealSeasonYieldMultiplier;
            }

            const amount = Math.floor(plantDef.yieldsAmount * totalYieldMultiplier);
            const yieldedItem = getItemById(plantDef.yields);
            if (yieldedItem) {
                newPlayer = addItems(newPlayer, plantDef.yields, amount, false);
                notificationStore.add('item_received', yieldedItem, amount);
            }

            if (plantDef.leavesYield > 0) {
                const leavesItem = getItemById('leaves');
                if (leavesItem) {
                    newPlayer = addItems(newPlayer, 'leaves', plantDef.leavesYield, false);
                    notificationStore.add('item_received', leavesItem, plantDef.leavesYield);
                }
            }

            newPlayer.skills = gainExperience(newPlayer, FARMING_SKILL_ID, plantDef.xpYield).skills;
            newPlayer.cropsHarvested = (newPlayer.cropsHarvested ?? 0) + 1;
            plot.crop = null;
            harvested++;
        });

        if (harvested > 0) {
            messageStore.addMessage(`Harvested ${harvested} crop${harvested > 1 ? 's' : ''}.`, ['World']);
            toastStore.success(`Harvested ${harvested} crops!`);
        } else {
            toastStore.info('No crops ready to harvest.');
        }

        return newPlayer;
    });
}

export function refreshHomestead() {
    syncHomestead();
}