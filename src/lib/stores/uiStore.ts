import { writable } from 'svelte/store';
import type { Item, NPC, LocationEvent, Enemy, ResourceNode } from '$lib/types';
import { persistentStore } from './persistentStore';

// --- Active Item ---
export const activeItem = writable<Item | null>(null);

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

// --- Event Screen ---
export interface ContextButton {
    text: string;
    action: () => void;
    hotkey: string;
}

export type EventScreenType = 'none' | 'npc' | 'location_event' | 'item_found' | 'enemy' | 'resource';

export type EventScreenState = 
    | { type: 'none'; image: null; data: null; contextButtons: ContextButton[] }
    | { type: 'npc'; image: string; data: { npcId: string, fullImage: string }; contextButtons: ContextButton[] }
    | { type: 'location_event'; image: string; data: LocationEvent; contextButtons: ContextButton[] }
    | { type: 'item_found'; image: string; data: { item: Item; quantity: number }; contextButtons: ContextButton[] }
    | { type: 'enemy'; image: string; data: Enemy; contextButtons: ContextButton[] }
    | { type: 'resource'; image: string; data: ResourceNode; contextButtons: ContextButton[] };

const initialEventScreenState: EventScreenState = {
    image: null,
    type: 'none',
    data: null,
    contextButtons: [],
};

export const eventScreen = writable<EventScreenState>(initialEventScreenState);

export function showEvent(type: EventScreenType, image: string | null, data: any = null, contextButtons: ContextButton[] = []) {
    eventScreen.set({ type, image, data, contextButtons } as EventScreenState);
}

export function clearEvent() {
    eventScreen.set(initialEventScreenState);
}

// --- Contextual Actions ---
export const contextualActions = writable<ContextButton[]>([]);

export function setContextualActions(buttons: ContextButton[]) {
    contextualActions.set(buttons);
}

export function clearContextualActions() {
    contextualActions.set([]);
}

// --- Gift Modal ---
export const isGiftModalOpen = writable<boolean>(false);
export const giftTargetNpcId = writable<string | null>(null);

export function openGiftModal(npcId: string) {
    giftTargetNpcId.set(npcId);
    isGiftModalOpen.set(true);
}

export function closeGiftModal() {
    giftTargetNpcId.set(null);
    isGiftModalOpen.set(false);
}

// --- Draggable Widgets ---
export interface WidgetState {
    isCollapsed: boolean;
}

// Quest Tracker
const initialQuestTrackerState: WidgetState = { isCollapsed: false };
export const questTrackerState = persistentStore<WidgetState>('questTrackerState', initialQuestTrackerState);

export function toggleQuestTracker() {
    questTrackerState.update(s => ({ ...s, isCollapsed: !s.isCollapsed }));
}

// Homestead Status
const initialHomesteadStatusState: WidgetState = { isCollapsed: true };
export const homesteadStatusState = persistentStore<WidgetState>('homesteadStatusState', initialHomesteadStatusState);

export function toggleHomesteadStatus() {
    homesteadStatusState.update(s => ({ ...s, isCollapsed: !s.isCollapsed }));
}

// --- Faction Choice Modal ---
export const isFactionChoiceModalOpen = writable<boolean>(false);

export function openFactionChoiceModal() {
    isFactionChoiceModalOpen.set(true);
}

export function closeFactionChoiceModal() {
    isFactionChoiceModalOpen.set(false);
}
