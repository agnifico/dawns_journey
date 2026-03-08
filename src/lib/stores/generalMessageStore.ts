import { writable } from 'svelte/store';

type GeneralMessageState = {
    isOpen: boolean;
    messages: string[];
    currentIndex: number;
};

function createGeneralMessageStore() {
    const { subscribe, update } = writable<GeneralMessageState>({
        isOpen: false,
        messages: [],
        currentIndex: 0
    });

    function show(content: string | string[]) {
        const messages = Array.isArray(content) ? content : [content];
        if (messages.length === 0) return;

        update(state => ({
            ...state,
            isOpen: true,
            messages,
            currentIndex: 0
        }));
    }

    function next() {
        update(state => {
            if (!state.isOpen) return state;

            const nextIndex = state.currentIndex + 1;
            if (nextIndex >= state.messages.length) {
                return { ...state, isOpen: false, messages: [], currentIndex: 0 };
            } else {
                return { ...state, currentIndex: nextIndex };
            }
        });
    }

    function close() {
        update(state => ({
            ...state,
            isOpen: false,
            messages: [],
            currentIndex: 0
        }));
    }

    return {
        subscribe,
        show,
        next,
        close
    };
}

export const generalMessageStore = createGeneralMessageStore();
