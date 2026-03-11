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
        color: '#dad7cd' // LightGray
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
    precision: {
        id: 'precision',
        name: 'Precision',
        abbr: 'PRS',
        description: 'Point-for-Point reduction to enemy Evasion.',
        color: '#FA75B1' // MediumPurple
    }
};

export const elementColors: { [key: string]: string } = {
    fire: '#ffffff',
    water: '#ffffff',
    earth: '#ffffff',
    wind: '#2b2b2b',
    light: '#111111',
    dark: '#f8a6d4',
    normal: '#222',
    none: '#666666' // Default color for 'None' element
};

export const elementBgs: { [key: string]: string } = {
    fire: '#cc4113',
    water: '#276b9f',
    earth: '#2d7645',
    wind: '#4bc7e3',
    light: '#f0e68c',
    dark: '#452e6f',
    normal: '#fff',
    none: '#ffffff' // Default color for 'None' element
};
