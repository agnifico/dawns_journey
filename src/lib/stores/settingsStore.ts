import { persistentStore } from './persistentStore';

export interface Settings {
    renderScale: number;
}

const initialSettings: Settings = {
    renderScale: 4,
};

export const settingsStore = persistentStore<Settings>('settings', initialSettings);

export function setRenderScale(newScale: number) {
    settingsStore.update(s => {
        // Clamp the scale to reasonable values
        const scale = Math.max(1, Math.min(newScale, 5));
        return { ...s, renderScale: scale };
    });
}

import { writable } from 'svelte/store';
import { ABILITY_MODE } from '$lib/config/abilityConfig';
export const abilityMode = writable<'dev' | 'live'>(ABILITY_MODE);
