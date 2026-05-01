// abilityEffects.ts

import type { Combatant, CombatLogMessage, CombatLogSide, StatusEffect, PlayerBaseStats, Ability } from '$lib/types';

function consumeGuaranteedHit(attacker: Combatant): { combatant: Combatant; consumed: boolean } {
    const hasFlag = attacker.statusEffects.some(s => s.flags?.includes('guaranteed_hit'));
    if (!hasFlag) return { combatant: attacker, consumed: false };
    return {
        combatant: {
            ...attacker,
            statusEffects: attacker.statusEffects.filter(s => !s.flags?.includes('guaranteed_hit')),
        },
        consumed: true,
    };
}

/**
 * Walks the attacker's tagBonuses, multiplying together every entry whose
 * tag matches one of the ability's tags. Returns 1.0 if there are no
 * matches or if either side has no tags/bonuses.
 *
 * Multiple matching bonuses stack multiplicatively. e.g. Fireborn 4pc
 * (+30% fire) and Executioner 2pc (+25% finisher) on a fire+finisher
 * ability = 1.30 × 1.25 = 1.625.
 *
 * Also reads `speedConditionalBonuses` whose condition is met against
 * `defender` (the opponent) — those tagBonuses fold into the same
 * multiplier when their condition holds.
 */
export function aggregateTagBonus(
    attacker: Combatant,
    defender: Combatant,
    ability: Ability,
): number {
    const abilityTags = ability.tags;
    if (!abilityTags?.length) return 1.0;

    let multiplier = 1.0;

    // Source 1: always-on tagBonuses
    for (const bonus of attacker.tagBonuses ?? []) {
        if (abilityTags.includes(bonus.tag)) {
            multiplier *= bonus.damageMultiplier;
        }
    }

    // Source 2: speed-conditional tagBonuses
    for (const cond of attacker.speedConditionalBonuses ?? []) {
        if (!cond.tagBonus) continue;
        if (!isSpeedConditionMet(cond.condition, attacker, defender)) continue;
        if (abilityTags.includes(cond.tagBonus.tag)) {
            multiplier *= cond.tagBonus.damageMultiplier;
        }
    }

    return multiplier;
}

/**
 * Check whether a speed condition is met between the attacker and opponent.
 */
function isSpeedConditionMet(
    condition: 'attacker_faster' | 'attacker_slower',
    attacker: Combatant,
    defender: Combatant,
): boolean {
    const attackerSpeed = attacker.speed ?? 0;
    const defenderSpeed = defender.speed ?? 0;
    if (condition === 'attacker_faster') return attackerSpeed > defenderSpeed;
    if (condition === 'attacker_slower') return attackerSpeed < defenderSpeed;
    return false;
}

/**
 * Returns a new Combatant with speed-conditional stat bonuses overlaid onto
 * the relevant base fields (physicalAttack, physicalDefence, etc.). Used by
 * damage handlers to feed an "effective" attacker into calculateDamage
 * without mutating the persistent combatant state.
 *
 * Only stats matching keyof PlayerBaseStats are overlaid; unknown stats
 * are silently ignored.
 */
export function applyConditionalStatOverlay(
    attacker: Combatant,
    defender: Combatant,
): Combatant {
    const conditional = attacker.speedConditionalBonuses;
    if (!conditional?.length) return attacker;

    let overlay: Record<string, number> = {};

    for (const cond of conditional) {
        if (!cond.stats?.length) continue;
        if (!isSpeedConditionMet(cond.condition, attacker, defender)) continue;
        for (const stat of cond.stats) {
            overlay[stat.name] = (overlay[stat.name] ?? 0) + stat.value;
        }
    }

    if (Object.keys(overlay).length === 0) return attacker;

    const overlaid: any = { ...attacker };
    for (const [stat, value] of Object.entries(overlay)) {
        if (typeof overlaid[stat] === 'number') {
            overlaid[stat] = overlaid[stat] + value;
        }
    }
    return overlaid as Combatant;
}

