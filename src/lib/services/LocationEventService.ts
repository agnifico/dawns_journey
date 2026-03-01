import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import type { GameEffect, LocationEvent, Player } from '$lib/types';
import { get } from 'svelte/store';
import { checkQuestTriggers, checkRequirement } from './QuestService';
import { effectHandlers } from './LocationEventEffectHandlers';
import { questStore } from '$lib/stores/questStore';
import { npcStore } from '$lib/stores/npcStore';

// ---------------------------------------------------------------------------
// Main entry point — called when player steps on / interacts with an event tile
// ---------------------------------------------------------------------------

/**
 * Attempt to trigger a location event.
 *
 * NEW BEHAVIOUR:
 * 1. If the event has a `requirement`, evaluate it against current player state.
 *    - If not met: show `requirementNotMetMessage` (or a fallback) and return early.
 *    - The event tile stays on the map — the player can try again later.
 * 2. If met (or no requirement): run effects as before.
 *
 * This fixes the bug where events like the Altar of Fates were triggerable
 * from day one regardless of quest state.
 */
export function triggerLocationEvent(event: LocationEvent) {
    const player = get(playerStore);
    const globalNpcs = get(npcStore).globalNpcs;

    // --- Requirement gate ---
    if (event.requirement) {
        const { met } = checkRequirement(event.requirement, player, null, globalNpcs, true);
        if (!met) {
            const msg = event.requirementNotMetMessage ?? `You cannot interact with this yet.`;
            messageStore.addMessage(msg, ['System']);
            return; // bail — do not fire effects, do not record in locationEventHistory
        }
    }

    // --- Fire effects ---
    triggerEventEffect(event.id, event.effects ?? [], event.stepOnMessage ?? '');
}

/**
 * Trigger a specific named action from a location event's `actions` array.
 * Actions can have their own `requirement` — hidden/disabled in the UI,
 * but also double-checked here for safety.
 */
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

    triggerEventEffect(event.id, action.effects ?? [], action.responseMessage ?? '');
}

// ---------------------------------------------------------------------------
// Effect runner (internal — also still exported for any direct callers)
// ---------------------------------------------------------------------------

export function triggerEventEffect(eventId: string, effects: GameEffect[], message: string) {
    if (!effects || effects.length === 0) return;

    playerStore.update(player => {
        let newPlayer = { ...player };
        const currentStats = get(playerStats);
        let messageSent = false;
        let allEffectsApplied = true;

        for (const effect of effects) {
            // Handle the new effect types that don't fit in LocationEventEffectHandlers
            // because they touch stores beyond playerStore.
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

            // CHOOSE_FACTION: record the player's faction choice as a world tag,
            // then let checkQuestTriggers propagate the consequences (failing opposing quests).
            if (effect.type === 'CHOOSE_FACTION') {
                const choiceTag = `sided_with_${effect.faction.toLowerCase().replace(/\s+/g, '_')}`;
                const opposingTag = effect.faction === 'Solis Saints'
                    ? 'sided_with_shadowhand'
                    : 'sided_with_solis_saints';

                // Record choice, remove opposing tag if somehow present
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

            // All other effects go through the existing handler map
            const handler = effectHandlers[effect.type];
            if (handler) {
                const result = handler(newPlayer, effect, currentStats);
                newPlayer = result.newPlayer;
                if (result.effectApplied && !messageSent && result.allEffectsApplied && message) {
                    messageStore.addMessage(message, ['System']);
                    messageSent = true;
                }
                if (!result.allEffectsApplied) {
                    allEffectsApplied = false;
                }
            } else {
                console.warn(`[LocationEventService] No handler for effect type: ${(effect as any).type}`);
            }
        }

        // Only record the event as completed if all effects applied successfully
        if (allEffectsApplied) {
            if (!newPlayer.locationEventHistory) {
                newPlayer.locationEventHistory = {};
            }
            const currentCount = newPlayer.locationEventHistory[eventId] || 0;
            newPlayer.locationEventHistory[eventId] = currentCount + 1;
        }

        newPlayer = checkQuestTriggers(newPlayer);

        return newPlayer;
    });
}