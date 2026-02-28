import { get } from 'svelte/store';
import { factions as factionData } from '$lib/data/factions';
import { playerStore } from '$lib/stores/playerStore';
import { addItems } from './InventoryService';
import { notificationStore } from '$lib/stores/notificationStore';

export function increaseFactionScore(factionId: string, amount: number) {
    playerStore.update(p => {
        if (!p.factions[factionId]) {
            p.factions[factionId] = { score: 0, rank: 0 };
        }
        p.factions[factionId].score += amount;
        return p;
    });
    checkFactionRankUp(factionId);
}

function checkFactionRankUp(factionId: string) {
    const playerFactions = get(playerStore).factions;
    const faction = factionData[factionId];
    if (!faction || !playerFactions[factionId]) return;

    const currentRank = playerFactions[factionId].rank;
    const currentScore = playerFactions[factionId].score;

    const nextRank = faction.ranks.find(rank => currentScore >= rank.scoreThreshold);

    if (nextRank) {
        const newRank = currentRank + 1;
        playerStore.update(p => {
            p.factions[factionId].rank = newRank;
            return p;
        });
        notificationStore.add('faction_rank_up', { name: faction.name, rank: newRank }, 1);
        nextRank.rewards.forEach(reward => {
            playerStore.update(p => addItems(p, reward.itemId, reward.quantity));
        });
    }
}
