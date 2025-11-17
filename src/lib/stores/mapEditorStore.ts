import { writable } from 'svelte/store';

export const selectedTileType = writable<string | null>(null);
export const selectedBehaviorType = writable<string | null>(null);
export const activeBrush = writable<'tile' | 'behavior' | null>(null);