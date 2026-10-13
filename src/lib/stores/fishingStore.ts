import { writable } from 'svelte/store';
import type { FishingSpot } from '$lib/services/FishingService';

/** The spot being fished; null when the fishing minigame is closed. */
export const fishingStore = writable<FishingSpot | null>(null);
