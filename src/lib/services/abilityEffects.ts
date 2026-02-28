// abilityEffects.ts

import type { Combatant, CombatLogMessage, CombatLogSide, StatusEffect, PlayerBaseStats } from '$lib/types';

type CalculateDamageFunction = (
    attacker: Combatant,
    defender: Combatant,
    attackType: 'physical' | 'elemental',
    activeElements: string[],
    abilityMultiplier: number
) => { damage: number; isCritical: boolean };

type ApplyDamageFunction = (combatant: Combatant, damage: number) => Combatant;
type CalculateEvasionFunction = (defender: Combatant, attackerPrecision?: number) => boolean;

// ---------------------------------------------------------------------------
// Effect type definitions
// ---------------------------------------------------------------------------

export interface HealEffect {
    type: 'heal';
    target: 'self' | 'enemy';
    healType: 'hp' | 'aura_shield';
    multiplier: number;
    basedOn?: keyof PlayerBaseStats;
}

export interface DamageEffect {
    type: 'damage';
    damageType: 'physical' | 'elemental';
    multiplier: number;
    hitCount?: number;
}

export interface ConditionalDamageEffect {
    type: 'conditional_damage';
    damageType: 'physical' | 'elemental';
    baseMultiplier: number;
    condition: 'hp_below' | 'hp_above' | 'status_active' | 'self_hp_below';
    threshold?: number;
    statusId?: string;
    bonusMultiplier: number;
}

export interface StatusEffectApplication {
    type: 'apply_status';
    target: 'self' | 'enemy';
    stackBehavior?: 'replace' | 'stack';
    statusEffect: {
        id: string;
        name: string;
        duration: number;
        damagePerTurn?: number;
        /** % of maxHp restored as HP each turn. */
        healPerTurn?: number;
        statModifiers?: Partial<PlayerBaseStats>;
        isStunned?: boolean;
        flags?: StatusEffect['flags'];
        /**
         * Broad category used for immunity checks.
         * e.g. category: 'poison' → blocked by flag 'immune_to_poison'
         *      category: 'stun'   → blocked by flag 'immune_to_stun'
         */
        category?: string;
    };
}

export interface StatModifierEffect {
    type: 'stat_modifier';
    target: 'self' | 'enemy';
    duration: number;
    modifiers: Partial<Omit<PlayerBaseStats, 'hp' | 'maxHp' | 'auraShield' | 'maxAuraShield'>>;
}

export interface ShieldEffect {
    type: 'shield_manipulate';
    operation: 'reduce' | 'break' | 'drain';
    amount?: number;
}

export interface StatTransferEffect {
    type: 'stat_transfer';
    transfers: {
        sourceStat: 'physicalAttack' | 'elementalAttack' | 'physicalDefence' | 'elementalDefence';
        targetStat: 'physicalAttack' | 'elementalAttack' | 'physicalDefence' | 'elementalDefence';
        retainRatio: number;
    }[];
}

export interface HealPercentMaxHpEffect {
    type: 'heal_percent_max_hp';
    target: 'self';
    percent: number;
}

export interface HealFullEffect {
    type: 'heal_full';
    target: 'self';
}

/**
 * Strips negative or positive status effects from a target.
 *
 * cleanse: 'negative' — used on self. Removes DoTs, stuns, stat debuffs.
 * cleanse: 'positive' — used on enemy (Dispel). Removes buffs and ability-granted
 *                       immunity statuses. Never removes gear passives.
 */
export interface CleanseEffect {
    type: 'cleanse';
    cleanse: 'negative' | 'positive';
    target: 'self' | 'enemy';
}

/**
 * Deals damage and heals the attacker for a percentage of damage dealt.
 * The heal scales with actual damage (including crits and element bonuses),
 * unlike a flat damage + heal combo.
 */
