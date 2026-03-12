import type { NPC, Player, Requirement, Reward, GiftingOption, RankData, Quest } from '$lib/types';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { messageStore } from '$lib/stores/messageStore';
import { addItems, removeItemsByItemId } from './InventoryService';
import { get } from 'svelte/store';
import { playerStore } from '$lib/stores/playerStore';
import { questStore } from '$lib/stores/questStore';
import {
    checkRequirement,
    checkQuestTriggers,
    resolveActiveRankData,
    createRequirementSnapshot,
    findRankDataForQuest,
} from './QuestService';
import { revolut } from '$lib/stores/timeStore';
import { increaseFactionScore } from './FactionService';
import { toastStore } from '$lib/stores/toastStore';
import { notificationStore } from '$lib/stores/notificationStore';



// ---------------------------------------------------------------------------
// Reward handler
// ---------------------------------------------------------------------------

function handleRewards(player: Player, rewards: Reward[]): Player {
    let newPlayer = { ...player };
    for (const reward of rewards) {
        if (reward.type === 'item') {
            newPlayer = addItems(newPlayer, reward.itemId, reward.quantity);
        } else if (reward.type === 'world_resonance') {
            newPlayer.worldResonance = (newPlayer.worldResonance ?? 0) + reward.amount;
            toastStore.success(`World Resonance +${reward.amount}`);
            messageStore.addMessage(`+${reward.amount} World Resonance.`, ['World']);
        } else if (reward.type === 'tag') {
            if (!newPlayer.worldTags.includes(reward.tagId)) {
                newPlayer.worldTags.push(reward.tagId);
            }
        } else if (reward.type === 'tag_conditional') {
            // Conditional reward: only fires if the player has the specified tag.
            // Multiple tag_conditional entries can coexist — all matching ones fire.
            // Any non-conditional rewards in the array are always applied (baseline).
            // Example:
            //   { "type": "tag_conditional", "tag": "sided_with_solis_saints",
            //     "rewards": [{ "type": "item", "itemId": "holy_relic", "quantity": 1 }] }
            if (newPlayer.worldTags.includes(reward.tag)) {
                newPlayer = handleRewards(newPlayer, reward.rewards);
            }
        }
    }
    newPlayer = checkQuestTriggers(newPlayer);
    return newPlayer;
}


// ---------------------------------------------------------------------------
// Maxed-out dialogue cycling
// ---------------------------------------------------------------------------

function handleMaxedOutDialogue(npc: NPC, dialogueType: 'allRanksMaxed' | 'swordRankMaxed'): { updatedNpc: NPC, shouldReturn: boolean } {
    const dialogueKey = `${dialogueType}Dialogue`;
    const dialogueIndexKey = `${dialogueType}DialogueIndex`;

    const dialogue = npc[dialogueKey];
    if (!dialogue?.length) return { updatedNpc: npc, shouldReturn: false };

    const dialogueIndex = npc[dialogueIndexKey] || 0;
    dialogueStore.startDialogue(dialogue, npc.name);

    const newIndex = Math.min(dialogueIndex + 1, dialogue.length - 1);
    return { updatedNpc: { ...npc, [dialogueIndexKey]: newIndex }, shouldReturn: true };
}


// ---------------------------------------------------------------------------
// Stage cooldown helper
// ---------------------------------------------------------------------------

/**
 * Returns true if the stage has a cooldown that is currently blocking it.
 * A stage with `cooldown_revoluts: 3` requires 3 in-game days to pass from
 * when the stage became active (tracked via quest.stageCooldownSnapshot).
 */
function isStageCoolingDown(quest: Quest, stageIndex: number, stage: any): boolean {
    if (!stage.cooldown_revoluts) return false;
    const snapshotRevolut = quest.stageCooldownSnapshot?.[stageIndex];
    if (snapshotRevolut === undefined) return false; // snapshot not set yet = not blocking
    const currentRevolut = get(revolut);
    return currentRevolut < (snapshotRevolut + stage.cooldown_revoluts);
}

/**
 * Returns a human-readable reminder for a cooling-down stage.
 */
function getCooldownReminderDialogue(quest: Quest, stageIndex: number, stage: any): string[] {
    const snapshotRevolut = quest.stageCooldownSnapshot?.[stageIndex] ?? 0;
    const returnOnRevolut = snapshotRevolut + stage.cooldown_revoluts;
    const custom = stage.cooldown_dialogue;
    return custom ?? [`Come back in a few days. (Return on Revolut ${returnOnRevolut})`];
}


