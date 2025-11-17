import { writable } from 'svelte/store';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

const initialSeason: Season = 'Spring';

function createSeasonStore() {
    const { subscribe, set } = writable<Season>(initialSeason);

    return {
        subscribe,
        setSeason: (season: Season) => set(season),
    };
}

export const seasonStore = createSeasonStore();
