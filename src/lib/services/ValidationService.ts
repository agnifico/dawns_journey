import type { Quest, NPC, LocationEvent, Item } from '$lib/types';
import { get } from 'svelte/store';
import type { QuestStoreState } from '$lib/stores/questStore';
import type { NpcStoreState } from '$lib/stores/npcStore';

function validateQuests(quests: { [key: string]: Quest }, npcs: { [key: string]: NPC }): string[] {
    const errors: string[] = [];
    for (const questId in quests) {
        const quest = quests[questId];
        if (quest.giver && !npcs[quest.giver]) {
            errors.push(`Quest "${quest.title}" has an invalid giver: ${quest.giver}`);
        }
    }
    return errors;
}

function validateNpcs(npcs: { [key: string]: NPC }, quests: { [key: string]: Quest }): string[] {
    const errors: string[] = [];
    for (const npcId in npcs) {
        const npc = npcs[npcId];
        for (const rank of npc.swordRanks) {
            if (rank.questId && !quests[rank.questId]) {
                errors.push(`NPC "${npc.name}" has an invalid questId in swordRanks: ${rank.questId}`);
            }
        }
    }
    return errors;
}

export function validateAllData(questStore: QuestStoreState, npcStore: NpcStoreState): boolean {
    console.log('Validating all game data...');

    const allQuests = questStore.quests;
    const allNpcs = npcStore.globalNpcs;

    const questErrors = validateQuests(allQuests, allNpcs);
    const npcErrors = validateNpcs(allNpcs, allQuests);

    const allErrors = [...questErrors, ...npcErrors];

    if (allErrors.length === 0) {
        console.log('Game data validation passed.');
        return true;
    } else {
        console.error('Game data validation failed:');
        allErrors.forEach(error => console.error(`- ${error}`));
        return false;
    }
}
