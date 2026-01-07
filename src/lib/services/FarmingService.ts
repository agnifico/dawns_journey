import { get } from 'svelte/store';
import { playerStore } from '../stores/playerStore';
import { messageStore } from '../stores/messageStore';
import { cropDefinitions } from '../data/cropDefinitions';
import { getItemById } from '../services/ItemDataService';
import { addItem, removeItem } from './ItemService';
import { gainExperience } from './SkillService';
import type { Player, Crop, FarmPlot, CropDefinition } from '../types';
import { seasonStore } from '../stores/seasonStore';
import { notificationStore } from '$lib/stores/notificationStore';

const FARMING_SKILL_ID = 'farming';

/**
 * Plants a crop in a specified farm plot.
 */
export function plantCrop(plotId: string, cropDefinitionId: string, useCompost: boolean) {
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

        const cropDef = cropDefinitions[cropDefinitionId];
        if (!cropDef) {
            messageStore.addMessage('Crop definition not found.', ['System']);
            return player;
        }

        // Check for compost requirement
        if (cropDef.requiredTech.includes('tech_compost_bin')) {
            if (!useCompost) {
                messageStore.addMessage(`${cropDef.name} requires compost.`, ['System']);
                return player;
            }
            const compostInInventory = newPlayer.inventory.find(i => i.itemId === 'compost');
            if (!compostInInventory || compostInInventory.amount < 1) {
                messageStore.addMessage('You do not have any compost.', ['System']);
                return player;
            }
            // Consume compost
            newPlayer = removeItem(newPlayer, 'compost', 1);
            messageStore.addMessage('Used 1 Compost.', ['World']);
        }

        const seedItem = getItemById(cropDef.seedItemId);
        if (!seedItem) {
            messageStore.addMessage('Seed item not found.', ['System']);
            return player;
        }

        const seedInInventory = newPlayer.inventory.find(i => i.itemId === cropDef.seedItemId);
        if (!seedInInventory || seedInInventory.amount < 1) {
            messageStore.addMessage(`You don't have any ${cropDef.name} seeds.`, ['System']);
            return player;
        }

        // Consume seed
        newPlayer = removeItem(newPlayer, cropDef.seedItemId, 1);

        const now = Date.now();
        const newCrop: Crop = {
            id: `${cropDefinitionId}-${now}`,
            cropDefinitionId: cropDefinitionId,
            plantedTimestamp: now,
            stageStartedTimestamp: now,
            currentGrowthStage: 0,
            lastWateredTimestamp: 0, // Not watered yet
            wateredCount: 0,
        };

        plot.crop = newCrop;
        messageStore.addMessage(`You planted ${cropDef.name}.`, ['World']);
        newPlayer.skills = gainExperience(newPlayer, FARMING_SKILL_ID, 5).skills;

        return newPlayer;
    });
}

/**
 * Waters a crop in a specified farm plot.
 */
export function waterCrop(plotId: string) {
    playerStore.update(player => {
        const newPlayer = { ...player };
        const plot = newPlayer.homestead.farmPlots.find(p => p.id === plotId);

        if (!plot || !plot.crop) {
            messageStore.addMessage('No crop to water here.', ['System']);
            return player;
        }

        const cropDef = cropDefinitions[plot.crop.cropDefinitionId];
        if (!cropDef) return player;

        plot.crop.wateredCount++;
        plot.crop.lastWateredTimestamp = Date.now();

        messageStore.addMessage(`You watered the ${cropDef.name}.`, ['World']);

        // Immediately check for growth after watering
        refreshHomestead();

        return newPlayer;
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

        const cropDef = cropDefinitions[plot.crop.cropDefinitionId];
        if (!cropDef) return player;

        if (plot.crop.currentGrowthStage < cropDef.growthStages.length - 1) {
            messageStore.addMessage(`The ${cropDef.name} is not yet fully grown.`, ['System']);
            return player;
        }

        let totalYieldMultiplier = 1;
        const currentSeason = get(seasonStore);
        if (cropDef.idealSeason === currentSeason) {
            totalYieldMultiplier = cropDef.yieldMultiplierInIdealSeason;
            messageStore.addMessage(`Bonus yield for harvesting in the ideal season!`, ['System']);
        }

        cropDef.yield.forEach(yieldItem => {
            const amount = Math.floor(yieldItem.amount * totalYieldMultiplier);
            newPlayer = addItem(newPlayer, yieldItem.itemId, amount);
        });

        // Add leaves to inventory
        if (cropDef.leavesYield > 0) {
            newPlayer = addItem(newPlayer, 'leaves', cropDef.leavesYield);
        }

        newPlayer.skills = gainExperience(newPlayer, FARMING_SKILL_ID, cropDef.xpYield).skills;
        plot.crop = null;

        return newPlayer;
    });
}

