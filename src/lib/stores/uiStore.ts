import { writable } from 'svelte/store';

// --- Selected Plot ---
export const selectedPlotId = writable<string | null>(null);

export function selectPlot(plotId: string) {
    selectedPlotId.set(plotId);
}

export function deselectPlot() {
    selectedPlotId.set(null);
}

// --- Combat Modal ---
export const isCombatModalOpen = writable<boolean>(false);

export function openCombatModal() {
    isCombatModalOpen.set(true);
}

export function closeCombatModal() {
    isCombatModalOpen.set(false);
}

// --- Mobile View ---
export type MobileInfoPanelView = 'log' | 'event';

export const mobileInfoPanelView = writable<MobileInfoPanelView>('log');

export function switchToEventView() {
	mobileInfoPanelView.set('event');
}

export function switchToLogView() {
	mobileInfoPanelView.set('log');
}
