// CombatEngine.ts

import type { Combatant, CombatLogMessage, CombatLogSide, StatusEffect } from '$lib/types';
import { calculateDamage, calculateEvasion } from './combatCalculations';
import { getAbilityById } from '../data/abilities';
import * as EffectHandlers from './abilityEffects';
import type { AnyAbilityEffect, EffectResult } from './abilityEffects';

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function applyDamage(combatant: Combatant, damage: number): Combatant {
    const next = { ...combatant };
    let remaining = damage;
    if (next.auraShield > 0) {
        const absorbed = Math.min(next.auraShield, remaining);
        next.auraShield -= absorbed;
        remaining -= absorbed;
    }
    if (remaining > 0) next.hp -= remaining;
    return next;
}

function sideOf(combatant: Combatant): CombatLogSide {
    return combatant.isPlayer ? 'player' : 'opponent';
}

/**
 * Rebuilds every live stat from baseStats, then multiplies in all active
 * status effect stat modifiers.
 * Gear passives (inflictedBy: 'equipment' | 'innate') never carry statModifiers
 * so they are skipped for clarity.
 */
function applyStatModifiers(combatant: Combatant): Combatant {
    const c = { ...combatant };
    c.physicalAttack   = c.baseStats.physicalAttack;
    c.elementalAttack  = c.baseStats.elementalAttack;
    c.physicalDefence  = c.baseStats.physicalDefence;
    c.elementalDefence = c.baseStats.elementalDefence;
    c.speed            = c.baseStats.speed;
    c.evasion          = c.baseStats.evasion;
    c.critChance       = c.baseStats.critChance;
    c.critDamage       = c.baseStats.critDamage;
    c.precision        = c.baseStats.precision ?? 0;

    for (const effect of c.statusEffects) {
        if (effect.inflictedBy === 'equipment' || effect.inflictedBy === 'innate') continue;
        const m = effect.statModifiers;
        if (!m) continue;
        if (m.physicalAttack   !== undefined) c.physicalAttack   *= m.physicalAttack;
        if (m.elementalAttack  !== undefined) c.elementalAttack  *= m.elementalAttack;
        if (m.physicalDefence  !== undefined) c.physicalDefence  *= m.physicalDefence;
        if (m.elementalDefence !== undefined) c.elementalDefence *= m.elementalDefence;
        if (m.speed            !== undefined) c.speed            *= m.speed;
        if (m.evasion          !== undefined) c.evasion          += m.evasion; // additive
        if (m.critChance       !== undefined) c.critChance       *= m.critChance;
        if (m.critDamage       !== undefined) c.critDamage       *= m.critDamage;
        if (m.precision        !== undefined) c.precision        += m.precision; // additive, can go negative
    }

    return c;
}

function isStunned(combatant: Combatant): boolean {
    return combatant.statusEffects.some(e => e.isStunned === true);
}

// ---------------------------------------------------------------------------
// Public: tick status effects at the start of a turn
// ---------------------------------------------------------------------------

export function applyStatusEffects(
    combatant: Combatant
): { updatedCombatant: Combatant; logs: CombatLogMessage[] } {
    let updated = { ...combatant };
    const logs: CombatLogMessage[] = [];
    const surviving: StatusEffect[] = [];
    const actorName = updated.isPlayer ? 'Player' : updated.name;
    const side = sideOf(updated);

    for (const effect of updated.statusEffects) {
        // Gear passives are permanent — skip tick/countdown entirely.
        if (effect.inflictedBy === 'equipment' || effect.inflictedBy === 'innate') {
            surviving.push(effect);
            continue;
        }

        let current = { ...effect };

        if (current.remainingTurns === undefined) {
            current.remainingTurns = current.duration;
        }

        // Damage over time
        if (current.damagePerTurn) {
            const damage = Math.round(updated.maxHp * current.damagePerTurn);
            updated = applyDamage(updated, damage);
            logs.push({
                type: 'status_tick',
                side,
                targetName: actorName,
                statusName: current.name,
                amount: damage,
            });
        }

        // Heal over time
        if (current.healPerTurn) {
            const healAmount = Math.round(updated.maxHp * current.healPerTurn);
            updated = { ...updated, hp: Math.min(updated.maxHp, updated.hp + healAmount) };
            logs.push({
                type: 'status_heal',
                side,
                targetName: actorName,
                statusName: current.name,
                amount: healAmount,
            });
        }

        current.remainingTurns--;

        if (current.remainingTurns > 0) {
            surviving.push(current);
        } else {
            logs.push({
                type: 'status_expire',
                side,
                targetName: actorName,
                statusName: current.name,
            });
        }
    }

    updated.statusEffects = surviving;
    return { updatedCombatant: updated, logs };
}

