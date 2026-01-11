import { get } from 'svelte/store';
import type { NPC, Player, Combatant } from '$lib/types';
import { combatStore } from '$lib/stores/combatStore';
import { playerStore, playerStats } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { dialogueStore } from '$lib/stores/dialogueStore';
import { npcStore } from '$lib/stores/npcStore';
import { questStore } from '$lib/stores/questStore';
import { openCombatModal, closeCombatModal } from '$lib/stores/uiStore';
import * as CombatEngine from './CombatEngine';
import { getNpcCombatStats } from './NpcService';
import { checkRequirement, checkQuestTriggers } from './QuestService';

function endCombat(outcome: 'win' | 'lose', player: Combatant, opponent: Combatant) {
    const drops = outcome === 'win' ? (opponent as any).drops || [] : [];

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

    // Check for quest triggers after combat ends
    checkQuestTriggers();

    // Handle combat aftermath (dialogue and affinity changes)
    const npc = get(npcStore).globalNpcs[opponent.id];
    if (npc) {
        const aftermathsByRank = npc.battleAftermathsBySwordRank.find(a => a.rank === npc.swordRank);
        if (aftermathsByRank) {
            const potentialAftermaths = aftermathsByRank.aftermaths.filter(a => a.outcome === outcome);
            let aftermathToApply = null;

            const playerForCheck = get(playerStore);
            const allNpcs = get(npcStore).globalNpcs;

            for (const potential of potentialAftermaths) {
                // If no requirement, it's a default. The checkRequirement function returns true for null requirement.
                const { met } = checkRequirement(potential.requirement, playerForCheck, npc, allNpcs, true);
                if (met) {
                    aftermathToApply = potential;
                    break; // Use the first one that matches
                }
            }

            if (aftermathToApply) {
                if (aftermathToApply.dialogue) {
                    dialogueStore.startDialogue(aftermathToApply.dialogue, npc.name);
                }
                if (aftermathToApply.value !== undefined) {
                    npcStore.applyCombatAftermath(npc.id, aftermathToApply);
                }
            }
        }
    }

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
}

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

    combatStore.update(state => ({
        ...state,
        player,
        opponent,
        combatLog: [...state.combatLog, ...logs],
    }));

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

    const nextTurn = combatState.currentTurn === 'player' ? 'opponent' : 'player';
    const nextTurnNumber = combatState.currentTurn === 'opponent' ? combatState.turnNumber + 1 : combatState.turnNumber;

    combatStore.update(state => ({
        ...state,
        currentTurn: nextTurn,
        turnNumber: nextTurnNumber,
        playerWeaponIndex: nextTurn === 'player' ? (state.playerWeaponIndex + 1) % 2 as (0 | 1) : state.playerWeaponIndex,
    }));
}

export function startCombat(opponentNpc: NPC) {
    const currentPlayer = get(playerStore);
    const currentPlayerStats = get(playerStats);

    if (currentPlayerStats.hp <= 0) {
        messageStore.addMessage('You are too weak to engage in combat.', ['Combat']);
        return;
    }

    const playerCombatant: Combatant = {
        id: 'player', name: 'Player', isPlayer: true, image: '',
        activeEffects: currentPlayer.activeEffects, statusEffects: currentPlayer.statusEffects,
        ...currentPlayerStats, equipment: currentPlayer.equipment, elements: [],
    };

    const opponentStats = getNpcCombatStats(opponentNpc);
    const opponentCombatant: Combatant = {
        ...opponentNpc, ...opponentStats, id: opponentNpc.id, isPlayer: false,
        hp: opponentStats.hp || 50, maxHp: opponentStats.maxHp || 50,
        auraShield: 0, maxAuraShield: 0, elements: opponentNpc.types || [],
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
        isInCombat: true, combatEnded: false, outcome: null,
        player: playerCombatant, opponent: opponentCombatant,
        combatLog: initialLog, currentTurn: firstTurn,
        turnNumber: 1, playerWeaponIndex: 0, drops: [],
    });

    openCombatModal();
}
