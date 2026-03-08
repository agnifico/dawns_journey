/**
 * messageStore.ts — patched version
 *
 * Changes from original:
 *  1. Added `sessionId` to MessageState — increments every time newSession() is called.
 *     TileMessagePanel watches this to know when to clear and reset.
 *  2. Added `messageStore.newSession()` — call this from game.movePlayer() (or wherever
 *     a tile step happens) to begin a new per-tile message group.
 *  3. Everything else is identical to the original.
 */

import { writable, get } from 'svelte/store';
import { time } from './timeStore';
import { generalMessageStore } from './generalMessageStore';
import type { Item, NpcInteraction } from '$lib/types';

export type MessageType = 'System' | 'World' | 'NPC' | 'Help' | 'Combat' | 'Player';

let messageIdCounter = 0;

export interface Message {
    id: number;
    text: string;
    types: MessageType[];
    timestamp: number;
    /** Which tile-session this message belongs to. */
    sessionId: number;
    item?: Item;
    explorationRequirements?: { name: string; level: number; }[];
    interaction?: NpcInteraction;
}

interface MessageState {
    messages: Message[];
    /** Increments on every newSession() call. */
    currentSessionId: number;
}

const initialState: MessageState = {
    messages: [],
    currentSessionId: 0,
};

function createMessageStore() {
    const { subscribe, update } = writable<MessageState>(initialState);

    let _currentSessionId = 0;

    return {
        subscribe,

        addMessage: (
            text: string,
            types: MessageType[],
            item?: Item,
            explorationRequirements?: { name: string; level: number; }[],
            interaction?: NpcInteraction
        ) => {
            update(state => {
                const newMessage: Message = {
                    id: messageIdCounter++,
                    text,
                    types,
                    timestamp: get(time),
                    sessionId: state.currentSessionId,
                    item,
                    explorationRequirements,
                    interaction,
                };
                const newMessages = [...state.messages, newMessage].slice(-100);
                return { ...state, messages: newMessages };
            });
            // Also show in the general message overlay
            // generalMessageStore.show(text);
        },

        /**
         * Call this whenever the player moves to a new tile.
         * Increments the sessionId so TileMessagePanel knows to start a new group.
         */
        newSession: () => {
            _currentSessionId += 1;
            update(state => ({ ...state, currentSessionId: _currentSessionId }));
        },

        clearInteraction: () => {
            update(state => {
                const lastMessage = state.messages[state.messages.length - 1];
                if (lastMessage && lastMessage.interaction) {
                    const newMessages = [...state.messages];
                    newMessages[newMessages.length - 1] = { ...lastMessage, interaction: undefined };
                    return { ...state, messages: newMessages };
                }
                return state;
            });
        },

        clearMessages: () => {
            update(state => ({ ...state, messages: [] }));
        },
    };
}

export const messageStore = createMessageStore();