// src/lib/data/achievements.ts

export type AchievementReward = {
    type: 'item' | 'tag';
    id: string;
    quantity?: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: 'sighting' | 'kill_count' | 'collection' | 'milestone';
    isSecret?: boolean;
    tiers?: {
        [tier: number]: {
            threshold: number;
            reward: AchievementReward;
        }
    };
    target?: string;
    reward?: AchievementReward; // For single-tier achievements
}

export const allAchievements: Achievement[] = [
    // Sighting Achievements
    {
        id: 'sighting_bob',
        name: "You've Seen Things",
        description: "Encounter the legendary Bob.",
        category: 'sighting',
        isSecret: true,
        target: 'bob',
        reward: { type: 'item', id: 'citrine', quantity: 1 },
    },
    {
        id: 'sighting_wilhemina',
        name: "A Glimpse of the Past",
        description: "Encounter the spectral Wilhemina.",
        category: 'sighting',
        isSecret: true,
        target: 'wilhemina',
        reward: { type: 'item', id: 'turquoise', quantity: 1 },
    },
    {
        id: 'sighting_archangel_one',
        name: "Heavenly Encounter",
        description: "Witness the Archangel One.",
        category: 'sighting',
        isSecret: true,
        target: 'archangel_one',
        reward: { type: 'item', id: 'azurite', quantity: 1 },
    },

    // Kill Count Achievements
    {
        id: 'kill_total',
        name: "Slayer",
        description: "Defeat multiple enemies.",
        category: 'kill_count',
        target: 'total',
        tiers: {
            1: { threshold: 10, reward: { type: 'item', id: 'citrine', quantity: 5 } },
            2: { threshold: 100, reward: { type: 'item', id: 'turquoise', quantity: 5 } },
            3: { threshold: 1000, reward: { type: 'tag', id: 'master_slayer' } },
        }
    },
    {
        id: 'kill_white_wyvern',
        name: "Wyvern Hunter",
        description: "Defeat multiple White Wyverns.",
        category: 'kill_count',
        target: 'white_wyvern',
        tiers: {
            1: { threshold: 10, reward: { type: 'item', id: 'citrine', quantity: 2 } },
            2: { threshold: 50, reward: { type: 'item', id: 'turquoise', quantity: 2 } },
            3: { threshold: 100, reward: { type: 'tag', id: 'wyvern_bane' } },
        }
    },

    // Collection Achievements
    {
        id: 'collect_all_elements',
        name: "Elemental Master",
        description: "Have one weapon of each Element for the first time.",
        category: 'collection',
        reward: { type: 'tag', id: 'elemental_master' },
    },
    {
        id: 'collect_unity',
        name: "Unity",
        description: "Obtain the legendary weapon 'Unity'.",
        category: 'collection',
        target: 'unity',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'collect_medusa_scissors',
        name: "Medusa's Bane",
        description: "Obtain the legendary weapon 'Medusa Scissors'.",
        category: 'collection',
        target: 'medusa_scissors',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'collect_sky_fan',
        name: "Wind Dancer",
        description: "Obtain the legendary weapon 'Sky Fan'.",
        category: 'collection',
        target: 'sky_fan',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'collect_xochi',
        name: "Flower of the Gods",
        description: "Obtain the legendary weapon 'Xochi'.",
        category: 'collection',
        target: 'xochi',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'collect_hellward_lance',
        name: "Hell's Point",
        description: "Obtain the legendary weapon 'Hellward Lance'.",
        category: 'collection',
        target: 'hellward_lance',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'collect_queens_trident',
        name: "Queen's Decree",
        description: "Obtain the legendary weapon 'Queen's Trident'.",
        category: 'collection',
        target: 'queens_trident',
        reward: { type: 'item', id: 'gold', quantity: 10 },
    },
    {
        id: 'full_set',
        name: "Fully Equipped",
        description: "Have a full set of Weapons and Relics.",
        category: 'collection',
        reward: { type: 'item', id: 'four_leaf_clover', quantity: 1 },
    },

    // Milestone Achievements
    {
        id: 'harvest_crops',
        name: "Green Thumb",
        description: "Harvest multiple crops.",
        category: 'milestone',
        target: 'crops',
        tiers: {
            1: { threshold: 1, reward: { type: 'item', id: 'citrine', quantity: 1 } },
            2: { threshold: 60, reward: { type: 'item', id: 'turquoise', quantity: 10 } },
            3: { threshold: 150, reward: { type: 'tag', id: 'master_farmer' } },
        }
    },
    {
        id: 'take_steps',
        name: "Wanderer",
        description: "Travel a long distance.",
        category: 'milestone',
        target: 'steps',
        tiers: {
            1: { threshold: 100, reward: { type: 'item', id: 'bread', quantity: 1 } },
            2: { threshold: 1000, reward: { type: 'item', id: 'forza_mead', quantity: 1 } },
            3: { threshold: 5000, reward: { type: 'tag', id: 'seasoned_traveler' } },
        }
    },
];

export const getAchievementById = (id: string): Achievement | undefined => {
    return allAchievements.find(a => a.id === id);
};
