import type { Player, NPC, Quest, Weapon } from '../types';
import { player as basePlayer } from './player';
import { createItems } from '../services/ItemFactory';

// Import all base NPC data to construct the full NPC state
import claudia from '../assets/data/npcs/claudia.json';
import cygwin from '../assets/data/npcs/cygwin.json';
import guinevere from '../assets/data/npcs/guinevere.json';
import aoife from '../assets/data/npcs/aoife.json';
import hela from '../assets/data/npcs/hela.json';
import marjane from '../assets/data/npcs/marjane.json';
import verona from '../assets/data/npcs/verona.json';
import sylvie from '../assets/data/npcs/sylvie.json';
import veres from '../assets/data/npcs/veres.json';

// --- Find Items ---
const vineWhip = createItems('vine_whip', 1)[0] as Weapon;
const waterWhip = createItems('water_whip', 1)[0] as Weapon;

// --- 1. Player State ---
const devPlayerOverrides: Partial<Player> = {
    equipment: {
        weapon_slots: [vineWhip, waterWhip],
        relic_slots: [null, null, null, null],
    },
    inventory: [
        ...createItems('potato_seed', 10),
        ...createItems('bread', 5),
        ...createItems('vine_whip', 1),
        ...createItems('water_whip', 1),
        ...createItems('hymn', 1),
        ...createItems('requiem', 1),
        ...createItems('argentum', 5000)
    ],
    worldTags: [
        "sylvie_sword_1_complete",
        "sylvie_sword_2_complete",
        "sylvie_sword_3_complete",
        "sylvie_sword_4_complete",
        "sylvie_sword_5_complete",
        "can_fight_hela",
        "hela_heart_rank_1_unlocked",
        "hela_sword_1_complete",
        "hela_sword_2_complete",
        "hela_sword_3_complete",
        "veres_heart_1_unlocked",
        "veres_sword_1_complete",
        "veres_sword_2_complete",
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
 claudia, cygwin, guinevere, aoife, hela, marjane, verona, sylvie, veres
};

// Create a deep copy to avoid modifying the original JSON imports
const devNpcsData = JSON.parse(JSON.stringify(baseNpcs));
devNpcsData.sylvie.swordRank = 5;
devNpcsData.hela.swordRank = 3;
devNpcsData.hela.heartRank = 1;
devNpcsData.veres.swordRank = 2;
devNpcsData.veres.heartRank = 1;


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
devQuestsData.sylvie_sword_5.state = 'COMPLETED';
devQuestsData.hela_sword_1.state = 'COMPLETED';
devQuestsData.hela_sword_2.state = 'COMPLETED';
devQuestsData.hela_sword_3.state = 'COMPLETED';
devQuestsData.veres_sword_1.state = 'COMPLETED';
devQuestsData.veres_sword_2.state = 'COMPLETED';


export const devQuestState: { quests: Record<string, Quest> } = {
    quests: devQuestsData
};