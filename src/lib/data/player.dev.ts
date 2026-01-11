import type { Player, NPC, Quest } from '../types';
import { player as basePlayer } from './player';

// Import all base NPC data to construct the full NPC state
import akari from '../assets/data/npcs/akari.json';
import claudia from '../assets/data/npcs/claudia.json';
import cygwin from '../assets/data/npcs/cygwin.json';
import guinevere from '../assets/data/npcs/guinevere.json';
import hanabi from '../assets/data/npcs/hanabi.json';
import hela from '../assets/data/npcs/hela.json';
import marjane from '../assets/data/npcs/marjane.json';
import nyx from '../assets/data/npcs/nyx.json';
import sylvie from '../assets/data/npcs/sylvie.json';
import veres from '../assets/data/npcs/veres.json';

// --- 1. Player State ---
const devPlayerOverrides: Partial<Player> = {
    equipment: {
        weapon_slots: [null, null],
        relic_slots: [null, null, null, null],
    },
    inventory: [
        { itemId: 'potato_seed', amount: 10 },
        { itemId: 'bread', amount: 5 },
        { itemId: 'vine_whip', amount: 1 },
        { itemId: 'hymn', amount: 1 },
        { itemId: 'requiem', amount: 1 },
        { itemId: 'argentum', amount: 5000 }
    ],
    worldTags: [
        "sylvie_sword_1_complete",
        "sylvie_sword_2_complete",
        "sylvie_sword_3_complete",
        "sylvie_sword_4_complete",
        "can_fight_hela",
        "hela_heart_rank_1_unlocked",
        "hela_sword_1_complete",
        "hela_sword_2_complete"
    ],
    locationEventHistory: {
        "campfire": 1,
        "treasure_chest": 1
    }
};

export const playerDev: Player = {
    ...basePlayer,
    ...devPlayerOverrides
};


// --- 2. NPC State ---
const baseNpcs: Record<string, NPC> = {
    akari, claudia, cygwin, guinevere, hanabi, hela, marjane, nyx, sylvie, veres
};

// Create a deep copy to avoid modifying the original JSON imports
const devNpcsData = JSON.parse(JSON.stringify(baseNpcs));
devNpcsData.sylvie.swordRank = 4;
devNpcsData.hela.swordRank = 2;
devNpcsData.hela.heartRank = 1;

export const devNpcState: { npcsInitialized: boolean, globalNpcs: Record<string, NPC> } = {
    npcsInitialized: true,
    globalNpcs: devNpcsData
};


// --- 3. Quest State ---
const baseQuests: Record<string, Quest> = {};
// This mimics the registration process in npcStore
Object.values(baseNpcs).forEach(npc => {
    npc.swordRanks.forEach(rankData => {
        if (rankData.questId) {
            baseQuests[rankData.questId] = {
                id: rankData.questId,
                title: rankData.title,
                description: rankData.description,
                giver: npc.id,
                state: rankData.startState || 'LOCKED',
                currentStage: 0,
                stages: rankData.stages,
                startRequirement: rankData.startRequirement
            };
        }
    });
});

const devQuestsData = JSON.parse(JSON.stringify(baseQuests));
devQuestsData.sylvie_sword_1.state = 'COMPLETED';
devQuestsData.sylvie_sword_2.state = 'COMPLETED';
devQuestsData.sylvie_sword_3.state = 'COMPLETED';
devQuestsData.sylvie_sword_4.state = 'COMPLETED';
devQuestsData.hela_sword_1.state = 'COMPLETED';
devQuestsData.hela_sword_2.state = 'COMPLETED';

export const devQuestState: { quests: Record<string, Quest> } = {
    quests: devQuestsData
};