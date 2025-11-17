
export interface Position {
    x: number;
    y: number;
}

export interface Stat {
    name: string;
    value: number;
}

export interface Effect {
    hp?: number;
    auraShield?: number;
}

export interface ActiveEffect {
    id: string;
    name: string;
    stat: string;
    type: 'flat' | 'percentage';
    value: number;
    duration: number;
    source: string;
}

export type ItemType = 'general' | 'relic' | 'weapon';

export interface Item {
    id: string;
    name: string;
    description: string;
    image: string;
    type: ItemType;
    stats?: Stat[];
    effects?: Effect[];
    activeEffects?: ActiveEffect[];
    element?: string;
    combatConditionEffect?: { name: string; chance: number };
    flags?: string[];
    amount?: number;
    mastery?: number;
    exploration?: { name: string, level: number }[];
}

export interface Weapon extends Item {
    type: 'weapon';
    mastery: number;
    element: string;
}

export interface Relic extends Item {}

export interface InventoryItem {
    itemId: string;
    amount: number;
}

export interface MapData {
    width: number;
    height: number;
    image: string;
    defaultRegion: string;
    regions: { x: number; y: number; width: number; height: number; regionType: string; }[];
    unwalkable: { x: number; y: number; width: number; height: number; }[];
    objects: { x: number; y: number; type: 'npc' | 'resource' | 'event' | 'playerStart'; [key: string]: any; }[];
    playerStart: Position;
    enemyEncounterChance?: number;
    itemFindingChance?: number;
}

export interface RegionDefinition {
    gates: { element: string; level: number; }[] | null;
    enemies: { id: string; chance: number; }[] | null;
    items: { id: string; chance: number; }[] | null;
}

export interface CombatHistory {
    npcId: string;
    outcome: 'win' | 'lose';
}

