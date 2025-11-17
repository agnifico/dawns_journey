import { writable } from 'svelte/store';
import type { Enemy } from '../types';
import { allEnemies as enemyData } from '../data/enemies';

const store = writable<Enemy[]>(enemyData, (set) => {
    // No async loading needed now, data is directly imported
});

export const getEnemyById = (id: string): Enemy | undefined => {
    return enemyData.find(e => e.id === id);
}

export default store;
