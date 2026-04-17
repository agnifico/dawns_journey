import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

type ModalConfirm = {
    type: 'confirm';
    title: string;
    content: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
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

        showConfirm: (
            title: string,
            content: string,
            onConfirm: () => void,
            onCancel?: () => void,
            options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean }
        ) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'confirm',
                    title,
                    content,
                    onConfirm,
                    onCancel,
                    confirmLabel: options?.confirmLabel,
                    cancelLabel: options?.cancelLabel,
                    danger: options?.danger,
                }
            }));
        },

        showMessage: (title: string, content: string) => {
            update(() => ({
                isOpen: true,
                data: { type: 'message', title, content }
            }));
        },

        displayResult: (title: string, content: string) => {
            update((store) => {
                if (!store.isOpen) return store;
                return { ...store, data: { type: 'message', title, content } };
            });
        },

        close: () => {
            update((store) => ({ ...store, isOpen: false }));
        },

        // ── Save/Load convenience helpers ─────────────────────────────────

        confirmSave: (onConfirm: () => void) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'confirm',
                    title: 'Save Game',
                    content: 'Save your current progress? This will overwrite your existing save.',
                    confirmLabel: 'Save',
                    cancelLabel: 'Cancel',
                    onConfirm,
                }
            }));
        },

        confirmLoad: (onConfirm: () => void) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'confirm',
                    title: 'Load Save',
                    content: 'Load your saved game? Any unsaved progress will be lost.',
                    confirmLabel: 'Load',
                    cancelLabel: 'Cancel',
                    onConfirm,
                }
            }));
        },

        confirmClearSave: (onConfirm: () => void) => {
            update(() => ({
                isOpen: true,
                data: {
                    type: 'confirm',
                    title: 'Delete Save',
                    content: 'This will permanently delete your save file and reload the game. This cannot be undone.',
                    confirmLabel: 'Delete',
                    cancelLabel: 'Cancel',
                    danger: true,
                    onConfirm,
                }
            }));
        },
    };
};

export const modalStore = createModalStore();