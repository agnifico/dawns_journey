export interface StatDefinition {
    id: string;
    name: string;
    abbr: string;
    description: string;
}

export const statDefinitions: { [key: string]: StatDefinition } = {
    hp: {
        id: 'hp',
        name: 'Health Points',
        abbr: 'HP',
        description: 'Determines how much damage you can take before being defeated.'
    },
    maxHp: {
        id: 'maxHp',
        name: 'Max Health Points',
        abbr: 'Max HP',
        description: 'Your maximum Health Points.'
    },
    auraShield: {
        id: 'auraShield',
        name: 'Aura Shield',
        abbr: 'Aura',
        description: 'A magical shield that absorbs damage before your HP.'
    },
    maxAuraShield: {
        id: 'maxAuraShield',
        name: 'Max Aura Shield',
        abbr: 'Max Aura',
        description: 'Your maximum Aura Shield capacity.'
    },
    physicalAttack: {
        id: 'physicalAttack',
        name: 'Physical Attack',
        abbr: 'P. ATK',
        description: 'Increases the damage dealt by your physical attacks.'
    },
    physicalDefence: {
        id: 'physicalDefence',
        name: 'Physical Defence',
        abbr: 'P. DEF',
        description: 'Reduces the damage taken from physical attacks.'
    },
    elementalAttack: {
        id: 'elementalAttack',
        name: 'Elemental Attack',
        abbr: 'E. ATK',
        description: 'Increases the damage dealt by your elemental attacks.'
    },
    elementalDefence: {
        id: 'elementalDefence',
        name: 'Elemental Defence',
        abbr: 'E. DEF',
        description: 'Reduces the damage taken from elemental attacks.'
    },
    speed: {
        id: 'speed',
        name: 'Speed',
        abbr: 'SPD',
        description: 'Determines who acts first in combat.'
    },
    evasion: {
        id: 'evasion',
        name: 'Evasion',
        abbr: 'EVA',
        description: 'Increases your chance to completely evade an incoming attack.'
    },
    critChance: {
        id: 'critChance',
        name: 'Critical Chance',
        abbr: 'Crit. %',
        description: 'The probability of landing a critical hit for extra damage.'
    },
    critDamage: {
        id: 'critDamage',
        name: 'Critical Damage',
        abbr: 'Crit. Dmg',
        description: 'The damage multiplier applied on a critical hit.'
    },
    mastery: {
        id: 'mastery',
        name: 'Total Mastery',
        abbr: 'Mastery',
        description: 'Your overall proficiency, used for exploration and overcoming wild creatures.'
    }
};