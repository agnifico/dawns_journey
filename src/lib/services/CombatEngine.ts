import type { Combatant, CombatLogMessage } from '$lib/types';
import { get } from 'svelte/store';
import { combatStore } from '$lib/stores/combatStore';
import { calculateDamage, calculateEvasion } from './combatCalculations';

function applyDamage(combatant: Combatant, damage: number): Combatant {
    const newCombatant = { ...combatant };
    let remainingDamage = damage;

    if (newCombatant.auraShield > 0) {
        const shieldDamage = Math.min(newCombatant.auraShield, remainingDamage);
        newCombatant.auraShield -= shieldDamage;
        remainingDamage -= shieldDamage;
    }

    if (remainingDamage > 0) {
        newCombatant.hp -= remainingDamage;
    }

    return newCombatant;
}

function executeAttack(
    attacker: Combatant,
    defender: Combatant,
    attackType: 'physical' | 'elemental',
    activeElements: string[] = []
): { logs: CombatLogMessage[], damage: number } {
    const logs: CombatLogMessage[] = [];
    const attackerName = attacker.isPlayer ? 'Player' : attacker.name;
    const defenderName = defender.isPlayer ? 'Player' : defender.name;

    const attackTypeText = attackType === 'physical' ? 'Physical Attack' : `${activeElements[0]} Attack`;
    
    const attackLog = { text: `${attackerName} uses a ${attackTypeText}...`, class: `${attackType}-attack` };
    if (attacker.isPlayer) {
        logs.push({ left: attackLog });
    } else {
        logs.push({ right: attackLog });
    }

    if (calculateEvasion(defender)) {
        const evasionLog = { text: `${defenderName} evaded!`, class: 'evasion' };
        if (defender.isPlayer) {
            logs.push({ left: evasionLog });
        } else {
            logs.push({ right: evasionLog });
        }
        return { logs, damage: 0 };
    }

    const { damage, isCritical } = calculateDamage(attacker, defender, attackType, activeElements);
    
    let damageLogText = `and deals ${damage} damage.`;
    if (isCritical) {
        damageLogText += ' (CRIT!)';
    }
    const damageLog = { text: damageLogText, class: isCritical ? 'crit' : '' };
    if (attacker.isPlayer) {
        logs.push({ left: damageLog });
    } else {
        logs.push({ right: damageLog });
    }

    return { logs, damage };
}


/**
 * Executes a full turn for the player.
 */
export function executePlayerTurn(player: Combatant, opponent: Combatant) {
    let logs: CombatLogMessage[] = [];
    let updatedOpponent = { ...opponent };

    // --- 1. Physical Attack ---
    const physicalAttackResult = executeAttack(player, updatedOpponent, 'physical');
    updatedOpponent = applyDamage(updatedOpponent, physicalAttackResult.damage);
    logs = logs.concat(physicalAttackResult.logs);

    if (updatedOpponent.hp <= 0) {
        return { updatedOpponent, logs };
    }

    // --- 2. Elemental Attack ---
    const playerWeaponIndex = get(combatStore).playerWeaponIndex;
    const attackingWeapon = player.equipment.weapon_slots[playerWeaponIndex];
    const attackElement = attackingWeapon?.element || 'None';

    // Check for Coherence Buff
    const coherenceActive =
        player.equipment.weapon_slots[0] &&
        player.equipment.weapon_slots[1] &&
        player.equipment.weapon_slots[0].element === player.equipment.weapon_slots[1].element;

    let elementalAttack = player.elementalAttack || 0;
    if (coherenceActive) {
        elementalAttack *= 1.3;
        logs.push({ left: { text: 'Coherence Buff active! (+30% E.ATK)', class: 'buff' } });
    }

    const attackerWithBuffs: Combatant = {
        ...player,
        elementalAttack,
    };

    const elementalAttackResult = executeAttack(attackerWithBuffs, updatedOpponent, 'elemental', [attackElement]);
    updatedOpponent = applyDamage(updatedOpponent, elementalAttackResult.damage);
    logs = logs.concat(elementalAttackResult.logs);

    return { updatedOpponent, logs };
}

/**
 * Executes a full turn for the opponent.
 */
export function executeEnemyTurn(opponent: Combatant, player: Combatant) {
    let logs: CombatLogMessage[] = [];
    let updatedPlayer = { ...player };

    // --- 1. Physical Attack ---
    const physicalAttackResult = executeAttack(opponent, updatedPlayer, 'physical');
    updatedPlayer = applyDamage(updatedPlayer, physicalAttackResult.damage);
    logs = logs.concat(physicalAttackResult.logs);

    if (updatedPlayer.hp <= 0) {
        return { updatedPlayer, logs };
    }

    // --- 2. Elemental Attack ---
    const turnNumber = get(combatStore).turnNumber;
    const elementIndex = (turnNumber - 1) % (opponent.elements?.length || 1);
    const attackElement = opponent.elements ? opponent.elements[elementIndex] : 'None';

    const elementalAttackResult = executeAttack(opponent, updatedPlayer, 'elemental', [attackElement]);
    updatedPlayer = applyDamage(updatedPlayer, elementalAttackResult.damage);
    logs = logs.concat(elementalAttackResult.logs);

    return { updatedPlayer, logs };
}
