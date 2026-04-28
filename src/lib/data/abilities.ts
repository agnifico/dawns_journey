import type { Ability, GearPassive } from '$lib/types';
import { ABILITY_MODE } from '$lib/config/abilityConfig';


/**
 * All game abilities.
 * Effects are executed in order.
 */
export const playerAbilities: Ability[] = [
    // -------------------------------------------------------------------------
    // Basic / shared
    // -------------------------------------------------------------------------
    {
        id: 'basic_slash',
        name: 'Basic Slash',
        description: 'A simple physical attack dealing 30% of Physical Attack.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.30 }]
    },
    {
        id: 'minor_heal',
        name: 'Minor Heal',
        description: 'Restores HP equal to 25% of your Elemental Attack.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [{ type: 'heal', healType: 'hp', multiplier: 0.25, basedOn: 'elementalAttack', target: 'self' }]
    },
    {
        id: 'minor_heal2',
        name: 'Minor Heal 2',
        description: 'Restores HP equal to 25% of your Physical Attack.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [{ type: 'heal', healType: 'hp', multiplier: 0.25, basedOn: 'physicalAttack', target: 'self' }]
    },
    {
        id: 'elemental_blast',
        name: 'Elemental Blast',
        description: 'An elemental attack dealing 20% of Elemental Attack.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 0.20 }]
    },
    {
        id: 'elemental_smite',
        name: 'Elemental Smite',
        description: 'An elemental attack dealing 40% of Elemental Attack.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 0.40 }]
    },
    {
        id: 'spirit_storm',
        name: 'Spirit Storm',
        description: 'An elemental attack dealing 60% of Elemental Attack with 75% chance, twice.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 0.75,
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 0.6, hitCount: 2 }]
    },
    {
        id: 'cataclysm',
        name: 'Cataclysm',
        description: 'An elemental attack dealing 120% of Elemental Attack. 60% accuracy.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 0.60,
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 1.2 }]
    },
    {
        id: 'sureshot_cataclysm',
        name: 'Cataclysm',
        description: 'An elemental attack dealing 150% of Elemental Attack.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 1,
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 1.5 }]
    },
    {
        id: 'basic_poison',
        name: 'Basic Poison',
        description: 'Poisons the target for 6 turns (5% max HP per turn).',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy', stackBehavior: 'stack',
            statusEffect: { id: 'poison', name: 'Poison', duration: 6, damagePerTurn: 0.05, category: 'poison' }
        }]
    },
    {
        id: 'rapid_strike',
        name: 'Rapid Strike',
        description: 'Strikes 5 times, each hit dealing 8% Physical Attack. 80% accuracy.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 0.80,
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.08, hitCount: 5 }]
    },
    {
        id: 'hammer_smite',
        name: 'Hammer Smite',
        description: 'A devastating 70% Physical Attack blow — but stuns yourself for 2 turns.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'both',
        effects: [
            { type: 'damage', damageType: 'physical', multiplier: 0.70 },
            {
                type: 'apply_status', target: 'self',
                statusEffect: { id: 'self_stun', name: 'Stunned', duration: 2, isStunned: true }
            }
        ]
    },
    {
        id: 'stun',
        name: 'Stun',
        description: 'Deals 10% Elemental Attack and stuns the enemy for 3 turns. 90% accuracy.',
        abilityType: 'Elemental Damage',
        category: 'control',
        targetType: 'enemy',
        accuracy: 0.90,
        effects: [
            { type: 'damage', damageType: 'elemental', multiplier: 0.10 },
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: { id: 'stunned', name: 'Stunned', duration: 3, isStunned: true, category: 'stun' }
            }
        ]
    },
    {
        id: 'execution',
        name: 'Execution',
        description: 'Deals 50% Elemental Attack. If enemy HP is below 20%, deals 70% instead.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'elemental',
            baseMultiplier: 0.50, condition: 'hp_below', threshold: 0.20, bonusMultiplier: 0.70
        }]
    },
    {
        id: 'shield_breaker',
        name: 'Shield Breaker',
        description: 'Reduces enemy Aura Shield by 25% of its max value.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{ type: 'shield_manipulate', operation: 'reduce', amount: 0.25 }]
    },
    {
        id: 'smokescreen',
        name: 'Smokescreen',
        description: 'Deals 10% Physical Attack and reduces enemy evasion by 20 for 3 turns.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [
            { type: 'damage', damageType: 'physical', multiplier: 0.10 },
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: {
                    id: 'smokescreen_debuff',
                    name: 'Smokescreen',
                    duration: 3,
                    statModifiers: { evasion: -20 }
                }
            }
        ]
    },
    {
        id: 'fury',
        name: 'Fury',
        description: 'Raises your Physical and Elemental Attack by 15% for 3 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'fury',
                name: 'Fury',
                duration: 3,
                statModifiers: { physicalAttack: 1.15, elementalAttack: 1.15 }
            }
        }]
    },
    {
        id: 'fortify',
        name: 'Fortify',
        description: 'Raises your Physical and Elemental Defence by 15% for 3 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'fortify',
                name: 'Fortify',
                duration: 3,
                statModifiers: { physicalDefence: 1.15, elementalDefence: 1.15 }
            }
        }]
    },
    {
        id: 'demoralise',
        name: 'Demoralise',
        description: 'Reduces enemy Physical and Elemental Attack by 15% for 3 turns.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: {
                id: 'demoralise',
                name: 'Demoralised',
                duration: 3,
                statModifiers: { physicalAttack: 0.85, elementalAttack: 0.85 }
            }
        }]
    },
    {
        id: 'penetrate',
        name: 'Penetrate',
        description: 'Reduces enemy Physical and Elemental Defence by 15% for 3 turns.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: {
                id: 'penetrate',
                name: 'Armour Broken',
                duration: 3,
                statModifiers: { physicalDefence: 0.85, elementalDefence: 0.85 }
            }
        }]
    },
];