// ---------------------------------------------------------------------------
// Quest state handlers
// ---------------------------------------------------------------------------

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
        if (!firstStage) return { updatedNpc, updatedPlayer };

        questStore.setQuestState(quest.id, 'ACTIVE');

        // Snapshot all stage requirements at quest start.
        // Key is namespaced to avoid sword/heart rank collisions.
        const snapshotKey = `sword_${updatedNpc.swordRank}`;
        const snapshot = createRequirementSnapshot(updatedPlayer, rankData.stages.map(s => s.requirement));
        updatedNpc.requirementSnapshot = {
            ...updatedNpc.requirementSnapshot,
            [snapshotKey]: snapshot,
        };

        // If this stage has a cooldown, record the current revolut immediately
        if (firstStage.cooldown_revoluts) {
            updatedNpc = snapshotStageCooldown(quest.id, 0, updatedNpc);
        }

        if (firstStage.requirement.type === 'dialogue') {
            const intro = firstStage.intro_dialogue || ['A new opportunity awaits.'];
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
            dialogueStore.startDialogue(firstStage.intro_dialogue || ['I have a new task for you.'], npc.name);
        }

        return { updatedNpc, updatedPlayer };
    },

    ACTIVE: (npc, player, globalNpcs, rankData, quest) => {
        console.log('[ACTIVE]', npc.id, 'stage:', quest.currentStage, 'state:', quest.state, 'stage data:', rankData.stages[quest.currentStage]);
        let updatedNpc = { ...npc };
        let updatedPlayer = { ...player };
        const currentStageIndex = quest.currentStage;
        const stage = rankData.stages[currentStageIndex];

        if (!stage) {
            messageStore.addMessage(`${npc.name} seems to be at a loss for words.`, ['System']);
            return { updatedNpc, updatedPlayer };
        }

        // Stage cooldown check — must happen before requirement check
        if (isStageCoolingDown(quest, currentStageIndex, stage)) {
            const cooldownLines = getCooldownReminderDialogue(quest, currentStageIndex, stage);
            dialogueStore.startDialogue(cooldownLines, npc.name);
            return { updatedNpc, updatedPlayer };
        }

        // Snapshot the cooldown start for this stage if not already set
        // (handles the case where a player talks to the NPC for the first time on this stage)
        if (stage.cooldown_revoluts && quest.stageCooldownSnapshot?.[currentStageIndex] === undefined) {
            updatedNpc = snapshotStageCooldown(quest.id, currentStageIndex, updatedNpc);
            // Show the cooldown message immediately on first visit
            const cooldownLines = getCooldownReminderDialogue(
                { ...quest, stageCooldownSnapshot: { ...quest.stageCooldownSnapshot, [currentStageIndex]: get(revolut) } },
                currentStageIndex,
                stage
            );
            dialogueStore.startDialogue(cooldownLines, npc.name);
            return { updatedNpc, updatedPlayer };
        }

        if (stage.requirement.type === 'dialogue') {
            if (stage.success_dialogue?.length) {
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
                // Snapshot cooldown for the next stage if it has one
                const nextStage = rankData.stages[currentStageIndex + 1];
                if (nextStage?.cooldown_revoluts) {
                    updatedNpc = snapshotStageCooldown(quest.id, currentStageIndex + 1, updatedNpc);
                }
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
                if (nextStage?.intro_dialogue) {
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
                // Snapshot cooldown for next stage if needed
                const nextStage = rankData.stages[currentStageIndex + 1];
                if (nextStage?.cooldown_revoluts) {
                    updatedNpc = snapshotStageCooldown(quest.id, currentStageIndex + 1, updatedNpc);
                }
            }
        } else {
            dialogueStore.startDialogue(stage.reminder_dialogue || ['You still have things to do.'], npc.name);
        }

        return { updatedNpc, updatedPlayer };
    },

    REPORT_PENDING: (npc, player, globalNpcs, rankData, quest) => {
        let updatedPlayer = { ...player };
        const finalState = quest.finalState;
        // Use currentStage for rewards, not always the last stage
        const pendingStage = rankData.stages[quest.currentStage] ?? rankData.stages[rankData.stages.length - 1];

        if (finalState === 'COMPLETED') {
            questStore.setQuestState(quest.id, 'COMPLETED');
            messageStore.addMessage(`You reported to ${npc.name}. Quest "${quest.title}" completed!`, ['World', 'NPC']);
            toastStore.success('Sword Rank Quest Complete!');
            if (pendingStage?.success_rewards) updatedPlayer = handleRewards(updatedPlayer, pendingStage.success_rewards);
            const dialogue = pendingStage?.success_dialogue?.length
                ? pendingStage.success_dialogue
                : [`Thank you for your report on "${quest.title}". Well done.`];
            dialogueStore.startDialogue(dialogue, npc.name);
        } else if (finalState === 'FAILED') {
            questStore.setQuestState(quest.id, 'FAILED');
            messageStore.addMessage(`You reported to ${npc.name}. Quest "${quest.title}" failed.`, ['World', 'NPC']);
            toastStore.info('Sword Rank Quest: Marked Failed.');
            const dialogue = pendingStage?.unavailable_dialogue?.length
                ? pendingStage.unavailable_dialogue
                : [`You failed to complete "${quest.title}".`];
            dialogueStore.startDialogue(dialogue, npc.name);
        }

        return { updatedNpc: npc, updatedPlayer };
    },

    COMPLETED: (npc, player, globalNpcs, rankData, quest) => {
        let updatedNpc = { ...npc };
        let updatedPlayer = { ...player };
        // Only increment swordRank once per completed quest (guard: current rank still points at this quest's slot)
        const questSlotIndex = npc.swordRanks.findIndex(slot => {
            if ('questId' in slot) return (slot as any).questId === quest.id;
            if ('variants' in slot) return (slot as any).variants.some((v: any) => v.questId === quest.id);
            return false;
        });
        if (updatedNpc.swordRank === questSlotIndex) {
            const finalStage = rankData.stages[rankData.stages.length - 1];
            if (finalStage?.success_dialogue?.length) {
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
    },
};


// ---------------------------------------------------------------------------
// Stage cooldown snapshot helper (writes to questStore)
// ---------------------------------------------------------------------------

/**
 * Records the current revolut as the start time for a stage cooldown.
 * Stores it on the quest in questStore so it persists in saves.
 * Returns the npc unchanged (cooldown state lives on the quest, not the npc).
 */
function snapshotStageCooldown(questId: string, stageIndex: number, npc: NPC): NPC {
    const currentRevolut = get(revolut);
    questStore.update(s => {
        const quest = s.quests[questId];
        if (!quest) return s;
        return {
            ...s,
            quests: {
                ...s.quests,
                [questId]: {
                    ...quest,
                    stageCooldownSnapshot: {
                        ...(quest.stageCooldownSnapshot ?? {}),
                        [stageIndex]: currentRevolut,
                    },
                },
            },
        };
    });
    return npc;
}


// ---------------------------------------------------------------------------
// handleTalk — main entry point, now uses resolveActiveRankData
// ---------------------------------------------------------------------------

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

                // Guard: only start dialogue if there are lines to show
                if (heartRankData.rank_up_dialogue?.length) {
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

    // --- Sword Rank quest — uses resolveActiveRankData for alternatives support ---
    const rankData = resolveActiveRankData(updatedNpc, updatedPlayer, globalNpcs);

    if (!rankData?.questId) {
        messageStore.addMessage(`${updatedNpc.name} has nothing new to say.`, ['System']);
        return { updatedNpc, updatedPlayer };
    }

    const quest = allQuests[rankData.questId];

    if (!quest) {
        messageStore.addMessage(`Error: Quest data for ${rankData.questId} not found.`, ['System', 'Error']);
        return { updatedNpc, updatedPlayer };
    }

    const handler = questStateHandlers[quest.state];
    if (handler) {
        return handler(updatedNpc, updatedPlayer, globalNpcs, rankData, quest);
    }

    return { updatedNpc, updatedPlayer };
}


// ---------------------------------------------------------------------------
// fulfillGiftingOption — unchanged
// ---------------------------------------------------------------------------

export function fulfillGiftingOption(npc: NPC, player: Player, option: GiftingOption): { updatedNpc: NPC, updatedPlayer: Player } {
    let updatedNpc = JSON.parse(JSON.stringify(npc));

    const itemInInventory = player.inventory.find(i => i.id === option.itemId);
    if (!itemInInventory || itemInInventory.amount < option.quantity) {
        messageStore.addMessage(`You don't have enough ${option.itemId}.`, ['World', 'Error']);
        return { updatedNpc, updatedPlayer: player };
    }

    updatedNpc.affinity += option.value;
    messageStore.addMessage(`[${updatedNpc.name}]: ${option.dialogue[0]}`, ['NPC']);

    if (updatedNpc.affinity >= 10 && updatedNpc.heartState !== 'READY_FOR_RANK_UP') {
        updatedNpc.heartState = 'READY_FOR_RANK_UP';
        toastStore.info(`You should talk to ${updatedNpc.name}.`);
        messageStore.addMessage(`You feel your connection with ${updatedNpc.name} has deepened. You should Talk to them.`, ['World', 'NPC']);
    }

    const updatedPlayer = removeItemsByItemId(player, option.itemId, option.quantity);
    return { updatedNpc, updatedPlayer };
}


// ---------------------------------------------------------------------------
// getNpcCombatStats — unchanged
// ---------------------------------------------------------------------------

export function getNpcCombatStats(npc: NPC): Partial<Player['baseStats']> {
    const stats: Partial<Player['baseStats']> = { ...npc.baseStats };
    const effectiveRank = Math.max(npc.heartRank, npc.swordRank);
    npc.statGrowth.forEach(growth => {
        if (effectiveRank >= growth.level) Object.assign(stats, growth.stats);
    });
    return stats;
}


// ---------------------------------------------------------------------------
// selectBattleAftermath — exported so combat resolution can use it
// Evaluates the requirement field on each aftermath and returns the first match.
// ---------------------------------------------------------------------------

export function selectBattleAftermath(
    npc: NPC,
    player: Player,
    globalNpcs: Record<string, NPC>,
    outcome: 'win' | 'lose'
): { value?: number; dialogue: string[] } | null {
    const rankAftermaths = npc.battleAftermathsBySwordRank?.find(a => a.rank === npc.swordRank);
    if (!rankAftermaths) return null;

    const candidates = rankAftermaths.aftermaths.filter(a => a.outcome === outcome);

    for (const aftermath of candidates) {
        if (!aftermath.requirement) {
            // No requirement = unconditional, always applies
            return aftermath;
        }
        const { met } = checkRequirement(aftermath.requirement, player, npc, globalNpcs, true);
        if (met) return aftermath;
    }

    return null;
}