/**
 * dialogueStore.ts — patched
 *
 * ONE CHANGE from original:
 *   startDialogue() now accepts an optional third argument: onComplete callback.
 *   It fires when the player dismisses the final line.
 *   Everything else is identical.
 *
 * This is what LocationEventService uses to fire effects after story text.
 */

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
    onComplete?: () => void;   // ← NEW: fires after last line dismissed
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
        onComplete: undefined,
    });

    /**
     * @param lines    Lines of dialogue to show, one at a time.
     * @param speaker  Label shown above the text box.
     * @param onComplete  Optional callback fired after the last line is dismissed.
     *                    LocationEventService passes effects-runner here.
     */
    function startDialogue(lines: string[], speaker: string, onComplete?: () => void) {
        update(s => ({
            ...s,
            isOpen: true,
            lines,
            speaker,
            currentIndex: 0,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    function setChoices(choices: DialogueChoice[]) {
        update(s => ({
            ...s,
            isOpen: true,
            choices,
            selectedChoice: 0,
        }));
    }

    function advanceDialogue() {
        update(s => {
            if (!s.isOpen) return s;

            const nextIndex = s.currentIndex + 1;

            // If we've shown all lines, choices (if any) take over — stop advancing text
            if (nextIndex >= s.lines.length && s.choices.length > 0) return s;

            if (nextIndex >= s.lines.length) {
                // Last line dismissed — fire onComplete before closing
                const cb = s.onComplete;
                setTimeout(() => {
                    update(inner => ({ ...inner, justClosed: false }));
                    // Fire after the store closes so effects don't fight the
                    // closing animation
                    if (cb) cb();
                }, 200);

                return {
                    ...s,
                    isOpen: false,
                    lines: [],
                    currentIndex: 0,
                    speaker: null,
                    justClosed: true,
                    choices: [],
                    selectedChoice: 0,
                    onComplete: undefined,
                };
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
            onComplete: undefined,
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