import skills from '$lib/data/skills.json';

export function getXpForLevelFromData(skillId: string, currentLevel: number): number | null {
    const skillData = (skills as any)[skillId];
    if (!skillData) {
        console.error(`Skill data for ${skillId} not found.`);
        return null;
    }

    const nextLevel = currentLevel + 1;
    const currentLevelData = skillData.levels[currentLevel];
    const nextLevelData = skillData.levels[nextLevel];

    if (nextLevelData && currentLevelData) {
        return nextLevelData.xp - currentLevelData.xp;
    }

    return null;
}

