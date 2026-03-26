import type { RegionDefinition } from '../types';

export const regionDefinitions: { [key: string]: RegionDefinition } = {

    // ─── Existing regions (unchanged) ────────────────────────────────────────────

    pleasure_island: {
        id: 'pleasure_island',
        name: 'Pleasure Island',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.9 }, { id: 'punching_tortoise', chance: 0.1 }],
        items: [{ id: 'corn', chance: 0.25 }, { id: 'tomato', chance: 0.25 }, { id: 'onion', chance: 0.25 }, { id: 'meat', chance: 0.25 }]
    },
    pleasure_island_waters: {
        id: 'pleasure_island_waters',
        name: 'Pleasure Island Waters',
        gates: null,
        enemies: [{ id: 'toxolotl', chance: 0.0 }],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'turquoise', chance: 0.05 }, { id: 'sapphire', chance: 0.05 }]
    },
    north_land: {
        id: 'north_land',
        name: 'North Land',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.5 }, { id: 'woodmech_bear', chance: 0.5 }],
        items: [{ id: 'meat', chance: 0.3 }, { id: 'cotton', chance: 0.3 }, { id: 'fire_tulip', chance: 0.3 }]
    },
    forest1: {
        id: 'forest1',
        name: 'Forest',
        gates: null,
        enemies: [{ id: 'forest_prowler', chance: 0.4 }, { id: 'mountain_basilisk', chance: 0.3 }, { id: 'rock_lion', chance: 0.3 }],
        items: [{ id: 'wood', chance: 0.6 }, { id: 'leaves', chance: 0.3 }, { id: 'mushrooms', chance: 0.1 }]
    },
    veres_hill: {
        id: 'veres_hill',
        name: 'Mountain',
        gates: [{ element: 'Earth', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'biceon', chance: 0.7 }, { id: 'white_wyvern', chance: 0.3 }],
        items: [{ id: 'stone', chance: 0.5 }, { id: 'cuprum', chance: 0.3 }, { id: 'dragon_fang', chance: 0.2 }]
    },
    mountain_forest: {
        id: 'mountain_forest',
        name: 'Mountain Forest',
        gates: [{ element: 'Earth', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'woodmech_bear', chance: 0.5 }, { id: 'forest_prowler', chance: 0.5 }],
        items: [{ id: 'wood', chance: 0.7 }, { id: 'blueberries', chance: 0.3 }]
    },
    south_land: {
        id: 'south_land',
        name: 'South Land',
        gates: null,
        enemies: [{ id: 'white_wyvern', chance: 0.5 }, { id: 'rock_lion', chance: 0.5 }],
        items: [{ id: 'feather', chance: 0.6 }, { id: 'meat', chance: 0.1 }, { id: 'fire_tulip', chance: 0.3 }]
    },
    south_coast: {
        id: 'south_coast',
        name: 'South Coast',
        gates: null,
        enemies: [{ id: 'punching_tortoise', chance: 0.8 }, { id: 'white_wyvern', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.2 }]
    },
    eastern_waters: {
        id: 'eastern_waters',
        name: 'Eastern Waters',
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'aquamech_shark', chance: 0.4 }, { id: 'water_spirit_beast', chance: 0.3 }, { id: 'inkjet_ray', chance: 0.3 }],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'azurite', chance: 0.1 }]
    },
    wingtail_bay: {
        id: 'wingtail_bay',
        name: 'Wingtail Bay',
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'toxolotl', chance: 0.4 }, { id: 'aquamech_shark', chance: 0.4 }, { id: 'white_wyvern', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.2 }]
    },
    gwens_island: {
        id: 'gwens_island',
        name: "Gwen's Island",
        gates: null,
        enemies: [{ id: 'solis_sentinel', chance: 1.0 }],
        items: [{ id: 'citrine', chance: 0.5 }, { id: 'gold', chance: 0.5 }]
    },
    southern_sea: {
        id: 'southern_sea',
        name: 'Southern Sea',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'vanguard_siren', chance: 0.4 }, { id: 'shark_soldier', chance: 0.4 }, { id: 'water_spirit_beast', chance: 0.2 }],
        items: [{ id: 'island_herb', chance: 0.7 }, { id: 'fish', chance: 0.3 }]
    },
    western_sea: {
        id: 'western_sea',
        name: 'Western Sea',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'inkjet_ray', chance: 0.4 }, { id: 'aquamech_shark', chance: 0.4 }, { id: 'water_spirit_beast', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.9 }, { id: 'turquoise', chance: 0.1 }]
    },
    marjana_trench: {
        id: 'marjana_trench',
        name: 'Marjana Trench',
        gates: [{ element: 'Water', level: 3 }],
        enemies: [{ id: 'vanguard_siren', chance: 0.4 }, { id: 'coral_eyes', chance: 0.3 }, { id: 'shark_soldier', chance: 0.3 }],
        items: [{ id: 'turquoise', chance: 0.4 }, { id: 'coral_reef', chance: 0.6 }]
    },
    deserted_island: {
        id: 'deserted_island',
        name: 'Deserted Island',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 1.0 }],
        items: [{ id: 'four_leaf_clover', chance: 0.05 }, { id: 'meat', chance: 0.95 }]
    },
    legendary_1: {
        id: 'legendary_1', name: 'hidden area',
        gates: [{ element: 'Earth', level: 2 }],
        enemyChance: 1, itemChance: 0,
        enemies: [{ id: 'archangel_one', chance: 0.1 }], items: []
    },
    legendary_2: {
        id: 'legendary_2', name: 'hidden area',
        gates: [{ element: 'Water', level: 2 }],
        enemyChance: 1, itemChance: 0,
        enemies: [{ id: 'bob', chance: 0.1 }], items: []
    },
    legendary_3: {
        id: 'legendary_3', name: 'hidden area',
        gates: [{ element: 'Water', level: 3 }],
        enemyChance: 1, itemChance: 0,
        enemies: [{ id: 'wilhemina', chance: 0.1 }], items: []
    },
    bridge: { id: 'bridge', name: 'Bridge', gates: null, enemies: [], items: [] },
    agnes_garden: { id: 'agnes_garden', name: "Agnes' Garden", gates: null, enemies: [], items: [] },
    sewers: { id: 'sewers', name: 'Sewers', gates: null, enemies: [{ id: 'toxolotl', chance: 1.0 }], items: [] },
    courtyard: { id: 'courtyard', name: 'Courtyard', gates: null, enemies: [], items: [] },
    fountain: { id: 'fountain', name: 'Fountain', gates: null, enemies: [], items: [] },
    backforest: { id: 'backforest', name: 'Backforest', gates: null, enemies: [{ id: 'forest_prowler', chance: 0.4 }], items: [{ id: 'wood', chance: 0.6 }] },
    tower_top: { id: 'tower_top', name: 'Tower Top', gates: null, enemies: [], items: [] },
    tower_balcony: { id: 'tower_balcony', name: 'Tower Balcony', gates: null, enemies: [], items: [] },
    tower_wall: { id: 'tower_wall', name: 'Tower Wall', gates: null, enemies: [], items: [] },
    church_roof: { id: 'church_roof', name: 'Church Roof', gates: null, enemies: [], items: [] },
    cross: { id: 'cross', name: 'Cross', gates: null, enemies: [], items: [] },
    church_wall: { id: 'church_wall', name: 'Church Wall', gates: null, enemies: [], items: [] },

    // ─── New regions ─────────────────────────────────────────────────────────────

    // Main island — accessible early
    arrival_plains: {
        id: 'arrival_plains',
        name: 'Arrival Plains',
        gates: null,
        enemies: [{ id: 'greenhorn', chance: 0.75 }, { id: 'woodmech_bear', chance: 0.25 }],
        items: [{ id: 'tomato', chance: 0.25 }, { id: 'onion', chance: 0.25 }, { id: 'meat', chance: 0.25 }, { id: 'stone', chance: 0.25 }]
    },
    north_beach: {
        id: 'north_beach',
        name: 'North Beach',
        gates: null,
        enemies: [{ id: 'punching_tortoise', chance: 0.7 }, { id: 'greenhorn', chance: 0.3 }],
        items: [{ id: 'fish', chance: 0.7 }, { id: 'coral_reef', chance: 0.2 }, { id: 'feather', chance: 0.1 }]
    },
    shallow_water: {
        id: 'shallow_water',
        name: 'Shallow Water',
        gates: null,
        enemies: [{ id: 'toxolotl', chance: 0.6 }, { id: 'punching_tortoise', chance: 0.4 }],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.15 }, { id: 'turquoise', chance: 0.05 }]
    },
    waterfall: {
        id: 'waterfall',
        name: 'Waterfall',
        gates: [{ element: 'Water', level: 1 }],
        enemies: [{ id: 'water_spirit_beast', chance: 0.7 }, { id: 'white_wyvern', chance: 0.3 }],
        items: [{ id: 'island_herb', chance: 0.5 }, { id: 'azurite', chance: 0.3 }, { id: 'sapphire', chance: 0.2 }]
    },
    dragon_shrine_grounds: {
        id: 'dragon_shrine_grounds',
        name: "Dragon's Shrine Grounds",
        gates: [{ element: 'Earth', level: 1 }],
        enemies: [{ id: 'biceon', chance: 0.5 }, { id: 'rock_lion', chance: 0.5 }],
        items: [{ id: 'dragon_fang', chance: 0.4 }, { id: 'stone', chance: 0.4 }, { id: 'four_leaf_clover', chance: 0.2 }]
    },
    unknown_hills: {
        id: 'unknown_hills',
        name: 'Unknown Hills',
        gates: [{ element: 'Earth', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'rock_lion', chance: 0.5 }, { id: 'mountain_basilisk', chance: 0.5 }],
        items: [{ id: 'stone', chance: 0.5 }, { id: 'feather', chance: 0.3 }, { id: 'dragon_fang', chance: 0.2 }]
    },
    unknown_islands: {
        id: 'unknown_islands',
        name: 'Unknown Islands',
        gates: [{ element: 'Water', level: 1 }],
        enemies: [{ id: 'water_spirit_beast', chance: 0.6 }, { id: 'punching_tortoise', chance: 0.4 }],
        items: [{ id: 'four_leaf_clover', chance: 0.1 }, { id: 'coral_reef', chance: 0.5 }, { id: 'fish', chance: 0.4 }]
    },
    mountain_forest2: {
        // Deeper mountain forest — harder than mountain_forest
        id: 'mountain_forest2',
        name: 'Deep Mountain Forest',
        gates: [{ element: 'Earth', level: 2 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'biceon', chance: 0.4 }, { id: 'forest_prowler', chance: 0.3 }, { id: 'mountain_basilisk', chance: 0.3 }],
        items: [{ id: 'wood', chance: 0.5 }, { id: 'blueberries', chance: 0.3 }, { id: 'island_herb', chance: 0.2 }]
    },
    mountain_east: {
        id: 'mountain_east',
        name: 'Eastern Mountain',
        gates: [{ element: 'Earth', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'biceon', chance: 0.6 }, { id: 'white_wyvern', chance: 0.4 }],
        items: [{ id: 'stone', chance: 0.4 }, { id: 'cuprum', chance: 0.4 }, { id: 'ruby', chance: 0.2 }]
    },
    murky_water: {
        id: 'murky_water',
        name: 'Murky Water',
        gates: [{ element: 'Water', level: 1 }, { element: 'Dark', level: 1 }],
        enemies: [{ id: 'toxolotl', chance: 0.5 }, { id: 'inkjet_ray', chance: 0.5 }],
        items: [{ id: 'fish', chance: 0.6 }, { id: 'coral_reef', chance: 0.3 }, { id: 'azurite', chance: 0.1 }]
    },

    // Seas and open water
    eastern_sea: {
        id: 'eastern_sea',
        name: 'Eastern Sea',
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'aquamech_shark', chance: 0.5 }, { id: 'inkjet_ray', chance: 0.3 }, { id: 'water_spirit_beast', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.8 }, { id: 'coral_reef', chance: 0.15 }, { id: 'azurite', chance: 0.05 }]
    },
    northeastern_sea: {
        id: 'northeastern_sea',
        name: 'Northeastern Sea',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'aquamech_shark', chance: 0.4 }, { id: 'vanguard_siren', chance: 0.3 }, { id: 'shark_soldier', chance: 0.3 }],
        items: [{ id: 'fish', chance: 0.7 }, { id: 'sapphire', chance: 0.2 }, { id: 'turquoise', chance: 0.1 }]
    },
    northeast: {
        // Labelled 'northeast' in the Tiled data
        id: 'northeast',
        name: 'Northeast',
        gates: null,
        enemies: [{ id: 'punching_tortoise', chance: 0.5 }, { id: 'greenhorn', chance: 0.5 }],
        items: [{ id: 'fish', chance: 0.6 }, { id: 'feather', chance: 0.3 }, { id: 'four_leaf_clover', chance: 0.1 }]
    },
    southeastern_sea: {
        id: 'southeastern_sea',
        name: 'Southeastern Sea',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'shark_soldier', chance: 0.5 }, { id: 'vanguard_siren', chance: 0.3 }, { id: 'coral_eyes', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.6 }, { id: 'coral_reef', chance: 0.3 }, { id: 'sapphire', chance: 0.1 }]
    },
    cold_waters: {
        id: 'cold_waters',
        name: 'Cold Waters',
        gates: [{ element: 'Water', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'shark_soldier', chance: 0.4 }, { id: 'vanguard_siren', chance: 0.4 }, { id: 'water_spirit_beast', chance: 0.2 }],
        items: [{ id: 'fish', chance: 0.5 }, { id: 'sapphire', chance: 0.3 }, { id: 'azurite', chance: 0.2 }]
    },
    stormy_water: {
        id: 'stormy_water',
        name: 'Stormy Water',
        gates: [{ element: 'Water', level: 3 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'vanguard_siren', chance: 0.4 }, { id: 'shark_soldier', chance: 0.3 }, { id: 'coral_eyes', chance: 0.3 }],
        items: [{ id: 'fish', chance: 0.4 }, { id: 'coral_reef', chance: 0.3 }, { id: 'sapphire', chance: 0.3 }]
    },

    // Ice continent — southern, gated behind Earth + Wind higher levels
    icy_coast_south: {
        id: 'icy_coast_south',
        name: 'Icy Southern Coast',
        gates: [{ element: 'Earth', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'white_wyvern', chance: 0.6 }, { id: 'biceon', chance: 0.4 }],
        items: [{ id: 'fish', chance: 0.5 }, { id: 'stone', chance: 0.3 }, { id: 'feather', chance: 0.2 }]
    },
    icy_mountain: {
        id: 'icy_mountain',
        name: 'Icy Mountain',
        gates: [{ element: 'Earth', level: 2 }, { element: 'Wind', level: 2 }],
        enemies: [{ id: 'biceon', chance: 0.5 }, { id: 'white_wyvern', chance: 0.3 }, { id: 'rock_lion', chance: 0.2 }],
        items: [{ id: 'stone', chance: 0.5 }, { id: 'cuprum', chance: 0.3 }, { id: 'ruby', chance: 0.2 }]
    },
    icy_mountain_top: {
        id: 'icy_mountain_top',
        name: 'Icy Mountain Peak',
        gates: [{ element: 'Earth', level: 3 }, { element: 'Wind', level: 3 }],
        enemies: [{ id: 'white_wyvern', chance: 0.5 }, { id: 'mountain_basilisk', chance: 0.5 }],
        items: [{ id: 'dragon_fang', chance: 0.4 }, { id: 'ruby', chance: 0.3 }, { id: 'four_leaf_clover', chance: 0.3 }]
    },
    glacier_bottom: {
        id: 'glacier_bottom',
        name: 'Glacier — Lower Shelf',
        gates: [{ element: 'Earth', level: 2 }, { element: 'Water', level: 2 }],
        enemies: [{ id: 'biceon', chance: 0.6 }, { id: 'water_spirit_beast', chance: 0.4 }],
        items: [{ id: 'stone', chance: 0.4 }, { id: 'azurite', chance: 0.4 }, { id: 'sapphire', chance: 0.2 }]
    },
    glacier_top: {
        id: 'glacier_top',
        name: 'Glacier — Upper Shelf',
        gates: [{ element: 'Earth', level: 3 }, { element: 'Water', level: 2 }],
        enemies: [{ id: 'white_wyvern', chance: 0.5 }, { id: 'biceon', chance: 0.3 }, { id: 'water_spirit_beast', chance: 0.2 }],
        items: [{ id: 'sapphire', chance: 0.5 }, { id: 'azurite', chance: 0.3 }, { id: 'four_leaf_clover', chance: 0.2 }]
    },
    ice_spring: {
        id: 'ice_spring',
        name: 'Ice Spring',
        gates: [{ element: 'Water', level: 2 }, { element: 'Earth', level: 2 }],
        enemies: [{ id: 'water_spirit_beast', chance: 0.7 }, { id: 'toxolotl', chance: 0.3 }],
        items: [{ id: 'island_herb', chance: 0.5 }, { id: 'azurite', chance: 0.3 }, { id: 'sapphire', chance: 0.2 }]
    },
    ice_spring_island: {
        id: 'ice_spring_island',
        name: 'Ice Spring Island',
        gates: [{ element: 'Water', level: 2 }, { element: 'Earth', level: 2 }],
        enemies: [{ id: 'water_spirit_beast', chance: 0.6 }, { id: 'white_wyvern', chance: 0.4 }],
        items: [{ id: 'sapphire', chance: 0.4 }, { id: 'island_herb', chance: 0.4 }, { id: 'four_leaf_clover', chance: 0.2 }]
    },
};