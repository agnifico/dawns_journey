import { derived } from 'svelte/store';
import { playerStore } from './playerStore';
import { questStore } from './questStore';
import { npcStore } from './npcStore';
import { checkRequirement } from '../services/QuestService';
import type { Quest } from '../types';

export type QuestStageStatus = 'ready' | 'ongoing';

/**
 * A derived store that tracks the completion status of the current stage for all active quests.
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

            const rankData = giver.swordRanks.find(r => r.questId === quest.id);
            if (!rankData) continue;

            const stage = rankData.stages[quest.currentStage];
            if (!stage) continue;

            // For dialogue quests, they are always ready to "turn in".
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