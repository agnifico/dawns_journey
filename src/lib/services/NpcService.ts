import type { NPC, Player, Requirement, Reward, GiftingOption } from '$lib/types';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { messageStore } from '$lib/stores/messageStore';
import { addItem, removeItem } from './ItemService';
import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { questStore } from '$lib/stores/questStore';
import { checkRequirement, checkQuestTriggers } from './QuestService';

function createRequirementSnapshot(player: Player, requirement: Requirement): any {
    const snapshot = {
        kill: {},
        win_against_npc: {},
        lose_to_npc: {},
        fight_npc: {},
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
        }
    }
    return snapshot;
}

function handleRewards(player: Player, rewards: Reward[]): Player {
    let newPlayer = { ...player };
    for (const reward of rewards) {
        if (reward.type === 'item') {
            newPlayer = addItem(newPlayer, reward.itemId, reward.quantity);
        } else if (reward.type === 'tag') {
            if (!newPlayer.worldTags.includes(reward.tagId)) {
                newPlayer.worldTags.push(reward.tagId);
            }
        }
    }
    checkQuestTriggers();
    return newPlayer;
}

export function handleTalk(npc: NPC, player: Player, globalNpcs: Record<string, NPC>): { updatedNpc: NPC, updatedPlayer: Player } {
    const allQuests = get(questStore).quests;
    let updatedNpc = { ...npc };
    let updatedPlayer = { ...player };
    
    // --- Maxed out checks ---
    const isSwordMaxed = updatedNpc.swordRank >= updatedNpc.swordRanks.length;
    const isHeartMaxed = updatedNpc.heartRank >= updatedNpc.heartRanks.length;

    if (isSwordMaxed && isHeartMaxed && updatedNpc.allRanksMaxedDialogue?.length) {
        const dialogue = updatedNpc.allRanksMaxedDialogue[Math.floor(Math.random() * updatedNpc.allRanksMaxedDialogue.length)];
        dialogueStore.startDialogue([dialogue], updatedNpc.name);
        return { updatedNpc, updatedPlayer };
    }
    if (isSwordMaxed && updatedNpc.swordRankMaxedDialogue?.length) {
        const dialogue = updatedNpc.swordRankMaxedDialogue[Math.floor(Math.random() * updatedNpc.swordRankMaxedDialogue.length)];
        dialogueStore.startDialogue([dialogue], updatedNpc.name);
        return { updatedNpc, updatedPlayer };
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
                
                if (heartRankData.rank_up_dialogue) {
                    dialogueStore.startDialogue(heartRankData.rank_up_dialogue, updatedNpc.name);
                }
                if (heartRankData.rank_up_rewards) {
                    updatedPlayer = handleRewards(updatedPlayer, heartRankData.rank_up_rewards);
                }
                
                messageStore.addMessage(`Your Heart Rank with ${updatedNpc.name} is now ${updatedNpc.heartRank}.`, ['World', 'Update']);
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
        messageStore.addMessage("Error: Quest not found.", ['System']);
        return { updatedNpc, updatedPlayer };
    }

    switch (quest.state) {
        case 'LOCKED': {
            const unavailableDialogue = rankData.stages[0]?.unavailable_dialogue || [`I have nothing for you right now.`];
            dialogueStore.startDialogue(unavailableDialogue, updatedNpc.name);
            break;
        }
        case 'AVAILABLE': {
            const firstStage = rankData.stages[0];
            if (firstStage) {
                dialogueStore.startDialogue(firstStage.reminder_dialogue || ["A new opportunity awaits."], updatedNpc.name);
                questStore.setQuestState(quest.id, 'ACTIVE');
                
                const allRequirements = rankData.stages.map(s => s.requirement);
                const combinedRequirement = { operator: 'OR' as const, conditions: allRequirements.flatMap(r => 'conditions' in r ? r.conditions : [r]) };
                const snapshot = createRequirementSnapshot(updatedPlayer, combinedRequirement);
                updatedNpc.requirementSnapshot = {
                    ...updatedNpc.requirementSnapshot,
                    [updatedNpc.swordRank]: snapshot
                };

                if (firstStage.requirement.type === 'dialogue') {
                    if (firstStage.success_rewards) {
                        updatedPlayer = handleRewards(updatedPlayer, firstStage.success_rewards);
                    }
                    questStore.advanceQuestStage(quest.id);
                }
            }
            break;
        }
        case 'ACTIVE': {
            const currentStageIndex = quest.currentStage;
            const stage = rankData.stages[currentStageIndex];

            if (!stage) {
                messageStore.addMessage(`${updatedNpc.name} seems to be at a loss for words.`, ['System']);
                break;
            }

            if (stage.requirement.type === 'dialogue') {
                if (stage.success_dialogue) {
                    dialogueStore.startDialogue(stage.success_dialogue, updatedNpc.name);
                }
                if (stage.success_rewards) {
                    updatedPlayer = handleRewards(updatedPlayer, stage.success_rewards);
                }
                questStore.advanceQuestStage(quest.id);
                return { updatedNpc, updatedPlayer };
            }

            const { met, postCheckActions } = checkRequirement(stage.requirement, updatedPlayer, updatedNpc, globalNpcs);

            if (met) {
                updatedPlayer = postCheckActions.reduce((p, action) => action(p), updatedPlayer);
                
                if (stage.success_rewards) {
                    updatedPlayer = handleRewards(updatedPlayer, stage.success_rewards);
                }
                
                if (stage.success_dialogue) {
                    dialogueStore.startDialogue(stage.success_dialogue, updatedNpc.name);
                }

                if (currentStageIndex >= rankData.stages.length - 1) {
                    questStore.setQuestState(quest.id, 'COMPLETED');
                    updatedNpc.swordRank++;
                    messageStore.addMessage(`Your Sword Rank with ${updatedNpc.name} is now ${updatedNpc.swordRank}.`, ['World', 'Update']);
                    checkQuestTriggers();
                } else {
                    questStore.advanceQuestStage(quest.id);
                }
            } else {
                dialogueStore.startDialogue(stage.reminder_dialogue || ["You still have things to do."], updatedNpc.name);
            }
            break;
        }
        case 'COMPLETED': {
            messageStore.addMessage(`${updatedNpc.name} has nothing new to say.`, ['System']);
            break;
        }
    }

    return { updatedNpc, updatedPlayer };
}


export function fulfillGiftingOption(npc: NPC, player: Player, option: GiftingOption): { updatedNpc: NPC, updatedPlayer: Player } {
    let updatedNpc = JSON.parse(JSON.stringify(npc));
    
    const itemInInventory = player.inventory.find(i => i.itemId === option.itemId);
    if (!itemInInventory || itemInInventory.amount < option.quantity) {
        messageStore.addMessage(`You don't have enough ${option.itemId}.`, ['World', 'Error']);
        return { updatedNpc, updatedPlayer: player };
    }

    const affinityChange = option.value;
    updatedNpc.affinity += affinityChange;
    messageStore.addMessage(`[${updatedNpc.name}]: ${option.dialogue[0]}`, ['NPC']);

    if (updatedNpc.affinity >= 10 && updatedNpc.heartState !== 'READY_FOR_RANK_UP') {
        updatedNpc.heartState = 'READY_FOR_RANK_UP';
        messageStore.addMessage(`You feel your connection with ${updatedNpc.name} has deepened. You should Talk to them.`, ['World', 'Update']);
    }

    const updatedPlayer = removeItem(player, option.itemId, option.quantity);
    
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