export interface Player {
    isInitialized: boolean;
    position: Position;
    direction: string;
    isMoving: boolean;
    baseStats: {
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
    equipment: { weapon_slots: (Weapon | null)[]; relic_slots: (Relic | null)[]; };
    inventory: InventoryItem[];
    activeEffects: ActiveEffect[];
    statusEffects: string[];
    worldTags: string[];
    skills: Skill[];
    killCounts: Record<string, number>;
    combatHistory: CombatHistory[];
    homestead: Homestead;
    lastPlayedTimestamp: number;
    farmingLevel: number;
    farmingXp: number;
    techPoints: number;
    unlockedTech: string[];
}

export interface Homestead {
    farmPlots: FarmPlot[];
    compostQueue: CompostTask[];
}

export interface CompostTask {
    id: string;
    compostToProduce: number;
    startTime: number;
    duration: number; // in milliseconds
}

export interface FarmPlot {
    id: string;
    mapObjectId: number; // The ID from the Tiled map object
    requiredLevel: number; // The farming level required to unlock this plot
    x: number;
    y: number;
    environment: 'env_open_field' | 'env_greenhouse' | 'env_forest_floor';
    crop: Crop | null;
    appliedTech: string[];
}

export interface Crop {
    id: string;
    cropDefinitionId: string;
    plantedTimestamp: number;
    stageStartedTimestamp: number;
    currentGrowthStage: number;
    lastWateredTimestamp: number; // Real-world timestamp
    wateredCount: number; // For lifetime-based watering
}

export interface CropDefinition {
    id: string;
    name: string;
    seedItemId: string;
    growthStages: CropGrowthStage[];
    yield: { itemId: string; amount: number; }[];
    wateringRequirementType: 'stage_based' | 'lifetime_based';
    wateringRequirementValue: number;
    idealSeason: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | null;
    growthMultiplierInIdealSeason: number;
    yieldMultiplierInIdealSeason: number;
    requiredEnvironment: string[];
    requiredTech: string[];
    requiredUpgrades?: string[];
    xpYield: number;
    leavesYield: number;
}

export interface CropGrowthStage {
    duration: number; // in milliseconds
    imagePath: string;
}

export interface Skill { id: string; name: string; level: number; experience: number; }

export type Prerequisite = string | { operator: 'OR', items: string[] } | { operator: 'AND', items: string[] };

export interface TechNode {
    id: string;
    name: string;
    description: string;
    unlockLevel: number;
    costTP: number;
    prerequisites: Prerequisite[];
    applicableTo?: { environments?: string[], tech?: string[] };
}

export interface PlotUpgrade {
    id: string;
    name: string;
    description: string;
    requiredTechId: string;
    materialCost: {
        wood?: number;
        stone?: number;
        metal?: number;
    };
}

export type RequirementCondition =
    | { type: 'kill'; enemyId: string; quantity: number }
    | { type: 'have_item'; itemId: string; quantity: number }
    | { type: 'npc_rank'; npcId: string; rankType: 'sword' | 'heart'; value: number }
    | { type: 'win_against_npc'; npcId: string; quantity: number }
    | { type: 'lose_to_npc'; npcId: string; quantity: number }
    | { type: 'counterpart_rank'; rankType: 'sword' | 'heart'; value: number };

export type Requirement = { operator: 'AND' | 'OR'; conditions: RequirementCondition[]; } | RequirementCondition;

export type Reward = 
    | { type: 'item'; itemId: string; quantity: number; }
    | { type: 'tag'; tagId: string; };

export interface RankData {
    requirement?: Requirement;
    intro_dialogue: string[];
    reminder_dialogue: string[];
    success_dialogue: string[];
    success_rewards: Reward[];
}

export interface StatGrowth {
    level: number;
    stats: Partial<Player['baseStats']>;
}

export interface ItemPreference {
    itemId: string;
    value: number; // affinity change
    dialogue: string[]; // reaction dialogue
}

export interface BattleAftermath {
    outcome: 'win' | 'lose';
    value: number; // affinity change
    dialogue: string[]; // reaction dialogue
}

export type NpcInteractionState = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_TURN_IN' | 'READY_FOR_RANK_UP';

export interface NPC {
    id: string;
    name: string;
    image: string;
    profileImage: string;
    swordRank: number;
    heartRank: number;
    affinity: number;
    swordState: NpcInteractionState;
    heartState: NpcInteractionState;
    swordRanks: RankData[];
    heartRanks: RankData[];
    statGrowth: StatGrowth[];
    itemPreferencesByHeartRank: { rank: number; preferences: ItemPreference[] }[];
    battleAftermathsBySwordRank: { rank: number; aftermaths: BattleAftermath[] }[];
    types?: string[];
    requirementSnapshot?: any;
}

export interface Enemy {
    id: string;
    name: string;
    description: string;
    image: string;
    thumbnailImage: string;
    types: string[]; // Elements
    masteryRequirements?: { [element: string]: number };
    drops: { itemId: string; quantity: number }[];
    // Combat Stats
    hp: number;
    physicalAttack: number;
    physicalDefence: number;
    elementalAttack: number;
    elementalDefence: number;
    speed: number;
    evasion: number;
    critChance: number;
    critDamage: number;
    statusEffects: string[];
}

export type GameEffect =
    | { type: 'RESTORE_HP', value: number }
    | { type: 'RESTORE_HP_FULL' }
    | { type: 'RESTORE_AURA', value: number }
    | { type: 'GIVE_ITEM', itemId: string, quantity: number }
    | { type: 'TAKE_ITEM', itemId: string, quantity: number }
    | { type: 'SWAP_ITEM', takeItemId: string, takeQuantity: number, giveItemId: string, giveQuantity: number };

export interface EventAction {
    text: string;
    effects?: GameEffect[];
}

export interface LocationEvent {
    id: string;
    name: string;
    image: string;
    shortDesc: string;
    stepOnMessage: string;
    message: string;
    effects?: GameEffect[]; // Immediate effects
    actions?: EventAction[]; // Player choices
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

export interface CombatLogMessage {
    left?: { text: string; class?: string };
    center?: string;
    right?: { text: string; class?: string };
    class?: string;
}

export interface FoundItem {
    itemId: string;
    amount: number;
}

export interface MapEntity {
    x: number;
    y: number;
    type: 'npc' | 'resource' | 'event';
    typeId: string;
}

// --- Combat Specific Types ---

export interface Attacker {
    physicalAttack?: number;
    elementalAttack?: number;
    critChance?: number;
    critDamage?: number;
    speed?: number;
    elements?: string[];
}

export interface Defender {
    physicalDefence?: number;
    elementalDefence?: number;
    evasion?: number;
    elements?: string[];
}

export interface Combatant extends Attacker, Defender {
    id: string;
    name: string;
    isPlayer: boolean;
    hp: number;
    maxHp: number;
    auraShield: number;
    maxAuraShield: number;
    activeEffects: ActiveEffect[];
    statusEffects: string[];
    image: string;
    npcId?: string;
}


export interface CombatState {
    isInCombat: boolean;
    combatEnded: boolean;
    outcome: 'win' | 'lose' | null;
    player: Player | null;
    opponent: (NPC & { currentHp: number }) | null;
    combatLog: CombatLogMessage[];
    currentTurn: 'player' | 'opponent' | null;
    turnNumber: number;
    playerWeaponIndex: 0 | 1;
    drops: any[];
}


export interface ContextualAction {
    label: string;
    action: () => void;
    type: 'primary' | 'secondary';
}

export interface TimeState {
    day: number;
    hour: number;
    minute: number;
}

export interface Message {
    text: string;
    timestamp: number;
}

export interface Settings {
    volume: number;
    // other settings
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    isCompleted: boolean;
    requirements: Requirement;
    rewards: Reward[];
}

export interface UiState {
    isInventoryOpen: boolean;
    isQuestsOpen: boolean;
    isMapOpen: boolean;
    isSettingsOpen: boolean;
    isMobileInfoPanelOpen: boolean;
    activeModal: string | null;
}

export interface EventScreenState {
    isOpen: boolean;
    title: string;
    image: string;
    message: string;
    choices: { text: string; action: () => void }[];
}

export interface MapEditorState {
    selectedTool: string;
    selectedRegion: string;
    selectedObject: string;
}

export interface ResourceNodeState {
    currentGatherCount: number;
    cooldownEndTime: number; // Using game 'time' (cpt) for cooldown
}

export interface ItemStoreState {
    items: Item[];
    weapons: Weapon[];
    relics: Relic[];
}

export interface NpcStoreState {
    npcs: NPC[];
}

export interface EnemyStoreState {
    enemies: Enemy[];
    // ... other properties
}

export interface QuestStoreState {
    quests: Quest[];
}

export interface ResourceStoreState {
    resourceNodeStates: { [key: string]: ResourceNodeState }; // Key: mapId-x-y
}

export interface MapStoreState {
    currentMap: MapData | null;
    mapEntities: MapEntity[];
}

export interface MessageStoreState {
    messages: Message[];
}

export interface TimeStoreState {
    time: TimeState;
}

export interface SettingsStoreState {
    settings: Settings;
}

export interface PlayerStoreState {
    player: Player;
}

export interface UiStoreState {
    ui: UiState;
}

export interface EventScreenStoreState {
    eventScreen: EventScreenState;
}

export interface MapEditorStoreState {
    mapEditor: MapEditorState;
}

export interface CombatStoreState {
    combat: CombatState;
}

export interface ContextualActionStoreState {
    actions: ContextualAction[];
}