// ---------------------------------------------------------------------------
// Private: route a single effect to its handler
// ---------------------------------------------------------------------------

function executeEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: AnyAbilityEffect,
    abilityAccuracy: number,
    lastDamageHit: boolean,
    tagBonusMultiplier: number,
): EffectResult {
    switch (effect.type) {
        case 'damage':
            return EffectHandlers.executeDamageEffect(
                attacker, defender, effect,
                calculateDamage, applyDamage, calculateEvasion,
                abilityAccuracy, tagBonusMultiplier
            );
        case 'conditional_damage':
            return EffectHandlers.executeConditionalDamageEffect(
                attacker, defender, effect, calculateDamage, applyDamage,
                tagBonusMultiplier
            );
        case 'heal':
            return EffectHandlers.executeHealEffect(attacker, defender, effect);
        case 'apply_status':
            return EffectHandlers.executeStatusEffect(attacker, defender, effect, lastDamageHit);
        case 'stat_modifier':
            return EffectHandlers.executeStatModifierEffect(attacker, defender, effect);
        case 'shield_manipulate':
            return EffectHandlers.executeShieldEffect(attacker, defender, effect);
        case 'stat_transfer':
            return EffectHandlers.executeStatTransferEffect(attacker, defender, effect);
        case 'heal_percent_max_hp':
            return EffectHandlers.executeHealPercentMaxHpEffect(attacker, defender, effect);
        case 'heal_full':
            return EffectHandlers.executeHealFullEffect(attacker, defender, effect);
        case 'cleanse':
            return EffectHandlers.executeCleanseEffect(attacker, defender, effect);
        case 'lifesteal':
            return EffectHandlers.executeLifestealEffect(
                attacker, defender, effect,
                calculateDamage, applyDamage, calculateEvasion,
                1.0, tagBonusMultiplier
            );
        default:
            effect satisfies never;
            console.warn(`Unknown effect type: ${(effect as any).type}`);
            return { updatedAttacker: attacker, updatedDefender: defender, logs: [], totalDamage: 0 };
    }
}

// ---------------------------------------------------------------------------
// Public: execute a full ability
// ---------------------------------------------------------------------------

export function executeAbility(
    attacker: Combatant,
    defender: Combatant,
    abilityId: string
): { updatedAttacker: Combatant; updatedDefender: Combatant; logs: CombatLogMessage[] } {
    const logs: CombatLogMessage[] = [];
    const attackerName = attacker.isPlayer ? 'Player' : attacker.name;

    const ability = getAbilityById(abilityId);
    if (!ability) {
        logs.push({ type: 'system', text: `Ability "${abilityId}" not found!` });
        return { updatedAttacker: attacker, updatedDefender: defender, logs };
    }

    let currentAttacker = applyStatModifiers(attacker);
    let currentDefender = applyStatModifiers(defender);

    if (isStunned(currentAttacker)) {
        logs.push({ type: 'stun', side: sideOf(attacker), actorName: attackerName });
        return { updatedAttacker: attacker, updatedDefender: defender, logs };
    }

    logs.push({
        type: 'ability_use',
        side: sideOf(attacker),
        actorName: attackerName,
        abilityName: ability.name,
    });

    // Aggregate the attacker's tag bonuses for this ability once. Same value
    // applies to every damage effect inside the ability (e.g. multi-hit, lifesteal).
    const tagBonusMultiplier = EffectHandlers.aggregateTagBonus(currentAttacker, ability);

    // lastDamageHit starts true so status-only abilities always apply;
    // flips false only when a damage effect explicitly misses.
    let lastDamageHit = true;

    for (const effect of ability.effects) {
        const result = executeEffect(
            currentAttacker,
            currentDefender,
            effect,
            ability.accuracy ?? 1.0,
            lastDamageHit,
            tagBonusMultiplier,
        );

        currentAttacker = result.updatedAttacker;
        currentDefender = result.updatedDefender;
        logs.push(...result.logs);

        if (result.didHit !== undefined) {
            lastDamageHit = result.didHit;
        }

        if (currentDefender.hp <= 0) break;
    }

    return {
        updatedAttacker: applyStatModifiers(currentAttacker),
        updatedDefender: applyStatModifiers(currentDefender),
        logs,
    };
}