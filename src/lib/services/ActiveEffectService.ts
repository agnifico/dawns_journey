import type { Player, ActiveEffect } from '../types';

export const addActiveEffect = (player: Player, effect: ActiveEffect): Player => {
    const newPlayer = { ...player };
    newPlayer.activeEffects.push(effect);
    return newPlayer;
};

export const removeActiveEffect = (player: Player, effectId: string): Player => {
    const newPlayer = { ...player };
    newPlayer.activeEffects = newPlayer.activeEffects.filter(e => e.id !== effectId);
    return newPlayer;
};

export const updateActiveEffects = (player: Player): Player => {
    const newPlayer = { ...player };
    newPlayer.activeEffects = newPlayer.activeEffects.map(e => ({
        ...e,
        duration: e.duration - 1,
    })).filter(e => e.duration > 0);
    return newPlayer;
};
