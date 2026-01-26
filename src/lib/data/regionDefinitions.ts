import type { RegionDefinition } from '../types';

export const regionDefinitions: { [key: string]: RegionDefinition } = {
    pleasure_island: {
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.9 }, { id: 'punching_tortoise', chance: 0.1 }],
        items: [
            { id: 'corn', chance: 0.25 },
            { id: 'tomato', chance: 0.25 },
            { id: 'onion', chance: 0.25 },
            { id: 'meat', chance: 0.25 }
        ]
    },
    pleasure_island_waters: {
        gates: null,
        enemies: [{ id: 'toxolotl', chance: 1.0 }],
        items: [
            { id: 'fish', chance: 0.7 },
            { id: 'coral_reef', chance: 0.3 }
        ]
    },
    north_land: {
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.5 }, { id: 'woodmech_bear', chance: 0.5 }],
        items: [
            { id: 'meat', chance: 0.5 },
            { id: 'cotton', chance: 0.5 }
        ]
    },
    solo_forest: {
        gates: null,
        enemies: [
            { id: 'forest_prowler', chance: 0.4 },
            { id: 'mountain_basilisk', chance: 0.3 },
            { id: 'rock_lion', chance: 0.3 }
        ],
        items: [
            { id: 'wood', chance: 0.6 },
            { id: 'leaves', chance: 0.3 },
            { id: 'shrooms', chance: 0.1 }
        ]
    },
    mountain: {
        gates: [{ element: 'Earth', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'biceon', chance: 0.7 },
            { id: 'white_wyvern', chance: 0.3 }
        ],
        items: [
            { id: 'stone', chance: 0.5 },
            { id: 'cuprum', chance: 0.3 },
            { id: 'dragon_fang', chance: 0.2 }
        ]
    },
    mountain_forest: {
        gates: [{ element: 'Earth', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'woodmech_bear', chance: 0.5 },
            { id: 'forest_prowler', chance: 0.5 }
        ],
        items: [
            { id: 'wood', chance: 0.7 },
            { id: 'blueberries', chance: 0.3 }
        ]
    },
    south_land: {
        gates: null,
        enemies: [{ id: 'white_wyvern', chance: 0.5 }, { id: 'rock_lion', chance: 0.5 }],
        items: [
            { id: 'feather', chance: 0.6 },
            { id: 'meat', chance: 0.4 }
        ]
    },
    south_coast: {
        gates: null,
        enemies: [
            { id: 'punching_tortoise', chance: 0.8 },
            { id: 'white_wyvern', chance: 0.2 },
        ],
        items: [
            { id: 'fish', chance: 0.8 },
            { id: 'coral_reef', chance: 0.2 }
        ]
    },
    eastern_waters: {
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'water_spirit_beast', chance: 0.3 },
            { id: 'inkjet_ray', chance: 0.3 }
        ],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'azurite', chance: 0.1 }]
    },
    wingtail_bay: {
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'toxolotl', chance: 0.4 },
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'white_wyvern', chance: 0.2 }
        ],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.2 }]
    },
    gwens_island: {
        gates: null,
        enemies: [{ id: 'solis_sentinel', chance: 1.0 }],
        items: [{ id: 'citrine', chance: 0.5 }, { id: 'gold', chance: 0.5 }]
    },
    southern_sea: {
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [
            { id: 'vanguard_siren', chance: 0.4 },
            { id: 'shark_soldier', chance: 0.4 },
            { id: 'water_spirit_beast', chance: 0.2 }
        ],
        items: [
            { id: 'island_herb', chance: 0.7 },
            { id: 'fish', chance: 0.3 }
        ]
    },
    western_sea: {
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [
            { id: 'inkjet_ray', chance: 0.4 },
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'water_spirit_beast', chance: 0.2 }
        ],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'aquamarine', chance: 0.1 }]
    },
    marjana_trench: {
        gates: [{ element: 'Water', level: 3 }],
        enemies: [
            { id: 'vanguard_siren', chance: 0.4 },
            { id: 'coral_eyes', chance: 0.3 },
            { id: 'shark_soldier', chance: 0.3 }
        ],
        items: [
            { id: 'aquamarine', chance: 0.4 },
            { id: 'coral_reef', chance: 0.6 }
        ]
    },
    deserted_island: {
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 1.0 }],
        items: [{ id: 'four_leaf_clover', chance: 0.05 }, { id: 'meat', chance: 0.95 }]
    },
    legendary_1: {
        gates: [{ element: 'Earth', level: 2 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'archangel_one', chance: 0.1 }],
        items: []
    },
    legendary_2: {
        gates: [{ element: 'Water', level: 2 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'bob', chance: 0.1 }],
        items: []
    },
    legendary_3: {
        gates: [{ element: 'Water', level: 3 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'wilhemina', chance: 0.1 }],
        items: []
    }
};