/**
 * Main function to process growth on game load or manual refresh.
 * This is the core logic that handles stage advancement.
 */
export function calculateOfflineGrowth(player: Player): Player {
    const now = Date.now();
    const newPlayer = { ...player };

    newPlayer.homestead.farmPlots.forEach(plot => {
        if (!plot.crop) return;

        const cropDef = cropDefinitions[plot.crop.cropDefinitionId];
        if (!cropDef) return;

        // Cannot grow if already at max stage
        if (plot.crop.currentGrowthStage >= cropDef.growthStages.length - 1) {
            return;
        }

        let tempCrop = { ...plot.crop };
        let advanced = false;

        // Loop to allow for multiple stage advancements if enough time has passed (e.g., offline progress)
        while (tempCrop.currentGrowthStage < cropDef.growthStages.length - 1) {
            const stageDef = cropDef.growthStages[tempCrop.currentGrowthStage];
            const timeElapsedInStage = now - tempCrop.stageStartedTimestamp;
            
            const currentSeason = get(seasonStore);
            const growthMultiplier = cropDef.idealSeason === currentSeason ? cropDef.growthMultiplierInIdealSeason : 1;
            const effectiveTimeElapsed = timeElapsedInStage * growthMultiplier;

            // 1. Check if enough time has passed for the current stage
            if (effectiveTimeElapsed < stageDef.duration) {
                break; // Not enough time, stop checking this crop
            }

            // 2. Check watering requirements based on type
            let wateringMet = false;
            if (cropDef.wateringRequirementType === 'lifetime_based') {
                // Needs to meet the total requirement at any point. Does not reset.
                wateringMet = tempCrop.wateredCount >= cropDef.wateringRequirementValue;
            } else { // stage_based
                // Needs to meet the requirement for the current stage. Resets after.
                wateringMet = tempCrop.wateredCount >= cropDef.wateringRequirementValue;
            }

            if (!wateringMet) {
                break; // Not enough water, stop checking this crop
            }

            // All conditions met, advance to the next stage
            advanced = true;
            tempCrop.currentGrowthStage++;
            
            // The next stage "started" in the past, at the moment the previous one finished.
            // This allows for chain-growing offline.
            const timeSpentOnPreviousStage = Math.round(stageDef.duration / growthMultiplier);
            tempCrop.stageStartedTimestamp += timeSpentOnPreviousStage;

            // Reset water count only for stage-based crops
            if (cropDef.wateringRequirementType === 'stage_based') {
                tempCrop.wateredCount = 0;
            }
        }

        if (advanced) {
            plot.crop = tempCrop;
            messageStore.addMessage(`The ${cropDef.name} grew to stage ${tempCrop.currentGrowthStage + 1}!`, ['World', 'Update']);
        }
    });

    newPlayer.lastPlayedTimestamp = now;
    return newPlayer;
}


/**
 * Processes growth when the user manually refreshes or on load.
 */
export function refreshHomestead() {
    playerStore.update(player => {
        const playerAfterGrowth = calculateOfflineGrowth(player);
        messageStore.addMessage('Homestead crops refreshed.', ['System']);
        return playerAfterGrowth;
    });
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
            messageStore.addMessage(`Applied ${techId} to plot ${plotId}.`, ['World', 'Update']);
        } else {
            messageStore.addMessage(`Could not apply ${techId} to plot ${plotId}.`, ['System']);
        }

        return newPlayer;
    });
}