export const npcAbilities: Ability[] = [
    // -------------------------------------------------------------------------
    // Cygwin — The Iron Lioness
    // -------------------------------------------------------------------------
    {
        id: 'iron_wall',
        name: 'Iron Wall',
        description: 'Converts both Attack stats into Defence, reducing them to 20% of their value.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'stat_transfer',
            transfers: [
                { sourceStat: 'physicalAttack', targetStat: 'physicalDefence', retainRatio: 0.20 },
                { sourceStat: 'elementalAttack', targetStat: 'elementalDefence', retainRatio: 0.20 }
            ]
        }]
    },
    {
        id: 'crushing_poison',
        name: 'Crushing Poison',
        description: 'Inflicts a deep poison for 6 turns (8% max HP per turn).',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: { id: 'deep_poison', name: 'Deep Poison', duration: 6, damagePerTurn: 0.08, category: 'poison' }
        }]
    },
    {
        id: 'warcry_stun',
        name: 'War Cry',
        description: 'Stuns the enemy for 2 turns and reduces their Attack by 20% for 4 turns. 85% accuracy.',
        abilityType: 'Special',
        category: 'control',
        targetType: 'enemy',
        accuracy: 0.85,
        effects: [
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: { id: 'stunned', name: 'Stunned', duration: 2, isStunned: true, category: 'stun' }
            },
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: {
                    id: 'warcry_debuff',
                    name: 'War Cry Debuff',
                    duration: 4,
                    statModifiers: { physicalAttack: 0.80, elementalAttack: 0.80 }
                }
            }
        ]
    },
    {
        id: 'second_wind',
        name: 'Second Wind',
        description: 'Recovers 20% of max HP.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [{ type: 'heal_percent_max_hp', target: 'self', percent: 0.20 }]
    },
    {
        id: 'final_resolve',
        name: 'Final Resolve',
        description: 'Draws on the last reserves of strength, recovering 40% of max HP and surging Attack by 150% for 10 turns.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [
            { type: 'heal_percent_max_hp', target: 'self', percent: 0.40 },
            {
                type: 'apply_status', target: 'self',
                statusEffect: {
                    id: 'final_resolve_buff',
                    name: 'Final Resolve',
                    duration: 10,
                    statModifiers: { physicalAttack: 2.5, elementalAttack: 2.5 }
                }
            }
        ]
    },

    // -------------------------------------------------------------------------
    // Claudia — The Ice Aristocrat
    // -------------------------------------------------------------------------
    {
        id: 'frost_reaper',
        name: 'Reaper in the Frost',
        description: 'Converts both Defences into Attack, reducing them to 20% of their value.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'stat_transfer',
            transfers: [
                { sourceStat: 'physicalDefence', targetStat: 'physicalAttack', retainRatio: 0.20 },
                { sourceStat: 'elementalDefence', targetStat: 'elementalAttack', retainRatio: 0.20 }
            ]
        }]
    },
    {
        id: 'blizzard_surge',
        name: 'Blizzard Surge',
        description: 'Deals 55% Elemental Attack and shatters enemy defences by 25% for 3 turns.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [
            { type: 'damage', damageType: 'elemental', multiplier: 0.55 },
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: {
                    id: 'blizzard_debuff',
                    name: 'Shattered Armour',
                    duration: 3,
                    statModifiers: { physicalDefence: 0.75, elementalDefence: 0.75 }
                }
            }
        ]
    },
    {
        id: 'frozen_ground',
        name: 'Frozen Ground',
        description: 'The battlefield freezes around Claudia, raising her Elemental Attack by 25% for 4 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'frozen_ground',
                name: 'Frozen Ground',
                duration: 4,
                statModifiers: { elementalAttack: 1.25 }
            }
        }]
    },

    // -------------------------------------------------------------------------
    // Guinevere — The Holy Commander
    // -------------------------------------------------------------------------
    {
        id: 'player_unshackled',
        name: 'Player Unshackled',
        description: 'Player becomes immune to stat reductions and to the cost of transfer abilities for the rest of the fight.',
        abilityType: 'Special',
        category: 'utility',
        targetType: 'self',
        isPassive: true,
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'unshackled',
                name: 'Unshackled',
                duration: 999,
                flags: ['immune_to_stat_reduction', 'immune_to_transfer_reduction']
            }
        }]
    },
    {
        id: 'divine_judgment',
        name: 'Divine Judgment',
        description: 'Deals 60% Elemental Attack. If the enemy is below 35% HP, deals 120% instead.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'elemental',
            baseMultiplier: 0.60, condition: 'hp_below', threshold: 0.35, bonusMultiplier: 1.20
        }]
    },

    // -------------------------------------------------------------------------
    // Hela — The Juggernaut
    // -------------------------------------------------------------------------
    // {
    //     id: 'resurrection',
    //     name: "Queen's Resurrection",
    //     description: 'When Hela falls below 10% HP, she rises and restores herself to full.',
    //     abilityType: 'Special',
    //     category: 'heal',
    //     targetType: 'self',
    //     isPassive: true,
    //     effects: [{ type: 'heal_full', target: 'self' }]
    // },
    {
        id: 'abyss_poison',
        name: 'Abyssal Toxin',
        description: 'Inflicts a virulent poison for 8 turns (12% max HP per turn).',
        abilityType: 'Special',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: { id: 'abyssal_poison', name: 'Abyssal Toxin', duration: 8, damagePerTurn: 0.12, category: 'poison' }
        }],
        category: 'damage',
        targetType: 'enemy'
    },
    {
        id: 'hellfire',
        name: 'Hellfire',
        description: 'An overwhelming elemental strike dealing 80% of Elemental Attack.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 0.80 }]
    },
    {
        id: 'armor_shatter',
        name: 'Armor Shatter',
        description: "Crushes the enemy's armour, reducing both Defences by 35% for 5 turns.",
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: {
                id: 'armor_shatter',
                name: 'Armor Shattered',
                duration: 5,
                statModifiers: { physicalDefence: 0.65, elementalDefence: 0.65 }
            }
        }]
    },
    {
        id: 'night_curse',
        name: "Night's Curse",
        description: 'Hela wraps herself in the dark of night, raising all Attacks and Defences by 25% for 6 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'night_curse',
                name: "Night's Curse",
                duration: 6,
                statModifiers: { physicalAttack: 1.25, elementalAttack: 1.25, physicalDefence: 1.25, elementalDefence: 1.25 }
            }
        }]
    },
    {
        id: 'reaping_blow',
        name: 'Reaping Blow',
        description: 'Deals 60% Elemental Attack. If the enemy is below 25% HP, deals 150% instead.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'elemental',
            baseMultiplier: 0.60, condition: 'hp_below', threshold: 0.25, bonusMultiplier: 1.50
        }]
    },

    // -------------------------------------------------------------------------
    // Sylvie — Forest Ranger
    // -------------------------------------------------------------------------
    {
        id: 'vine_whip',
        name: 'Vine Whip',
        description: 'Nature lashes back — deals 35% Elemental Attack and reduces enemy Speed by 30% for 2 turns.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 0.90,
        effects: [
            { type: 'damage', damageType: 'elemental', multiplier: 0.35 },
            {
                type: 'apply_status', target: 'enemy',
                statusEffect: {
                    id: 'vine_whip_slow',
                    name: 'Slowed',
                    duration: 2,
                    statModifiers: { speed: 0.70 }
                }
            }
        ]
    },
    {
        id: 'thorned_poison',
        name: 'Thorned Poison',
        description: 'The forest strikes back — inflicts a brutal poison for 8 turns (8% max HP per turn).',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy', stackBehavior: 'stack',
            statusEffect: { id: 'thorned_poison', name: 'Thorned Poison', duration: 8, damagePerTurn: 0.08, category: 'poison' }
        }]
    },

    // -------------------------------------------------------------------------
    // Aoife — The Pirate Captain
    // -------------------------------------------------------------------------
    {
        id: 'rapid_volley',
        name: 'Rapid Volley',
        description: 'Fires 6 shots in quick succession, each dealing 10% Physical Attack. 85% accuracy.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        accuracy: 0.55,
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.02, hitCount: 100 }]
    },
    {
        id: 'powder_keg',
        name: 'Powder Keg',
        description: 'A single catastrophic shot dealing 90% Physical Attack.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.90 }]
    },
    {
        id: 'flintlock_barrage',
        name: 'Flintlock Barrage',
        description: 'Unloads both pistols in a rapid elemental burst — 3 hits, each dealing 20% Elemental Attack.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'elemental', multiplier: 0.20, hitCount: 3 }]
    },

    // -------------------------------------------------------------------------
    // Marjane — Queen of the Sea
    // -------------------------------------------------------------------------
    {
        id: 'sea_ward',
        name: 'Sea Ward',
        description: 'The sea itself protects Marjane — she becomes immune to all stat reductions for the rest of the fight.',
        abilityType: 'Special',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: { id: 'sea_ward', name: 'Sea Ward', duration: 999, flags: ['immune_to_stat_reduction'] }
        }],
        category: 'utility',
        targetType: 'self'
    },
    {
        id: 'seal_of_tides',
        name: 'Seal of Tides',
        description: 'Binds the enemy with the weight of the ocean — they cannot gain stat increases for 6 turns.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: { id: 'seal_of_tides', name: 'Seal of Tides', duration: 6, flags: ['immune_to_stat_increase'] }
        }]
    },
    {
        id: 'tidal_surge',
        name: 'Tidal Surge',
        description: 'Crashes a wave of elemental force for 70% Elemental Attack, then heals herself for 15% of her Elemental Attack.',
        abilityType: 'Elemental Damage',
        effects: [
            { type: 'damage', damageType: 'elemental', multiplier: 0.70 },
            { type: 'heal', healType: 'hp', multiplier: 0.15, basedOn: 'elementalAttack', target: 'self' }
        ],
        category: 'buff',
        targetType: 'both'
    },
    {
        id: 'oceanic_ascendance',
        name: 'Oceanic Ascendance',
        description: 'Marjane channels the full power of the sea, raising all Attacks and Defences by 30% for 4 turns.',
        abilityType: 'Special',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'oceanic_ascendance',
                name: 'Oceanic Ascendance',
                duration: 4,
                statModifiers: { physicalAttack: 1.30, elementalAttack: 1.30, physicalDefence: 1.30, elementalDefence: 1.30 }
            }
        }],
        category: 'buff',
        targetType: 'self'
    },

    // -------------------------------------------------------------------------
    // Utility (player + NPC)
    // -------------------------------------------------------------------------
    {
        id: 'cleanse',
        name: 'Cleanse',
        description: 'Purges all negative effects from yourself — poisons, stuns, and stat debuffs.',
        abilityType: 'Special',
        category: 'utility',
        targetType: 'self',
        effects: [{ type: 'cleanse', cleanse: 'negative', target: 'self' }]
    },
    {
        id: 'dispel',
        name: 'Dispel',
        description: "Strips all positive effects from the enemy — buffs and ability-granted immunities. Gear passives cannot be dispelled.",
        abilityType: 'Special',
        category: 'utility',
        targetType: 'enemy',
        effects: [{ type: 'cleanse', cleanse: 'positive', target: 'enemy' }]
    },
    {
        id: 'mending_aura',
        name: 'Mending Aura',
        description: 'Surrounds yourself in a healing aura, restoring 6% max HP per turn for 4 turns.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: { id: 'mending_aura', name: 'Mending Aura', duration: 4, healPerTurn: 0.06 }
        }]
    },
    {
        id: 'purifying_light',
        name: 'Purifying Light',
        description: 'Cleanses all negative effects and bathes yourself in healing light, restoring 5% max HP per turn for 3 turns.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [
            { type: 'cleanse', cleanse: 'negative', target: 'self' },
            {
                type: 'apply_status', target: 'self',
                statusEffect: { id: 'purifying_light', name: 'Purifying Light', duration: 3, healPerTurn: 0.05 }
            }
        ]
    },
    {
        id: 'blooddrinker',
        name: 'Blooddrinker',
        description: 'Deals 60% Physical Attack and heals for 40% of damage dealt.',
        abilityType: 'Physical Damage',
        category: 'heal',
        targetType: 'both',
        effects: [{ type: 'lifesteal', damageType: 'physical', multiplier: 0.60, healRatio: 0.40 }]
    },
    {
        id: 'soul_drain',
        name: 'Soul Drain',
        description: 'Deals 50% Elemental Attack and heals for 50% of damage dealt.',
        abilityType: 'Elemental Damage',
        category: 'heal',
        targetType: 'both',
        effects: [{ type: 'lifesteal', damageType: 'elemental', multiplier: 0.50, healRatio: 0.50 }]
    },
    {
        id: 'last_stand',
        name: 'Last Stand',
        description: 'Deals 40% Physical Attack normally. Below 30% HP, desperation surges through — deals 160% instead.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'physical',
            baseMultiplier: 0.40, condition: 'self_hp_below', threshold: 0.30, bonusMultiplier: 1.60
        }]
    },
    {
        id: 'death_surge',
        name: 'Death Surge',
        description: 'Deals 35% Elemental Attack normally. Below 25% HP, raw survival instinct erupts — deals 200% instead.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'elemental',
            baseMultiplier: 0.35, condition: 'self_hp_below', threshold: 0.25, bonusMultiplier: 2.00
        }]
    },
    {
        id: 'lock_on',
        name: 'Lock On',
        description: 'You fix your aim on the target — your next ability cannot miss and cannot be dodged.',
        abilityType: 'Special',
        category: 'utility',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: { id: 'lock_on', name: 'Lock On', duration: 1, flags: ['guaranteed_hit'] }
        }]
    },

    // -------------------------------------------------------------------------
    // Verona — The Speed Duelist
    // -------------------------------------------------------------------------
    {
        id: 'double_team',
        name: 'Double Team',
        description: 'Verona blurs into afterimages, dramatically raising her evasion for 3 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'double_team',
                name: 'Double Team',
                duration: 3,
                statModifiers: { evasion: 40 }
            }
        }]
    },
    {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        description: 'Strikes from the blind spot — deals 55% Physical Attack.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.55 }]
    },
    {
        id: 'feint',
        name: 'Feint',
        description: 'Reduces enemy precision by 30 for 4 turns, making their attacks easier to dodge.',
        abilityType: 'Special',
        category: 'debuff',
        targetType: 'enemy',
        effects: [{
            type: 'apply_status', target: 'enemy',
            statusEffect: {
                id: 'feint',
                name: 'Feinted',
                duration: 4,
                statModifiers: { precision: -30 }
            }
        }]
    },

    // -------------------------------------------------------------------------
    // Bonnie — The Berserker
    // -------------------------------------------------------------------------
    {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        description: 'Raw fury builds — raises Physical and Elemental Attack by 20% for 2 turns. Stacks with itself.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self', stackBehavior: 'stack',
            statusEffect: {
                id: 'berserker_rage',
                name: 'Berserker Rage',
                duration: 2,
                statModifiers: { physicalAttack: 1.20, elementalAttack: 1.20 }
            }
        }]
    },

    // -------------------------------------------------------------------------
    // Ariana — The Lifestealer
    // -------------------------------------------------------------------------
    {
        id: 'vital_strike',
        name: 'Vital Strike',
        description: 'Deals 50% Elemental Attack normally. Above 60% HP, full vitality amplifies the blow to 130%.',
        abilityType: 'Elemental Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{
            type: 'conditional_damage', damageType: 'elemental',
            baseMultiplier: 0.50, condition: 'hp_above', threshold: 0.60, bonusMultiplier: 1.30
        }]
    },
    {
        id: 'lifebind',
        name: 'Lifebind',
        description: 'Weaves life energy into the air, regenerating 4% max HP per turn for 4 turns.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: { id: 'lifebind', name: 'Lifebind', duration: 4, healPerTurn: 0.04 }
        }]
    },

    // -------------------------------------------------------------------------
    // Minerva — The Punisher
    // -------------------------------------------------------------------------
    {
        id: 'counter_stance',
        name: 'Counter Stance',
        description: 'Minerva reads the threat and braces — raises both Defences by 30% for 3 turns.',
        abilityType: 'Special',
        category: 'buff',
        targetType: 'self',
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'counter_stance',
                name: 'Counter Stance',
                duration: 3,
                statModifiers: { physicalDefence: 1.30, elementalDefence: 1.30 }
            }
        }]
    },
    {
        id: 'punishing_blow',
        name: 'Punishing Blow',
        description: 'A calculated strike dealing 65% Physical Attack. No frills — just consequence.',
        abilityType: 'Physical Damage',
        category: 'damage',
        targetType: 'enemy',
        effects: [{ type: 'damage', damageType: 'physical', multiplier: 0.65 }]
    },
];

