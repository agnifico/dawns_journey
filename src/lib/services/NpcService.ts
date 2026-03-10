import type { NPC, Player, Requirement, Reward, GiftingOption, RankData, Quest } from '$lib/types';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { messageStore } from '$lib/stores/messageStore';
import { mapStore } from '$lib/stores/mapStore';
import { addItems, removeItemsByItemId } from './InventoryService';
import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { questStore } from '$lib/stores/questStore';
import { checkRequirement, checkQuestTriggers } from './QuestService';
import { increaseFactionScore } from './FactionService';
import { toastStore } from '$lib/stores/toastStore';


function createRequirementSnapshot(player: Player, requirement: Requirement): any {
    const snapshot = {
        kill: {},
        win_against_npc: {},
        lose_to_npc: {},
        fight_npc: {},
        finish_location_event: {},
    };

    const conditions = 'conditions' in requirement ? requirement.conditions : [requirement];

    for (const condition of conditions) {
        if (condition.type === 'kill') {
            snapshot.kill[condition.enemyId] = player.killCounts[condition.enemyId] || 0;
        } else if (condition.type === 'win_against_npc') {
            snapshot.win_against_npc[condition.npcId] = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
        } else if (condition.type === 'lose_to_npc') {
            snapshot.lose_to_npc[condition.npcId] = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
        } else if (condition.type === 'fight_npc') {
            snapshot.fight_npc[condition.npcId] = player.combatHistory.filter(h => h.npcId === condition.npcId).length;
        } else if (condition.type === 'finish_location_event' && condition.timing === 'future') {
            snapshot.finish_location_event[condition.eventId] = player.locationEventHistory[condition.eventId] || 0;
        }
    }
    return snapshot;
}

function handleRewards(player: Player, rewards: Reward[]): Player {
    let newPlayer = { ...player };
    for (const reward of rewards) {
        if (reward.type === 'item') {
            newPlayer = addItems(newPlayer, reward.itemId, reward.quantity);
        } else if (reward.type === 'tag') {
            if (!newPlayer.worldTags.includes(reward.tagId)) {
                newPlayer.worldTags.push(reward.tagId);
            }
        }
    }
    newPlayer = checkQuestTriggers(newPlayer);
    return newPlayer;
}

function handleMaxedOutDialogue(npc: NPC, dialogueType: 'allRanksMaxed' | 'swordRankMaxed'): { updatedNpc: NPC, shouldReturn: boolean } {
    const dialogueKey = `${dialogueType}Dialogue`;
    const dialogueIndexKey = `${dialogueType}DialogueIndex`;

    const dialogue = npc[dialogueKey];
    if (!dialogue?.length) {
        return { updatedNpc: npc, shouldReturn: false };
    }

    const dialogueIndex = npc[dialogueIndexKey] || 0;
    dialogueStore.startDialogue(dialogue, npc.name);

    const newIndex = Math.min(dialogueIndex + 1, dialogue.length - 1);
    const updatedNpc = { ...npc, [dialogueIndexKey]: newIndex };

    return { updatedNpc, shouldReturn: true };
}

type QuestStateHandler = (
    npc: NPC,
    player: Player,
    globalNpcs: Record<string, NPC>,
    rankData: RankData,
    quest: Quest
) => { updatedNpc: NPC, updatedPlayer: Player };

