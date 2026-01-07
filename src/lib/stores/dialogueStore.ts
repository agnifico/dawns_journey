import { writable } from 'svelte/store';

interface DialogueStore {
    isOpen: boolean;
    lines: string[];
    currentIndex: number;
    speaker: string | null;
    justClosed: boolean;
}

function createDialogueStore() {
    const { subscribe, update } = writable<DialogueStore>({
        isOpen: false,
        lines: [],
        currentIndex: 0,
        speaker: null,
        justClosed: false,
    });

    function startDialogue(lines: string[], speaker: string) {
        update(s => ({
            ...s,
            isOpen: true,
            lines,
            speaker,
            currentIndex: 0,
            justClosed: false,
        }));
    }

    function advanceDialogue() {
        update(s => {
            if (!s.isOpen) return s;
            const nextIndex = s.currentIndex + 1;
            if (nextIndex >= s.lines.length) {
                // End of dialogue, set the justClosed flag
                setTimeout(() => {
                    update(s => ({ ...s, justClosed: false }));
                }, 100); // Reset the flag after a short delay
                return { ...s, isOpen: false, lines: [], currentIndex: 0, speaker: null, justClosed: true };
            }
            return { ...s, currentIndex: nextIndex };
        });
    }

    function closeDialogue() {
        update(s => ({
            ...s,
            isOpen: false,
            lines: [],
            currentIndex: 0,
            speaker: null,
            justClosed: false,
        }));
    }

    return {
        subscribe,
        startDialogue,
        advanceDialogue,
        closeDialogue,
    };
}

export const dialogueStore = createDialogueStore();
