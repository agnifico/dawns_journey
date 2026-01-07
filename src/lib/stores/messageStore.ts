import { writable, get } from 'svelte/store';
import { time } from './timeStore';
import type { Item, NpcInteraction } from '$lib/types';

export type MessageType = 'System' | 'World' | 'NPC' | 'Help' | 'Combat' | 'Update' | 'LevelUp';

let messageIdCounter = 0;

export interface Message {
    id: number;
    text: string;
    types: MessageType[];
    timestamp: number;
    item?: Item;
    explorationRequirements?: { name: string; level: number; }[];
    interaction?: NpcInteraction;
}

interface MessageState {
    messages: Message[];
}

const initialState: MessageState = {
    messages: [],
};

function createMessageStore() {
    const { subscribe, update } = writable<MessageState>(initialState);

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
                    item,
                    explorationRequirements,
                    interaction,
                };
                // Keep the message list from getting too long
                const newMessages = [...state.messages, newMessage].slice(-100);
                return {
                    ...state,
                    messages: newMessages,
                };
            });
        },
        clearInteraction: () => {
            update(state => {
                const lastMessage = state.messages[state.messages.length - 1];
                if (lastMessage && lastMessage.interaction) {
                    const newMessages = [...state.messages];
                    newMessages[newMessages.length - 1] = { ...lastMessage, interaction: undefined };
                    return {
                        ...state,
                        messages: newMessages,
                    };
                }
                return state;
            });
        },
        clearMessages: () => {
            update(state => ({
                ...state,
                messages: [],
            }));
        },
    };
}

export const messageStore = createMessageStore();
