import type { NPC, Player, Requirement, RequirementCondition } from '$lib/types';
import { messageStore } from '$lib/stores/messageStore';

// ---  PRIVATE: Requirement Checking ---
function checkRequirement(
    requirement: Requirement,
    player: Player,
    npc: NPC,
    globalNpcs: Record<string, NPC>
): boolean {
    const checkCondition = (condition: RequirementCondition): boolean => {
        switch (condition.type) {
            case 'have_item': {
                const item = player.inventory.find(i => i.itemId === condition.itemId);
                return item ? item.amount >= condition.quantity : false;
            }
            case 'kill': {
                const killsAtQuestStart = npc.requirementSnapshot?.kill?.[condition.enemyId] || 0;
                const currentKills = player.killCounts[condition.enemyId] || 0;
                return (currentKills - killsAtQuestStart) >= condition.quantity;
            }
            case 'win_against_npc': {
                const winsAtQuestStart = npc.requirementSnapshot?.win_against_npc?.[condition.npcId] || 0;
                const currentWins = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
                return (currentWins - winsAtQuestStart) >= condition.quantity;
            }
            case 'lose_to_npc': {
                const lossesAtQuestStart = npc.requirementSnapshot?.lose_to_npc?.[condition.npcId] || 0;
                const currentLosses = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
                return (currentLosses - lossesAtQuestStart) >= condition.quantity;
            }
            case 'counterpart_rank': {
                if (condition.rankType === 'heart') {
                    return npc.heartRank >= condition.value;
                } else {
                    return npc.swordRank >= condition.value;
                }
            }
            case 'npc_rank': {
                const targetNpc = globalNpcs[condition.npcId];
                if (!targetNpc) return false;
                if (condition.rankType === 'heart') {
                    return targetNpc.heartRank >= condition.value;
                } else {
                    return targetNpc.swordRank >= condition.value;
                }
            }
            default:
                return false;
        }
    };

    if ('operator' in requirement) {
        if (requirement.operator === 'AND') {
            return requirement.conditions.every(checkCondition);
        }
        if (requirement.operator === 'OR') {
            return requirement.conditions.some(checkCondition);
        }
    }
    return checkCondition(requirement as RequirementCondition);
}

function createRequirementSnapshot(player: Player, requirement: Requirement): any {
    const snapshot = {
        kill: {},
        win_against_npc: {},
        lose_to_npc: {},
    };

    const conditions = 'conditions' in requirement ? requirement.conditions : [requirement];

    for (const condition of conditions) {
        if (condition.type === 'kill') {
            snapshot.kill[condition.enemyId] = player.killCounts[condition.enemyId] || 0;
        } else if (condition.type === 'win_against_npc') {
            snapshot.win_against_npc[condition.npcId] = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'win').length;
        } else if (condition.type === 'lose_to_npc') {
            snapshot.lose_to_npc[condition.npcId] = player.combatHistory.filter(h => h.npcId === condition.npcId && h.outcome === 'lose').length;
        }
    }
    return snapshot;
}


// --- PUBLIC API for NPC interactions ---

export function handleTalk(npc: NPC, player: Player, globalNpcs: Record<string, NPC>): { updatedNpc: NPC, updatedPlayer: Player } {
    const rankData = npc.swordRanks[npc.swordRank];
    if (!rankData) {
        messageStore.addMessage(`[${npc.name}]: I have nothing more to say to you.`, ['NPC']);
        return { updatedNpc: npc, updatedPlayer: player };
    }

    if (npc.swordState === 'NOT_STARTED') {
        npc.swordState = 'IN_PROGRESS';
        if (rankData.requirement) {
            npc.requirementSnapshot = createRequirementSnapshot(player, rankData.requirement);
        }
        messageStore.addMessage(`[${npc.name}]: ${rankData.intro_dialogue[0]}`, ['NPC']);
    } else if (npc.swordState === 'IN_PROGRESS') {
        const requirementMet = rankData.requirement ? checkRequirement(rankData.requirement, player, npc, globalNpcs) : false;
        if (requirementMet) {
            npc.swordState = 'NOT_STARTED';
            npc.swordRank++;
            npc.requirementSnapshot = {}; // Clear snapshot
            messageStore.addMessage(`[${npc.name}]: ${rankData.success_dialogue[0]}`, ['NPC']);
            messageStore.addMessage(`Your Sword Rank with ${npc.name} is now ${npc.swordRank}.`, ['World', 'Update']);
            // TODO: Handle rewards
        } else {
            messageStore.addMessage(`[${npc.name}]: ${rankData.reminder_dialogue[0]}`, ['NPC']);
        }
    }
    return { updatedNpc: npc, updatedPlayer: player };
}

