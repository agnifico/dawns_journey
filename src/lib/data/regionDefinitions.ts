import type { RegionDefinition } from '../types';

export const regionDefinitions: { [key: string]: RegionDefinition } = {
    pleasure_island: {
        id: 'pleasure_island',
        name: 'Pleasure Island',
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
        id: 'pleasure_island_waters',
        name: 'Pleasure Island Waters',
        gates: null,
        enemies: [{ id: 'toxolotl', chance: 0.0 }],
        items: [
            { id: 'fish', chance: 0.9 },
            { id: 'turquoise', chance: 0.05 },
            { id: 'sapphire', chance: 0.05 }
        ]
    },
    north_land: {
        id: 'north_land',
        name: 'North Land',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.5 }, { id: 'woodmech_bear', chance: 0.5 }],
        items: [
            { id: 'meat', chance: 0.3 },
            { id: 'cotton', chance: 0.3 },
            { id: 'fire_tulip', chance: 0.3 }
        ]
    },
    solo_forest: {
        id: 'solo_forest',
        name: 'Forest',
        gates: null,
        enemies: [
            { id: 'forest_prowler', chance: 0.4 },
            { id: 'mountain_basilisk', chance: 0.3 },
            { id: 'rock_lion', chance: 0.3 }
        ],
        items: [
            { id: 'wood', chance: 0.6 },
            { id: 'leaves', chance: 0.3 },
            { id: 'mushrooms', chance: 0.1 }
        ]
    },
    mountain: {
        id: 'mountain',
        name: 'Mountain',
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
        id: 'mountain_forest',
        name: 'Mountain Forest',
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
        id: 'south_land',
        name: 'South Land',
        gates: null,
        enemies: [{ id: 'white_wyvern', chance: 0.5 }, { id: 'rock_lion', chance: 0.5 }],
        items: [
            { id: 'feather', chance: 0.6 },
            { id: 'meat', chance: 0.1 },
            { id: 'fire_tulip', chance: 0.3 }
        ]
    },
    south_coast: {
        id: 'south_coast',
        name: 'South Coast',
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
        id: 'eastern_waters',
        name: 'Eastern Waters',
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'water_spirit_beast', chance: 0.3 },
            { id: 'inkjet_ray', chance: 0.3 }
        ],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'azurite', chance: 0.1 }]
    },
    wingtail_bay: {
        id: 'wingtail_bay',
        name: 'Wingtail Bay',
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [
            { id: 'toxolotl', chance: 0.4 },
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'white_wyvern', chance: 0.2 }
        ],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.2 }]
    },
    gwens_island: {
        id: 'gwens_island',
        name: 'Gwen\'s Island',
        gates: null,
        enemies: [{ id: 'solis_sentinel', chance: 1.0 }],
        items: [{ id: 'citrine', chance: 0.5 }, { id: 'gold', chance: 0.5 }]
    },
    southern_sea: {
        id: 'southern_sea',
        name: 'Southern Sea',
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
        id: 'western_sea',
        name: 'Western Sea',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [
            { id: 'inkjet_ray', chance: 0.4 },
            { id: 'aquamech_shark', chance: 0.4 },
            { id: 'water_spirit_beast', chance: 0.2 }
        ],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'turquoise', chance: 0.1 }]
    },
    marjana_trench: {
        id: 'marjana_trench',
        name: 'Marjana Trench',
        gates: [{ element: 'Water', level: 3 }],
        enemies: [
            { id: 'vanguard_siren', chance: 0.4 },
            { id: 'coral_eyes', chance: 0.3 },
            { id: 'shark_soldier', chance: 0.3 }
        ],
        items: [
            { id: 'turquoise', chance: 0.4 },
            { id: 'coral_reef', chance: 0.6 }
        ]
    },
    deserted_island: {
        id: 'deserted_island',
        name: 'Deserted Island',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 1.0 }],
        items: [{ id: 'four_leaf_clover', chance: 0.05 }, { id: 'meat', chance: 0.95 }]
    },
    legendary_1: {
        id: 'legendary_1',
        name: 'hidden',
        gates: [{ element: 'Earth', level: 2 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'archangel_one', chance: 0.1 }],
        items: []
    },
    legendary_2: {
        id: 'legendary_2',
        name: 'hidden',
        gates: [{ element: 'Water', level: 2 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'bob', chance: 0.1 }],
        items: []
    },
    legendary_3: {
        id: 'legendary_3',
        name: 'hidden',
        gates: [{ element: 'Water', level: 3 }],
        enemyChance: 1,
        itemChance: 0,
        enemies: [{ id: 'wilhemina', chance: 0.1 }],
        items: []
    },
    bridge: {
        id: 'bridge',
        name: 'Bridge',
        gates: null,
        enemies: [],
        items: []
    },
    agnes_garden: {
        id: 'agnes_garden',
        name: 'Agnes\' Garden',
        gates: null,
        enemies: [],
        items: []
    },
    sewers: {
        id: 'sewers',
        name: 'Sewers',
        gates: null,
        enemies: [{ id: 'toxolotl', chance: 1.0 }],
        items: []
    },
    courtyard: {
        id: 'courtyard',
        name: 'Courtyard',
        gates: null,
        enemies: [],
        items: []
    },
    fountain: {
        id: 'fountain',
        name: 'Fountain',
        gates: null,
        enemies: [],
        items: []
    },
    backforest: {
        id: 'backforest',
        name: 'Backforest',
        gates: null,
        enemies: [{ id: 'forest_prowler', chance: 0.4 }],
        items: [{ id: 'wood', chance: 0.6 }]
    },
    tower_top: {
        id: 'tower_top',
        name: 'Tower Top',
        gates: null,
        enemies: [],
        items: []
    },
    tower_balcony: {
        id: 'tower_balcony',
        name: 'Tower Balcony',
        gates: null,
        enemies: [],
        items: []
    },
    tower_wall: {
        id: 'tower_wall',
        name: 'Tower Wall',
        gates: null,
        enemies: [],
        items: []
    },
    church_roof: {
        id: 'church_roof',
        name: 'Church Roof',
        gates: null,
        enemies: [],
        items: []
    },
    cross: {
        id: 'cross',
        name: 'Cross',
        gates: null,
        enemies: [],
        items: []
    },
    church_wall: {
        id: 'church_wall',
        name: 'Church Wall',
        gates: null,
        enemies: [],
        items: []
    }
};

