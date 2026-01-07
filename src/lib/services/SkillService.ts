import { playerStore } from '../stores/playerStore';
import { messageStore } from '../stores/messageStore';
import { TECH_POINTS_PER_LEVEL } from '$lib/data/progression';
import { farmingTechTree } from '$lib/data/skilltree/farming';

const LEVEL_EXPONENT = 1.6;
const BASE_XP = 100;

function getXpForLevel(level: number): number {
    return Math.floor(BASE_XP * Math.pow(level, LEVEL_EXPONENT));
}

export function gainExperience(player: Player, skillId: string, amount: number): Player {
    const newPlayer = { ...player };
    const skillIndex = newPlayer.skills.findIndex(s => s.id === skillId);

    if (skillIndex === -1) {
        console.error(`Skill with id ${skillId} not found on player.`);
        return player;
    }

    const skill = { ...newPlayer.skills[skillIndex] };
    skill.experience += amount;
    messageStore.addMessage(`You gain ${amount} ${skill.name} experience.`, ['World']);

    let xpForNextLevel = getXpForLevel(skill.level);
    while (skill.experience >= xpForNextLevel) {
        skill.level++;
        skill.experience -= xpForNextLevel;
        newPlayer.techPoints += TECH_POINTS_PER_LEVEL;
        messageStore.addMessage(`${skill.name} level is now ${skill.level}!`, ['System', 'LevelUp']);
        messageStore.addMessage(`You gained ${TECH_POINTS_PER_LEVEL} Tech Point!`, ['System', 'LevelUp']);
        xpForNextLevel = getXpForLevel(skill.level);
    }

    newPlayer.skills[skillIndex] = skill;

    // Also update the top-level farmingLevel for convenience
    if (skillId === 'farming') {
        newPlayer.farmingLevel = skill.level;
    }
    
    return newPlayer;
}

/**
 * FOR TESTING: Sets a skill to a specific level and grants a large number of tech points.
 */
export function setSkillLevel(skillId: string, level: number) {
    playerStore.update(player => {
        const newPlayer = { ...player };
        const skillIndex = newPlayer.skills.findIndex(s => s.id === skillId);

        if (skillIndex === -1) {
            console.error(`Skill with id ${skillId} not found on player.`);
            return player;
        }

        const skill = { ...newPlayer.skills[skillIndex] };
        skill.level = level;
        skill.experience = 0; // Reset XP to avoid accidental level ups

        newPlayer.skills[skillIndex] = skill;

        // Grant a large number of tech points for testing when setting level high
        if (level > 1) {
            newPlayer.techPoints = 999;
        } else {
            newPlayer.techPoints = 0; // Reset tech points if level is set back to 1
        }

        if (skillId === 'farming') {
            newPlayer.farmingLevel = skill.level;
        }

        messageStore.addMessage(`${skill.name} level set to ${level} for testing.`, ['System']);
        return newPlayer;
    });
}
