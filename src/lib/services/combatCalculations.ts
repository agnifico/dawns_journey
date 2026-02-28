import { getElementalEffectiveness } from './elementalEffectiveness';
import type {Combatant } from '../types';

function calculateMultiElementEffectiveness(attackerElements: string[], defenderElements: string[]): number {
    if (!attackerElements || attackerElements.length === 0 || !defenderElements || defenderElements.length === 0) {
        return 1.0; // Neutral effectiveness if no elements on either side
    }

    let totalEffectiveness = 0;
    
    for (const attE of attackerElements) {
        for (const defE of defenderElements) {
            totalEffectiveness += getElementalEffectiveness(attE, defE);
        }
    }

    const interactionCount = attackerElements.length * defenderElements.length;

    return interactionCount > 0 ? totalEffectiveness / interactionCount : 1.0;
}

export function calculateDamage(
    attacker: Combatant,
    defender: Combatant,
    attackType: 'physical' | 'elemental',
    activeElements: string[] = [],
    abilityMultiplier: number = 1.0 // New optional argument
) {
    let baseDamage = 0;
    let isCritical = false;

    // 1. Calculate Base Damage — mitigation model
    // Defence reduces damage as a percentage using a softcap curve:
    //   reduction = defence / (defence + K)
    // K=200 means 200 defence = 50% reduction, 400 = 67%, 100 = 33%.
    // This ensures damage is always > 0 and defence never completely walls an attacker.
    const K = 200;
    if (attackType === 'physical') {
        const atk = attacker.physicalAttack || 0;
        const def = defender.physicalDefence || 0;
        const reduction = def / (def + K);
        baseDamage = atk * (1 - reduction);
    } else if (attackType === 'elemental') {
        const atk = attacker.elementalAttack || 0;
        const def = defender.elementalDefence || 0;
        const reduction = def / (def + K);
        baseDamage = atk * (1 - reduction);
    }

    // Apply ability multiplier
    baseDamage *= abilityMultiplier;

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
 * Attacker's precision reduces the defender's effective evasion point-for-point.
 * e.g., defender has 80 evasion, attacker has 30 precision → effective evasion = 50.
 * Evasion chance uses a softcap: 100 evasion = 50%, 200 = 67%, never reaches 100%.
 * @param defender The defending character.
 * @param attackerPrecision The attacker's precision stat (default 0).
 * @returns {boolean} True if the attack is evaded, false otherwise.
 */
export function calculateEvasion(defender: Combatant, attackerPrecision: number = 0): boolean {
    const rawEvasion = defender.evasion || 0;
    const effectiveEvasion = Math.max(0, rawEvasion - attackerPrecision);
    const evasionChance = effectiveEvasion / 100;
    return Math.random() < evasionChance;
}