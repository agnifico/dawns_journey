import type { Player } from '$lib/types';
import { messageStore } from '$lib/stores/messageStore';
import { addItems } from './InventoryService';
import playerLevels from '$lib/data/playerLevels.json';
import { notificationStore } from '$lib/stores/notificationStore';
import { toastStore } from '$lib/stores/toastStore';

function getLevelFromXp(xp: number): number {
    let level = 1;
    const levels = playerLevels.levels as Record<string, { xp: number }>;
    const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);

    for (const levelNumber of sortedLevels) {
        if (xp >= levels[levelNumber].xp) {
            level = levelNumber;
        } else {
            break;
        }
    }
    return level;
}

export function gainExperience(player: Player, amount: number): Player {
    let newPlayer = { ...player };
    newPlayer.xp += amount;
    messageStore.addMessage(`You gain ${amount} XP.`, ['System']);
    notificationStore.addXp(amount, '');

    const newLevel = getLevelFromXp(newPlayer.xp);

    if (newLevel > newPlayer.level) {
        for (let i = newPlayer.level + 1; i <= newLevel; i++) {
            messageStore.addMessage(`You are now level ${i}!`, ['System', 'Player']);
            toastStore.success(`Player Level UP! You are now  Lv.${i}!`)
            notificationStore.addLevelUp(1);
            const levelData = (playerLevels.levels as any)[i];
            if (levelData?.rewards) {
                for (const reward of levelData.rewards) {
                    if (reward.type === 'item') {
                        newPlayer = addItems(newPlayer, reward.itemId, reward.amount); 
                        messageStore.addMessage(`You received ${reward.amount} ${reward.name}!`, ['System', 'World']);
                        toastStore.info(`Received: ${reward.amount} ${reward.name} for Leveling up!`)
                    }
                }
            }
        }
        newPlayer.level = newLevel;
    }

    return newPlayer;
}

export function getXpForLevel(level: number): number {
    const levelData = (playerLevels.levels as any)[level.toString()];
    return levelData ? levelData.xp : 0;
}

export function getXpForLevelUp(level: number): number | null {
    const currentLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    if (nextLevelXp > 0) { // nextLevelXp will be 0 if max level is reached
        return nextLevelXp - currentLevelXp;
    }
    return null;
}