type CalculateDamageFunction = (
    attacker: Combatant,
    defender: Combatant,
    attackType: 'physical' | 'elemental',
    activeElements: string[],
    abilityMultiplier: number,
    tagBonusMultiplier?: number,
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
    condition: 'hp_below' | 'hp_above' | 'status_active' | 'self_hp_below' | 'self_hp_above';
    threshold?: number;
    statusId?: string;
    bonusMultiplier: number;
}

export interface StatusEffectApplication {
    type: 'apply_status';
    target: 'self' | 'enemy';
    /**
     * 'replace' (default) — removes any existing effect with the same id
     *   before applying. Refreshes the timer without stacking damage.
     *   Use this for every NPC that should keep one poison/stun stack.
     *
     * 'stack' — allows multiple simultaneous instances of the same effect.
     *   Use only for Sylvie's intentional multi-stack poison behaviour.
     */
    stackBehavior?: 'replace' | 'stack';
    statusEffect: {
        healPerTurn?: number;
        category?: StatusEffect['category'];
        id: string;
        name: string;
        duration: number;
        damagePerTurn?: number;
        statModifiers?: Partial<PlayerBaseStats>;
        isStunned?: boolean;
        flags?: StatusEffect['flags'];
    };
}

export interface StatModifierEffect {
    type: 'stat_modifier';
    target: 'self' | 'enemy';
    duration: number;
    modifiers: Partial<Omit<PlayerBaseStats, 'hp' | 'maxHp' | 'auraShield' | 'maxAuraShield' | 'precision'>>;
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

export interface LifestealEffect {
    type: 'lifesteal';
    damageType: 'physical' | 'elemental';
    /** Damage multiplier (applied to physical/elementalAttack) */
    multiplier: number;
    /** Fraction of damage dealt that becomes healing. Crits scale this too. */
    healRatio: number;
}

export interface CleanseEffect {
    type: 'cleanse';
    target: 'self' | 'enemy';
    /**
     * 'negative' — removes debuffs from target (used by player Cleanse,
     *              Ariana's Purifying Light, etc.)
     * 'positive' — strips buffs from target (Dispel)
     */
    cleanse: 'negative' | 'positive';
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
    | LifestealEffect
    | CleanseEffect;

// ---------------------------------------------------------------------------
// Effect result
// ---------------------------------------------------------------------------

export interface EffectResult {
    updatedAttacker: Combatant;
    updatedDefender: Combatant;
    logs: CombatLogMessage[];
    totalDamage: number;
    /**
     * True if this effect was a damage effect and at least one hit landed.
     * Used by CombatEngine to gate whether the following apply_status fires.
     * Undefined for non-damage effects (they don't affect the gate).
     */
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

    const log: CombatLogMessage = {
        type: 'heal',
        side: sideOf(attacker),
        targetName,
        amount: healAmount,
        healType: effect.healType,
    };

