import { get } from 'svelte/store';
import { questStore } from '$lib/stores/questStore';
import type { Requirement, Player, NPC, RequirementCondition } from '$lib/types';
import { removeItemsByItemId, hasItem } from './InventoryService';

type RequirementCheck = (
    condition: any,
    player: Player,
    npc: NPC | null,
    globalNpcs: Record<string, NPC>,
    isStartRequirement: boolean,
    postCheckActions: ((p: Player) => Player)[]
) => boolean;

const requirementCheckers: Record<string, RequirementCheck> = {
    quest_state: (condition, player) => {
        const allQuests = get(questStore).quests;
        const quest = allQuests[condition.questId];
        return quest ? quest.state === condition.state : false;
    },
    dialogue: () => true,
    talk: () => true,
    have_item: (condition, player) => {
        return hasItem(player.inventory, condition.itemId, condition.quantity);
    },
    give_item: (condition, player, npc, globalNpcs, isStartRequirement, postCheckActions) => {
        if (hasItem(player.inventory, condition.itemId, condition.quantity)) {
            postCheckActions.push((p: Player) => removeItemsByItemId(p, condition.itemId, condition.quantity));
            return true;
        }
        return false;
    },
    kill: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentKills = player.killCounts[condition.enemyId] || 0;
        if (isStartRequirement || !npc) {
            return currentKills >= condition.quantity;
        }
        const killsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.kill?.[condition.enemyId] || 0;
        return (currentKills - killsAtQuestStart) >= condition.quantity;
    },
    win_against_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentWins = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
        if (isStartRequirement || !npc) {
            return currentWins >= condition.quantity;
        }
        const winsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.win_against_npc?.[condition.npcId] || 0;
        return (currentWins - winsAtQuestStart) >= condition.quantity;
    },
    lose_to_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentLosses = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
        if (isStartRequirement || !npc) {
            return currentLosses >= condition.quantity;
        }
        const lossesAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.lose_to_npc?.[condition.npcId] || 0;
        return (currentLosses - lossesAtQuestStart) >= condition.quantity;
    },
    fight_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentFights = player.combatHistory.filter(h => h.npcId === condition.npcId).length;
        if (isStartRequirement || !npc) {
            return currentFights >= condition.quantity;
        }
        const fightsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.fight_npc?.[condition.npcId] || 0;
        return (currentFights - fightsAtQuestStart) >= condition.quantity;
    },
    counterpart_rank: (condition, player, npc) => {
        if (!npc) return false;
        return condition.rankType === 'heart' ? npc.heartRank >= condition.value : npc.swordRank >= condition.value;
    },
    npc_rank: (condition, player, npc, globalNpcs) => {
        const targetNpc = globalNpcs[condition.npcId];
        if (!targetNpc) return false;
        return condition.rankType === 'heart' ? targetNpc.heartRank >= condition.value : targetNpc.swordRank >= condition.value;
    },
    finish_location_event: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const timing = condition.timing || 'history';
        const quantity = condition.quantity || 1;
        const currentCount = (player.locationEventHistory && player.locationEventHistory[condition.eventId]) || 0;

        if (timing === 'history') {
            return currentCount >= quantity;
        } else { // timing === 'future'
            if (isStartRequirement || !npc) {
                return false;
            }
            const countAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.finish_location_event?.[condition.eventId] || 0;
            return (currentCount - countAtQuestStart) >= quantity;
        }
    },
    have_tag: (condition, player) => player.worldTags.includes(condition.tag),

    // NEW: true when the player does NOT have the tag — use to lock quests after a faction choice
    not_tag: (condition, player) => !player.worldTags.includes(condition.tag),

    // NEW: true when player's faction rank >= minRank
    faction_rank: (condition, player) => {
        const factionData = player.factions[condition.factionId];
        if (!factionData) return false;
        return factionData.rank >= condition.minRank;
    },

    // NEW: true when player's raw faction score >= minScore (finer-grained than rank)
    faction_score: (condition, player) => {
        const factionData = player.factions[condition.factionId];
        if (!factionData) return false;
        return factionData.score >= condition.minScore;
    },

    stat_check: (condition, player) => player.baseStats[condition.stat] >= condition.value,
    element_exploration_level_check: (condition, player) => player.equipment.weapon_slots.some(w => w?.exploration?.some(e => e.name === condition.element && e.level >= condition.level)),
};

