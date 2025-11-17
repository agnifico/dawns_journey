import type { RegionDefinition } from '../types';

// Data derived from old oulier_island_metadata.json
export const regionDefinitions: { [key: string]: RegionDefinition } = {
    walkable_grass: {
        gates: null,
        enemies: [{ id: 'greenhorn', chance: .8 }, { id: 'woodmech_bear', chance: .2 }],
        items: [
            { id: 'corn', chance: 0.25, },
            { id: 'tomato', chance: 0.25 },
            { id: 'onion', chance: 0.25 },
            { id: 'meat', chance: 0.25 }
        ]
    },
    forest: {
        gates: null,
        enemies: [{ id: 'woodmech_bear', chance: 0.7 }, { id: 'greenhorn', chance: 0.3 } ],
        items: [{ id: 'wood', chance: 0.5 }]
    },
    mountains: {
        gates: [{ element: 'Earth', level: 1 }],
        enemies: [{ id: 'woodmech_bear', chance: 0.8 }, { id: 'white_wyvern', chance: 0.2 }],
        items: [
            { id: 'meat', chance: 0.33 },
            { id: 'feather', chance: 0.33 },
            { id: 'dragon_fang', chance: 0.33 }
        ]
    },
    shallow_water: {
        gates: null,
        enemies: null,
        items: [
            { id: 'island_herb', chance: 0.6 },
            { id: 'fish', chance: 0.4 }
        ]
    },
    high_seas: {
        gates: [{ element: 'Water', level: 1 }, { element: 'Wind', level: 1 }],
        enemies: [{ id: 'aquamech_shark', chance: 1 }],
        items: [
            { id: 'fish', chance: 0.8 },
            { id: 'coral_reef', chance: 0.2 }
        ]
    },
    stormy_seas: {
        gates: [{ element: 'Water', level: 2 }],
        enemies: [{ id: 'aquamech_shark', chance: 0.8 }, { id: 'white_wyvern', chance: 0.2 }],
        items: [
            { id: 'fish', chance: 0.9 },
            { id: 'aquamarine', chance: 0.1 }
        ]
    }
};