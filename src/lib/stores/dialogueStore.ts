import { writable, get } from 'svelte/store';
import { playerName } from '$lib/stores/playerStore';
import { resolveText } from '$lib/utils/textUtils';

export interface DialogueChoice {
    text: string;
    action: () => void;
}

// ── Scene line types ──────────────────────────────────────────────────────────

export interface SceneTextLine {
    type?: 'line';
    speaker: string;
    speakerImage?: string | null;
    speakerElements?: string[];       // NPC element types e.g. ['Fire', 'Dark']
    line: string;
    requiredTag?: string;
    requiredTagAbsent?: string;
}

export interface SceneChoiceLine {
    type: 'choice';
    speaker?: string;
    speakerImage?: string | null;
    speakerElements?: string[];
    prompt?: string;
    choices: SceneChoiceOption[];
}

export interface SceneChoiceOption {
    text: string;
    tag?: string;
    continues?: SceneLine[];
}

export type SceneLine = SceneTextLine | SceneChoiceLine;

// ── Internal flat line ────────────────────────────────────────────────────────

interface FlatLine {
    text: string;
    speaker: string | null;
    speakerImage: string | null;
    speakerElements: string[];
    isChoice: false;
}

interface FlatChoiceLine {
    text: string;
    speaker: string | null;
    speakerImage: string | null;
    speakerElements: string[];
    isChoice: true;
    choices: SceneChoiceOption[];
}

type AnyFlatLine = FlatLine | FlatChoiceLine;

// ── Store state ───────────────────────────────────────────────────────────────

interface DialogueStore {
    isOpen: boolean;
    flatLines: AnyFlatLine[];
    currentIndex: number;
    lines: string[];
    lineSpeakers: ({ speaker: string; speakerImage: string | null } | null)[];
    speaker: string | null;
    speakerImage: string | null;
    speakerElements: string[];
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

function flattenSceneLines(lines: SceneLine[], name: string): AnyFlatLine[] {
    const result: AnyFlatLine[] = [];
    for (const line of lines) {
        if (line.type === 'choice') {
            result.push({
                text: line.prompt ? resolveText(line.prompt, name) : '',
                speaker: line.speaker ?? 'You',
                speakerImage: line.speakerImage ?? null,
                speakerElements: line.speakerElements ?? [],
                isChoice: true,
                choices: line.choices,
            });
        } else {
            const tl = line as SceneTextLine;
            result.push({
                text: resolveText(tl.line, name),
                speaker: tl.speaker,
                speakerImage: tl.speakerImage ?? null,
                speakerElements: tl.speakerElements ?? [],
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
        speakerElements: [],
        justClosed: false,
        choices: [],
        selectedChoice: 0,
        onComplete: undefined,
    });

    function startDialogue(
        lines: string[],
        speaker: string,
        onComplete?: () => void,
        speakerImage?: string | null,
        speakerElements?: string[]
    ) {
        const name = get(playerName);
        const resolvedLines = resolveText(lines, name);
        const resolvedSpeaker = resolveText(speaker, name);

        const flatLines: AnyFlatLine[] = resolvedLines.map(text => ({
            text,
            speaker: resolvedSpeaker,
            speakerImage: speakerImage ?? null,
            speakerElements: speakerElements ?? [],
            isChoice: false,
        }));

        update(s => ({
            ...s,
            isOpen: true,
            flatLines,
            currentIndex: 0,
            lines: resolvedLines,
            lineSpeakers: resolvedLines.map(() => null),
            speaker: resolvedSpeaker,
            speakerImage: speakerImage ?? null,
            speakerElements: speakerElements ?? [],
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    function startScene(
        sceneLines: SceneLine[],
        playerTags: string[],
        onComplete?: () => void
    ) {
        const name = get(playerName);
        const filtered = filterConditionalLines(sceneLines, playerTags);
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
            speakerElements: [],
            justClosed: false,
            choices: [],
            selectedChoice: 0,
            onComplete,
        }));
    }

    function resolveChoice(option: SceneChoiceOption, playerTags: string[]) {
        const name = get(playerName);

        update(s => {
            let newFlatLines = [...s.flatLines];
            const currentIndex = s.currentIndex;

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

        advanceDialogue();
    }

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
                    speakerElements: [],
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
            speakerElements: [],
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