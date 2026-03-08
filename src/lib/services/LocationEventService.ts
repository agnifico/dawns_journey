/**
 * LocationEventService.ts — patched triggerLocationEvent
 *
 * KEY CHANGE: stepOnMessage now fires as progressive dialogue (same as NPCs).
 * Effects only run after the player dismisses the last line.
 *
 * If the event has no stepOnMessage, effects fire immediately as before.
 * If the event has player-choice actions, those still show via ChoiceMenu
 * after the dialogue — unchanged.
 *
 * stepOnMessage can now be string | string[] — single string becomes one
 * dialogue page, array becomes multiple pages the player steps through.
 *
 * HOW IT WORKS:
 *   1. triggerLocationEvent checks requirement as before.
 *   2. If stepOnMessage exists → start dialogue via dialogueStore.
 *   3. dialogueStore exposes an onComplete callback (new field).
 *      When the player dismisses the last line, the callback fires
 *      triggerEventEffect(...) exactly as before.
 *   4. If no stepOnMessage → triggerEventEffect fires immediately (old behaviour).
 *
 * DIALOGUESTORE CHANGE NEEDED:
 *   Add `onComplete?: () => void` to DialogueStore state.
 *   Call it in advanceDialogue() when the last line is dismissed.
 *   See dialogueStore.patch.ts for the minimal change.
 */

import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import type { GameEffect, LocationEvent, Player } from '$lib/types';
import { get } from 'svelte/store';
import { checkQuestTriggers, checkRequirement } from './QuestService';
import { effectHandlers } from './LocationEventEffectHandlers';
import { questStore } from '$lib/stores/questStore';
import { npcStore } from '$lib/stores/npcStore';

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function triggerLocationEvent(event: LocationEvent) {
    const player = get(playerStore);
    const globalNpcs = get(npcStore).globalNpcs;

    // Requirement gate — unchanged
    if (event.requirement) {
        const { met } = checkRequirement(event.requirement, player, null, globalNpcs, true);
        if (!met) {
            const msg = event.requirementNotMetMessage ?? `You cannot interact with this yet.`;
            messageStore.addMessage(msg, ['System']);
            return;
        }
    }

    const lines = normaliseLines(event.stepOnMessage);
    const afterLines = normaliseLines(event.message);
    const hasDialogue = lines.length > 0;
    const hasEffects  = (event.effects ?? []).length > 0;
    const hasActions  = (event.actions ?? []).length > 0;

    // After effects fire, show the aftermath message as dialogue (if any)
    const afterEffects = afterLines.length > 0
        ? () => dialogueStore.startDialogue(afterLines, event.name ?? 'EVENT')
        : undefined;

    if (hasDialogue) {
        dialogueStore.startDialogue(
            lines,
            event.name ?? 'EVENT',
            hasEffects && !hasActions
                ? () => triggerEventEffect(event.id, event.effects ?? [], '', afterEffects)
                : undefined
        );
    } else if (hasEffects && !hasActions) {
        triggerEventEffect(event.id, event.effects ?? [], '', afterEffects);
    }
}

// ---------------------------------------------------------------------------
// Action trigger (player chose an option)
// ---------------------------------------------------------------------------

export function triggerEventAction(event: LocationEvent, actionIndex: number) {
    const action = event.actions?.[actionIndex];
    if (!action) return;

    const player = get(playerStore);
    const globalNpcs = get(npcStore).globalNpcs;

    if (action.requirement) {
        const { met } = checkRequirement(action.requirement, player, null, globalNpcs, true);
        if (!met) {
            messageStore.addMessage(`That option is not available right now.`, ['System']);
            return;
        }
    }

    const responseLines = normaliseLines(action.responseMessage);
    const afterLines = normaliseLines(event.message);

    // After action effects fire, show the event's aftermath message as dialogue
    const afterEffects = afterLines.length > 0
        ? () => dialogueStore.startDialogue(afterLines, event.name ?? 'EVENT')
        : undefined;

    if (responseLines.length > 0) {
        dialogueStore.startDialogue(
            responseLines,
            event.name ?? 'EVENT',
            (action.effects ?? []).length > 0
                ? () => triggerEventEffect(event.id, action.effects ?? [], '', afterEffects)
                : undefined
        );
    } else {
        triggerEventEffect(event.id, action.effects ?? [], '', afterEffects);
    }
}

// ---------------------------------------------------------------------------
// Effect runner — internal, unchanged logic
// ---------------------------------------------------------------------------

export function triggerEventEffect(eventId: string, effects: GameEffect[], message: string, onComplete?: () => void) {
    if (!effects || effects.length === 0) return;

    playerStore.update(player => {
        let newPlayer = { ...player };
        const currentStats = get(playerStats);
        let messageSent = false;
        let allEffectsApplied = true;

        for (const effect of effects) {
            if (effect.type === 'set_quest_state') {
                questStore.setQuestState(effect.questId, effect.state);
                continue;
            }
            if (effect.type === 'fail_quest') {
                questStore.setQuestState(effect.questId, 'FAILED');
                continue;
            }
            if (effect.type === 'add_tag') {
                if (!newPlayer.worldTags.includes(effect.tag)) {
                    newPlayer = { ...newPlayer, worldTags: [...newPlayer.worldTags, effect.tag] };
                }
                continue;
            }
            if (effect.type === 'remove_tag') {
                newPlayer = { ...newPlayer, worldTags: newPlayer.worldTags.filter(t => t !== effect.tag) };
                continue;
            }
            if (effect.type === 'CHOOSE_FACTION') {
                const choiceTag = `sided_with_${effect.faction.toLowerCase().replace(/\s+/g, '_')}`;
                const opposingTag = effect.faction === 'Solis Saints'
                    ? 'sided_with_shadowhand'
                    : 'sided_with_solis_saints';
                newPlayer = {
                    ...newPlayer,
                    worldTags: [
                        ...newPlayer.worldTags.filter(t => t !== opposingTag),
                        choiceTag
                    ]
                };
                messageStore.addMessage(
                    `You have aligned yourself with ${effect.faction}.`,
                    ['World', 'Update']
                );
                continue;
            }

            const handler = effectHandlers[effect.type];
            if (handler) {
                const result = handler(newPlayer, effect, currentStats);
                newPlayer = result.newPlayer;
                if (result.effectApplied && !messageSent && result.allEffectsApplied && message) {
                    messageStore.addMessage(message, ['System']);
                    messageSent = true;
                }
                if (!result.allEffectsApplied) allEffectsApplied = false;
            } else {
                console.warn(`[LocationEventService] No handler for effect type: ${(effect as any).type}`);
            }
        }

        if (allEffectsApplied) {
            if (!newPlayer.locationEventHistory) newPlayer.locationEventHistory = {};
            const currentCount = newPlayer.locationEventHistory[eventId] || 0;
            newPlayer.locationEventHistory[eventId] = currentCount + 1;
        }

        newPlayer = checkQuestTriggers(newPlayer);
        return newPlayer;
    });

    // Fire aftermath dialogue (or any post-effect callback) after store update settles
    if (onComplete) setTimeout(onComplete, 50);
}

// ---------------------------------------------------------------------------
// Helper — normalise string | string[] | undefined → string[]
// ---------------------------------------------------------------------------

function normaliseLines(msg: string | string[] | undefined): string[] {
    if (!msg) return [];
    if (Array.isArray(msg)) return msg.filter(Boolean);
    return msg.trim() ? [msg] : [];
}