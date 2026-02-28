// src/lib/services/AchievementService.ts

import { get } from 'svelte/store';
import type { Player } from '$lib/types';
import { playerStore } from '$lib/stores/playerStore';
import { allAchievements, getAchievementById, type Achievement } from '$lib/data/achievements';
import { showAchievement } from '$lib/stores/achievementStore';
import { getItemById } from './InventoryService';

/**
 * Updates the player store with the unlocked achievement and shows the notification.
 * This function no longer checks for existing unlocks; that is the responsibility of the caller.
 */
function unlockAchievement(achievement: Achievement, tier: number = 1) {
    playerStore.update(p => {
        const newAchievements = { ...p.achievements };
        newAchievements[achievement.id] = {
            unlocked: true,
            unlockedTimestamp: Date.now(),
            currentTier: tier,
            progress: p.achievements[achievement.id]?.progress || 0,
        };
        return { ...p, achievements: newAchievements };
    });

    const notificationData = { ...achievement };
    if (achievement.tiers) {
        notificationData.reward = achievement.tiers[tier].reward;
        notificationData.name = `${achievement.name} (Tier ${tier})`;
    }
    showAchievement(notificationData);
    console.log(`Achievement Unlocked: ${notificationData.name}`);
}

// --- Check Functions ---

export function checkSighting(opponentId: string) {
    const player = get(playerStore);
    const achievement = allAchievements.find(a => a.category === 'sighting' && a.target === opponentId);
    
    if (achievement && !player.achievements[achievement.id]?.unlocked) {
        unlockAchievement(achievement);
    }
}

export function checkKillCounts(killedOpponentId: string) {
    const player = get(playerStore);

    // Check total kills
    const totalKillAchievement = getAchievementById('kill_total');
    if (totalKillAchievement && totalKillAchievement.tiers) {
        const totalKills = Object.values(player.killCounts).reduce((a, b) => a + b, 0);
        for (const tierStr in totalKillAchievement.tiers) {
            const tier = parseInt(tierStr);
            const tierInfo = totalKillAchievement.tiers[tier];
            const alreadyUnlockedTier = player.achievements[totalKillAchievement.id]?.currentTier || 0;

            if (totalKills >= tierInfo.threshold && tier > alreadyUnlockedTier) {
                unlockAchievement(totalKillAchievement, tier);
            }
        }
    }

    // Check specific enemy kills
    const specificKillAchievement = allAchievements.find(a => a.category === 'kill_count' && a.target === killedOpponentId);
    if (specificKillAchievement && specificKillAchievement.tiers) {
        const count = player.killCounts[killedOpponentId] || 0;
        for (const tierStr in specificKillAchievement.tiers) {
            const tier = parseInt(tierStr);
            const tierInfo = specificKillAchievement.tiers[tier];
            const alreadyUnlockedTier = player.achievements[specificKillAchievement.id]?.currentTier || 0;

            if (count >= tierInfo.threshold && tier > alreadyUnlockedTier) {
                unlockAchievement(specificKillAchievement, tier);
            }
        }
    }
}

export function checkCollection() {
    const player = get(playerStore);

    // Check for obtaining specific weapons
    const specificItemAchievements = allAchievements.filter(a => 
        a.category === 'collection' && a.target
    );
    for (const achievement of specificItemAchievements) {
        if (!player.achievements[achievement.id]?.unlocked) {
            const allPlayerItemIds = new Set(player.inventory.map(item => item.id));
            player.equipment.weapon_slots.forEach(w => w && allPlayerItemIds.add(w.id));
            player.equipment.relic_slots.forEach(r => r && allPlayerItemIds.add(r.id));

            if (allPlayerItemIds.has(achievement.target)) {
                unlockAchievement(achievement);
            }
        }
    }

    // Check for having one weapon of each element
    const elementalAchievement = getAchievementById('collect_all_elements');
    if (elementalAchievement && !player.achievements[elementalAchievement.id]?.unlocked) {
        const elements = ["Fire", "Water", "Earth", "Wind", "Light", "Dark"];
        const ownedWeaponElements = new Set<string>();
        const allWeapons = player.inventory.filter(i => i?.type === 'weapon');
        player.equipment.weapon_slots.forEach(w => w && allWeapons.push(w));

        for (const weapon of allWeapons) {
            if (weapon?.element) {
                ownedWeaponElements.add(weapon.element);
            }
        }

        if (elements.every(el => ownedWeaponElements.has(el))) {
            unlockAchievement(elementalAchievement);
        }
    }

    // Check for full set of weapons and relics
    const fullSetAchievement = getAchievementById('full_set');
    if (fullSetAchievement && !player.achievements[fullSetAchievement.id]?.unlocked) {
        const allWeaponSlotsFilled = player.equipment.weapon_slots.every(s => s !== null);
        const allRelicSlotsFilled = player.equipment.relic_slots.every(s => s !== null);
        if (allWeaponSlotsFilled && allRelicSlotsFilled) {
            unlockAchievement(fullSetAchievement);
        }
    }
}

export function checkMilestone(milestoneType: 'steps' | 'crops') {
    const player = get(playerStore);
    const achievementId = milestoneType === 'steps' ? 'take_steps' : 'harvest_crops';
    const achievement = getAchievementById(achievementId);

    if (!achievement || !achievement.tiers) {
        return;
    }

    const progress = milestoneType === 'steps' ? player.stepsTaken : player.cropsHarvested;
    const alreadyUnlockedTier = player.achievements[achievement.id]?.currentTier || 0;

    for (const tierStr in achievement.tiers) {
        const tier = parseInt(tierStr);
        const tierInfo = achievement.tiers[tier];

        if (progress >= tierInfo.threshold && tier > alreadyUnlockedTier) {
            unlockAchievement(achievement, tier);
        }
    }
}
