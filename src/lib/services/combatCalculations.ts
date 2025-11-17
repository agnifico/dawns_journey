import { getElementalEffectiveness } from './elementalEffectiveness';
import type { Attacker, Defender } from '../types';

function calculateMultiElementEffectiveness(attackerElements: string[], defenderElements: string[]): number {
    if (!attackerElements || attackerElements.length === 0) {
        return 1.0; // No attacker elements, neutral effectiveness
    }
    if (!defenderElements || defenderElements.length === 0) {
        return 1.0; // No defender elements, neutral effectiveness
    }

    let attackerMaxEffectivenessSum = 0;
    const numAttackerElements = attackerElements.length;

    for (const attE of attackerElements) {
        const effectivenessValues = defenderElements.map(defE => getElementalEffectiveness(attE, defE));
        const maxEffForAttE = Math.max(...effectivenessValues);
        attackerMaxEffectivenessSum += maxEffForAttE;
    }

    return attackerMaxEffectivenessSum / numAttackerElements;
}

export function calculateDamage(attacker: Attacker, defender: Defender, attackType: 'physical' | 'elemental', activeElements: string[] = []) {
    let baseDamage = 0;
    let isCritical = false;

    // 1. Calculate Base Damage
    if (attackType === 'physical') {
        baseDamage = attacker.physicalAttack || 0;
        baseDamage = Math.max(0, baseDamage - (defender.physicalDefence || 0));
    } else if (attackType === 'elemental') {
        baseDamage = attacker.elementalAttack || 0;
        baseDamage = Math.max(0, baseDamage - (defender.elementalDefence || 0));
    }

    // 2. Apply Elemental Effectiveness (for elemental attacks)
    let elementalMultiplier = 1.0;
    if (attackType === 'elemental') {
        const attackerElements = activeElements;
        const defenderElements = defender.elements || [];
        elementalMultiplier = calculateMultiElementEffectiveness(attackerElements, defenderElements);
    }

    let finalDamage = baseDamage * elementalMultiplier;

    // 3. Apply Critical Hit
    const critChance = attacker.critChance || 0;
    if (Math.random() < critChance) {
        isCritical = true;
        const critDamageMultiplier = attacker.critDamage || 1.5; // Default to 1.5x if not specified
        finalDamage *= critDamageMultiplier;
    }
    
    return { damage: Math.round(Math.max(0, finalDamage)), isCritical };
}

/**
 * Calculates if a defender evades an attack.
 * @param defender The defending character.
 * @returns {boolean} True if the attack is evaded, false otherwise.
 */
export function calculateEvasion(defender: Defender): boolean {
    const evasionStat = defender.evasion || 0;
    // The formula gives a percentage chance with diminishing returns.
    // e.g., 50 evasion = 33% chance, 100 evasion = 50% chance, 200 evasion = 66% chance.
    const evasionChance = evasionStat / (evasionStat + 100);
    return Math.random() < evasionChance;
}