    return {
        updatedAttacker: effect.target === 'self' ? updatedTarget : attacker,
        updatedDefender: effect.target === 'enemy' ? updatedTarget : defender,
        logs: [log],
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

    // immune_to_stat_reduction protects against enemy debuffs — it does NOT block
    // self-transfers like Iron Wall / Frost Reaper.
    // immune_to_transfer_reduction (Unshackled) means the source stat is kept
    // at full value — the gain still happens, the loss doesn't.
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
        physicalAttack: newBaseStats.physicalAttack,
        elementalAttack: newBaseStats.elementalAttack,
        physicalDefence: newBaseStats.physicalDefence,
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
    tagBonusMultiplier: number = 1.0,
): EffectResult {
    const logs: CombatLogMessage[] = [];
    let totalDamage = 0;
    let hitCount = 0;
    let missCount = 0;
    let critCount = 0;
    let updatedDefender = { ...defender };
    const hitAttempts = effect.hitCount || 1;
    const isMultiHit = hitAttempts > 1;

    // Hit chance is purely the ability's accuracy value.
    // Combatant precision is NOT a hit multiplier — it reduces defender evasion (see calculateEvasion).
    const combinedAccuracy = abilityAccuracy;
    const { combatant: hitAttacker, consumed: guaranteedHit } = consumeGuaranteedHit(attacker);
    // Apply speed-conditional stat overlay once per ability (speed is read fresh
    // here so any mid-fight buffs/debuffs change which conditionals fire).
    const effectiveAttacker = applyConditionalStatOverlay(hitAttacker, defender);
    for (let i = 0; i < hitAttempts; i++) {
        // First check accuracy (ability × combatant), then check evasion (defender-level)
        if (!guaranteedHit) {
            if (Math.random() > combinedAccuracy) {
                missCount++;
                if (!isMultiHit) {
                    logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'accuracy' });
                }
                continue;
            }
        }

        if (!guaranteedHit) {
            if (calculateEvasion(updatedDefender, effectiveAttacker.precision ?? 0)) {
                missCount++;
                if (!isMultiHit) {
                    logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'dodge' });
                }
                continue;
            }
        }

        hitCount++;
        const { damage, isCritical } = calculateDamage(
            effectiveAttacker, updatedDefender,
            effect.damageType,
            effect.damageType === 'elemental' ? [effectiveAttacker.activeElement] : [],
            effect.multiplier,
            tagBonusMultiplier
        );
        totalDamage += damage;
        if (isCritical) critCount++;
        updatedDefender = applyDamage(updatedDefender, damage);

        // For multi-hit, log each hit individually
        if (isMultiHit) {
            logs.push({
                type: 'damage',
                side: sideOf(attacker),
                amount: damage,
                isCritical,
                damageType: effect.damageType,
                element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
                hitIndex: i + 1,
                totalHits: hitAttempts,
            });
        }
    }

    if (!isMultiHit && hitCount > 0) {
        // Single hit — one clean damage log
        logs.push({
            type: 'damage',
            side: sideOf(attacker),
            amount: totalDamage,
            isCritical: critCount > 0,
            damageType: effect.damageType,
            element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
        });
    } else if (isMultiHit && hitCount > 0) {
        // Summary after individual hit logs
        logs.push({
            type: 'multi_hit_summary',
            side: sideOf(attacker),
            hitCount,
            totalHits: hitAttempts,
            totalDamage,
        });
    } else if (isMultiHit && hitCount === 0) {
        // All hits missed
        logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'accuracy' });
    }

    return {
        updatedAttacker: hitAttacker,
        updatedDefender,
        logs,
        totalDamage,
        didHit: hitCount > 0,
        hitCount,
        missCount,
        critCount,
    };
}

export function executeConditionalDamageEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: ConditionalDamageEffect,
    calculateDamage: CalculateDamageFunction,
    applyDamage: ApplyDamageFunction,
    tagBonusMultiplier: number = 1.0,
): EffectResult {
    let multiplier = effect.baseMultiplier;
    let conditionMet = false;

    if (effect.condition === 'hp_below' && effect.threshold !== undefined) {
        conditionMet = (defender.hp / defender.maxHp) < effect.threshold;
    } else if (effect.condition === 'hp_above' && effect.threshold !== undefined) {
        conditionMet = (defender.hp / defender.maxHp) > effect.threshold;
    } else if (effect.condition === 'self_hp_below' && effect.threshold !== undefined) {
        conditionMet = (attacker.hp / attacker.maxHp) < effect.threshold;
    } else if (effect.condition === 'self_hp_above' && effect.threshold !== undefined) {
        conditionMet = (attacker.hp / attacker.maxHp) > effect.threshold;
    } else if (effect.condition === 'status_active' && effect.statusId) {
        conditionMet = defender.statusEffects.some(s => s.id === effect.statusId);
    }

    if (conditionMet) multiplier = effect.bonusMultiplier;

    const effectiveAttacker = applyConditionalStatOverlay(attacker, defender);
    const { damage, isCritical } = calculateDamage(
        effectiveAttacker, defender,
        effect.damageType,
        effect.damageType === 'elemental' ? [effectiveAttacker.activeElement] : [],
        multiplier,
        tagBonusMultiplier
    );

    return {
        updatedAttacker: attacker,
        updatedDefender: applyDamage(defender, damage),
        logs: [{
            type: 'damage',
            side: sideOf(attacker),
            amount: damage,
            isCritical,
            damageType: effect.damageType,
            element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
        }],
        totalDamage: damage,
        didHit: true, // conditional_damage always resolves (no accuracy/evasion check)
        critCount: isCritical ? 1 : 0,
    };
}

