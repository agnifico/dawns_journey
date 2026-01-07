import { derived } from 'svelte/store';
import { questStore } from './questStore';
import { playerStore } from './playerStore';
import { npcStore } from './npcStore';
import type { RequirementCondition } from '$lib/types';

export const questProgressStore = derived(
    [questStore, playerStore, npcStore],
    ([$questStore, $playerStore, $npcStore]) => {
        const progressData = {};

        for (const questId in $questStore.quests) {
            const quest = $questStore.quests[questId];
            if (quest.state === 'ACTIVE') {
                const stage = quest.stages[quest.currentStage];
                if (!stage) continue;

                const requirement = stage.requirement;
                let progress = 0;
                let target = 0;

                const processCondition = (condition: RequirementCondition) => {
                    switch (condition.type) {
                        case 'kill':
                            const npc = $npcStore.globalNpcs[quest.giver];
                            const snapshotKills = npc?.requirementSnapshot?.[npc.swordRank]?.kill?.[condition.enemyId] || 0;
                            const currentKills = $playerStore.killCounts[condition.enemyId] || 0;
                            progress = Math.max(0, currentKills - snapshotKills);
                            target = condition.quantity;
                            break;
                        case 'have_item':
                        case 'give_item':
                            const item = $playerStore.inventory.find(i => i.itemId === condition.itemId);
                            progress = item?.amount || 0;
                            target = condition.quantity;
                            break;
                    }
                };

                if ('conditions' in requirement) {
                    // For now, we only show progress for the first condition in a multi-condition requirement.
                    // This could be expanded later.
                    processCondition(requirement.conditions[0]);
                } else {
                    processCondition(requirement);
                }

                if (target > 0) {
                    progressData[questId] = { progress: Math.min(progress, target), target };
                }
            }
        }
        return progressData;
    }
);
