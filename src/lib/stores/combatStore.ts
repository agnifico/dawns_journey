import { writable } from 'svelte/store';
import type { Player, NPC, CombatLogMessage } from '$lib/types';

export interface CombatState {
    isInCombat: boolean;
    combatEnded: boolean;
    outcome: 'win' | 'lose' | null;
    player: Player | null;
    opponent: (NPC & { currentHp: number }) | null;
    combatLog: CombatLogMessage[];
    currentTurn: 'player' | 'opponent' | null;
    turnNumber: number;
    playerWeaponIndex: 0 | 1;
    drops: any[];
}

const initialState: CombatState = {
    isInCombat: false,
    combatEnded: false,
    outcome: null,
    player: null,
    opponent: null,
    combatLog: [],
    currentTurn: null,
    turnNumber: 0,
    playerWeaponIndex: 0,
    drops: [],
};

function createCombatStore() {
    const { subscribe, set, update } = writable<CombatState>(initialState);

    return {
        subscribe,
        set,
        update,
        resetCombat: () => set(initialState),
    };
}

export const combatStore = createCombatStore();