const questStateHandlers: Record<string, QuestStateHandler> = {
    LOCKED: (npc, player, globalNpcs, rankData, quest) => {
        const unavailableDialogue = rankData.stages[0]?.unavailable_dialogue || [`I have nothing for you right now.`];
        dialogueStore.startDialogue(unavailableDialogue, npc.name);
        return { updatedNpc: npc, updatedPlayer: player };
    },
    AVAILABLE: (npc, player, globalNpcs, rankData, quest) => {
        let updatedNpc = { ...npc };
        let updatedPlayer = { ...player };
        const firstStage = rankData.stages[0];
        if (firstStage) {
            questStore.setQuestState(quest.id, 'ACTIVE');
            
            const allRequirements = rankData.stages.map(s => s.requirement);
            const combinedRequirement = { operator: 'OR' as const, conditions: allRequirements.flatMap(r => 'conditions' in r ? r.conditions : [r]) };
            const snapshot = createRequirementSnapshot(updatedPlayer, combinedRequirement);
            updatedNpc.requirementSnapshot = {
                ...updatedNpc.requirementSnapshot,
                [updatedNpc.swordRank]: snapshot
            };

            if (firstStage.requirement.type === 'dialogue') {
                const intro = firstStage.intro_dialogue || ["A new opportunity awaits."];
                const success = firstStage.success_dialogue || [];
                dialogueStore.startDialogue([...intro, ...success], npc.name);

                if (firstStage.success_rewards) {
                    updatedPlayer = handleRewards(updatedPlayer, firstStage.success_rewards);
                }
                
                if (rankData.stages.length === 1) {
                    questStore.setQuestState(quest.id, 'COMPLETED');
                    updatedNpc.swordRank++;
                    messageStore.addMessage(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`, ['World', 'NPC']);
                    toastStore.success(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`);
                    updatedPlayer = checkQuestTriggers(updatedPlayer);
                } else {
                    questStore.advanceQuestStage(quest.id);
                }
            } else {
                dialogueStore.startDialogue(firstStage.intro_dialogue || ["I have a NEW TASK for you."], npc.name);
            }
        }
        return { updatedNpc, updatedPlayer };
    },
    ACTIVE: (npc, player, globalNpcs, rankData, quest) => {
        let updatedNpc = { ...npc };
        let updatedPlayer = { ...player };
        const currentStageIndex = quest.currentStage;
        const stage = rankData.stages[currentStageIndex];

        if (!stage) {
            messageStore.addMessage(`${npc.name} seems to be at a loss for words.`, ['System']);
            return { updatedNpc, updatedPlayer };
        }

        if (stage.requirement.type === 'dialogue') {
            if (stage.success_dialogue) {
                dialogueStore.startDialogue(stage.success_dialogue, npc.name);
            }
            if (stage.success_rewards) {
                updatedPlayer = handleRewards(updatedPlayer, stage.success_rewards);
            }
            
            if (currentStageIndex >= rankData.stages.length - 1) {
                questStore.setQuestState(quest.id, 'COMPLETED');
                updatedNpc.swordRank++;
                messageStore.addMessage(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`, ['World', 'NPC']);
                toastStore.success(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`);
                updatedPlayer = checkQuestTriggers(updatedPlayer);
            } else {
                questStore.advanceQuestStage(quest.id);
            }
            return { updatedNpc, updatedPlayer };
        }

        const { met, postCheckActions } = checkRequirement(stage.requirement, updatedPlayer, updatedNpc, globalNpcs);

        if (met) {
            updatedPlayer = postCheckActions.reduce((p, action) => action(p), updatedPlayer);
            
            if (stage.success_rewards) {
                updatedPlayer = handleRewards(updatedPlayer, stage.success_rewards);
            }
            
            let finalDialogue = stage.success_dialogue || [];
            if (currentStageIndex < rankData.stages.length - 1) {
                const nextStage = rankData.stages[currentStageIndex + 1];
                if (nextStage && nextStage.intro_dialogue) {
                    finalDialogue = [...finalDialogue, ...nextStage.intro_dialogue];
                }
            }

            if (finalDialogue.length > 0) {
                dialogueStore.startDialogue(finalDialogue, npc.name);
            }

            if (currentStageIndex >= rankData.stages.length - 1) {
                questStore.setQuestState(quest.id, 'COMPLETED');
                updatedNpc.swordRank++;
                messageStore.addMessage(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`, ['World', 'NPC']);
                toastStore.success(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`);
                updatedPlayer = checkQuestTriggers(updatedPlayer);
            } else {
                questStore.advanceQuestStage(quest.id);
            }
        } else {
            dialogueStore.startDialogue(stage.reminder_dialogue || ["You still have things to do."], npc.name);
        }
        return { updatedNpc, updatedPlayer };
    },
    REPORT_PENDING: (npc, player, globalNpcs, rankData, quest) => {
        let updatedPlayer = { ...player };
        const finalState = quest.finalState;
        if (finalState === 'COMPLETED') {
            questStore.setQuestState(quest.id, 'COMPLETED');
            messageStore.addMessage(`You reported to ${npc.name}. Quest "${quest.title}" completed!`, ['World', 'NPC']);
            toastStore.success('Sword Rank Quest Complete!');
            const finalStage = rankData.stages[rankData.stages.length - 1];
            if (finalStage?.success_rewards) {
                updatedPlayer = handleRewards(updatedPlayer, finalStage.success_rewards);
            }
            if (finalStage?.success_dialogue) {
                dialogueStore.startDialogue(finalStage.success_dialogue, npc.name);
            } else {
                dialogueStore.startDialogue([`Thank you for your report on "${quest.title}". Well done.`], npc.name);
            }
        } else if (finalState === 'FAILED') {
            questStore.setQuestState(quest.id, 'FAILED');
            messageStore.addMessage(`You reported to ${npc.name}. Quest "${quest.title}" failed.`, ['World', 'NPC']);
            toastStore.success('Sword Rank Quest: Marked Failed.');
            const finalStage = rankData.stages[rankData.stages.length - 1];
            if (finalStage?.unavailable_dialogue) {
                dialogueStore.startDialogue(finalStage.unavailable_dialogue, npc.name);
            } else {
                dialogueStore.startDialogue([`You failed to complete "${quest.title}". Better luck next time.`], npc.name);
            }
        }
        return { updatedNpc: npc, updatedPlayer: player };
    },
    COMPLETED: (npc, player, globalNpcs, rankData, quest) => {
        let updatedNpc = { ...npc };
        let updatedPlayer = { ...player };
        if (updatedNpc.swordRank === updatedNpc.swordRanks.findIndex(r => r.questId === quest.id)) {
            const finalStage = rankData.stages[rankData.stages.length - 1];
            if (finalStage?.success_dialogue) {
                dialogueStore.startDialogue(finalStage.success_dialogue, npc.name);
            }
            updatedNpc.swordRank++;
            messageStore.addMessage(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`, ['World', 'NPC']);
            toastStore.success(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`);
            updatedPlayer = checkQuestTriggers(updatedPlayer);
        } else {
            const dialogue = rankData.post_completion_dialogue || [`${npc.name} has nothing new to say.`];
            dialogueStore.startDialogue(dialogue, npc.name);
        }
        return { updatedNpc, updatedPlayer };
    },
    FAILED: (npc, player, globalNpcs, rankData, quest) => {
        const dialogue = rankData.post_failure_dialogue || [`${npc.name} has nothing to say to you.`];
        dialogueStore.startDialogue(dialogue, npc.name);
        return { updatedNpc: npc, updatedPlayer: player };
    }
};

