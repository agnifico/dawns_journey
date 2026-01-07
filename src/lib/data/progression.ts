export interface LevelData {
    level: number;
    xpRequired: number;
}

// Defines the total XP required to reach a given level.
export const farmingLevelProgression: LevelData[] = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 250 },
    { level: 4, xpRequired: 450 },
    { level: 5, xpRequired: 700 },
    { level: 6, xpRequired: 1000 },
    { level: 7, xpRequired: 1350 },
    { level: 8, xpRequired: 1750 },
    { level: 9, xpRequired: 2200 },
    { level: 10, xpRequired: 2700 },
    { level: 11, xpRequired: 3250 },
    { level: 12, xpRequired: 3850 },
    { level: 13, xpRequired: 4500 },
    { level: 14, xpRequired: 5200 },
    { level: 15, xpRequired: 6000 },
    { level: 16, xpRequired: 6850 },
    { level: 17, xpRequired: 7750 },
    { level: 18, xpRequired: 8700 },
    { level: 19, xpRequired: 9700 },
    { level: 20, xpRequired: 10750 },
    // Levels can continue to be added here...
];

// How many Tech Points (TP) are awarded at each level-up.
export const TECH_POINTS_PER_LEVEL = 1;
