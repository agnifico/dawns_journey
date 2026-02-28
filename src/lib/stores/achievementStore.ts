// achievementStore.ts
import { writable } from 'svelte/store';
import type { Achievement } from '$lib/data/achievements';

export const achievementQueue = writable<Achievement[]>([]);

export function showAchievement(achievement: Achievement) {
    achievementQueue.update(queue => {
        // Avoid showing the same notification if it's already in the queue
        if (!queue.find(a => a.id === achievement.id)) {
            return [...queue, achievement];
        }
        return queue;
    });
}

export function dismissOne(achievementId: string) {
    achievementQueue.update(queue => queue.filter(a => a.id !== achievementId));
}

export function dismissAll() {
    achievementQueue.set([]);
}
