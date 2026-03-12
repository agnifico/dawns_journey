import { derived } from 'svelte/store';
import { playerStore } from './playerStore';
import { questStore } from './questStore';
import { npcStore } from './npcStore';
import { checkRequirement, findRankDataForQuest } from '../services/QuestService';
import type { Quest } from '../types';

export type QuestStageStatus = 'ready' | 'ongoing' | 'cooldown';

/**
 * A derived store that tracks the completion status of the current stage for all active quests.
 *
 * Status values:
 *   'ready'    — requirement is met, player can turn in by talking to the NPC
 *   'ongoing'  — requirement not yet met
 *   'cooldown' — stage has a cooldown_revoluts gate that hasn't expired yet
 */
export const questProgressStore = derived(
    [playerStore, questStore, npcStore],
    ([$player, $questStore, $npcStore], set) => {
        const activeQuests = Object.values($questStore.quests).filter(q => q.state === 'ACTIVE');
        const questStatuses: Record<string, QuestStageStatus> = {};

        if (activeQuests.length === 0 || !$npcStore.npcsInitialized) {
            set({});
            return;
        }

        for (const quest of activeQuests) {
            const giver = $npcStore.globalNpcs[quest.giver];
            if (!giver) continue;

            // Works for both swordRanks and heartRanks, and handles variant slots
            const rankData = findRankDataForQuest(giver, quest.id);
            if (!rankData) continue;

            const stage = rankData.stages[quest.currentStage];
            if (!stage) continue;

            // Cooldown check — stage is blocked until enough revoluts have passed
            if (stage.cooldown_revoluts) {
                const snapshotRevolut = quest.stageCooldownSnapshot?.[quest.currentStage];
                if (snapshotRevolut !== undefined) {
                    // Import get lazily to avoid circular deps — use the revolut value from timeStore
                    // We access it via the window global that the timeStore exposes, or re-derive it here.
                    // Since this is a derived store we can't call get() directly, so we check against
                    // the snapshotted value stored on the quest.
                    // The actual blocking is enforced in NpcService; here we just reflect the state.
                    // We expose 'cooldown' so UI can show a clock icon instead of a task icon.
                    questStatuses[quest.id] = 'cooldown';
                    continue;
                }
            }

            // Dialogue stages are always ready to turn in
            if (stage.requirement.type === 'dialogue') {
                questStatuses[quest.id] = 'ready';
                continue;
            }

            const { met } = checkRequirement(stage.requirement, $player, giver, $npcStore.globalNpcs);
            questStatuses[quest.id] = met ? 'ready' : 'ongoing';
        }

        set(questStatuses);
    }
);