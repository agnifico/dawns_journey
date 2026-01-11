import { get } from 'svelte/store';
import { questStore } from '$lib/stores/questStore';
import { playerStore } from '$lib/stores/playerStore';
import { npcStore } from '$lib/stores/npcStore';
import type { Requirement, Player, NPC, RequirementCondition } from '$lib/types';
import { removeItem } from './ItemService';

export function checkRequirement(
    requirement: Requirement,
    player: Player,
    npc: NPC | null, // The NPC context for the check
    globalNpcs: Record<string, NPC>,
    isStartRequirement: boolean = false // Flag to ignore snapshots
): { met: boolean; postCheckActions: ((p: Player) => Player)[] } {
    const postCheckActions: ((p: Player) => Player)[] = [];

    const checkCondition = (condition: RequirementCondition): boolean => {
        switch (condition.type) {
            case 'quest_state': {
                const allQuests = get(questStore).quests;
                const quest = allQuests[condition.questId];
                return quest ? quest.state === condition.state : false;
            }
            case 'dialogue': return true;
            case 'have_item': {
                const item = player.inventory.find(i => i.itemId === condition.itemId);
                return item ? item.amount >= condition.quantity : false;
            }
            case 'give_item': {
                const hasItem = player.inventory.find(i => i.itemId === condition.itemId && i.amount >= condition.quantity);
                if (hasItem) {
                    postCheckActions.push((p: Player) => removeItem(p, condition.itemId, condition.quantity));
                    return true;
                }
                return false;
            }
            case 'talk': return true;
            case 'kill': {
                const currentKills = player.killCounts[condition.enemyId] || 0;
                if (isStartRequirement || !npc) {
                    return currentKills >= condition.quantity;
                }
                const killsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.kill?.[condition.enemyId] || 0;
                return (currentKills - killsAtQuestStart) >= condition.quantity;
            }
            case 'win_against_npc': {
                const currentWins = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
                 if (isStartRequirement || !npc) {
                    return currentWins >= condition.quantity;
                }
                const winsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.win_against_npc?.[condition.npcId] || 0;
                return (currentWins - winsAtQuestStart) >= condition.quantity;
            }
            case 'lose_to_npc': {
                const currentLosses = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
                if (isStartRequirement || !npc) {
                    return currentLosses >= condition.quantity;
                }
                const lossesAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.lose_to_npc?.[condition.npcId] || 0;
                return (currentLosses - lossesAtQuestStart) >= condition.quantity;
            }
            case 'fight_npc': {
                const currentFights = player.combatHistory.filter(h => h.npcId === condition.npcId).length;
                if (isStartRequirement || !npc) {
                    return currentFights >= condition.quantity;
                }
                const fightsAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.fight_npc?.[condition.npcId] || 0;
                return (currentFights - fightsAtQuestStart) >= condition.quantity;
            }
            case 'counterpart_rank': {
                if (!npc) return false;
                return condition.rankType === 'heart' ? npc.heartRank >= condition.value : npc.swordRank >= condition.value;
            }
            case 'npc_rank': {
                const targetNpc = globalNpcs[condition.npcId];
                if (!targetNpc) return false;
                return condition.rankType === 'heart' ? targetNpc.heartRank >= condition.value : targetNpc.swordRank >= condition.value;
            }
            case 'finish_location_event': {
                const timing = condition.timing || 'history';
                const quantity = condition.quantity || 1;
                const currentCount = (player.locationEventHistory && player.locationEventHistory[condition.eventId]) || 0;

                if (timing === 'history') {
                    return currentCount >= quantity;
                } else { // timing === 'future'
                    if (isStartRequirement || !npc) {
                        // A 'future' check can't be a start requirement, so it's always false if checked that way.
                        return false;
                    }
                    const countAtQuestStart = npc.requirementSnapshot?.[npc.swordRank]?.finish_location_event?.[condition.eventId] || 0;
                    return (currentCount - countAtQuestStart) >= quantity;
                }
            }
            case 'have_tag': return player.worldTags.includes(condition.tag);
            case 'stat_check': return player.baseStats[condition.stat] >= condition.value;
            case 'element_exploration_level_check': return player.equipment.weapon_slots.some(w => w?.exploration?.some(e => e.name === condition.element && e.level >= condition.level));
            default: return false;
        }
    };

    if (!requirement) return { met: true, postCheckActions: [] };

    let met = false;
    if ('operator' in requirement) {
        if (requirement.operator === 'AND') {
            met = requirement.conditions.every(checkCondition);
        } else if (requirement.operator === 'OR') {
            met = requirement.conditions.some(checkCondition);
        }
    } else {
        met = checkCondition(requirement as RequirementCondition);
    }

    return { met, postCheckActions: met ? postCheckActions : [] };
}


export function checkQuestTriggers() {
    playerStore.update(player => {
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
        }
        return newPlayer;
    });
}