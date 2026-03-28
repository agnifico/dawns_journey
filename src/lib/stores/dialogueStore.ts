/**
 * dialogueStore.ts
 *
 * Changes from previous version:
 *   - startDialogue now resolves {playerName} tokens in all lines automatically.
 *   - playerName is read from playerStore at the moment startDialogue is called,
 *     so it always reflects the current name without reactive overhead.
 *   - Everything else is identical.
 */

import { writable, get } from 'svelte/store';
import { playerName } from '$lib/stores/playerStore';
import { resolveText } from '$lib/utils/textUtils';

export interface DialogueChoice {
    text: string;
    action: () => void;
}

interface DialogueStore {
    isOpen: boolean;
    lines: string[];
    currentIndex: number;
    speaker: string | null;
    speakerImage?: string | null;  // NEW: avatar shown next to speaker name
    justClosed: boolean;
    choices: DialogueChoice[];
    selectedChoice: number;
    onComplete?: () => void;
}

function createDialogueStore() {
    const { subscribe, update, set } = writable<DialogueStore>({
        isOpen: false,
        lines: [],
        currentIndex: 0,
        speaker: null,
        speakerImage: null,
        justClosed: false,
        choices: [],
        selectedChoice: 0,
        onComplete: undefined,
    });

    /**
     * @param lines        Lines of dialogue to show, one at a time.
     * @param speaker      Label shown above the text box.
     * @param onComplete   Optional callback fired after the last line is dismissed.
     * @param speakerImage Optional avatar URL shown next to the speaker name.
     */
    function startDialogue(
        lines: string[],
        speaker: string,
        onComplete?: () => void,
        speakerImage?: string | null
    ) {
        // Resolve {playerName} tokens using the current name at call time
        const name = get(playerName);
        const resolvedLines = resolveText(lines, name);
        const resolvedSpeaker = resolveText(speaker, name);

        update(s => ({
            ...s,
            isOpen: true,
            lines: resolvedLines,
            speaker: resolvedSpeaker,
            speakerImage: speakerImage ?? null,
            currentIndex: 0,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    function setChoices(choices: DialogueChoice[]) {
        update(s => ({ ...s, isOpen: true, choices, selectedChoice: 0 }));
    }

    function advanceDialogue() {
        update(s => {
            if (!s.isOpen) return s;

            const nextIndex = s.currentIndex + 1;

            // If choices are waiting, don't advance past the last line
            if (nextIndex >= s.lines.length && s.choices.length > 0) return s;

            if (nextIndex >= s.lines.length) {
                const cb = s.onComplete;
                setTimeout(() => {
                    update(inner => ({ ...inner, justClosed: false }));
                    if (cb) cb();
                }, 200);

                return {
                    ...s,
                    isOpen: false,
                    lines: [],
                    currentIndex: 0,
                    speaker: null,
                    speakerImage: null,
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
            speakerImage: null,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete: undefined,
        }));
    }

    return { subscribe, update, set, startDialogue, setChoices, advanceDialogue, closeDialogue };
}

export const dialogueStore = createDialogueStore();