export function checkRequirement(
    requirement: Requirement,
    player: Player,
    npc: NPC | null,
    globalNpcs: Record<string, NPC>,
    isStartRequirement: boolean = false
): { met: boolean; postCheckActions: ((p: Player) => Player)[] } {
    const postCheckActions: ((p: Player) => Player)[] = [];

    const checkCondition = (condition: RequirementCondition): boolean => {
        const checker = requirementCheckers[condition.type];
        if (checker) {
            return checker(condition, player, npc, globalNpcs, isStartRequirement, postCheckActions);
        }
        console.warn(`[QuestService] Unknown requirement type: ${(condition as any).type}`);
        return false;
    };

    const checkRequirementNode = (req: Requirement): boolean => {
        if (!req) return true;

        if ('operator' in req) {
            if (req.operator === 'AND') {
                return (req as any).conditions.every((c: RequirementCondition) => checkCondition(c));
            }
            if (req.operator === 'OR') {
                return (req as any).conditions.some((c: RequirementCondition) => checkCondition(c));
            }
            // NEW: NOT operator — wraps a single child requirement and inverts it
            if (req.operator === 'NOT') {
                const inner = checkRequirementNode((req as any).condition);
                return !inner;
            }
        }

        return checkCondition(requirement as RequirementCondition);
    };

    if (!requirement) return { met: true, postCheckActions: [] };

    const met = checkRequirementNode(requirement);
    return { met, postCheckActions: met ? postCheckActions : [] };
}


import { npcStore } from '$lib/stores/npcStore';

export function checkQuestTriggers(player: Player): Player {
    let newPlayer = { ...player };
    const allQuests = get(questStore).quests;
    const globalNpcs = get(npcStore).globalNpcs;

    for (const questId in allQuests) {
        const quest = allQuests[questId];
        if (quest.state === 'LOCKED' && quest.startRequirement) {
            const giverNpc = globalNpcs[quest.giver] || null;

            const { met } = checkRequirement(quest.startRequirement, newPlayer, giverNpc, globalNpcs, true);

            if (met) {
                const rankData = giverNpc?.swordRanks.find(r => r.questId === questId);
                if (rankData?.autoStart) {
                    questStore.setQuestState(quest.id, 'ACTIVE');

                    // Consume the "can_start" tag
                    const conditions = 'conditions' in rankData.startRequirement ? rankData.startRequirement.conditions : [rankData.startRequirement];
                    const startTagCondition = conditions.find(c => c.type === 'have_tag' && c.tag.startsWith('can_start_'));
                    if (startTagCondition && 'tag' in startTagCondition) {
                        newPlayer.worldTags = newPlayer.worldTags.filter(t => t !== startTagCondition.tag);
                    }
                } else {
                    questStore.setQuestState(quest.id, 'AVAILABLE');
                }
            }
        }

        // NEW: auto-fail ACTIVE quests whose startRequirement is now broken by a faction choice.
        // Use case: player sided with Saints, Shadowhand quests that require not_tag('sided_with_saints')
        // will be caught here and failed automatically.
        if (quest.state === 'ACTIVE' && quest.startRequirement) {
            const giverNpc = globalNpcs[quest.giver] || null;
            // Only re-check if the requirement contains not_tag or faction conditions —
            // we don't want to fail quests for unrelated reasons.
            if (requirementContainsFactionCondition(quest.startRequirement)) {
                const { met } = checkRequirement(quest.startRequirement, newPlayer, giverNpc, globalNpcs, true);
                if (!met) {
                    questStore.setQuestState(quest.id, 'FAILED');
                }
            }
        }
    }
    return newPlayer;
}

/**
 * Returns true if a requirement tree contains any faction-sensitive conditions.
 * Used to decide whether to re-evaluate an active quest after a faction choice.
 */
function requirementContainsFactionCondition(req: Requirement): boolean {
    if (!req) return false;
    if ('operator' in req) {
        if (req.operator === 'NOT') {
            return requirementContainsFactionCondition((req as any).condition);
        }
        return (req as any).conditions.some((c: Requirement) => requirementContainsFactionCondition(c));
    }
    const type = (req as RequirementCondition).type;
    return type === 'not_tag' || type === 'faction_rank' || type === 'faction_score';
}