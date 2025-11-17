import { writable } from 'svelte/store';

/**
 * Stores the ID of the currently selected farm plot object from the map.
 * The value can be a number (the plot ID) or null if no plot is selected.
 */
export const selectedPlotId = writable<number | null>(null);
