import type { Player, Item, Weapon, FarmPlot } from '../types';
import { items } from './items';
import skills from './skills.json';
import { farmingTechTree } from './skilltree/farming'; // Import the farming tech tree
import homesteadPlots from './homesteadPlots.json';
import { v4 as uuidv4 } from 'uuid';
import { createItems } from '../services/ItemFactory';

const initialInventory: Item[] = [
    ...createItems('bread', 20),
];

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
// The player starts with the first 6 plots in the open field.
// Other plots and environments are unlocked via the skill tree.
const startingPlots = homesteadPlots.open_field.slice(0, 6);
startingPlots.forEach(plot => {
    initialFarmPlots.push({
        id: uuidv4(), // Generate a unique ID for the player's instance of the plot
        mapObjectId: plot.id, // Link to the Tiled map object ID
        requiredLevel: plot.requiredLevel,
        x: plot.x,
        y: plot.y,
        environment: 'env_open_field',
        crop: null,
        appliedTech: [],
    });
});


export const player: Player = {
    isInitialized: false,
    level: 1,
    xp: 0,
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    profile: {
        avatar: '/images/characters/player1.png',
    },
    baseStats: {
        hp: 100,
        maxHp: 100,
        auraShield: 100,
        maxAuraShield: 100,
        physicalAttack: 10,
        physicalDefence: 10,
        elementalAttack: 10,
        elementalDefence: 10,
        speed: 20,
        evasion: 20,
        critChance: 0.1, 
        critDamage: 1.25,
        precision: 10,
    },
    equipment: {
        weapon_slots: [null, null],
        relic_slots: [null, null, null, null],
    },
    inventory: initialInventory,
    activeEffects: [],
    statusEffects: [],
    worldTags: [],
    skills: initialSkills,
    killCounts: {},
    combatHistory: [],
    farmingLevel: 1,
    // farmingXp: 0,
    techPoints: 0,
    unlockedTech: ['env_open_field'], // Start with only the open field unlocked
    locationEventHistory: {},
    factionReputation: {},
    homestead: {
        farmPlots: initialFarmPlots,
        compostQueue: [],
    },
    lastPlayedTimestamp: Date.now(),
    lastTimePointClaimTimestamp: Date.now(),
    // Achievements and milestones
    achievements: {},
    stepsTaken: 0,
    worldResonance: 0,
    cropsHarvested: 0,
    factions: {},
};

export default player;
