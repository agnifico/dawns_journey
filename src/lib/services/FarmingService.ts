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

const FARMING_SKILL_ID = 'farming';

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

        // Check for compost requirement
        if (plantDef.requiredTechs.includes('tech_compost_bin')) {
            if (!useCompost) {
                messageStore.addMessage(`${plantDef.name} requires compost.`, ['System']);
                return player;
            }
            // hasItem uses item.id (template ID), not itemId
            if (!hasItem(newPlayer.inventory, 'compost', 1)) {
                messageStore.addMessage('You do not have any compost.', ['System']);
                return player;
            }
            newPlayer = removeItemsByItemId(newPlayer, 'compost', 1);
            messageStore.addMessage('Used 1 Compost.', ['World']);
        }

        const seedItem = getItemById(plantDef.seedItemId);
        if (!seedItem) {
            messageStore.addMessage('Seed item not found.', ['System']);
            return player;
        }

        // hasItem uses item.id (template ID) — matches seedItemId correctly
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
        };

        plot.crop = newCrop;
        messageStore.addMessage(`You planted a ${plantDef.name}.`, ['World']);
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

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return player;

        plot.crop.wateredCount++;
        plot.crop.lastWateredTimestamp = Date.now();

        messageStore.addMessage(`You watered the ${plantDef.name}.`, ['World']);

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

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return player;

        if (plot.crop.currentGrowthStage < plantDef.growthStages.length - 1) {
            messageStore.addMessage(`The ${plantDef.name} is not yet fully grown.`, ['System']);
            return player;
        }

        let totalYieldMultiplier = 1;
        const currentSeason = get(seasonStore);
        if (plantDef.idealSeason === currentSeason) {
            totalYieldMultiplier = plantDef.idealSeasonYieldMultiplier;
            messageStore.addMessage(`Bonus yield for harvesting in the ideal season!`, ['System']);
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

        const plantDef = cropDefinitions[plot.crop.plantId];
        if (!plantDef) return;

        if (plot.crop.currentGrowthStage >= plantDef.growthStages.length - 1) return;

        let tempCrop = { ...plot.crop };
        let advanced = false;

        while (tempCrop.currentGrowthStage < plantDef.growthStages.length - 1) {
            const stageDef = plantDef.growthStages[tempCrop.currentGrowthStage];
            const timeElapsedInStage = now - tempCrop.stageStartedTimestamp;

            const currentSeason = get(seasonStore);
            const growthMultiplier = plantDef.idealSeason === currentSeason
                ? plantDef.growthMultiplierInIdealSeason
                : 1;
            const effectiveTimeElapsed = timeElapsedInStage * growthMultiplier;

            if (effectiveTimeElapsed < stageDef.duration) break;

            let wateringMet = false;
            if (plantDef.wateringRequirementType === 'lifetime_based') {
                wateringMet = tempCrop.wateredCount >= plantDef.wateringRequirementValue;
            } else {
                wateringMet = tempCrop.wateredCount >= plantDef.wateringRequirementValue;
            }

            if (!wateringMet) break;

            advanced = true;
            tempCrop.currentGrowthStage++;

            const timeSpentOnPreviousStage = Math.round(stageDef.duration / growthMultiplier);
            tempCrop.stageStartedTimestamp += timeSpentOnPreviousStage;

            if (plantDef.wateringRequirementType === 'stage_based') {
                tempCrop.wateredCount = 0;
            }
        }

        if (advanced) {
            plot.crop = tempCrop;
            messageStore.addMessage(`The ${plantDef.name} grew to stage ${tempCrop.currentGrowthStage + 1}!`, ['World', 'Update']);
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