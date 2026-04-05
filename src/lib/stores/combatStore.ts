import { writable } from 'svelte/store';
import type { Combatant, CombatLogMessage, PlayerBaseStats, CombatWager } from '$lib/types';

export interface CombatState {
    isInCombat: boolean;
    isArenaCombat: boolean;
    combatEnded: boolean;
    outcome: 'win' | 'lose' | null;
    player: Combatant | null;
    opponent: Combatant | null;
    combatLog: CombatLogMessage[];
    /**
     * 'player_selecting' — waiting for the player to choose an ability.
     * 'resolving'        — a turn is mid-execution; no input accepted.
     * null               — combat hasn't started or has ended.
     */
    turnPhase: 'player_selecting' | 'resolving' | null;
    turnNumber: number;
    playerWeaponIndex: 0 | 1;
    drops: any[];
    /** Snapshot of player stats at combat start (after equipment/buffs applied) */
    initialPlayerStats: PlayerBaseStats | null;
    /** Snapshot of opponent stats at combat start */
    initialOpponentStats: PlayerBaseStats | null;
    wager?: CombatWager | null;
}

const initialState: CombatState = {
    isInCombat: false,
    isArenaCombat: false,
    combatEnded: false,
    outcome: null,
    player: null,
    opponent: null,
    combatLog: [],
    turnPhase: null,
    turnNumber: 0,
    playerWeaponIndex: 0,
    drops: [],
    initialPlayerStats: null,
    initialOpponentStats: null,
    wager: null,
};

function createCombatStore() {
    const { subscribe, set, update } = writable<CombatState>(initialState);

    return {
        subscribe,
        set,
        update,
        setPlayerActiveElement: (element: string) => {
            update(state => {
                if (state.player) {
                    return { ...state, player: { ...state.player, activeElement: element } };
                }
                return state;
            });
        },
        resetCombat: () => set(initialState),
    };
}

export const combatStore = createCombatStore();