export interface LifestealEffect {
    type: 'lifesteal';
    damageType: 'physical' | 'elemental';
    multiplier: number;
    /** Fraction of damage dealt restored as HP to the attacker. e.g. 0.50 = 50% lifesteal. */
    healRatio: number;
}

export type AnyAbilityEffect =
    | DamageEffect
    | ConditionalDamageEffect
    | StatusEffectApplication
    | StatModifierEffect
    | ShieldEffect
    | HealEffect
    | StatTransferEffect
    | HealPercentMaxHpEffect
    | HealFullEffect
    | CleanseEffect
    | LifestealEffect;

// ---------------------------------------------------------------------------
// Effect result
// ---------------------------------------------------------------------------

export interface EffectResult {
    updatedAttacker: Combatant;
    updatedDefender: Combatant;
    logs: CombatLogMessage[];
    totalDamage: number;
    didHit?: boolean;
    hitCount?: number;
    missCount?: number;
    critCount?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sideOf(combatant: Combatant): CombatLogSide {
    return combatant.isPlayer ? 'player' : 'opponent';
}

function isImmuneToStatus(target: Combatant, category: string | undefined): boolean {
    if (!category) return false;
    const immunityFlag = `immune_to_${category}` as StatusEffect['flags'][number];
    return target.statusEffects.some(s => s.flags?.includes(immunityFlag));
}

/** Returns true if the attacker has a guaranteed_hit buff active. */
function hasGuaranteedHit(attacker: Combatant): boolean {
    return attacker.statusEffects.some(s => s.flags?.includes('guaranteed_hit'));
}

/**
 * Consumes the guaranteed_hit buff from the attacker after it fires.
 * Removes all status effects with the guaranteed_hit flag.
 */
function consumeGuaranteedHit(attacker: Combatant): Combatant {
    return {
        ...attacker,
        statusEffects: attacker.statusEffects.filter(
            s => !(s.flags?.includes('guaranteed_hit'))
        ),
    };
}

// ---------------------------------------------------------------------------
// Effect handlers
// ---------------------------------------------------------------------------

export function executeHealEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: HealEffect,
): EffectResult {
    const target = effect.target === 'self' ? attacker : defender;
    const targetName = target.isPlayer ? 'Player' : target.name;
    let updatedTarget = { ...target };

    let healAmount = 0;
    if (effect.basedOn) {
        const baseStat = attacker.baseStats[effect.basedOn] as number ?? 0;
        healAmount = Math.round(baseStat * effect.multiplier);
    } else {
        healAmount = Math.round(effect.multiplier);
    }

    if (effect.healType === 'hp') {
        updatedTarget.hp = Math.min(updatedTarget.maxHp, updatedTarget.hp + healAmount);
    } else {
        updatedTarget.auraShield = Math.min(updatedTarget.maxAuraShield, updatedTarget.auraShield + healAmount);
    }

    return {
        updatedAttacker: effect.target === 'self' ? updatedTarget : attacker,
        updatedDefender: effect.target === 'enemy' ? updatedTarget : defender,
        logs: [{
            type: 'heal',
            side: sideOf(attacker),
            targetName,
            amount: healAmount,
            healType: effect.healType,
        }],
        totalDamage: 0,
    };
}

export function executeHealPercentMaxHpEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: HealPercentMaxHpEffect,
): EffectResult {
    const healAmount = Math.floor(attacker.maxHp * effect.percent);
    const targetName = attacker.isPlayer ? 'Player' : attacker.name;

    return {
        updatedAttacker: { ...attacker, hp: Math.min(attacker.maxHp, attacker.hp + healAmount) },
        updatedDefender: defender,
        logs: [{
            type: 'heal',
            side: sideOf(attacker),
            targetName,
            amount: healAmount,
            healType: 'hp',
        }],
        totalDamage: 0,
    };
}

