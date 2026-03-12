import { get } from 'svelte/store';
import { questStore } from '$lib/stores/questStore';
import { revolut, phase } from '$lib/stores/timeStore';
import { seasonStore } from '$lib/stores/seasonStore';
import type { Requirement, Player, NPC, RequirementCondition, RankData } from '$lib/types';
import { removeItemsByItemId, hasItem } from './InventoryService';
import { npcStore } from '$lib/stores/npcStore';
import { toastStore } from '$lib/stores/toastStore';

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
        // toastStore.warning(condition.itemId);
        if (hasItem(player.inventory, condition.itemId, condition.quantity)) {
            postCheckActions.push((p: Player) => removeItemsByItemId(p, condition.itemId, condition.quantity));
            return true;
        }
        return false;
    },
    kill: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentKills = player.killCounts[condition.enemyId] || 0;
        if (isStartRequirement || !npc) return currentKills >= condition.quantity;
        const killsAtQuestStart = npc.requirementSnapshot?.[`sword_${npc.swordRank}`]?.kill?.[condition.enemyId] || 0;
        return (currentKills - killsAtQuestStart) >= condition.quantity;
    },
    win_against_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentWins = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
        if (isStartRequirement || !npc) return currentWins >= condition.quantity;
        const winsAtQuestStart = npc.requirementSnapshot?.[`sword_${npc.swordRank}`]?.win_against_npc?.[condition.npcId] || 0;
        return (currentWins - winsAtQuestStart) >= condition.quantity;
    },
    lose_to_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentLosses = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
        if (isStartRequirement || !npc) return currentLosses >= condition.quantity;
        const lossesAtQuestStart = npc.requirementSnapshot?.[`sword_${npc.swordRank}`]?.lose_to_npc?.[condition.npcId] || 0;
        return (currentLosses - lossesAtQuestStart) >= condition.quantity;
    },
    fight_npc: (condition, player, npc, globalNpcs, isStartRequirement) => {
        const currentFights = player.combatHistory.filter(h => h.npcId === condition.npcId).length;
        if (isStartRequirement || !npc) return currentFights >= condition.quantity;
        const fightsAtQuestStart = npc.requirementSnapshot?.[`sword_${npc.swordRank}`]?.fight_npc?.[condition.npcId] || 0;
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
        if (timing === 'history') return currentCount >= quantity;
        if (isStartRequirement || !npc) return false;
        const countAtQuestStart = npc.requirementSnapshot?.[`sword_${npc.swordRank}`]?.finish_location_event?.[condition.eventId] || 0;
        return (currentCount - countAtQuestStart) >= quantity;
    },
    have_tag: (condition, player) => player.worldTags.includes(condition.tag),
    not_tag: (condition, player) => !player.worldTags.includes(condition.tag),
    faction_rank: (condition, player) => {
        const factionData = player.factions[condition.factionId];
        if (!factionData) return false;
        return factionData.rank >= condition.minRank;
    },
    faction_score: (condition, player) => {
        const factionData = player.factions[condition.factionId];
        if (!factionData) return false;
        return factionData.score >= condition.minScore;
    },
    stat_check: (condition, player) => player.baseStats[condition.stat] >= condition.value,
    element_exploration_level_check: (condition, player) =>
        player.equipment.weapon_slots.some(w => w?.exploration?.some(e => e.name === condition.element && e.level >= condition.level)),

    // --- NEW ---

    /**
     * world_resonance: player's world resonance >= minValue
     * { "type": "world_resonance", "minValue": 50 }
     */
    world_resonance: (condition, player) => (player.worldResonance ?? 0) >= condition.minValue,

    /**
     * npc_affinity: target NPC's raw affinity score >= minValue
     * { "type": "npc_affinity", "npcId": "sylvie", "minValue": 5 }
     */
    npc_affinity: (condition, player, npc, globalNpcs) => {
        const targetNpc = globalNpcs[condition.npcId];
        if (!targetNpc) return false;
        return targetNpc.affinity >= condition.minValue;
    },

    /**
     * phase: time-of-day must match. Values: "Dawnrise" | "Duskfall"
     * { "type": "phase", "value": "Dawnrise" }
     */
    phase: (condition) => get(phase) === condition.value,

    /**
     * season: current season must match. Values: "Spring" | "Summer" | "Autumn" | "Winter"
     * { "type": "season", "value": "Winter" }
     */
    season: (condition) => get(seasonStore) === condition.value,

    /**
     * revolut_min: the game must have reached at least this revolut (absolute day gate).
     * { "type": "revolut_min", "value": 10 }
     */
    revolut_min: (condition) => get(revolut) >= condition.value,

    /**
     * cooldown_revoluts: used internally for stage-level cooldowns.
     * Not authored directly — NpcService injects this from a stage's `cooldown_revoluts` field.
     * { "type": "cooldown_revoluts", "snapshotRevolut": 5, "cooldown": 3 }
     */
    cooldown_revoluts: (condition) => get(revolut) >= (condition.snapshotRevolut + condition.cooldown),
};


