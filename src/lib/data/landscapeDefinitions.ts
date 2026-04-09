import type { LandscapeDefinition } from '../types';

export const landscapeDefinitions: { [key: string]: LandscapeDefinition } = {
    // Existing regions
    pleasure_island: {
        id: 'pleasure_island',
        name: 'Pleasure Island',
        rainLevel: 2,
        image: '/locations/pleasure_island.jpg',
    },
    pleasure_island_waters: {
        id: 'pleasure_island_waters',
        name: 'Pleasure Island Waters',
        image: '/locations/pleasure_island_waters.jpg',
    },
    north_land: {
        id: 'north_land',
        name: 'North Land',
        image: '/locations/north_land.jpg',
    },
    forest1: {
        id: 'forest1',
        name: 'Forest',
        image: '/locations/forest1.jpg',
    },
    veres_hill: {
        id: 'veres_hill',
        name: 'Mountain',
        image: '/locations/mountain.jpg',
    },
    mountain_forest: {
        id: 'mountain_forest',
        name: 'Mountain Forest',
        image: '/locations/mountain_forest.jpg',
    },
    south_land: {
        id: 'south_land',
        name: 'South Land',
        image: '/locations/south_land.jpg',
    },
    south_coast: {
        id: 'south_coast',
        name: 'South Coast',
        rainLevel: 2,
        image: '/locations/south_coast.jpg',
    },
    southern_sea: {
        id: 'southern_sea',
        name: 'Southern Sea',
        image: '/locations/southern_sea.jpg',
    },
    western_sea: {
        id: 'western_sea',
        name: 'Western Sea',
        image: '/locations/western_sea.jpg',
    },
    marjana_trench: {
        id: 'marjana_trench',
        name: 'Marjana Trench',
        image: '/locations/marjana_trench.jpg',
    },
    deserted_island: {
        id: 'deserted_island',
        name: 'Deserted Island',
        image: '/locations/deserted_island.jpg',
    },
    bridge: {
        id: 'bridge',
        name: 'Bridge',
        image: '/locations/bridge.jpg',
    },
    agnes_garden: {
        id: 'agnes_garden',
        name: "Agnes' Garden",
        image: '/locations/agnes_garden.jpg',
    },
    sewers: {
        id: 'sewers',
        name: 'Sewers',
        image: '/locations/sewers.jpg',
    },
    courtyard: {
        id: 'courtyard',
        name: 'Courtyard',
        image: '/locations/courtyard.jpg',
    },
    fountain: {
        id: 'fountain',
        name: 'Fountain',
        image: '/locations/fountain.jpg',
    },
    backforest: {
        id: 'backforest',
        name: 'Backforest',
        image: '/locations/backforest.jpg',
    },
    tower_top: {
        id: 'tower_top',
        name: 'Tower Top',
        image: '/locations/tower_top.jpg',
    },
    tower_balcony: {
        id: 'tower_balcony',
        name: 'Tower Balcony',
        image: '/locations/tower_balcony.jpg',
    },
    tower_wall: {
        id: 'tower_wall',
        name: 'Tower Wall',
        image: '/locations/tower_wall.jpg',
    },
    church_roof: {
        id: 'church_roof',
        name: 'Church Roof',
        image: '/locations/church_roof.jpg',
    },
    cross: {
        id: 'cross',
        name: 'Cross',
        image: '/locations/cross.jpg',
    },
    church_wall: {
        id: 'church_wall',
        name: 'Church Wall',
        image: '/locations/church_wall.jpg',
    },

    // New regions
    arrival_plains: {
        id: 'arrival_plains',
        name: 'Arrival Plains',
        image: '/locations/arrival_plains.jpg',
    },
    north_beach: {
        id: 'north_beach',
        name: 'North Beach',
        image: '/locations/north_beach.jpg',
    },
    shallow_water: {
        id: 'shallow_water',
        name: 'Shallow Water',
        image: '/locations/north_beach.jpg',
    },
    waterfall: {
        id: 'waterfall',
        name: 'Waterfall',
        image: '/locations/waterfall.jpg',
    },
    dragon_shrine_grounds: {
        id: 'dragon_shrine_grounds',
        name: "Dragon's Shrine Grounds",
        image: '/locations/dragon_shrine_grounds.jpg',
    },
    unknown_hills: {
        id: 'unknown_hills',
        name: 'Unknown Hills',
        image: '/locations/unknown_hills.jpg',
    },
    unknown_islands: {
        id: 'unknown_islands',
        name: 'Unknown Islands',
        image: '/locations/unknown_islands.jpg',
    },
    mountain_forest2: {
        id: 'mountain_forest2',
        name: 'Waterfall Forest',
        image: '/locations/waterfall2.jpg',
    },
    mountain_east: {
        id: 'mountain_east',
        name: '???',
        image: '/locations/south_coast.jpg',
    },
    murky_water: {
        id: 'murky_water',
        name: 'Murky Swamp',
        image: '/locations/murky_swamp.jpg',
    },
    eastern_sea: {
        id: 'eastern_sea',
        name: 'Eastern Sea',
        rainLevel: 2,
        image: '/locations/eastern_sea.jpg',
    },
    northeastern_sea: {
        id: 'northeastern_sea',
        name: 'Northeastern Sea',
        rainLevel: 3,
        image: '/locations/northeastern_sea.jpg',
    },
    northeast: {
        id: 'northeast',
        name: 'Northeastern Region',
        image: '/locations/northeast.jpg',
    },
    southeastern_sea: {
        id: 'southeastern_sea',
        name: 'Southeastern Sea',
        rainLevel: 4,
        image: '/locations/southeastern_sea.jpg',
    },
    cold_waters: {
        id: 'cold_waters',
        name: 'Cold Waters',
        rainLevel: 2,
        image: '/locations/cold_waters.jpg',
    },
    stormy_water: {
        id: 'stormy_water',
        name: 'North Sea',
        rainLevel: 1,
        image: '/locations/north_sea.jpg',
    },
    icy_coast_south: {
        id: 'icy_coast_south',
        name: 'Icy Southern Coast',
        rainLevel: 2,
        image: '/locations/glacier_bottom.jpg',
    },
    icy_mountain: {
        id: 'icy_mountain',
        name: 'Icy Mountain',
        image: '/locations/icy_mountain.jpg',
    },
    icy_mountain_top: {
        id: 'icy_mountain_top',
        name: 'Icy Mountain Peak',
        image: '/locations/icy_mountain.jpg',
    },
    glacier_bottom: {
        id: 'glacier_bottom',
        name: 'Glacier — Lower Shelf',
        image: '/locations/glacier_bottom.jpg',
    },
    glacier_top: {
        id: 'glacier_top',
        name: 'Glacier — Upper Shelf',
        image: '/locations/glacier_top.jpg',
    },
    ice_spring: {
        id: 'ice_spring',
        name: 'Ice Spring',
        image: '/locations/ice_spring.jpg',
    },
    ice_spring_island: {
        id: 'ice_spring_island',
        name: 'Ice Spring Island',
        image: '/locations/ice_spring_island.jpg',
    },
};