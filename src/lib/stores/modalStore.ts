import { writable } from 'svelte/store';

type ModalConfirm = {
    type: 'confirm';
    title: string;
    content: string;
    onConfirm: () => void;
    onCancel?: () => void;
};

type ModalMessage = {
    type: 'message';
    title: string;
    content: string;
};

type ModalStore = {
    isOpen: boolean;
    data: ModalConfirm | ModalMessage | null;
};

const createModalStore = () => {
    const { subscribe, update } = writable<ModalStore>({
        isOpen: false,
        data: null
    });

    return {
        subscribe,
        showConfirm: (title: string, content: string, onConfirm: () => void, onCancel?: () => void) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'confirm',
                    title,
                    content,
                    onConfirm,
                    onCancel
                }
            }));
        },
        showMessage: (title: string, content: string) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'message',
                    title,
                    content
                }
            }));
        },
        // This function will set the result message on the current confirm modal
        displayResult: (title: string, content: string) => {
            update((store) => {
                if (!store.isOpen) return store;
                return {
                    ...store,
                    data: {
                        type: 'message',
                        title,
                        content,
                    }
                }
            });
        },
        close: () => {
            update((store) => ({ ...store, isOpen: false }));
        }
    };
};

export const modalStore = createModalStore();