// ---------------------------------------------------------------------------
// checkRequirement — fully recursive AND/OR/NOT evaluation
// ---------------------------------------------------------------------------

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

    // Recursive — correctly handles nested AND inside OR, NOT wrapping AND, etc.
    const checkNode = (req: Requirement): boolean => {
        if (!req) return true;
        if ('operator' in req) {
            if (req.operator === 'AND') return (req as any).conditions.every((c: Requirement) => checkNode(c));
            if (req.operator === 'OR')  return (req as any).conditions.some((c: Requirement)  => checkNode(c));
            if (req.operator === 'NOT') return !checkNode((req as any).condition);
        }
        return checkCondition(req as RequirementCondition);
    };

    if (!requirement) return { met: true, postCheckActions: [] };
    const met = checkNode(requirement);
    return { met, postCheckActions: met ? postCheckActions : [] };
}


// ---------------------------------------------------------------------------
// extractLeafConditions — flattens any requirement tree to leaf conditions
// Used by createRequirementSnapshot and checkQuestTriggers
// ---------------------------------------------------------------------------

export function extractLeafConditions(req: Requirement): RequirementCondition[] {
    if (!req) return [];
    if ('operator' in req) {
        if (req.operator === 'NOT') return extractLeafConditions((req as any).condition);
        return (req as any).conditions.flatMap((c: Requirement) => extractLeafConditions(c));
    }
    return [req as RequirementCondition];
}


// ---------------------------------------------------------------------------
// createRequirementSnapshot — exported, now uses extractLeafConditions
// ---------------------------------------------------------------------------

export function createRequirementSnapshot(player: Player, requirements: Requirement[]): any {
    const snapshot = {
        kill: {} as Record<string, number>,
        win_against_npc: {} as Record<string, number>,
        lose_to_npc: {} as Record<string, number>,
        fight_npc: {} as Record<string, number>,
        finish_location_event: {} as Record<string, number>,
    };

    const allConditions = requirements.flatMap(r => extractLeafConditions(r));

    for (const condition of allConditions) {
        if (condition.type === 'kill') {
            snapshot.kill[(condition as any).enemyId] = player.killCounts[(condition as any).enemyId] || 0;
        } else if (condition.type === 'win_against_npc') {
            snapshot.win_against_npc[(condition as any).npcId] =
                player.combatHistory.filter(h => h.npcId === (condition as any).npcId && h.outcome === 'win').length;
        } else if (condition.type === 'lose_to_npc') {
            snapshot.lose_to_npc[(condition as any).npcId] =
                player.combatHistory.filter(h => h.npcId === (condition as any).npcId && h.outcome === 'lose').length;
        } else if (condition.type === 'fight_npc') {
            snapshot.fight_npc[(condition as any).npcId] =
                player.combatHistory.filter(h => h.npcId === (condition as any).npcId).length;
        } else if (condition.type === 'finish_location_event' && (condition as any).timing === 'future') {
            snapshot.finish_location_event[(condition as any).eventId] =
                (player.locationEventHistory?.[(condition as any).eventId]) || 0;
        }
    }

    return snapshot;
}


