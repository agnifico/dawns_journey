import { writable, get } from 'svelte/store';
import { playerName } from '$lib/stores/playerStore';
import { resolveText } from '$lib/utils/textUtils';

export interface DialogueChoice {
    text: string;
    action: () => void;
}

// ── Scene line types ──────────────────────────────────────────────────────────

export interface SceneTextLine {
    type?: 'line';                    // default, can be omitted
    speaker: string;
    speakerImage?: string | null;
    line: string;
    requiredTag?: string;             // only show if player HAS this tag
    requiredTagAbsent?: string;       // only show if player does NOT have this tag
}

export interface SceneChoiceLine {
    type: 'choice';
    speaker?: string;                 // usually 'You' — shown as nameplate
    speakerImage?: string | null;
    prompt?: string;                  // optional line shown above the choices
    choices: SceneChoiceOption[];
}

export interface SceneChoiceOption {
    text: string;
    tag?: string;                     // tag to set when chosen (added to worldTags)
    continues?: SceneLine[];          // lines to append after this choice
}

export type SceneLine = SceneTextLine | SceneChoiceLine;

// ── Internal flat line (post-processing) ─────────────────────────────────────
// Scenes are flattened into this format before being stored.
// Choice lines become a special marker that DialogueBox detects.

interface FlatLine {
    text: string;
    speaker: string | null;
    speakerImage: string | null;
    isChoice: false;
}

interface FlatChoiceLine {
    text: string;                     // prompt text (may be empty)
    speaker: string | null;
    speakerImage: string | null;
    isChoice: true;
    choices: SceneChoiceOption[];
}

type AnyFlatLine = FlatLine | FlatChoiceLine;

// ── Store state ───────────────────────────────────────────────────────────────

interface DialogueStore {
    isOpen: boolean;
    flatLines: AnyFlatLine[];
    currentIndex: number;
    // Legacy fields — kept for backward compat with startDialogue callers
    lines: string[];
    lineSpeakers: ({ speaker: string; speakerImage: string | null } | null)[];
    speaker: string | null;
    speakerImage: string | null;
    justClosed: boolean;
    choices: DialogueChoice[];
    selectedChoice: number;
    onComplete?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function filterConditionalLines(lines: SceneLine[], playerTags: string[]): SceneLine[] {
    return lines.filter(line => {
        if (line.type === 'choice') return true;
        const tl = line as SceneTextLine;
        if (tl.requiredTag && !playerTags.includes(tl.requiredTag)) return false;
        if (tl.requiredTagAbsent && playerTags.includes(tl.requiredTagAbsent)) return false;
        return true;
    });
}

function flattenSceneLines(lines: SceneLine[], playerName: string): AnyFlatLine[] {
    const result: AnyFlatLine[] = [];
    for (const line of lines) {
        if (line.type === 'choice') {
            result.push({
                text: line.prompt ? resolveText(line.prompt, playerName) : '',
                speaker: line.speaker ?? 'You',
                speakerImage: line.speakerImage ?? null,
                isChoice: true,
                choices: line.choices,
            });
        } else {
            result.push({
                text: resolveText((line as SceneTextLine).line, playerName),
                speaker: (line as SceneTextLine).speaker,
                speakerImage: (line as SceneTextLine).speakerImage ?? null,
                isChoice: false,
            });
        }
    }
    return result;
}

// ── Store ─────────────────────────────────────────────────────────────────────

function createDialogueStore() {
    const { subscribe, update, set } = writable<DialogueStore>({
        isOpen: false,
        flatLines: [],
        currentIndex: 0,
        lines: [],
        lineSpeakers: [],
        speaker: null,
        speakerImage: null,
        justClosed: false,
        choices: [],
        selectedChoice: 0,
        onComplete: undefined,
    });

    // ── Single-NPC dialogue (unchanged API) ───────────────────────────────────

    function startDialogue(
        lines: string[],
        speaker: string,
        onComplete?: () => void,
        speakerImage?: string | null
    ) {
        const name = get(playerName);
        const resolvedLines = resolveText(lines, name);
        const resolvedSpeaker = resolveText(speaker, name);

        const flatLines: AnyFlatLine[] = resolvedLines.map(text => ({
            text,
            speaker: resolvedSpeaker,
            speakerImage: speakerImage ?? null,
            isChoice: false,
        }));

        update(s => ({
            ...s,
            isOpen: true,
            flatLines,
            currentIndex: 0,
            // legacy
            lines: resolvedLines,
            lineSpeakers: resolvedLines.map(() => null),
            speaker: resolvedSpeaker,
            speakerImage: speakerImage ?? null,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    // ── Multi-speaker scene ───────────────────────────────────────────────────

    function startScene(
        sceneLines: SceneLine[],
        playerTags: string[],
        onComplete?: () => void
    ) {
        const name = get(playerName);

        // 1. Filter conditional lines
        const filtered = filterConditionalLines(sceneLines, playerTags);

        // 2. Flatten into AnyFlatLine[]
        const flatLines = flattenSceneLines(filtered, name);

        update(s => ({
            ...s,
            isOpen: true,
            flatLines,
            currentIndex: 0,
            lines: flatLines.map(l => l.text),
            lineSpeakers: flatLines.map(l => l.speaker ? { speaker: l.speaker, speakerImage: l.speakerImage } : null),
            speaker: null,
            speakerImage: null,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    // ── Choice resolution (called by DialogueBox when player picks an option) ─

    function resolveChoice(option: SceneChoiceOption, playerTags: string[]) {
        const name = get(playerName);

        update(s => {
            let newFlatLines = [...s.flatLines];
            const currentIndex = s.currentIndex;

            // Insert continuation lines right after the current choice line
            if (option.continues && option.continues.length > 0) {
                const filtered = filterConditionalLines(option.continues, playerTags);
                const newFlat = flattenSceneLines(filtered, name);
                newFlatLines = [
                    ...newFlatLines.slice(0, currentIndex + 1),
                    ...newFlat,
                    ...newFlatLines.slice(currentIndex + 1),
                ];
            }

            return {
                ...s,
                flatLines: newFlatLines,
                lines: newFlatLines.map(l => l.text),
            };
        });

        // Advance past the choice line to the first continuation line
        advanceDialogue();
    }

    // ── Shared ────────────────────────────────────────────────────────────────

    function setChoices(choices: DialogueChoice[]) {
        update(s => ({ ...s, isOpen: true, choices, selectedChoice: 0 }));
    }

    function advanceDialogue() {
        update(s => {
            if (!s.isOpen) return s;
            const nextIndex = s.currentIndex + 1;

            if (nextIndex >= s.flatLines.length && s.choices.length > 0) return s;

            if (nextIndex >= s.flatLines.length) {
                const cb = s.onComplete;
                setTimeout(() => {
                    update(inner => ({ ...inner, justClosed: false }));
                    if (cb) cb();
                }, 200);
                return {
                    ...s,
                    isOpen: false,
                    flatLines: [],
                    currentIndex: 0,
                    lines: [],
                    lineSpeakers: [],
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
            flatLines: [],
            currentIndex: 0,
            lines: [],
            lineSpeakers: [],
            speaker: null,
            speakerImage: null,
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete: undefined,
        }));
    }

    return {
        subscribe, update, set,
        startDialogue,
        startScene,
        resolveChoice,
        setChoices,
        advanceDialogue,
        closeDialogue,
    };
}

export const dialogueStore = createDialogueStore();