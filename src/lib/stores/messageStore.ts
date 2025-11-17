import { writable, get } from 'svelte/store';
import { time } from './timeStore';

export type MessageType = 'System' | 'World' | 'NPC' | 'Help' | 'Combat';

let messageIdCounter = 0;

export interface Message {
    id: number;
    text: string;
    types: MessageType[];
    timestamp: number;
    item?: any; // Replace 'any' with a proper item type later
    explorationRequirements?: { name: string; level: number; }[];
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
        addMessage: (text: string, types: MessageType[], item?: any, explorationRequirements?: { name: string; level: number; }[]) => {
            update(state => {
                const newMessage: Message = {
                    id: messageIdCounter++,
                    text,
                    types,
                    timestamp: get(time),
                    item,
                    explorationRequirements,
                };
                // Keep the message list from getting too long
                const newMessages = [...state.messages, newMessage].slice(-100);
                return {
                    ...state,
                    messages: newMessages,
                };
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