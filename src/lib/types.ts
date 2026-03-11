export interface Position {
    x: number;
    y: number;
}

export interface Stat {
    name: string;
    value: number;
}

export type ItemType = 'general' | 'relic' | 'weapon';

export interface GearPassive {
    id: string;
    name: string;
    flags: StatusEffect['flags'];
    description?: string;
}

export interface Item {
    price?: any;
    id: string;
    instanceId?: string;
    name: string;
    description: string;
    image: string;
    type: ItemType;
    stats?: Stat[];
    effects?: { hp?: number; auraShield?: number; }[];
    activeEffects?: ActiveEffect[];
    element?: string;
    flags?: string[];
    exploration?: { name: string, level: number }[];
    plantId?: string;
    gearPassives?: GearPassive[];
}

export interface Weapon extends Item {
    type: 'weapon';
}

export interface Relic extends Item {
    type: 'relic';
}

export interface PlayerBaseStats {
    hp: number;
    maxHp: number;
    auraShield: number;
    maxAuraShield: number;
    physicalAttack: number;
    physicalDefence: number;
    elementalAttack: number;
    elementalDefence: number;
    speed: number;
    evasion: number;
    critChance: number;
    critDamage: number;
    precision: number;
}

import type { AnyAbilityEffect } from '$lib/services/abilityEffects';

export type AbilityType = 'Physical Damage' | 'Elemental Damage' | 'Special';

export interface Ability {
    id: string;
    name: string;
    description: string;
    abilityType: AbilityType;
    accuracy?: number;
    effects: AnyAbilityEffect[];
}

export interface StatusEffect {
    id: string;
    name: string;
    duration: number;
    remainingTurns?: number;
    /** % of maxHp dealt as damage each turn. */
    damagePerTurn?: number;
    /** % of maxHp restored as HP each turn. */
    healPerTurn?: number;
    damageType?: 'physical' | 'elemental';
    statModifiers?: Partial<Omit<PlayerBaseStats, 'hp' | 'maxHp' | 'auraShield' | 'maxAuraShield'>>;
    inflictedBy?: string;
    isStunned?: boolean;
    /**
     * Immunity / passive flags.
     *
     * immune_to_stat_reduction     — blocks incoming stat debuffs
     * immune_to_stat_increase      — blocks incoming stat buffs (used on player by enemy)
     * immune_to_transfer_reduction — suppresses loss half of stat_transfer
     * immune_to_poison             — blocks any apply_status with category: 'poison'
     * immune_to_stun               — blocks any apply_status with category: 'stun'
     * guaranteed_hit               — next damage/lifesteal ability skips accuracy + evasion rolls
     */
    flags?: Array<
        | 'immune_to_stat_reduction'
        | 'immune_to_stat_increase'
        | 'immune_to_transfer_reduction'
        | 'immune_to_poison'
        | 'immune_to_stun'
        | 'guaranteed_hit'
    >;
}

// ---------------------------------------------------------------------------
// Arena AI
// ---------------------------------------------------------------------------

export type ArenaTriggerCondition =
    | { type: 'PLAYER_HP_BELOW'; value: number }
    | { type: 'SELF_HP_BELOW'; value: number }
    | { type: 'SELF_HP_ABOVE'; value: number }
    | { type: 'ENEMY_STATUS_MISSING'; statusId: string }
    | { type: 'ENEMY_STATUS_PRESENT'; statusId: string }
    | { type: 'SELF_STATUS_PRESENT'; statusId: string }
    | { type: 'TURN_MULTIPLE_OF'; value: number }
    | { type: 'TURN_NUMBER_IS'; value: number }
    | { type: 'SELF_STATUS_MISSING'; statusId: string }
    | { type: 'ENEMY_HAS_FLAG'; flag: string };

export interface ArenaTrigger {
    condition: ArenaTriggerCondition;
    responseAbility: string;
    priority: number;
    oneShot?: boolean;
}

export type ArenaPhaseAbility = string | { id: string; maxUses: number };

export interface ArenaPhase {
    hpThreshold: number;
    abilities: ArenaPhaseAbility[];
    tactic: 'RANDOM' | 'SEQUENCE';
}

export interface ArenaBehavior {
    phases: ArenaPhase[];
    triggers?: ArenaTrigger[];
}

// ---------------------------------------------------------------------------
// Combatant
// ---------------------------------------------------------------------------