export function handleConnect(npc: NPC, player: Player, globalNpcs: Record<string, NPC>): { updatedNpc: NPC, updatedPlayer: Player } {
    const rankData = npc.heartRanks[npc.heartRank];
    if (!rankData) {
        messageStore.addMessage(`[${npc.name}]: I have nothing more to share with you.`, ['NPC']);
        return { updatedNpc: npc, updatedPlayer: player };
    }

    const requirementMet = rankData.requirement ? checkRequirement(rankData.requirement, player, npc, globalNpcs) : false;
    const affinityMet = npc.affinity >= 10;

    if (npc.heartState === 'READY_FOR_RANK_UP' || requirementMet || affinityMet) {
        npc.heartState = 'NOT_STARTED';
        npc.heartRank++;
        npc.requirementSnapshot = {}; // Clear snapshot
        if (affinityMet && !requirementMet) npc.affinity -= 10;
        messageStore.addMessage(`[${npc.name}]: ${rankData.success_dialogue[0]}`, ['NPC']);
        messageStore.addMessage(`Your Heart Rank with ${npc.name} is now ${npc.heartRank}.`, ['World', 'Update']);
        // TODO: Handle rewards
    } else if (npc.heartState === 'NOT_STARTED') {
        npc.heartState = 'IN_PROGRESS';
        if (rankData.requirement) {
            npc.requirementSnapshot = createRequirementSnapshot(player, rankData.requirement);
        }
        messageStore.addMessage(`[${npc.name}]: ${rankData.intro_dialogue[0]}`, ['NPC']);
    } else {
        messageStore.addMessage(`[${npc.name}]: ${rankData.reminder_dialogue[0]}`, ['NPC']);
    }
    return { updatedNpc: npc, updatedPlayer: player };
}

export function handleGiveItem(npc: NPC, player: Player, itemId: string, quantity: number): { updatedNpc: NPC, updatedPlayer: Player } {
    console.log(`[NpcService.handleGiveItem] 1. Received call to give ${quantity}x ${itemId} to ${npc.name}`);
    
    const updatedNpc = JSON.parse(JSON.stringify(npc));
    const heartRank = updatedNpc.heartRank;
    console.log(`[NpcService.handleGiveItem] 2. Current Heart Rank: ${heartRank}`);

    const preferencesForRank = updatedNpc.itemPreferencesByHeartRank.find(p => p.rank === heartRank);
    console.log(`[NpcService.handleGiveItem] 3. Found preferences object for rank ${heartRank}:`, preferencesForRank);

    const preferences = preferencesForRank?.preferences || [];
    const itemPref = preferences.find(p => p.itemId === itemId);
    console.log(`[NpcService.handleGiveItem] 4. Found specific preference for item ${itemId}:`, itemPref);

    let dialogue = "I have no use for this.";

    if (itemPref) {
        const affinityChange = itemPref.value * quantity;
        dialogue = itemPref.dialogue[0];
        console.log(`[NpcService.handleGiveItem] 5. Match found! Affinity change: ${affinityChange}. Dialogue: ${dialogue}`);
        updatedNpc.affinity += affinityChange;
    } else {
        console.log('[NpcService.handleGiveItem] 5. No preference match found. Using neutral dialogue.');
    }
    messageStore.addMessage(`[${npc.name}]: ${dialogue}`, ['NPC']);

    if (updatedNpc.affinity >= 10 && updatedNpc.heartState !== 'READY_FOR_RANK_UP') {
        updatedNpc.heartState = 'READY_FOR_RANK_UP';
        messageStore.addMessage(`You feel your connection with ${npc.name} has deepened. You should Connect with them.`, ['World', 'Update']);
        console.log('[NpcService.handleGiveItem] 6. Affinity threshold reached! State changed to READY_FOR_RANK_UP.');
    }

    // Create a new player object with updated inventory
    const newInventory = [...player.inventory];
    const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
    if (itemIndex !== -1) {
        newInventory[itemIndex].amount -= quantity;
        if (newInventory[itemIndex].amount <= 0) {
            newInventory.splice(itemIndex, 1);
        }
    }
    const updatedPlayer = { ...player, inventory: newInventory };

    return { updatedNpc, updatedPlayer };
}

export function getNpcCombatStats(npc: NPC): Partial<Player['baseStats']> {
    const stats: Partial<Player['baseStats']> = {};

    npc.statGrowth.forEach(growth => {
        if (npc.swordRank >= growth.level) {
            Object.assign(stats, growth.stats);
        }
    });

    return stats;
}