export function executeHealFullEffect(
    attacker: Combatant,
    defender: Combatant,
    _effect: HealFullEffect,
): EffectResult {
    const healAmount = attacker.maxHp - attacker.hp;
    const targetName = attacker.isPlayer ? 'Player' : attacker.name;

    return {
        updatedAttacker: { ...attacker, hp: attacker.maxHp },
        updatedDefender: defender,
        logs: [{
            type: 'heal',
            side: sideOf(attacker),
            targetName,
            amount: healAmount,
            healType: 'hp',
        }],
        totalDamage: 0,
    };
}

export function executeStatTransferEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: StatTransferEffect,
): EffectResult {
    const actorName = attacker.isPlayer ? 'Player' : attacker.name;

    const suppressReduction = attacker.statusEffects.some(s => s.flags?.includes('immune_to_transfer_reduction'));
    const newBaseStats = { ...attacker.baseStats };

    for (const transfer of effect.transfers) {
        const currentValue = newBaseStats[transfer.sourceStat];
        const transferAmount = Math.floor(currentValue * (1 - transfer.retainRatio));
        if (!suppressReduction) {
            newBaseStats[transfer.sourceStat] = Math.floor(currentValue * transfer.retainRatio);
        }
        newBaseStats[transfer.targetStat] += transferAmount;
    }

    const transferDesc = effect.transfers.map(t => `${t.sourceStat} → ${t.targetStat}`).join(', ');

    const updatedAttacker: Combatant = {
        ...attacker,
        baseStats: newBaseStats,
        physicalAttack:   newBaseStats.physicalAttack,
        elementalAttack:  newBaseStats.elementalAttack,
        physicalDefence:  newBaseStats.physicalDefence,
        elementalDefence: newBaseStats.elementalDefence,
    };

    return {
        updatedAttacker,
        updatedDefender: defender,
        logs: [{
            type: 'stat_transfer',
            side: sideOf(attacker),
            actorName,
            description: transferDesc,
            suppressed: suppressReduction,
        }],
        totalDamage: 0,
    };
}

export function executeDamageEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: DamageEffect,
    calculateDamage: CalculateDamageFunction,
    applyDamage: ApplyDamageFunction,
    calculateEvasion: CalculateEvasionFunction,
    abilityAccuracy: number = 1.0,
): EffectResult {
    const logs: CombatLogMessage[] = [];
    let totalDamage = 0;
    let hitCount = 0;
    let missCount = 0;
    let critCount = 0;
    let updatedDefender = { ...defender };
    let updatedAttacker = { ...attacker };
    const hitAttempts = effect.hitCount || 1;
    const isMultiHit = hitAttempts > 1;

    const guaranteed = hasGuaranteedHit(attacker);
    if (guaranteed) {
        updatedAttacker = consumeGuaranteedHit(updatedAttacker);
    }

    for (let i = 0; i < hitAttempts; i++) {
        if (!guaranteed && Math.random() > abilityAccuracy) {
            missCount++;
            if (!isMultiHit) logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'accuracy' });
            continue;
        }
        if (!guaranteed && calculateEvasion(updatedDefender, attacker.precision ?? 0)) {
            missCount++;
            if (!isMultiHit) logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'dodge' });
            continue;
        }

        hitCount++;
        const { damage, isCritical } = calculateDamage(
            updatedAttacker, updatedDefender,
            effect.damageType,
            effect.damageType === 'elemental' ? [attacker.activeElement] : [],
            effect.multiplier
        );
        totalDamage += damage;
        if (isCritical) critCount++;
        updatedDefender = applyDamage(updatedDefender, damage);

        if (isMultiHit) {
            logs.push({
                type: 'damage', side: sideOf(attacker),
                amount: damage, isCritical, damageType: effect.damageType,
                element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
                hitIndex: i + 1, totalHits: hitAttempts,
            });
        }
    }

    if (!isMultiHit && hitCount > 0) {
        logs.push({
            type: 'damage', side: sideOf(attacker),
            amount: totalDamage, isCritical: critCount > 0, damageType: effect.damageType,
            element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
        });
    } else if (isMultiHit && hitCount > 0) {
        logs.push({
            type: 'multi_hit_summary', side: sideOf(attacker),
            hitCount, totalHits: hitAttempts, totalDamage,
        });
    } else if (isMultiHit && hitCount === 0) {
        logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'accuracy' });
    }

    return { updatedAttacker, updatedDefender, logs, totalDamage, didHit: hitCount > 0, hitCount, missCount, critCount };
}

