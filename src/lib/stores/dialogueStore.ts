import { writable } from 'svelte/store';

export interface DialogueChoice {
    text: string;
    action: () => void;
}

interface DialogueStore {
    isOpen: boolean;
    lines: string[];
    currentIndex: number;
    speaker: string | null;
    justClosed: boolean;
    choices: DialogueChoice[];
    selectedChoice: number;
}

function createDialogueStore() {
    const { subscribe, update, set } = writable<DialogueStore>({
        isOpen: false,
        lines: [],
        currentIndex: 0,
        speaker: null,
        justClosed: false,
        choices: [],
        selectedChoice: 0,
    });

    function startDialogue(lines: string[], speaker: string) {
        update(s => ({
            ...s,
            isOpen: true,
            lines,
            speaker,
            currentIndex: 0,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
        }));
    }

    function setChoices(choices: DialogueChoice[]) {
        update(s => ({
            ...s,
            isOpen: true,
            choices: choices,
            selectedChoice: 0,
        }));
    }

    function advanceDialogue() {
        update(s => {
            if (!s.isOpen) return s;
            // If there are choices, don't advance text, let action handle it
            if (s.choices.length > 0) return s;

            const nextIndex = s.currentIndex + 1;
            if (nextIndex >= s.lines.length) {
                // End of dialogue
                setTimeout(() => {
                    update(s => ({ ...s, justClosed: false }));
                }, 200);
                return { ...s, isOpen: false, lines: [], currentIndex: 0, speaker: null, justClosed: true, choices: [], selectedChoice: 0 };
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
            choices: [],
            selectedChoice: 0,
        }));
    }

    return {
        subscribe,
        update,
        set,
        startDialogue,
        setChoices,
        advanceDialogue,
        closeDialogue,
    };
}

export const dialogueStore = createDialogueStore();
