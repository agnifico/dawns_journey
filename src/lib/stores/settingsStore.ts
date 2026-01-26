import { persistentStore } from './persistentStore';

export interface Settings {
    renderScale: number;
}

const initialSettings: Settings = {
    renderScale: 3,
};

export const settingsStore = persistentStore<Settings>('settings', initialSettings);

export function setRenderScale(newScale: number) {
    settingsStore.update(s => {
        // Clamp the scale to reasonable values
        const scale = Math.max(1, Math.min(newScale, 5));
        return { ...s, renderScale: scale };
    });
}
