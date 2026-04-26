import type { Combatant, NPC, ArenaBehavior } from '$lib/types';

import sylvieTemplateJson from '$lib/assets/data/npcs/sylvie.json';
import cygwinTemplateJson from '$lib/assets/data/npcs/cygwin.json';
import claudiaTemplateJson from '$lib/assets/data/npcs/claudia.json';
import guinevereTemplateJson from '$lib/assets/data/npcs/guinevere.json';
import helaTemplateJson from '$lib/assets/data/npcs/hela.json';
import aoifeTemplateJson from '$lib/assets/data/npcs/aoife.json';
import marjaneTemplateJson from '$lib/assets/data/npcs/marjane.json';
import minervaTemplateJson from '$lib/assets/data/npcs/minerva.json';
import bonnieTemplateJson from '$lib/assets/data/npcs/bonnie.json';
import arianaTemplateJson from '$lib/assets/data/npcs/ariana.json';
import veronaTemplateJson from '$lib/assets/data/npcs/verona.json';
import veresTemplateJson from '$lib/assets/data/npcs/veres.json';
import nemesisTemplateJson from '$lib/assets/data/npcs/nemesis.json';

const sylvieTemplate = sylvieTemplateJson as NPC;
const cygwinTemplate = cygwinTemplateJson as NPC;
const claudiaTemplate = claudiaTemplateJson as NPC;
const guinevereTemplate = guinevereTemplateJson as NPC;
const helaTemplate = helaTemplateJson as NPC;
const aoifeTemplate = aoifeTemplateJson as NPC;
const marjaneTemplate = marjaneTemplateJson as NPC;
const minervaTemplate = minervaTemplateJson as NPC;
const bonnieTemplate = bonnieTemplateJson as NPC;
const arianaTemplate = arianaTemplateJson as NPC;
const veronaTemplate = veronaTemplateJson as NPC;
const veresTemplate = veresTemplateJson as NPC;
const nemesisTemplate = nemesisTemplateJson as NPC;

function withAccuracy(baseStats: NPC['baseStats']): NPC['baseStats'] {
    return { ...baseStats, precision: baseStats.precision ?? 1.0 };
}

