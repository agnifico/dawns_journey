import { writable } from 'svelte/store';

export const rainLevel = writable(0);
export const rainEnabled = writable(true);