import { derived } from 'svelte/store';
import { revolut } from '$lib/stores/timeStore';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

const REVOLUTS_PER_SEASON = 7;
const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

/**
 * Automatically derives the current season from the in-game revolut (day) counter.
 *
 * Cycle: 7 revoluts per season, 4 seasons = 28 revoluts per year.
 *   Revoluts  1–7:   Spring
 *   Revoluts  8–14:  Summer
 *   Revoluts 15–21:  Autumn
 *   Revoluts 22–28:  Winter
 *   Revolut  29:     Spring again (cycles)
 *
 * No manual setSeason needed — the season is always in sync with the game clock.
 */
export const seasonStore = derived(revolut, ($revolut): Season => {
    // revolut is 1-indexed; convert to 0-indexed for modulo math
    const index = Math.floor(($revolut - 1) / REVOLUTS_PER_SEASON) % SEASONS.length;
    return SEASONS[index];
});