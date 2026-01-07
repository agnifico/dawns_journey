import { writable, get } from 'svelte/store';
import type { Quest, QuestStoreState, QuestState, RankData } from '$lib/types';

function createQuestStore() {
    const { subscribe, update, set } = writable<QuestStoreState>({
        quests: {},
    });

    function registerQuest(questData: RankData, giverId: string) {
        const newQuest: Quest = {
            id: questData.questId,
            title: questData.title,
            description: questData.description,
            giver: giverId,
            state: questData.startState || 'LOCKED',
            currentStage: 0,
            stages: questData.stages,
            startRequirement: questData.startRequirement,
        };

        update(s => {
            // Do not overwrite state of existing quests, only update definition
            const existingQuest = s.quests[newQuest.id];
            if (existingQuest) {
                return {
                    ...s,
                    quests: {
                        ...s.quests,
                        [newQuest.id]: { ...newQuest, state: existingQuest.state, currentStage: existingQuest.currentStage },
                    },
                };
            }
            return {
                ...s,
                quests: {
                    ...s.quests,
                    [newQuest.id]: newQuest,
                },
            };
        });
    }

    function setQuestState(questId: string, state: QuestState) {
        update(s => {
            const quest = s.quests[questId];
            if (quest && quest.state !== state) {
                console.log(`Quest ${questId} state changed from ${quest.state} to ${state}`);
                return {
                    ...s,
                    quests: {
                        ...s.quests,
                        [questId]: { ...quest, state },
                    },
                };
            }
            return s;
        });
    }

    function advanceQuestStage(questId: string) {
        update(s => {
            const quest = s.quests[questId];
            if (quest && quest.currentStage < quest.stages.length - 1) {
                console.log(`Advancing quest ${questId} to stage ${quest.currentStage + 1}`);
                return {
                    ...s,
                    quests: {
                        ...s.quests,
                        [questId]: { ...quest, currentStage: quest.currentStage + 1 },
                    },
                };
            }
            return s;
        });
    }
    
    function loadQuests(loadedQuests: Record<string, Quest>) {
        update(s => ({ ...s, quests: loadedQuests }));
    }


    return {
        subscribe,
        registerQuest,
        setQuestState,
        advanceQuestStage,
        loadQuests,
        set,
    };
}

export const questStore = createQuestStore();
