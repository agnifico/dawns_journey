import { writable } from 'svelte/store';
import type { Item, NPC, LocationEvent, Enemy, ResourceNode } from '$lib/types';

export interface ContextButton {
    text: string;
    action: () => void;
    hotkey: string;
}

export type EventScreenType = 'none' | 'npc' | 'location_event' | 'item_found' | 'enemy' | 'resource';

// MODIFIED: The 'data' for an NPC event is now just the ID.
export type EventScreenState = 
    | { type: 'none'; image: null; data: null; contextButtons: ContextButton[] }
    | { type: 'npc'; image: string; data: { npcId: string, fullImage: string }; contextButtons: ContextButton[] }
    | { type: 'location_event'; image: string; data: LocationEvent; contextButtons: ContextButton[] }
    | { type: 'item_found'; image: string; data: { item: Item; quantity: number }; contextButtons: ContextButton[] }
    | { type: 'enemy'; image: string; data: Enemy; contextButtons: ContextButton[] }
    | { type: 'resource'; image: string; data: ResourceNode; contextButtons: ContextButton[] };

const initialState: EventScreenState = {
    image: null,
    type: 'none',
    data: null,
    contextButtons: [],
};

function createEventScreenStore() {
    const { subscribe, set, update } = writable<EventScreenState>(initialState);

    return {
        subscribe,
        show: (type: EventScreenType, image: string | null, data: any = null, contextButtons: ContextButton[] = []) => {
            set({ type, image, data, contextButtons } as EventScreenState);
        },
        clear: () => {
            set(initialState);
        },
    };
}

export const eventScreenStore = createEventScreenStore();