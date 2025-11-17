import { writable } from 'svelte/store';
import type { ContextButton } from './eventScreenStore';

function createContextualActionStore() {
    const { subscribe, set } = writable<ContextButton[]>([]);

    return {
        subscribe,
        set: (buttons: ContextButton[]) => {
            set(buttons);
        },
        clear: () => {
            set([]);
        }
    };
}

export const contextualActionStore = createContextualActionStore();
