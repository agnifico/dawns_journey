import type { Enemy } from '../types';
import { allEnemies as enemyData } from '../data/enemies';

export function getEnemyById(id: string): Enemy | undefined {
    return enemyData.find(e => e.id === id);
}

export function getAllEnemies(): Enemy[] {
    return enemyData;
}