export const passiveAbilities: Ability[] = [
    {
        id: 'resurrection',
        name: "Queen's Resurrection",
        description: 'When Hela falls below 10% HP, she rises and restores herself to full.',
        abilityType: 'Special',
        category: 'heal',
        targetType: 'self',
        isPassive: true,
        effects: [{ type: 'heal_full', target: 'self' }]
    },
    {
        id: 'unshackled',
        name: 'Unshackled',
        description: 'Guinevere becomes immune to stat reductions and to the cost of transfer abilities for the rest of the fight.',
        abilityType: 'Special',
        category: 'utility',
        targetType: 'self',
        isPassive: true,
        effects: [{
            type: 'apply_status', target: 'self',
            statusEffect: {
                id: 'unshackled',
                name: 'Unshackled',
                duration: 999,
                flags: ['immune_to_stat_reduction', 'immune_to_transfer_reduction']
            }
        }]
    },
    // Add future weapon passives here as well — poison immunity, HP drain, etc.
    // GearPassive.svelte can then look them up by id from this array.
];

export function getAbilityById(id: string): Ability | undefined {
    return (
        playerAbilities.find(a => a.id === id) ||
        npcAbilities.find(a => a.id === id) ||
        passiveAbilities.find(a => a.id === id)
    );
}

export const allAbilities: Ability[] =
    ABILITY_MODE === 'dev'
        ? [...playerAbilities, ...npcAbilities, ...passiveAbilities]
        : playerAbilities;