export function handleTalk(npc: NPC, player: Player, globalNpcs: Record<string, NPC>): { updatedNpc: NPC, updatedPlayer: Player } {
    const allQuests = get(questStore).quests;
    let updatedNpc = { ...npc };
    let updatedPlayer = { ...player };
    
    const isSwordMaxed = updatedNpc.swordRank >= updatedNpc.swordRanks.length;
    const isHeartMaxed = updatedNpc.heartRank >= updatedNpc.heartRanks.length;

    if (isSwordMaxed && isHeartMaxed) {
        const { updatedNpc: newNpc, shouldReturn } = handleMaxedOutDialogue(updatedNpc, 'allRanksMaxed');
        if (shouldReturn) return { updatedNpc: newNpc, updatedPlayer };
    }

    if (isSwordMaxed) {
        const { updatedNpc: newNpc, shouldReturn } = handleMaxedOutDialogue(updatedNpc, 'swordRankMaxed');
        if (shouldReturn) return { updatedNpc: newNpc, updatedPlayer };
    }

    // --- Heart Rank upgrade ---
    if (updatedNpc.heartState === 'READY_FOR_RANK_UP') {
        const heartRankData = updatedNpc.heartRanks[updatedNpc.heartRank];
        if (heartRankData) {
            const { met } = checkRequirement(heartRankData.rankUpRequirement, player, updatedNpc, globalNpcs);
            if (met) {
                updatedNpc.heartRank++;
                updatedNpc.heartState = 'NOT_STARTED';
                updatedNpc.affinity -= 10;

                if (updatedNpc.faction) {
                    const multiplier = heartRankData.factionScoreMultiplier || 1;
                    increaseFactionScore(updatedNpc.faction, 1 * multiplier);
                }
                
                if (heartRankData.rank_up_dialogue) {
                    dialogueStore.startDialogue(heartRankData.rank_up_dialogue, updatedNpc.name);
                }
                if (heartRankData.rank_up_rewards) {
                    updatedPlayer = handleRewards(updatedPlayer, heartRankData.rank_up_rewards);
                }
                
                messageStore.addMessage(`Your Heart Rank with ${updatedNpc.name} is now ${updatedNpc.heartRank}.`, ['World', 'NPC']);
                toastStore.success(`Your Heart Rank with ${updatedNpc.name} is now ${updatedNpc.heartRank}.`);
                return { updatedNpc, updatedPlayer };
            }
        }
    }

    // --- Sword Rank quest ---
    const rankData = updatedNpc.swordRanks[updatedNpc.swordRank];

    if (!rankData?.questId) {
        messageStore.addMessage(`${updatedNpc.name} has nothing new to say.`, ['System']);
        return { updatedNpc, updatedPlayer };
    }

    const quest = allQuests[rankData.questId];

    if (!quest) {
        messageStore.addMessage(`Error: Quest data for ${rankData.questId} not found. Please check the data files.`, ['System', 'Error']);
        return { updatedNpc, updatedPlayer };
    }

    const handler = questStateHandlers[quest.state];
    if (handler) {
        return handler(updatedNpc, updatedPlayer, globalNpcs, rankData, quest);
    }

    return { updatedNpc, updatedPlayer };
}