export function executeStatusEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: StatusEffectApplication,
    lastDamageHit: boolean,
): EffectResult {
    // If this status effect is attached to an attack (i.e. the previous effect
    // in the same ability was a damage effect), only apply it if that hit landed.
    // We detect "attached to an attack" by checking if lastDamageHit was explicitly
    // set to false (meaning a damage effect ran and missed).
    if (!lastDamageHit) {
        return {
            updatedAttacker: attacker,
            updatedDefender: defender,
            logs: [],
            totalDamage: 0,
        };
    }

    // Resolve target before immunity check (target depends on `effect.target`)
    const target = effect.target === 'self' ? attacker : defender;

    // Immunity check — does the target carry a flag matching the incoming status category?
    const category = effect.statusEffect.category;
    const FLAG_BY_CATEGORY: Record<string, string> = {
        poison: 'immune_to_poison',
        stun: 'immune_to_stun',
        bleed: 'immune_to_bleed',
        burn: 'immune_to_burn',
        freeze: 'immune_to_freeze',
    };
    const requiredFlag = category ? FLAG_BY_CATEGORY[category] : undefined;
    if (requiredFlag && target.statusEffects.some(s => s.flags?.includes(requiredFlag as any))) {
        const targetName = effect.target === 'self'
            ? (attacker.isPlayer ? 'Player' : attacker.name)
            : (defender.isPlayer ? 'Player' : defender.name);
        return {
            updatedAttacker: attacker,
            updatedDefender: defender,
            logs: [{
                type: 'status_immune',
                side: sideOf(attacker),
                targetName,
                statusName: effect.statusEffect.name,
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
    const isBuff = effect.target === 'self';
    const targetName = isBuff
        ? (attacker.isPlayer ? 'Player' : attacker.name)
        : (defender.isPlayer ? 'Player' : defender.name);

    if (isBuff) {
        if (stackBehavior === 'replace') {
            updatedAttacker.statusEffects = updatedAttacker.statusEffects.filter(
                s => s.id !== effect.statusEffect.id
            );
        }
        updatedAttacker.statusEffects = [...updatedAttacker.statusEffects, newStatusEffect];
    } else {
        if (stackBehavior === 'replace') {
            updatedDefender.statusEffects = updatedDefender.statusEffects.filter(
                s => s.id !== effect.statusEffect.id
            );
        }
        updatedDefender.statusEffects = [...updatedDefender.statusEffects, newStatusEffect];
    }

    return {
        updatedAttacker,
        updatedDefender,
        logs: [{
            type: 'status_apply',
            side: sideOf(attacker),
            targetName,
            statusName: effect.statusEffect.name,
            isBuff,
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
    const isIncrease = values.some(v => v > 1.0);

    const immuneToReduction = target.statusEffects.some(s => s.flags?.includes('immune_to_stat_reduction'));
    const immuneToIncrease = target.statusEffects.some(s => s.flags?.includes('immune_to_stat_increase'));

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

    let updatedTarget = { ...target, statusEffects: [...target.statusEffects, statusEffect] };

    // Immediately rebuild live stats so the modifier takes effect visually
    updatedTarget.physicalAttack = updatedTarget.baseStats.physicalAttack;
    updatedTarget.elementalAttack = updatedTarget.baseStats.elementalAttack;
    updatedTarget.physicalDefence = updatedTarget.baseStats.physicalDefence;
    updatedTarget.elementalDefence = updatedTarget.baseStats.elementalDefence;
    updatedTarget.speed = updatedTarget.baseStats.speed;
    updatedTarget.evasion = updatedTarget.baseStats.evasion;
    updatedTarget.critChance = updatedTarget.baseStats.critChance;
    updatedTarget.critDamage = updatedTarget.baseStats.critDamage;
    updatedTarget.precision = updatedTarget.baseStats.precision ?? 0;

    for (const se of updatedTarget.statusEffects) {
        const sm = se.statModifiers;
        if (!sm) continue;
        if (sm.physicalAttack !== undefined) updatedTarget.physicalAttack *= sm.physicalAttack;
        if (sm.elementalAttack !== undefined) updatedTarget.elementalAttack *= sm.elementalAttack;
        if (sm.physicalDefence !== undefined) updatedTarget.physicalDefence *= sm.physicalDefence;
        if (sm.elementalDefence !== undefined) updatedTarget.elementalDefence *= sm.elementalDefence;
        if (sm.speed !== undefined) updatedTarget.speed *= sm.speed;
        if (sm.evasion !== undefined) updatedTarget.evasion += sm.evasion;
        if (sm.speed !== undefined) updatedTarget.speed += sm.speed;
        if (sm.precision !== undefined) updatedTarget.precision += sm.precision;
        if (sm.critChance !== undefined) updatedTarget.critChance *= sm.critChance;
        if (sm.critDamage !== undefined) updatedTarget.critDamage *= sm.critDamage;
    }

    // Build human-readable stat list
    const m = effect.modifiers;
    const upStats: string[] = [];
    const downStats: string[] = [];
    const categorise = (key: string, val: number | undefined, isAdditive = false) => {
        if (val === undefined) return;
        const up = isAdditive ? val > 0 : val > 1.0;
        (up ? upStats : downStats).push(key);
    };
    categorise('Phys. ATK', m.physicalAttack);
    categorise('Elem. ATK', m.elementalAttack);
    categorise('Phys. DEF', m.physicalDefence);
    categorise('Elem. DEF', m.elementalDefence);
    categorise('Evasion', m.evasion, true);
    categorise('Speed', m.speed);
    categorise('Crit Chance', m.critChance);

    const logs: CombatLogMessage[] = [];
    const targetSide = sideOf(target);
    if (upStats.length) logs.push({ type: 'stat_change', side: sideOf(attacker), targetSide, targetName, stats: upStats, direction: 'up' });
    if (downStats.length) logs.push({ type: 'stat_change', side: sideOf(attacker), targetSide, targetName, stats: downStats, direction: 'down' });

    // Return a FRESH object reference so Svelte reactivity detects the change
    const freshTarget = { ...updatedTarget };

    return {
        updatedAttacker: isBuff ? freshTarget : attacker,
        updatedDefender: isBuff ? defender : freshTarget,
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


export function executeLifestealEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: LifestealEffect,
    calculateDamage: CalculateDamageFunction,
    applyDamage: ApplyDamageFunction,
    calculateEvasion: CalculateEvasionFunction,
    abilityAccuracy: number = 1.0,
    tagBonusMultiplier: number = 1.0,
): EffectResult {
    const attackerName = attacker.isPlayer ? 'Player' : attacker.name;
    const logs: CombatLogMessage[] = [];
    const { combatant: hitAttacker, consumed: guaranteedHit } = consumeGuaranteedHit(attacker);
    const effectiveAttacker = applyConditionalStatOverlay(hitAttacker, defender);

    // Accuracy check
    if (!guaranteedHit && Math.random() > abilityAccuracy) {
        logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'accuracy' });
        return { updatedAttacker: hitAttacker, updatedDefender: defender, logs, totalDamage: 0, didHit: false };
    }

    // Evasion check
    if (!guaranteedHit && calculateEvasion(defender, effectiveAttacker.precision ?? 0)) {
        logs.push({ type: 'miss', side: sideOf(attacker), defenderName: defender.name, reason: 'dodge' });
        return { updatedAttacker: hitAttacker, updatedDefender: defender, logs, totalDamage: 0, didHit: false };
    }

    // Deal damage
    const { damage, isCritical } = calculateDamage(
        effectiveAttacker, defender,
        effect.damageType,
        effect.damageType === 'elemental' ? [effectiveAttacker.activeElement] : [],
        effect.multiplier,
        tagBonusMultiplier,
    );

    const updatedDefender = applyDamage(defender, damage);

    // Heal: crit scales the heal too (crit damage = crit heal)
    const healAmount = Math.round(damage * effect.healRatio);
    const updatedAttacker: Combatant = {
        ...hitAttacker,
        hp: Math.min(hitAttacker.maxHp, hitAttacker.hp + healAmount),
    };

    logs.push({
        type: 'damage',
        side: sideOf(attacker),
        amount: damage,
        isCritical,
        damageType: effect.damageType,
        element: effect.damageType === 'elemental' ? attacker.activeElement : undefined,
    });
    logs.push({
        type: 'heal',
        side: sideOf(attacker),
        targetName: attackerName,
        amount: healAmount,
        healType: 'hp',
    });

    return {
        updatedAttacker,
        updatedDefender,
        logs,
        totalDamage: damage,
        didHit: true,
        critCount: isCritical ? 1 : 0,
    };
}

export function executeCleanseEffect(
    attacker: Combatant,
    defender: Combatant,
    effect: CleanseEffect,
): EffectResult {
    const isSelf = effect.target === 'self';
    const target = isSelf ? attacker : defender;
    const targetName = target.isPlayer ? 'Player' : target.name;

    const isNegative = (e: StatusEffect): boolean => {
        // Negative = DoT, debuffs (stat reductions), stuns, precision debuffs
        if (e.damagePerTurn) return true;
        if (e.isStunned) return true;
        const m = e.statModifiers;
        if (m && Object.values(m).some(v => typeof v === 'number' && v < 1.0)) return true;
        return false;
    };

    const isPositive = (e: StatusEffect): boolean => {
        // Gear passives (equipment/innate) are permanent — never dispelled
        if (e.inflictedBy === 'equipment' || e.inflictedBy === 'innate') return false;
        // Positive = HoT, stat boosts, immunity flags
        if (e.healPerTurn) return true;
        if (e.flags && e.flags.length > 0) return true;
        const m = e.statModifiers;
        if (m && Object.values(m).some(v => typeof v === 'number' && v > 1.0)) return true;
        return false;
    };

    const predicate = effect.cleanse === 'negative' ? isNegative : isPositive;
    const stripped = target.statusEffects.filter(e => predicate(e));
    const kept = target.statusEffects.filter(e => !predicate(e));

    const updatedTarget: Combatant = { ...target, statusEffects: kept };

    const logType = effect.cleanse === 'negative' ? 'cleanse' : 'dispel';
    const logs: CombatLogMessage[] = stripped.length > 0
        ? [{ type: logType, side: sideOf(attacker), targetName, count: stripped.length }]
        : [{ type: logType, side: sideOf(attacker), targetName, count: 0 }];

    return {
        updatedAttacker: isSelf ? updatedTarget : attacker,
        updatedDefender: isSelf ? defender : updatedTarget,
        logs,
        totalDamage: 0,
    };
}