export function executeConditionalDamageEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: ConditionalDamageEffect,
    calculateDamage: CalculateDamageFunction,
    applyDamage: ApplyDamageFunction,
): EffectResult {
    let multiplier = effect.baseMultiplier;

    if (effect.condition === 'hp_below' && effect.threshold !== undefined) {
        if ((defender.hp / defender.maxHp) < effect.threshold) multiplier = effect.bonusMultiplier;
    } else if (effect.condition === 'hp_above' && effect.threshold !== undefined) {
        if ((defender.hp / defender.maxHp) > effect.threshold) multiplier = effect.bonusMultiplier;
    } else if (effect.condition === 'status_active' && effect.statusId) {
        if (defender.statusEffects.some(s => s.id === effect.statusId)) multiplier = effect.bonusMultiplier;
    } else if (effect.condition === 'self_hp_below' && effect.threshold !== undefined) {
        // Desperation attack — attacker's own HP is low
        if ((attacker.hp / attacker.maxHp) < effect.threshold) multiplier = effect.bonusMultiplier;
    }

    const { damage, isCritical } = calculateDamage(
        attacker, defender,
        effect.damageType,
        effect.damageType === 'elemental' ? [attacker.activeElement] : [],
        multiplier
    );

    return {
        updatedAttacker: attacker,
        updatedDefender: applyDamage(defender, damage),
        logs: [{
            type: 'damage', side: sideOf(attacker),
            amount: damage, isCritical, damageType: effect.damageType,
            element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
        }],
        totalDamage: damage,
        didHit: true,
        critCount: isCritical ? 1 : 0,
    };
}

export function executeStatusEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: StatusEffectApplication,
    lastDamageHit: boolean,
): EffectResult {
    if (!lastDamageHit) {
        return { updatedAttacker: attacker, updatedDefender: defender, logs: [], totalDamage: 0 };
    }

    const isBuff = effect.target === 'self';
    const rawTarget = isBuff ? attacker : defender;
    const targetName = rawTarget.isPlayer ? 'Player' : rawTarget.name;

    if (isImmuneToStatus(rawTarget, effect.statusEffect.category)) {
        return {
            updatedAttacker: attacker,
            updatedDefender: defender,
            logs: [{
                type: 'immune', side: sideOf(rawTarget), targetName,
                what: effect.statusEffect.category ?? effect.statusEffect.name,
            }],
            totalDamage: 0,
        };
    }

    let updatedAttacker = { ...attacker };
    let updatedDefender = { ...defender };

    const newStatusEffect: StatusEffect = {
        ...effect.statusEffect,
        remainingTurns: effect.statusEffect.duration,
        inflictedBy: attacker.id,
    };

    const stackBehavior = effect.stackBehavior ?? 'replace';

    if (isBuff) {
        if (stackBehavior === 'replace') {
            updatedAttacker.statusEffects = updatedAttacker.statusEffects.filter(s => s.id !== effect.statusEffect.id);
        }
        updatedAttacker.statusEffects = [...updatedAttacker.statusEffects, newStatusEffect];
    } else {
        if (stackBehavior === 'replace') {
            updatedDefender.statusEffects = updatedDefender.statusEffects.filter(s => s.id !== effect.statusEffect.id);
        }
        updatedDefender.statusEffects = [...updatedDefender.statusEffects, newStatusEffect];
    }

    return {
        updatedAttacker,
        updatedDefender,
        logs: [{
            type: 'status_apply', side: sideOf(attacker), targetName,
            statusName: effect.statusEffect.name, isBuff,
        }],
        totalDamage: 0,
    };
}