// ---------------------------------------------------------------------------
// resolveActiveRankData — alternatives system core
// ---------------------------------------------------------------------------

/**
 * Resolves which RankData to use for the NPC's current sword rank.
 *
 * Each swordRanks slot is now one of:
 *   - RankData (plain object with questId) — legacy, unchanged
 *   - { variants: RankData[] } — multiple alternatives, evaluated top-to-bottom
 *
 * For variant slots, the first alternative whose startRequirement is met wins.
 * The last variant should have no startRequirement to serve as the unconditional fallback.
 */
export function resolveActiveRankData(
    npc: NPC,
    player: Player,
    globalNpcs: Record<string, NPC>
): RankData | null {
    const slot = npc.swordRanks[npc.swordRank];
    if (!slot) return null;

    if ('questId' in slot) {
        return slot as RankData;
    }

    if ('variants' in slot) {
        const variants = (slot as any).variants as RankData[];
        for (const variant of variants) {
            if (!variant.startRequirement) return variant; // unconditional fallback
            const { met } = checkRequirement(variant.startRequirement, player, npc, globalNpcs, true);
            if (met) return variant;
        }
        // Nothing matched — return last as final fallback
        return variants[variants.length - 1] ?? null;
    }

    return null;
}


/**
 * Searches all rank slots (flat and variant) for a RankData with the given questId.
 * Checks swordRanks and heartRanks. Used when we need to find rankData without
 * knowing current player state (e.g. checkQuestTriggers, loadNpcs).
 */
export function findRankDataForQuest(npc: NPC | null, questId: string): RankData | null {
    if (!npc) return null;

    const searchSlots = (slots: any[]): RankData | null => {
        for (const slot of slots) {
            if ('questId' in slot && slot.questId === questId) return slot as RankData;
            if ('variants' in slot) {
                const found = slot.variants.find((v: any) => v.questId === questId);
                if (found) return found;
            }
        }
        return null;
    };

    return searchSlots(npc.swordRanks) ?? searchSlots(npc.heartRanks);
}


// ---------------------------------------------------------------------------
// checkQuestTriggers — uses findRankDataForQuest for alternatives support
// ---------------------------------------------------------------------------



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
                const rankData = findRankDataForQuest(giverNpc, questId);

                if (rankData?.autoStart) {
                    questStore.setQuestState(quest.id, 'ACTIVE');
                    // Consume the "can_start_" tag if present
                    const conditions = rankData.startRequirement ? extractLeafConditions(rankData.startRequirement) : [];
                    const startTagCondition = conditions.find(
                        c => c.type === 'have_tag' && (c as any).tag?.startsWith('can_start_')
                    );
                    if (startTagCondition) {
                        newPlayer.worldTags = newPlayer.worldTags.filter(t => t !== (startTagCondition as any).tag);
                    }
                } else {
                    questStore.setQuestState(quest.id, 'AVAILABLE');
                }
            }
        }

        // Auto-fail ACTIVE quests whose faction/tag conditions are now broken
        if (quest.state === 'ACTIVE' && quest.startRequirement) {
            const giverNpc = globalNpcs[quest.giver] || null;
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

function requirementContainsFactionCondition(req: Requirement): boolean {
    if (!req) return false;
    if ('operator' in req) {
        if (req.operator === 'NOT') return requirementContainsFactionCondition((req as any).condition);
        return (req as any).conditions.some((c: Requirement) => requirementContainsFactionCondition(c));
    }
    const type = (req as RequirementCondition).type;
    return type === 'not_tag' || type === 'faction_rank' || type === 'faction_score';
}