export interface Combatant {
    gearPassives: GearPassive[];
    baseStats: PlayerBaseStats;
    hp: number;
    maxHp: number;
    auraShield: number;
    maxAuraShield: number;
    physicalAttack: number;
    physicalDefence: number;
    elementalAttack: number;
    elementalDefence: number;
    speed: number;
    evasion: number;
    critChance: number;
    critDamage: number;
    precision: number;
    id: string;
    name: string;
    isPlayer: boolean;
    image: string;
    profileImage: string;
    elements: string[];
    activeElement: string;
    abilities: Ability[];
    /**
     * All active status effects including gear passives
     * (inflictedBy: 'equipment' | 'innate' — never expire, never cleansed).
     */
    statusEffects: StatusEffect[];
    equipment?: {
        weapon_slots: (Weapon | null)[];
        relic_slots: (Relic | null)[];
    };
    arenaBehavior?: ArenaBehavior;
    abilityUseCounts?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

export interface Profile {
    id: string;
    name: string;
    avatar: string;
    initialInventory: { itemId: string; amount: number }[];
    equippedWeapons: string[];
    equippedRelics: string[];
}

export interface Crop {
    id: string;
    plantId: string;
    plantedTimestamp: number;
    stageStartedTimestamp: number;
    currentGrowthStage: number;
    lastWateredTimestamp: number;
    wateredCount: number;
    /**
     * Set to true when a stage's time requirement is met but the watering
     * requirement is not. The UI should surface this clearly to the player.
     * Cleared automatically once watering is satisfied and the stage advances.
     */
    needsWater: boolean;
}

export interface FarmPlot {
    id: string;
    mapObjectId: number;
    requiredLevel: number;
    x: number;
    y: number;
    environment: string;
    crop: Crop | null;
    appliedTech: string[];
}

export interface ActiveEffect {
    id: string;
    name: string;
    duration: number;
    expiryTime?: number;
    type: 'flat' | 'percentage';
    stat: keyof PlayerBaseStats;
    value: number;
    source?: string;
}

export interface Player {
    isInitialized: boolean;
    level: number;
    xp: number;
    position: Position;
    direction: string;
    isMoving: boolean;
    profile: Profile;
    baseStats: PlayerBaseStats;
    equipment: { weapon_slots: (Weapon | null)[]; relic_slots: (Relic | null)[]; };
    inventory: Item[];
    activeEffects: ActiveEffect[];
    statusEffects: StatusEffect[];
    worldTags: string[];
    skills: any[];
    killCounts: Record<string, number>;
    combatHistory: any[];
    homestead: {
        farmPlots: FarmPlot[];
        compostQueue: any[];
    };
    lastPlayedTimestamp: number;
    /**
     * Unix ms timestamp of the last Time Point claim.
     * Elapsed minutes since this = Time Points to award on next load.
     * Set to Date.now() when a new game starts.
     */
    lastTimePointClaimTimestamp: number;
    farmingLevel: number;
    // farmingXp: number;
    techPoints: number;
    unlockedTech: string[];
    locationEventHistory: { [eventId: string]: number };
    factionReputation: Record<string, number>;
    achievements: {
        [achievementId: string]: {
            unlocked: boolean;
            unlockedTimestamp?: number;
            currentTier?: number;
            progress: number;
        }
    };
    stepsTaken: number;
    worldResonance: number;
    levelPoints: number;
    cropsHarvested: number;
    factions: Record<string, { score: number; rank: number; }>;
}

// ---------------------------------------------------------------------------
// Quest / world types
// ---------------------------------------------------------------------------

export type RequirementCondition =
    | { type: 'quest_state'; questId: string; state: QuestState }
    | { type: 'npc_rank'; npcId: string; rankType: 'sword' | 'heart'; value: number }
    | { type: 'counterpart_rank'; rankType: 'sword' | 'heart'; value: number }
    | { type: 'talk'; npcId: string }
    | { type: 'win_against_npc'; npcId: string; quantity: number }
    | { type: 'lose_to_npc'; npcId: string; quantity: number }
    | { type: 'fight_npc'; npcId: string; quantity: number }
    | { type: 'kill'; enemyId: string; quantity: number }
    | { type: 'have_item'; itemId: string; quantity: number }
    | { type: 'give_item'; itemId: string; quantity: number }
    | { type: 'finish_location_event'; eventId: string; quantity?: number; timing?: 'history' | 'future' }
    | { type: 'have_tag'; tag: string }
    | { type: 'not_tag'; tag: string }                                          // NEW: true if player does NOT have this tag
    | { type: 'faction_rank'; factionId: string; minRank: number }              // NEW: true if player has >= minRank with faction
    | { type: 'faction_score'; factionId: string; minScore: number }            // NEW: true if player has >= minScore with faction
    | { type: 'stat_check'; stat: keyof Player['baseStats']; value: number }
    | { type: 'element_check'; element: string; value: number }
    | { type: 'element_exploration_level_check'; element: string; level: number }
    | { type: 'dialogue' };

/**
 * Requirement tree.
 * - AND / OR: all or any conditions must be met.
 * - NOT: wraps a single requirement and inverts it.
 */
export type Requirement =
    | { operator: 'AND'; conditions: RequirementCondition[] }
    | { operator: 'OR'; conditions: RequirementCondition[] }
    | { operator: 'NOT'; condition: Requirement }                               // NEW: inverts child requirement
    | RequirementCondition;

export type Reward =
    | { type: 'item'; itemId: string; quantity: number; }
    | { type: 'tag'; tagId: string; }
    | { type: 'remove_tag'; tagId: string; }                                    
    | { type: 'change_reputation'; faction: 'solis_saints' | 'shadowhand'; amount: number; }
    | { type: 'faction_score'; factionId: string; amount: number; }
    | { type: 'complete_quest_stage'; questId: string; }
    | { type: 'world_resonance'; amount: number }
    | { type: 'fail_quest'; questId: string; };

export type GameEffect =
    | { type: 'RESTORE_HP'; value: number }
    | { type: 'RESTORE_HP_FULL' }
    | { type: 'RESTORE_AURA'; value: number }
    | { type: 'GIVE_ITEM'; itemId: string; quantity: number }
    | { type: 'TAKE_ITEM'; itemId: string; quantity: number }
    | { type: 'SWAP_ITEM'; takeItemId: string; takeQuantity: number; giveItemId: string; giveQuantity: number }
    | { type: 'trigger_faction_choice' }
    | { type: 'CHOOSE_FACTION'; faction: 'solis_saints' | 'shadowhand' }
    | { type: 'add_tag'; tag: string }
    | { type: 'remove_tag'; tag: string }
    | { type: 'give_item'; itemId: string; quantity: number }
    | { type: 'complete_quest_stage' }
    | { type: 'set_quest_state'; questId: string; state: QuestState }
    | { type: 'fail_quest'; questId: string; }
    | { type: 'switch_map'; mapId: string; x: number; y: number }
    | { type: 'add_reputation'; faction: string; amount: number }
    | { type: 'add_world_resonance'; amount: number };

export interface GiftingOption {
    itemId: string;
    quantity: number;
    value: number;
    dialogue: string[];
}

export interface QuestStage {
    objective: string;
    requirement: Requirement;
    intro_dialogue?: string[];                                                   // NEW: shown when stage first becomes active
    reminder_dialogue?: string[];
    success_dialogue?: string[];
    success_rewards?: Reward[];
    unavailable_dialogue?: string[];
}

export type QuestState = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'REPORT_PENDING';

export interface RankData {
    questId: string;
    title: string;
    description: string;
    startRequirement?: Requirement;
    startState?: QuestState;
    autoStart?: boolean;
    stages: QuestStage[];
    post_completion_dialogue?: string[];
    post_failure_dialogue?: string[];
}

export interface HeartRankData {
    giftingOptions?: GiftingOption[];
    rank_up_dialogue?: string[];
    rank_up_rewards?: Reward[];
    rankUpRequirement?: Requirement;
    factionScoreMultiplier?: number;
}

export interface LandscapeData {
    x: number;
    y: number;
    width: number;
    height: number;
    landscape: string;
}

export interface LandscapeDefinition {
    id: string;
    name: string;
    image: string;
    rainLevel?: number;
}

export interface RegionDefinition {
    id: string;
    name: string;
    gates: { element: string, level: number }[] | null;
    enemies: { id: string, chance: number }[];
    items: { id: string, chance: number }[];
    enemyChance?: number;
    itemChance?: number;
}

export interface MapData {
    width: number;
    height: number;
    image: string;
    defaultRegion: string;
    defaultLandscape: string;
    regions: RegionDefinition[];
    landscapes: LandscapeData[];
    unwalkable: any[];
    objects: any[];
    playerStart: Position;
    enemyEncounterChance?: number;
    itemFindingChance?: number;
}

export interface EventAction {
    text: string;
    effects: GameEffect[];
    responseMessage?: string;
    requirement?: Requirement;                                                   // NEW: hide/disable action if not met
}
export {};

export interface LocationEvent {
    id: string;
    name: string;
    image: string;
    coords?: Position;
    shortDesc: string;
    stepOnMessage?: string | string[];
    message?: string | string[];
    effects?: GameEffect[];
    actions?: EventAction[];
    afterImage?: string;
    afterDescription?: string;
    requirement?: Requirement;          // already existed — now actually enforced
    requirementNotMetMessage?: string;  // already existed — now actually shown
    reusable?: boolean;
}

export interface ResourceNode {
    id: string;
    name: string;
    skillId: string;
    requiredLevel: number;
    reward: { itemId: string; amount: number; };
    cooldown: number;
    image: string;
    dialogue: { success: string; failure: string; };
    maxGathers: number;
    xpPerLevel: number;
}

export type EventScreenType = 'none' | 'npc' | 'location_event' | 'item_found' | 'enemy' | 'resource';

export interface EventScreenState {
    type: EventScreenType;
    image: string | null;
    data: any;
    contextButtons: any[];
}

export interface Action {
    id: string;
    label: string;
    hotkey: string;
    icon?: string;
    action: () => void;
    disabled?: boolean;
}

export interface Enemy {
    id: string;
    name: string;
    description: string;
    image: string;
    thumbnailImage: string | null;
    types?: string[];
    resonanceRequirement: number;
    isLegendary: boolean;
    baseStats: PlayerBaseStats;
    drops: any[];
    xp: number;
    hpCost: number;
}

export type CombatLogSide = 'player' | 'opponent' | 'none';

export type CombatLogMessage =
    | { type: 'turn_banner'; turn: number }
    | { type: 'ability_use'; side: CombatLogSide; actorName: string; abilityName: string }
    | {
        type: 'damage'; side: CombatLogSide; amount: number; isCritical: boolean;
        damageType: 'physical' | 'elemental'; element?: string;
        hitIndex?: number; totalHits?: number
    }
    | { type: 'miss'; side: CombatLogSide; defenderName: string; reason: 'dodge' | 'accuracy' }
    | { type: 'multi_hit_summary'; side: CombatLogSide; hitCount: number; totalHits: number; totalDamage: number }
    | { type: 'heal'; side: CombatLogSide; targetName: string; amount: number; healType: 'hp' | 'aura_shield' }
    | { type: 'status_apply'; side: CombatLogSide; targetName: string; statusName: string; isBuff: boolean }
    | { type: 'status_tick'; side: CombatLogSide; targetName: string; statusName: string; amount: number }
    | { type: 'status_heal'; side: CombatLogSide; targetName: string; statusName: string; amount: number }
    | { type: 'status_expire'; side: CombatLogSide; targetName: string; statusName: string }
    | {
        type: 'stat_change'; side: CombatLogSide; targetSide: CombatLogSide; targetName: string;
        stats: string[]; direction: 'up' | 'down'
    }
    | { type: 'stat_transfer'; side: CombatLogSide; actorName: string; description: string; suppressed: boolean }
    | { type: 'stun'; side: CombatLogSide; actorName: string }
    | { type: 'immune'; side: CombatLogSide; targetName: string; what: string }
    | { type: 'defeated'; side: CombatLogSide; name: string }
    | { type: 'system'; text: string }
    | { type: 'cleanse'; side: CombatLogSide; targetName: string; count: number }
    | { type: 'dispel'; side: CombatLogSide; targetName: string; count: number };

export interface CropDefinition {
    id: string;
    name: string;
    yields: string;
    description: string;
    unlockLevel: number;
    requiredEnvironment: string[];
    requiredTechs: string[];
    idealSeason: string | null;
    wateringRequirementType: 'lifetime_based' | 'stage_based';
    wateringRequirementValue: number;
    xpValue: number;
    growthStages: { duration: number; }[];
    xpYield: number;
    seedItemId: string;
    growthMultiplierInIdealSeason: number;
    yieldsAmount: number;
    idealSeasonYieldMultiplier: number;
    totalGrowthTime: number;
    leavesYield: number;
}

/**
 * A single crafting recipe. Both `xpYield` and `requiredLevel` are optional
 * so that existing recipe data doesn't need to be updated all at once —
 * missing values default to 0 in CraftingService.
 */
export interface CraftingRecipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    /**
     * Which skill this recipe belongs to and awards XP towards.
     * Maps to a skill id: 'smithing' | 'cooking' | 'alchemy' | 'crafting'
     */
    skillId?: string;
    ingredients: { itemId: string; quantity: number }[];
    output: { itemId: string; quantity: number };
    /** Crafting XP awarded on success. Defaults to 0 if omitted. */
    xpYield?: number;
    /** Minimum skill level required. Defaults to 1 if omitted. */
    requiredLevel?: number;
}

export interface Faction {
    id: string;
    name: string;
    icon: string;
    score: number;
    rank: number;
    /**
     * rivalFactions: when this faction's score increases, all listed rival factions
     * receive a penalty of `rivalPenaltyRatio` × the amount gained.
     * e.g. rivalPenaltyRatio: 0.5 means gaining 10 Saints score costs 5 Shadowhand score.
     */
    rivalFactions?: { factionId: string; penaltyRatio: number }[];             // NEW
    ranks: {
        scoreThreshold: number;
        rewards: Reward[];
    }[];
}

export function countItemsById(inventory: Item[], itemId: string): number {
    return inventory.filter(i => i.id === itemId).length;
}