export function executeStatModifierEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: StatModifierEffect,
): EffectResult {
    const target = effect.target === 'self' ? attacker : defender;
    const targetName = target.isPlayer ? 'Player' : target.name;
    const isBuff = effect.target === 'self';

    const values = Object.values(effect.modifiers).filter((v): v is number => v !== undefined);
    const isReduction = values.some(v => v < 1.0);
    const isIncrease  = values.some(v => v > 1.0);

    const immuneToReduction = target.statusEffects.some(s => s.flags?.includes('immune_to_stat_reduction'));
    const immuneToIncrease  = target.statusEffects.some(s => s.flags?.includes('immune_to_stat_increase'));

    if (isReduction && immuneToReduction) {
        return {
            updatedAttacker: attacker, updatedDefender: defender, totalDamage: 0,
            logs: [{ type: 'immune', side: sideOf(target), targetName, what: 'stat reduction' }],
        };
    }
    if (isIncrease && immuneToIncrease) {
        return {
            updatedAttacker: attacker, updatedDefender: defender, totalDamage: 0,
            logs: [{ type: 'immune', side: sideOf(target), targetName, what: 'stat increase' }],
        };
    }

    const statusEffect: StatusEffect = {
        id: `stat_mod_${Date.now()}`,
        name: 'Stat Modifier',
        duration: effect.duration,
        remainingTurns: effect.duration,
        inflictedBy: attacker.id,
        statModifiers: effect.modifiers,
    };

    const updatedTarget = { ...target, statusEffects: [...target.statusEffects, statusEffect] };

    const m = effect.modifiers;
    const upStats: string[] = [];
    const downStats: string[] = [];
    const categorise = (key: string, val: number | undefined, isAdditive = false) => {
        if (val === undefined) return;
        const up = isAdditive ? val > 0 : val > 1.0;
        (up ? upStats : downStats).push(key);
    };
    categorise('Phys. ATK',  m.physicalAttack);
    categorise('Elem. ATK',  m.elementalAttack);
    categorise('Phys. DEF',  m.physicalDefence);
    categorise('Elem. DEF',  m.elementalDefence);
    categorise('Evasion',    m.evasion, true);
    categorise('Speed',      m.speed);
    categorise('Crit Chance',m.critChance);
    categorise('Precision',  m.precision, true); // additive, negative = reduction

    const logs: CombatLogMessage[] = [];
    const targetSide = sideOf(target);
    if (upStats.length)   logs.push({ type: 'stat_change', side: sideOf(attacker), targetSide, targetName, stats: upStats,   direction: 'up' });
    if (downStats.length) logs.push({ type: 'stat_change', side: sideOf(attacker), targetSide, targetName, stats: downStats, direction: 'down' });

    return {
        updatedAttacker: isBuff ? updatedTarget : attacker,
        updatedDefender: isBuff ? defender : updatedTarget,
        logs,
        totalDamage: 0,
    };
}

export function executeShieldEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: ShieldEffect,
): EffectResult {
    let updatedDefender = { ...defender };
    const defenderName = defender.isPlayer ? 'Player' : defender.name;

    if (effect.operation === 'reduce' && effect.amount !== undefined) {
        const newShield = Math.floor(updatedDefender.maxAuraShield * effect.amount);
        updatedDefender.auraShield = Math.max(0, newShield);
    } else if (effect.operation === 'break') {
        updatedDefender.auraShield = 0;
    }

    return {
        updatedAttacker: attacker,
        updatedDefender,
        logs: [{ type: 'stat_change', side: sideOf(attacker), targetSide: sideOf(defender), targetName: defenderName, stats: ['Aura Shield'], direction: 'down' }],
        totalDamage: 0,
    };
}

/**
 * Cleanse: removes negative effects from self.
 * Dispel:  removes positive effects from the enemy.
 * Gear passives (inflictedBy: 'equipment' | 'innate') are never removed.
 */