export const gearPassives: GearPassive[] = [
    // Generic immunity passives — used across items and NPCs
    {
        id: 'stun_immunity',
        name: 'Stun Immunity',
        description: 'Gain complete immunity to [Stun].',
        flags: ['immune_to_stun'],
    },
    {
        id: 'poison_immunity',
        name: 'Poison Immunity',
        description: 'Gain complete immunity to [Poison].',
        flags: ['immune_to_poison'],
    },
    {
        id: 'bleed_immunity',
        name: 'Bleed Immunity',
        description: 'Gain complete immunity to [Bleed].',
        flags: ['immune_to_bleed'],
    },
    {
        id: 'burn_immunity',
        name: 'Burn Immunity',
        description: 'Gain complete immunity to [Burn].',
        flags: ['immune_to_burn'],
    },
    {
        id: 'freeze_immunity',
        name: 'Freeze Immunity',
        description: 'Gain complete immunity to [Freeze].',
        flags: ['immune_to_freeze'],
    },
    {
        id: 'stat_reduction_immunity',
        name: 'Iron Will',
        description: 'Stats cannot be reduced by enemy abilities.',
        flags: ['immune_to_stat_reduction'],
    },

    // Hela-flavoured (innate to her)
    {
        id: 'juggernaut_stun_immunity',
        name: 'Unstoppable',
        description: 'Permanent and inalienable immunity to [Stun].',
        flags: ['immune_to_stun'],
    },
    {
        id: 'juggernaut_stat_immunity',
        name: 'Unbreakable',
        description: 'Permanent and inalienable immunity to [Stat Reduction].',
        flags: ['immune_to_stat_reduction'],
    },

    // Guinevere-flavoured (her existing passive)
    {
        id: 'unshackled',
        name: 'Unshackled',
        description: 'Cannot be weakened by reduction or transfer effects.',
        flags: ['immune_to_stat_reduction', 'immune_to_transfer_reduction'],
    },
];

export const getGearPassiveById = (id: string): GearPassive | undefined =>
    gearPassives.find(p => p.id === id);