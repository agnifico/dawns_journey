import { get } from 'svelte/store';
import { factions as factionData } from '$lib/data/factions';
import { playerStore } from '$lib/stores/playerStore';
import { addItems } from './InventoryService';
import { notificationStore } from '$lib/stores/notificationStore';
import type { Reward } from '$lib/types';

// ---------------------------------------------------------------------------
// Core score mutation
// ---------------------------------------------------------------------------

/**
 * Increase a faction's score by `amount`.
 * Automatically applies rival penalties and checks for rank-up.
 */
export function increaseFactionScore(factionId: string, amount: number) {
    playerStore.update(p => {
        if (!p.factions[factionId]) {
            p.factions[factionId] = { score: 0, rank: 0 };
        }
        p.factions[factionId].score += amount;
        return p;
    });

    // Apply rival penalties BEFORE rank-up check so the notification is accurate
    applyRivalPenalties(factionId, amount);
    checkFactionRankUp(factionId);
}

/**
 * Decrease a faction's score by `amount` (floor 0).
 * Does NOT trigger rival penalties — penalties are one-directional.
 */
export function decreaseFactionScore(factionId: string, amount: number) {
    playerStore.update(p => {
        if (!p.factions[factionId]) {
            p.factions[factionId] = { score: 0, rank: 0 };
        }
        p.factions[factionId].score = Math.max(0, p.factions[factionId].score - amount);
        return p;
    });
}

// ---------------------------------------------------------------------------
// Rival penalty propagation
// ---------------------------------------------------------------------------

/**
 * When faction `factionId` gains `amount` score, apply configured penalties
 * to all rival factions listed in that faction's data definition.
 *
 * Configure in your factions data file:
 *   rivalFactions: [{ factionId: 'shadowhand', penaltyRatio: 0.5 }]
 *
 * A penaltyRatio of 0.5 means gaining 10 Saints score costs 5 Shadowhand score.
 */
function applyRivalPenalties(factionId: string, amount: number) {
    const faction = factionData[factionId];
    if (!faction?.rivalFactions?.length) return;

    for (const rival of faction.rivalFactions) {
        const penalty = Math.floor(amount * rival.penaltyRatio);
        if (penalty > 0) {
            decreaseFactionScore(rival.factionId, penalty);
        }
    }
}

// ---------------------------------------------------------------------------
// Rank-up check
// ---------------------------------------------------------------------------

function checkFactionRankUp(factionId: string) {
    const playerFactions = get(playerStore).factions;
    const faction = factionData[factionId];
    if (!faction || !playerFactions[factionId]) return;

    const currentRank = playerFactions[factionId].rank;
    const currentScore = playerFactions[factionId].score;

    // Find the highest rank the player has now qualified for
    // Ranks should be ordered by ascending scoreThreshold in the data file
    const qualifiedRank = [...faction.ranks]
        .reverse()
        .find(rank => currentScore >= rank.scoreThreshold);

    if (!qualifiedRank) return;

    // Determine what rank index this is (1-based)
    const newRankIndex = faction.ranks.indexOf(qualifiedRank) + 1;

    if (newRankIndex > currentRank) {
        playerStore.update(p => {
            p.factions[factionId].rank = newRankIndex;
            return p;
        });
        notificationStore.add('faction_rank_up', { name: faction.name, rank: newRankIndex }, 1);
        qualifiedRank.rewards.forEach(reward => {
            playerStore.update(p => addItems(p, reward.itemId, reward.quantity));
        });
    }
}

// ---------------------------------------------------------------------------
// Reward handler (called from NpcService / LocationEventEffectHandlers)
// ---------------------------------------------------------------------------

/**
 * Process a `faction_score` reward from a quest or location event.
 * Positive amount = gain score. Negative amount = lose score.
 *
 * Usage in quest JSON:
 *   { "type": "faction_score", "factionId": "solis_saints", "amount": 10 }
 *   { "type": "faction_score", "factionId": "shadowhand", "amount": -5 }
 */
export function applyFactionScoreReward(reward: Extract<Reward, { type: 'faction_score' }>) {
    if (reward.amount > 0) {
        increaseFactionScore(reward.factionId, reward.amount);
    } else if (reward.amount < 0) {
        decreaseFactionScore(reward.factionId, Math.abs(reward.amount));
    }
}

// ---------------------------------------------------------------------------
// Convenience getters (read-only, no store subscription needed)
// ---------------------------------------------------------------------------

export function getPlayerFactionRank(factionId: string): number {
    return get(playerStore).factions[factionId]?.rank ?? 0;
}

export function getPlayerFactionScore(factionId: string): number {
    return get(playerStore).factions[factionId]?.score ?? 0;
}