export function executeCleanseEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: CleanseEffect,
): EffectResult {
    const isTargetingSelf = effect.target === 'self';
    const rawTarget = isTargetingSelf ? attacker : defender;
    const targetName = rawTarget.isPlayer ? 'Player' : rawTarget.name;

    let removedCount = 0;
    const filtered = rawTarget.statusEffects.filter(s => {
        // Gear passives are permanent — never cleansed or dispelled
        if (s.inflictedBy === 'equipment' || s.inflictedBy === 'innate') return true;

        if (effect.cleanse === 'negative') {
            const isDoT    = (s.damagePerTurn ?? 0) > 0;
            const isStun   = s.isStunned === true;
            const isDebuff = s.statModifiers
                ? Object.values(s.statModifiers).some(v => typeof v === 'number' && v < 1.0)
                : false;
            if (isDoT || isStun || isDebuff) { removedCount++; return false; }
        } else {
            // Positive = stat buffs or ability-granted immunity flags (Unshackled, Sea Ward, etc.)
            const isBuff = s.statModifiers
                ? Object.values(s.statModifiers).some(v => typeof v === 'number' && v > 1.0)
                : false;
            const hasImmunityFlags = (s.flags?.length ?? 0) > 0;
            if (isBuff || hasImmunityFlags) { removedCount++; return false; }
        }
        return true;
    });

    const updatedTarget = { ...rawTarget, statusEffects: filtered };
    const verb = effect.cleanse === 'negative' ? 'cleansed' : 'dispelled';
    const text = removedCount > 0
        ? `${targetName} was ${verb} of ${removedCount} effect${removedCount > 1 ? 's' : ''}.`
        : `${targetName} had nothing to ${verb}.`;

    return {
        updatedAttacker: isTargetingSelf ? updatedTarget : attacker,
        updatedDefender: isTargetingSelf ? defender : updatedTarget,
        logs: [{ type: 'system', text }],
        totalDamage: 0,
    };
}

/**
 * Lifesteal: deals damage and heals the attacker for a ratio of damage dealt.
 * The heal scales with actual damage including crits and element bonuses.
 * Respects guaranteed_hit the same way regular damage does.
 */
export function executeLifestealEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: LifestealEffect,
    calculateDamage: CalculateDamageFunction,
    applyDamage: ApplyDamageFunction,
    calculateEvasion: CalculateEvasionFunction,
): EffectResult {
    const logs: CombatLogMessage[] = [];
    let updatedAttacker = { ...attacker };

    const guaranteed = hasGuaranteedHit(attacker);
    if (guaranteed) updatedAttacker = consumeGuaranteedHit(updatedAttacker);

    if (!guaranteed && calculateEvasion(defender, attacker.precision ?? 0)) {
        logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'dodge' });
        return { updatedAttacker, updatedDefender: defender, logs, totalDamage: 0, didHit: false };
    }

    const { damage, isCritical } = calculateDamage(
        updatedAttacker, defender,
        effect.damageType,
        effect.damageType === 'elemental' ? [attacker.activeElement] : [],
        effect.multiplier
    );

    const updatedDefender = applyDamage(defender, damage);
    const healAmount = Math.round(damage * effect.healRatio);
    updatedAttacker = { ...updatedAttacker, hp: Math.min(updatedAttacker.maxHp, updatedAttacker.hp + healAmount) };
    const attackerName = attacker.isPlayer ? 'Player' : attacker.name;

    logs.push({
        type: 'damage', side: sideOf(attacker),
        amount: damage, isCritical, damageType: effect.damageType,
        element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
    });
    logs.push({
        type: 'heal', side: sideOf(attacker),
        targetName: attackerName, amount: healAmount, healType: 'hp',
    });

    return { updatedAttacker, updatedDefender, logs, totalDamage: damage, didHit: true };
}