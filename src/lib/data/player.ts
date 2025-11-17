import type { Player, InventoryItem, Weapon, FarmPlot } from '../types';
import { items } from './items';
import skills from './skills.json';
import { farmingTechTree } from './skilltree/farming'; // Import the farming tech tree
import homesteadPlots from './homesteadPlots.json';
import { v4 as uuidv4 } from 'uuid';

const unityWeapon = items.find(i => i.id === 'unity') as Weapon;

const initialInventory: InventoryItem[] = [
    // { itemId: 'compost', amount: 20 }
];

// Pre-populate inventory with some items for testing
for (const item of items) {
    if (item.id === 'unity') continue; // Don't add the equipped weapon to inventory

    if (item.type === 'general') {
        initialInventory.push({ itemId: item.id, amount: 5 });
    } else if (item.type === 'weapon' || item.type === 'relic') {
        initialInventory.push({ itemId: item.id, amount: 1 });
    }
}

const initialSkills = Object.keys(skills).map(skillId => ({
    id: skillId,
    name: skills[skillId].name,
    level: 1,
    experience: 0,
}));

// For testing: unlock all farming tech
const allFarmingTechIds = Array.from(new Set(farmingTechTree.map(node => node.id)));

// Generate initial farm plots from the processed map data
const initialFarmPlots: FarmPlot[] = [];
(Object.keys(homesteadPlots) as Array<keyof typeof homesteadPlots>).forEach(envKey => {
    const plotData = homesteadPlots[envKey];
    plotData.forEach(plot => {
        initialFarmPlots.push({
            id: uuidv4(), // Generate a unique ID for the player's instance of the plot
            mapObjectId: plot.id, // Link to the Tiled map object ID
            requiredLevel: plot.requiredLevel,
            x: plot.x,
            y: plot.y,
            environment: `env_${envKey}`, // Correctly format the environment string
            crop: null,
            appliedTech: [],
        });
    });
});


export const player: Player = {
    isInitialized: false,
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    baseStats: {
        hp: 100,
        maxHp: 100,
        auraShield: 0,
        maxAuraShield: 100,
        physicalAttack: 10,
        physicalDefence: 10,
        elementalAttack: 10,
        elementalDefence: 10,
        speed: 50,
        evasion: 30,
        critChance: 0.05, // 5% default
        critDamage: 1.5, // 1.5x default
    },
    equipment: {
        weapon_slots: [unityWeapon, null],
        relic_slots: [null, null, null, null],
    },
    inventory: initialInventory,
    activeEffects: [],
    statusEffects: [],
    worldTags: [],
    skills: initialSkills,
    killCounts: {},
    combatHistory: [],
    farmingLevel: 99, // For testing
    farmingXp: 0,
    techPoints: 999, // For testing
    unlockedTech: ['env_open_field', 'env_greenhouse', 'env_forest_floor', ...allFarmingTechIds], // Unlock all for testing
    homestead: {
        farmPlots: initialFarmPlots,
        compostQueue: [],
    },
    lastPlayedTimestamp: Date.now(),
};

export default player;