export function fulfillGiftingOption(npc: NPC, player: Player, option: GiftingOption): { updatedNpc: NPC, updatedPlayer: Player } {
    let updatedNpc = JSON.parse(JSON.stringify(npc));
    
    const itemInInventory = player.inventory.find(i => i.id === option.itemId);
    if (!itemInInventory || itemInInventory.amount < option.quantity) {
        messageStore.addMessage(`You don't have enough ${option.itemId}.`, ['World', 'Error']);
        return { updatedNpc, updatedPlayer: player };
    }

    const affinityChange = option.value;
    updatedNpc.affinity += affinityChange;
    messageStore.addMessage(`[${updatedNpc.name}]: ${option.dialogue[0]}`, ['NPC']);

    if (updatedNpc.affinity >= 10 && updatedNpc.heartState !== 'READY_FOR_RANK_UP') {
        updatedNpc.heartState = 'READY_FOR_RANK_UP';
        toastStore.info(`You should talk to ${updatedNpc.name}.`);
        messageStore.addMessage(`You feel your connection with ${updatedNpc.name} has deepened. You should Talk to them.`, ['World', 'NPC']);
    }

    const updatedPlayer = removeItemsByItemId(player, option.itemId, option.quantity);
    
    return { updatedNpc, updatedPlayer };
}

export function getNpcCombatStats(npc: NPC): Partial<Player['baseStats']> {
    const stats: Partial<Player['baseStats']> = { ...npc.baseStats };
    const effectiveRank = Math.max(npc.heartRank, npc.swordRank);

    npc.statGrowth.forEach(growth => {
        if (effectiveRank >= growth.level) {
            Object.assign(stats, growth.stats);
        }
    });

    return stats;
}