// ---------------------------------------------------------------------------
// Arena NPC roster
// ---------------------------------------------------------------------------
const arenaNpcs: Record<string, Combatant> = {

    // -----------------------------------------------------------------------
    // Sylvie — Forest Ranger
    // Patient and reactive. Keeps the player poisoned. Goes feral below 40%.
    // Detects poison immunity on turn 1 and switches to pure damage.
    // -----------------------------------------------------------------------
    sylvie: {
        ...sylvieTemplate,
        baseStats: {
            ...withAccuracy(sylvieTemplate.baseStats),
            maxHp: 600, hp: 600,
            maxAuraShield: 60, auraShield: 60,
            physicalAttack: 120, elementalAttack: 165,
            physicalDefence: 200, elementalDefence: 220,
            evasion: 30, precision: 15, speed: 55,
            critChance: 0.10, critDamage: 1.6,
        },
        drops: [{ itemId: 'arena_silver', chance: 1, quantity: 5 }],
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['vine_whip', 'elemental_blast', 'basic_poison', 'vine_whip'],
                    tactic: 'SEQUENCE',
                },
                {
                    hpThreshold: 0.40,
                    abilities: ['thorned_poison', 'elemental_smite', 'vine_whip'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'TURN_NUMBER_IS', value: 1 },
                    responseAbility: 'basic_poison', priority: 100, oneShot: true
                },
                {
                    condition: { type: 'ENEMY_HAS_FLAG', flag: 'immune_to_poison' },
                    responseAbility: 'elemental_smite', priority: 80
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'poison' },
                    responseAbility: 'basic_poison', priority: 20
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'thorned_poison' },
                    responseAbility: 'thorned_poison', priority: 25
                },
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.30 },
                    responseAbility: 'elemental_smite', priority: 15
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Cygwin — The Iron Lioness
    // Opens with Iron Wall (ATK → DEF), grinds the player down with stuns,
    // debuffs, and poison. Heals twice at key HP thresholds.
    // -----------------------------------------------------------------------
    cygwin: {
        ...cygwinTemplate,
        baseStats: { ...withAccuracy(cygwinTemplate.baseStats), hp: 600, maxHp: 600 },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['warcry_stun', 'crushing_poison', 'smokescreen', 'demoralise', 'basic_slash'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.99 },
                    responseAbility: 'iron_wall', priority: 100, oneShot: true
                },
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.60 },
                    responseAbility: 'second_wind', priority: 50, oneShot: true
                },
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.30 },
                    responseAbility: 'final_resolve', priority: 49, oneShot: true
                },
                {
                    condition: { type: 'ENEMY_HAS_FLAG', flag: 'immune_to_poison' },
                    responseAbility: 'warcry_stun', priority: 30
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'deep_poison' },
                    responseAbility: 'crushing_poison', priority: 20
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Claudia — The Ice Aristocrat
    // DEF → ATK opener, then ramps damage with periodic ATK buffs and debuffs.
    // -----------------------------------------------------------------------
    claudia: {
        ...claudiaTemplate,
        baseStats: { ...withAccuracy(claudiaTemplate.baseStats), hp: 400, maxHp: 400 },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['blizzard_surge', 'elemental_smite', 'penetrate', 'frozen_ground'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.99 },
                    responseAbility: 'frost_reaper', priority: 100, oneShot: true
                },
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 3 },
                    responseAbility: 'frozen_ground', priority: 30
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Guinevere — The Holy Commander
    // Unshackled opener → Glass Cannon safely → burst + execute finisher.
    // -----------------------------------------------------------------------
    guinevere: {
        ...guinevereTemplate,
        baseStats: { ...withAccuracy(guinevereTemplate.baseStats) },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['spirit_storm', 'penetrate', 'divine_judgment', 'sureshot_cataclysm'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.99 },
                    responseAbility: 'unshackled', priority: 110, oneShot: true
                },
                {
                    condition: { type: 'SELF_STATUS_PRESENT', statusId: 'unshackled' },
                    responseAbility: 'frost_reaper', priority: 105, oneShot: true
                },
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.75 },
                    responseAbility: 'sureshot_cataclysm', priority: 100, oneShot: true
                },
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.35 },
                    responseAbility: 'divine_judgment', priority: 20
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Hela — The Juggernaut
    // Innate immunity to stuns AND stat reductions — no debuff, no slow,
    // no control works on her. Resurrects once. Pure war of attrition.
    // You must out-damage her. No tricks allowed.
    // -----------------------------------------------------------------------
    hela: {
        ...helaTemplate,
        baseStats: {
            ...withAccuracy(helaTemplate.baseStats),
            hp: 1400,
            maxHp: 1400,
            maxAuraShield: 400,
            auraShield: 400,
            physicalAttack: 450,
            physicalDefence: 600,
            elementalAttack: 450,
            elementalDefence: 600,
            speed: 85,
            evasion: 80,
            precision: 60,
            critChance: 0.60,
            critDamage: 1.6,
        },

        // Gear passives on NPCs use inflictedBy: 'innate' — permanent, never cleansed
        gearPassives: [
            { id: 'juggernaut_stun_immunity', name: 'Unstoppable', flags: ['immune_to_stun'], description: 'Permanent, and inalienable immunity to [Stun].' },
            { id: 'juggernaut_stat_immunity', name: 'Unbreakable', flags: ['immune_to_stat_reduction'], description: 'Permanent, and inalienable immunity to [Stat Reduction].' },
        ],
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['armor_shatter', 'abyss_poison', 'hellfire', 'night_curse'],
                    tactic: 'RANDOM',
                },
                {
                    hpThreshold: 0.50,
                    abilities: ['hellfire', 'reaping_blow', 'abyss_poison', 'armor_shatter'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.10 },
                    responseAbility: 'resurrection', priority: 200, oneShot: true
                },
                {
                    condition: { type: 'ENEMY_HAS_FLAG', flag: 'immune_to_poison' },
                    responseAbility: 'hellfire', priority: 50
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'abyssal_poison' },
                    responseAbility: 'abyss_poison', priority: 40
                },
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 4 },
                    responseAbility: 'night_curse', priority: 25
                },
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.25 },
                    responseAbility: 'reaping_blow', priority: 50
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Aoife — The Pirate Captain
    // Pure aggression. Fast and hard hitting.
    // -----------------------------------------------------------------------
    aoife: {
        ...aoifeTemplate,
        baseStats: { ...withAccuracy(aoifeTemplate.baseStats), hp: 400, maxHp: 400, physicalAttack: 400, elementalDefence: 300},
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['rapid_volley', 'powder_keg', 'flintlock_barrage', 'rapid_volley'],
                    tactic: 'SEQUENCE',
                },
                {
                    hpThreshold: 0.40,
                    abilities: ['powder_keg', 'flintlock_barrage', 'rapid_volley'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.30 },
                    responseAbility: 'powder_keg', priority: 30
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Marjane — Queen of the Sea
    // Sea Ward opener, Seal of Tides, periodic ascendance, Tidal Surge sustain.
    // -----------------------------------------------------------------------
    marjane: {
        ...marjaneTemplate,
        baseStats: { ...withAccuracy(marjaneTemplate.baseStats), hp: 240, maxHp: 240 },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['tidal_surge', 'blizzard_surge', 'spirit_storm', 'oceanic_ascendance'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.99 },
                    responseAbility: 'sea_ward', priority: 110, oneShot: true
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'seal_of_tides' },
                    responseAbility: 'seal_of_tides', priority: 90, oneShot: true
                },
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 5 },
                    responseAbility: 'oceanic_ascendance', priority: 40
                },
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.50 },
                    responseAbility: 'tidal_surge', priority: 35
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Bonnie — The Berserker
    // Rage stacks every single turn via TURN_MULTIPLE_OF: 1. Thin defence,
    // no healing, no utility. Pure escalating pressure.
    // Kill her fast or she becomes unkillable.
    // Last Stand when cornered — goes out swinging hardest at death's door.
    // -----------------------------------------------------------------------
    bonnie: {
        ...bonnieTemplate,
        baseStats: {
            ...withAccuracy(bonnieTemplate.baseStats),
            hp: 320, maxHp: 320,
            maxAuraShield: 0, auraShield: 0,
            physicalAttack: 190, elementalAttack: 80,
            physicalDefence: 120, elementalDefence: 100,
            evasion: 10, precision: 5, speed: 70,
            critChance: 0.15, critDamage: 1.8,
        },
        arenaBehavior: {
            phases: [
                {
                    // Early: building rage, slashing hard
                    hpThreshold: 1.0,
                    abilities: ['rapid_strike', 'basic_slash', 'basic_slash', 'hammer_smite'],
                    tactic: 'SEQUENCE',
                },
                {
                    // Below 40% HP: pure desperation, abandons the pattern
                    hpThreshold: 0.40,
                    abilities: ['hammer_smite', 'last_stand', 'rapid_strike'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                // Stack rage every single turn — this is the core mechanic
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 1 },
                    responseAbility: 'berserker_rage', priority: 50
                },
                // When cornered, Last Stand takes over entirely
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.30 },
                    responseAbility: 'last_stand', priority: 80
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Ariana — The Lifestealer
    // High HP = high damage (vital_strike). Her entire strategy is staying
    // healthy. Heals aggressively via HoT, lifesteal, and purifying light.
    // If you burst her below 60% her damage collapses — she scrambles to heal.
    // She also has dispel to punish player buffing.
    // -----------------------------------------------------------------------
    ariana: {
        ...arianaTemplate,
        baseStats: {
            ...withAccuracy(arianaTemplate.baseStats),
            hp: 500, maxHp: 500,
            maxAuraShield: 80, auraShield: 80,
            physicalAttack: 100, elementalAttack: 180,
            physicalDefence: 160, elementalDefence: 180,
            evasion: 15, precision: 10, speed: 45,
            critChance: 0.08, critDamage: 1.5,
        },
        arenaBehavior: {
            phases: [
                {
                    // Phase 1: healthy, vital_strike hits hard
                    hpThreshold: 1.0,
                    abilities: ['vital_strike', 'soul_drain', 'dispel', 'vital_strike'],
                    tactic: 'SEQUENCE',
                },
                {
                    // Phase 2: scrambling to recover, leans into healing
                    hpThreshold: 0.60,
                    abilities: ['purifying_light', 'soul_drain', 'blooddrinker', 'vital_strike'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                // Turn 1: start the HoT immediately
                {
                    condition: { type: 'TURN_NUMBER_IS', value: 1 },
                    responseAbility: 'lifebind', priority: 100, oneShot: true
                },
                // Refresh mending aura whenever it lapses
                {
                    condition: { type: 'SELF_STATUS_MISSING', statusId: 'lifebind' },
                    responseAbility: 'lifebind', priority: 30
                },
                // Purifying light when low — cleanses + HoT
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.50 },
                    responseAbility: 'purifying_light', priority: 60, oneShot: true
                },
                // Dispel the player's buffs when they appear
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'mending_aura' },
                    responseAbility: 'dispel', priority: 45
                },
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'purifying_light' },
                    responseAbility: 'dispel', priority: 45
                },
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'unshackled' },
                    responseAbility: 'dispel', priority: 70, oneShot: true
                },
                // Lifesteal finisher when player is low
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.30 },
                    responseAbility: 'soul_drain', priority: 55
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // Minerva — The Punisher
    // Reads your intentions and counters them directly.
    // You buff attack → she raises defence. You apply HoT → she dispels it.
    // You use Lock On → she responds with punishing_blow before you land it.
    // You ignore her → she slowly grinds you down.
    // Forces the player to think every turn or get countered.
    // -----------------------------------------------------------------------
    minerva: {
        ...minervaTemplate,
        baseStats: {
            ...withAccuracy(minervaTemplate.baseStats),
            hp: 450, maxHp: 450,
            maxAuraShield: 100, auraShield: 100,
            physicalAttack: 160, elementalAttack: 130,
            physicalDefence: 200, elementalDefence: 200,
            evasion: 20, precision: 20, speed: 50,
            critChance: 0.10, critDamage: 1.6,
        },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['punishing_blow', 'penetrate', 'demoralise', 'elemental_smite'],
                    tactic: 'RANDOM',
                },
                {
                    // Below 40% HP she stops being reactive and just goes for the kill
                    hpThreshold: 0.40,
                    abilities: ['punishing_blow', 'elemental_smite', 'punishing_blow'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                // Player used Lock On — punish immediately before they land the guaranteed hit
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'lock_on' },
                    responseAbility: 'punishing_blow', priority: 100
                },
                // Player applied Unshackled — dispel it immediately, once
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'unshackled' },
                    responseAbility: 'dispel', priority: 90, oneShot: true
                },
                // Player is healing (HoT) — strip it
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'mending_aura' },
                    responseAbility: 'dispel', priority: 85
                },
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'purifying_light' },
                    responseAbility: 'dispel', priority: 85
                },
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'lifebind' },
                    responseAbility: 'dispel', priority: 85
                },
                // Player buffed attack (fury) — raise her defence
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'fury' },
                    responseAbility: 'counter_stance', priority: 75
                },
                // Player buffed defence (fortify) — ignore defence buffs, attack harder
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'fortify' },
                    responseAbility: 'penetrate', priority: 70
                },
                // Steady pressure: keep player's defences down
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 4 },
                    responseAbility: 'penetrate', priority: 20
                },
                // Execute when low
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.25 },
                    responseAbility: 'punishing_blow', priority: 60
                },
            ],
        } satisfies ArenaBehavior,
    },

    // -----------------------------------------------------------------------
    // verona — The Trickster
    // High evasion. Makes you miss. Punishes missed turns.
    // Double Team + Feint creates a wall of evasion you can't penetrate.
    // Lock On hard-counters her — she has no immunity to guaranteed_hit.
    // High precision means your evasion doesn't help much either.
    // -----------------------------------------------------------------------
    verona: {
        ...veronaTemplate,
        baseStats: {
            ...withAccuracy(veronaTemplate.baseStats),
            hp: 280, maxHp: 280,
            maxAuraShield: 40, auraShield: 40,
            physicalAttack: 170, elementalAttack: 100,
            physicalDefence: 130, elementalDefence: 120,
            evasion: 60,      // very high base evasion — core of her identity
            precision: 40,    // high precision — your evasion doesn't help much against her
            speed: 75,        // fast — often goes first
            critChance: 0.18, critDamage: 1.9,
        },
        arenaBehavior: {
            phases: [
                {
                    // Phase 1: evasion stacking + chip damage
                    hpThreshold: 1.0,
                    abilities: ['double_team', 'smokescreen', 'rapid_strike', 'feint'],
                    tactic: 'SEQUENCE',
                },
                {
                    // Phase 2: evasion is established, now she exploits it
                    hpThreshold: 0.50,
                    abilities: ['shadow_strike', 'rapid_strike', 'feint', 'double_team'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                // Turn 1: immediately establish evasion advantage
                {
                    condition: { type: 'TURN_NUMBER_IS', value: 1 },
                    responseAbility: 'double_team', priority: 100, oneShot: true
                },
                // Keep feint (enemy precision debuff) active
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'feint' },
                    responseAbility: 'feint', priority: 35
                },
                // Player used Lock On — she can't prevent the hit, but she strikes first
                // and tries to finish them off before the guaranteed hit lands
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'lock_on' },
                    responseAbility: 'shadow_strike', priority: 90
                },
                // When double_team is active she's safe behind evasion — go on offense
                {
                    condition: { type: 'SELF_STATUS_PRESENT', statusId: 'double_team' },
                    responseAbility: 'rapid_strike', priority: 25
                },
                // Execute finisher
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.25 },
                    responseAbility: 'shadow_strike', priority: 70
                },
            ],
        } satisfies ArenaBehavior,
    },
    nemesis: {
        ...nemesisTemplate,
        baseStats: {
            ...withAccuracy(nemesisTemplate.baseStats),
            hp: 280, maxHp: 280,
            maxAuraShield: 40, auraShield: 40,
            physicalAttack: 170, elementalAttack: 100,
            physicalDefence: 130, elementalDefence: 120,
            evasion: 60,      // very high base evasion — core of her identity
            precision: 40,    // high precision — your evasion doesn't help much against her
            speed: 75,        // fast — often goes first
            critChance: 0.18, critDamage: 1.9,
        },
        arenaBehavior: {
            phases: [
                {
                    // Phase 1: evasion stacking + chip damage
                    hpThreshold: 1.0,
                    abilities: ['double_team', 'smokescreen', 'rapid_strike', 'feint'],
                    tactic: 'SEQUENCE',
                },
                {
                    // Phase 2: evasion is established, now she exploits it
                    hpThreshold: 0.50,
                    abilities: ['shadow_strike', 'rapid_strike', 'feint', 'double_team'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                // Turn 1: immediately establish evasion advantage
                {
                    condition: { type: 'TURN_NUMBER_IS', value: 1 },
                    responseAbility: 'double_team', priority: 100, oneShot: true
                },
                // Keep feint (enemy precision debuff) active
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'feint' },
                    responseAbility: 'feint', priority: 35
                },
                // Player used Lock On — she can't prevent the hit, but she strikes first
                // and tries to finish them off before the guaranteed hit lands
                {
                    condition: { type: 'ENEMY_STATUS_PRESENT', statusId: 'lock_on' },
                    responseAbility: 'shadow_strike', priority: 90
                },
                // When double_team is active she's safe behind evasion — go on offense
                {
                    condition: { type: 'SELF_STATUS_PRESENT', statusId: 'double_team' },
                    responseAbility: 'rapid_strike', priority: 25
                },
                // Execute finisher
                {
                    condition: { type: 'PLAYER_HP_BELOW', value: 0.25 },
                    responseAbility: 'shadow_strike', priority: 70
                },
            ],
        } satisfies ArenaBehavior,
    },
    veres: {
        ...veresTemplate,
        baseStats: { ...withAccuracy(veresTemplate.baseStats), hp: 240, maxHp: 240 },
        arenaBehavior: {
            phases: [
                {
                    hpThreshold: 1.0,
                    abilities: ['tidal_surge', 'blizzard_surge', 'spirit_storm', 'oceanic_ascendance'],
                    tactic: 'RANDOM',
                },
            ],
            triggers: [
                {
                    condition: { type: 'SELF_HP_ABOVE', value: 0.99 },
                    responseAbility: 'sea_ward', priority: 110, oneShot: true
                },
                {
                    condition: { type: 'ENEMY_STATUS_MISSING', statusId: 'seal_of_tides' },
                    responseAbility: 'seal_of_tides', priority: 90, oneShot: true
                },
                {
                    condition: { type: 'TURN_MULTIPLE_OF', value: 5 },
                    responseAbility: 'oceanic_ascendance', priority: 40
                },
                {
                    condition: { type: 'SELF_HP_BELOW', value: 0.50 },
                    responseAbility: 'tidal_surge', priority: 35
                },
            ],
        } satisfies ArenaBehavior,
    },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getArenaNpc(id: string): Combatant | undefined {
    const npc = arenaNpcs[id];
    if (!npc) return undefined;
    return JSON.parse(JSON.stringify(npc)) as Combatant;
}

export function getAvailableArenaOpponents(): { id: string; name: string }[] {
    return Object.values(arenaNpcs).map(npc => ({ id: npc.id, name: npc.name }));
}

export function getAllArenaNpcIds(): string[] {
    return Object.keys(arenaNpcs);
}