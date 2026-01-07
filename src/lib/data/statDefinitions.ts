export interface StatDefinition {
    id: string;
    name: string;
    abbr: string;
    description: string;
    color: string;
}

export const statDefinitions: { [key: string]: StatDefinition } = {
    hp: {
        id: 'hp',
        name: 'Health Points',
        abbr: 'HP',
        description: 'Determines how much damage you can take before being defeated.',
        color: '#6a994e' // Green
    },
    maxHp: {
        id: 'maxHp',
        name: 'Max Health Points',
        abbr: 'Max HP',
        description: 'Your maximum Health Points.',
        color: '#BDAA89' // Green
    },
    auraShield: {
        id: 'auraShield',
        name: 'Aura Shield',
        abbr: 'Aura',
        description: 'A magical shield that absorbs damage before your HP.',
        color: '#a98467' // DeepSkyBlue
    },
    maxAuraShield: {
        id: 'maxAuraShield',
        name: 'Max Aura Shield',
        abbr: 'Max Aura',
        description: 'Your maximum Aura Shield capacity.',
        color: '#8d99ae' // DeepSkyBlue
    },
    physicalAttack: {
        id: 'physicalAttack',
        name: 'Physical Attack',
        abbr: 'Phy ATK',
        description: 'Increases the damage dealt by your physical attacks.',
        color: '#4895EF' // SteelBlue
    },
    physicalDefence: {
        id: 'physicalDefence',
        name: 'Physical Defence',
        abbr: 'Phy DEF',
        description: 'Reduces the damage taken from physical attacks.',
        color: '#4895EF' // SteelBlue
    },
    elementalAttack: {
        id: 'elementalAttack',
        name: 'Elemental Attack',
        abbr: 'Elm ATK',
        description: 'Increases the damage dealt by your elemental attacks.',
        color: '#FF6347' // Tomato
    },
    elementalDefence: {
        id: 'elementalDefence',
        name: 'Elemental Defence',
        abbr: 'Elm DEF',
        description: 'Reduces the damage taken from elemental attacks.',
        color: '#FF6347' // Tomato
    },
    speed: {
        id: 'speed',
        name: 'Speed',
        abbr: 'SPD',
        description: 'Determines who acts first in combat.',
        color: '#FA75B1' // DarkGray
    },
    evasion: {
        id: 'evasion',
        name: 'Evasion',
        abbr: 'EVA',
        description: 'Increases your chance to completely evade an incoming attack.',
        color: '#FA75B1' // DarkGray
    },
    critChance: {
        id: 'critChance',
        name: 'Critical Chance',
        abbr: 'Crit. %',
        description: 'The probability of landing a critical hit for extra damage.',
        color: '#FFD700' // Gold
    },
    critDamage: {
        id: 'critDamage',
        name: 'Critical Damage',
        abbr: 'Crit. Dmg',
        description: 'The damage multiplier applied on a critical hit.',
        color: '#FFD700' // Gold
    },
    mastery: {
        id: 'mastery',
        name: 'Weapon Mastery',
        abbr: 'Mastery',
        description: 'Your overall proficiency, used for exploration and overcoming wild creatures.',
        color: '#9370DB' // MediumPurple
    }
};