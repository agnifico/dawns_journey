import { get } from 'svelte/store';
import { factions as factionData } from '$lib/data/factions';
import { playerStore } from '$lib/stores/playerStore';
import { addItems } from './InventoryService';
import { notificationStore } from '$lib/stores/notificationStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import type { Reward } from '$lib/types';
import { toastStore } from '$lib/stores/toastStore';

// ---------------------------------------------------------------------------
// Core score mutation — single atomic store update
// ---------------------------------------------------------------------------

/**
 * Increase a faction's score by `amount`.
 * Rival penalties and rank-up check happen inside the same store update,
 * so `get(playerStore)` always sees consistent state.
 */
export function increaseFactionScore(factionId: string, amount: number) {
    let rankUpPayload: { factionId: string; factionName: string; newRank: number; rewards: any[] } | null = null;


    playerStore.update(p => {
        // 1. Apply gain
        if (!p.factions[factionId]) p.factions[factionId] = { score: 0, rank: 0 };
        p.factions[factionId].score += amount;

        // 2. Apply rival penalties inline
        const faction = factionData[factionId];
        if (faction?.rivalFactions?.length) {
            for (const rival of faction.rivalFactions) {
                const penalty = Math.floor(amount * rival.penaltyRatio);
                if (penalty > 0) {
                    if (!p.factions[rival.factionId]) p.factions[rival.factionId] = { score: 0, rank: 0 };
                    p.factions[rival.factionId].score = Math.max(0, p.factions[rival.factionId].score - penalty);
                }
            }
        }

        // 3. Check rank-up against the NEW score, right here
        if (faction?.ranks?.length) {
            const currentScore = p.factions[factionId].score;
            const currentRank  = p.factions[factionId].rank;

            const qualifiedRank = [...faction.ranks]
                .reverse()
                .find(r => currentScore >= r.scoreThreshold);
            if (qualifiedRank) {
                const newRankIndex = faction.ranks.indexOf(qualifiedRank) + 1;
                if (newRankIndex > currentRank) {
                    p.factions[factionId].rank = newRankIndex;
                    // Stash side-effects for after the update — can't call stores inside update()
                    rankUpPayload = {
                        factionId,
                        factionName: faction.name,
                        newRank: newRankIndex,
                        rewards: qualifiedRank.rewards ?? [],
                    };
                }
            }
        }

        return p;
    });

    // 4. Side-effects fire AFTER the store has settled
    const factionDisplayName = factionData[factionId]?.name ?? factionId;
    notificationStore.addFactionScore(factionDisplayName, amount);

    if (rankUpPayload) {
        const { factionName, newRank, rewards } = rankUpPayload;
        notificationStore.addFactionRankUp(factionName, newRank);
        toastStore.success(`Your Reputataion with ${factionName} is now ${newRank}`);
        rewards.forEach(reward => {
            playerStore.update(p => addItems(p, reward.itemId, reward.quantity));
        });
    }
}

/**
 * Decrease a faction's score by `amount` (floor 0).
 * No rival penalties, no rank-up check.
 */
export function decreaseFactionScore(factionId: string, amount: number) {
    playerStore.update(p => {
        if (!p.factions[factionId]) p.factions[factionId] = { score: 0, rank: 0 };
        p.factions[factionId].score = Math.max(0, p.factions[factionId].score - amount);
        return p;
    });
}

// ---------------------------------------------------------------------------
// Reward handler (called from LocationEventEffectHandlers)
// ---------------------------------------------------------------------------

export function applyFactionScoreReward(reward: Extract<Reward, { type: 'faction_score' }>) {
    if (reward.amount > 0) {
        increaseFactionScore(reward.factionId, reward.amount);
    } else if (reward.amount < 0) {
        decreaseFactionScore(reward.factionId, Math.abs(reward.amount));
    }
}

// ---------------------------------------------------------------------------
// Convenience getters
// ---------------------------------------------------------------------------

export function getPlayerFactionRank(factionId: string): number {
    return get(playerStore).factions[factionId]?.rank ?? 0;
}

export function getPlayerFactionScore(factionId: string): number {
    return get(playerStore).factions[factionId]?.score ?? 0;
}