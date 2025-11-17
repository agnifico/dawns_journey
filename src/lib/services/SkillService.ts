import type { Player, Skill } from '../types';
import { messageStore } from '../stores/messageStore';

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
        messageStore.addMessage(`${skill.name} level is now ${skill.level}!`, ['World']);
        xpForNextLevel = getXpForLevel(skill.level);
    }

    newPlayer.skills[skillIndex] = skill;
    return newPlayer;
}