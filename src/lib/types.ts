export interface Position {
    x: number;
    y: number;
}

export interface Stat {
    name: string;
    value: number;
}

export type ItemType = 'general' | 'relic' | 'weapon';

export interface Item {
    id: string;
    name: string;
    description: string;
    image: string;
    type: ItemType;
    stats?: Stat[];
    effects?: { hp?: number; auraShield?: number; }[];
    activeEffects?: any[];
    element?: string;
    flags?: string[];
    amount?: number;
    mastery?: number;
    exploration?: { name: string, level: number }[];
}

export interface Weapon extends Item {
    type: 'weapon';
}

export interface Relic extends Item {
    type: 'relic';
}

export interface InventoryItem {
    itemId: string;
    amount: number;
}

export type PlayerBaseStats = {
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
};

export interface Player {
    isInitialized: boolean;
    position: Position;
    direction: string;
    isMoving: boolean;
    baseStats: PlayerBaseStats;
    equipment: { weapon_slots: (Weapon | null)[]; relic_slots: (Relic | null)[]; };
    inventory: InventoryItem[];
    activeEffects: any[];
    statusEffects: string[];
    worldTags: string[];
    skills: any[];
    killCounts: Record<string, number>;
    combatHistory: any[];
    homestead: any;
    lastPlayedTimestamp: number;
    farmingLevel: number;
    farmingXp: number;
    techPoints: number;
    unlockedTech: string[];
    locationEventHistory: { [eventId: string]: number };
    factionReputation: Record<string, number>;
}

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
    | { type: 'unlock_location_event'; eventId: string }
    | { type: 'have_tag'; tag: string }
    | { type: 'stat_check'; stat: keyof Player['baseStats']; value: number }
    | { type: 'element_check'; element: string; value: number }
    | { type: 'element_exploration_level_check'; element: string; level: number }
    | { type: 'dialogue' };

export type Requirement = { operator: 'AND' | 'OR'; conditions: RequirementCondition[]; } | RequirementCondition;

export type Reward = 
    | { type: 'item'; itemId: string; quantity: number; }
    | { type: 'tag'; tagId: string; }
    | { type: 'unlock_location_event'; eventId: string; }
    | { type: 'change_reputation'; faction: 'Solis Saints' | 'Shadowhand'; amount: number; }
    | { type: 'complete_quest_stage'; questId: string; }
    | { type: 'fail_quest'; questId: string; };

export type GameEffect = 
    | { type: 'RESTORE_HP'; value: number }
    | { type: 'RESTORE_HP_FULL' }
    | { type: 'RESTORE_AURA'; value: number }
    | { type: 'GIVE_ITEM'; itemId: string; quantity: number }
    | { type: 'TAKE_ITEM'; itemId: string; quantity: number }
    | { type: 'SWAP_ITEM'; takeItemId: string; takeQuantity: number; giveItemId: string; giveQuantity: number }
    | { type: 'trigger_faction_choice' }
    | { type: 'add_tag', tag: string }
    | { type: 'give_item', itemId: string, quantity: number }
    | { type: 'complete_quest_stage' };

export interface GiftingOption {
    itemId: string;
    quantity: number;
    value: number;
    dialogue: string[];
}

export interface QuestStage {
    objective: string;
    requirement: Requirement;
    reminder_dialogue?: string[];
    success_dialogue?: string[];
    success_rewards?: Reward[];
    unavailable_dialogue?: string[];
}

export type QuestState = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface RankData {
    questId: string;
    title: string;
    description: string;
    startRequirement?: Requirement;
    startState?: QuestState;
    autoStart?: boolean;
    stages: QuestStage[];
}

export interface HeartRankData {
    giftingOptions?: GiftingOption[];
    rank_up_dialogue?: string[];
    rank_up_rewards?: Reward[];
    rankUpRequirement?: Requirement;
}

export interface SwordRankData extends RankData {}

export type NpcInteractionState = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_TURN_IN' | 'READY_FOR_RANK_UP';

export interface BattleAftermath {
    outcome: 'win' | 'lose';
    value?: number;
    dialogue?: string[];
    requirement?: Requirement;
}

export interface BattleAftermathsByRank {
    rank: number;
    aftermaths: BattleAftermath[];
}

export interface NPC {
    id: string;
    name: string;
    image: string;
    profileImage: string;
    isCombatant?: boolean;
    baseStats: PlayerBaseStats;
    swordRank: number;
    heartRank: number;
    affinity: number;
    swordState: NpcInteractionState;
    heartState: NpcInteractionState;
    swordRanks: SwordRankData[];
    heartRanks: HeartRankData[];
    statGrowth: any[];
    battleAftermathsBySwordRank: BattleAftermathsByRank[];
    types?: string[];
    requirementSnapshot?: any;
    swordRankMaxedDialogue?: string[];
    allRanksMaxedDialogue?: string[];
    galleryImages?: string[];
    faction?: 'Solis Saints' | 'Shadowhand';
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    giver: string;
    state: QuestState;
    currentStage: number;
    stages: QuestStage[];
    startRequirement?: Requirement;
}

export interface MapData {
    width: number;
    height: number;
    image: string;
    defaultRegion: string;
    regions: any[];
    unwalkable: any[];
    objects: any[];
    playerStart: Position;
    enemyEncounterChance?: number;
    itemFindingChance?: number;
}

export interface LocationEvent {
    id: string;
    name: string;
    image: string;
    coords?: Position;
    shortDesc: string;
    stepOnMessage: string;
    message: string;
    effects?: any[];
    actions?: any[];
    afterImage?: string;
    afterDescription?: string;
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