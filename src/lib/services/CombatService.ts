import { get } from 'svelte/store';
import type { NPC, Player, Combatant } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { openCombatModal, closeCombatModal } from '$lib/stores/uiStore';
import * as CombatEngine from './CombatEngine';
import { getNpcCombatStats } from './NpcService';

function endCombat(outcome: 'win' | 'lose', player: Combatant, opponent: Combatant) {
    console.log('--- END COMBAT DEBUG ---');
    console.log('Final Player HP:', player.hp);
    console.log('Outcome:', outcome);
    console.log('------------------------');

    const drops = outcome === 'win' ? (opponent.drops || []) : [];

    // Persist the player's final HP, Aura Shield, and combat history back to the main store
    playerStore.update(p => {
        const newCombatHistory = [...p.combatHistory, { npcId: opponent.id, outcome: outcome }];
        return {
            ...p,
            baseStats: {
                ...p.baseStats,
                hp: player.hp,
                auraShield: player.auraShield,
            },
            combatHistory: newCombatHistory,
        };
    });

    combatStore.update(state => ({
        ...state,
        combatEnded: true,
        outcome,
        drops,
    }));
}

export function forceEndCombat() {
    combatStore.resetCombat();
    closeCombatModal();
    console.log("Combat ended.");
}

/**
 * Processes the next turn in the combat sequence.
 */
export function processTurn() {
    const combatState = get(combatStore);
    if (!combatState.isInCombat || combatState.combatEnded || !combatState.player || !combatState.opponent) return;

    let player = combatState.player;
    let opponent = combatState.opponent;
    let logs = [];

    if (combatState.currentTurn === 'player') {
        const turnResult = CombatEngine.executePlayerTurn(player, opponent);
        opponent = turnResult.updatedOpponent;
        logs = turnResult.logs;
    } else {
        const turnResult = CombatEngine.executeEnemyTurn(opponent, player);
        player = turnResult.updatedPlayer;
        logs = turnResult.logs;
    }

    // Update the store with the new HP values and logs before checking for end conditions
    combatStore.update(state => ({
        ...state,
        player,
        opponent,
        combatLog: [...state.combatLog, ...logs],
    }));

    // Check for end conditions
    if (player.hp <= 0) {
        logs.push({ center: `${player.name} has been defeated!` });
        endCombat('lose', player, opponent);
        return;
    }
    if (opponent.hp <= 0) {
        logs.push({ center: `${opponent.name} has been defeated!` });
        endCombat('win', player, opponent);
        return;
    }

    // Switch turns and update state
    const nextTurn = combatState.currentTurn === 'player' ? 'opponent' : 'player';
    const nextTurnNumber = combatState.currentTurn === 'opponent' ? combatState.turnNumber + 1 : combatState.turnNumber;

    combatStore.update(state => ({
        ...state,
        currentTurn: nextTurn,
        turnNumber: nextTurnNumber,
        playerWeaponIndex: nextTurn === 'player' ? (state.playerWeaponIndex + 1) % 2 as (0 | 1) : state.playerWeaponIndex,
    }));
}

/**
 * Initiates combat against an NPC.
 * @param opponentNpc The NPC to fight.
 */
export function startCombat(opponentNpc: NPC) {
    const currentPlayer = get(playerStore);
    const currentPlayerStats = get(playerStats);

    if (currentPlayerStats.hp <= 0) {
        messageStore.addMessage('You are too weak to engage in combat.', ['Combat']);
        return;
    }

    const playerCombatant: Combatant = {
        id: 'player',
        name: 'Player',
        isPlayer: true,
        image: '' /* Player image if you have one */,
        activeEffects: currentPlayer.activeEffects,
        statusEffects: currentPlayer.statusEffects,
        ...currentPlayerStats,
        equipment: currentPlayer.equipment,
        elements: [],
    };

    const opponentStats = getNpcCombatStats(opponentNpc);

    const opponentCombatant: Combatant = {
        ...opponentNpc,
        ...opponentStats,
        id: opponentNpc.id,
        isPlayer: false,
        hp: opponentStats.hp || 50,
        maxHp: opponentStats.maxHp || 50,
        auraShield: 0,
        maxAuraShield: 0,
        elements: opponentNpc.types || [],
    };

    const playerSpeed = playerCombatant.speed || 0;
    const opponentSpeed = opponentCombatant.speed || 0;
    const firstTurn = playerSpeed >= opponentSpeed ? 'player' : 'opponent';

    const initialLog = [
        { center: `Combat started with ${opponentNpc.name}!` },
        { center: `--- Turn ${1} ---` },
        { center: `${firstTurn === 'player' ? playerCombatant.name : opponentCombatant.name} goes first.` }
    ];

    combatStore.set({
        isInCombat: true,
        combatEnded: false,
        outcome: null,
        player: playerCombatant,
        opponent: opponentCombatant,
        combatLog: initialLog,
        currentTurn: firstTurn,
        turnNumber: 1,
        playerWeaponIndex: 0,
        drops: [],
    });

    openCombatModal();
    console.log(`Combat started. ${firstTurn} goes first.`);
}