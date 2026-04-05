/**
 * notificationStore.ts — expanded
 *
 * Adds non-item notification types while keeping the existing item API
 * 100% identical. All existing callers continue to work unchanged.
 *
 * NEW TYPES:
 *   xp_gained    — "You gained 45 XP" or "Woodcutting +12 XP"
 *   level_up     — "Level Up! You are now level 7" — stays longer
 *   buff_applied — "Night Vision applied (60 steps)"
 *   buff_expired — "Night Vision has worn off"
 *
 * DURATIONS:
 *   item_*       — 3 000 ms  (unchanged)
 *   xp_gained    — 2 500 ms
 *   buff_*       — 3 000 ms
 *   level_up     — 6 000 ms  (more visual weight)
 *
 * USAGE EXAMPLES:
 *   notificationStore.add('item_received', item, 3);           // unchanged
 *   notificationStore.addXp(45);                               // generic XP
 *   notificationStore.addXp(12, 'Woodcutting');                // skill XP
 *   notificationStore.addLevelUp(7);                           // level up
 *   notificationStore.addBuff('Night Vision', 60, 'applied');  // buff on
 *   notificationStore.addBuff('Night Vision', 0,  'expired');  // buff off
 */

import { writable } from 'svelte/store';
import type { Item } from '$lib/types';

// ── Types ─────────────────────────────────────────────────────────────────

export type NotificationType =
    // existing item types — unchanged
    | 'item_received'
    | 'item_used'
    | 'item_equipped'
    | 'item_unequipped'
    | 'item_removed'
    // new types
    | 'xp_gained'
    | 'level_up'
    | 'buff_applied'
    | 'buff_expired'
    | 'faction_rank_up'
    | 'faction_score';

interface BaseNotification {
    id: number;
    type: NotificationType;
    duration: number;
}

interface ItemNotification extends BaseNotification {
    type: 'item_received' | 'item_used' | 'item_equipped' | 'item_unequipped' | 'item_removed';
    item: Item;
    quantity: number;
    isSpecial?: boolean;  // legendary or special weapon/relic — longer display, larger UI
}

interface XpNotification extends BaseNotification {
    type: 'xp_gained';
    amount: number;
    /** Optional — e.g. "Woodcutting". Omit for generic XP. */
    skill?: string;
}

interface LevelUpNotification extends BaseNotification {
    type: 'level_up';
    level: number;
    /** Optional skill name if this is a skill level-up rather than player level */
    skill?: string;
}

interface BuffNotification extends BaseNotification {
    type: 'buff_applied' | 'buff_expired';
    buffName: string;
    /** Remaining steps/turns — shown on applied, omitted on expired */
    duration_steps?: number;
}


interface FactionScoreNotification extends BaseNotification {
    type: 'faction_score';
    factionName: string;
    amount: number;
}
interface FactionRankUpNotification extends BaseNotification {
    type: 'faction_rank_up';
    factionName: string;
    rank: number;
}

export type Notification =
    | ItemNotification
    | XpNotification
    | LevelUpNotification
    | BuffNotification
    | FactionRankUpNotification
    | FactionScoreNotification;

// ── Durations ─────────────────────────────────────────────────────────────

const DURATIONS: Record<NotificationType, number> = {
    item_received:   3000,
    item_used:       3000,
    item_equipped:   3000,
    item_unequipped: 3000,
    item_removed:    3000,
    xp_gained:       2500,
    level_up:        6000,
    buff_applied:    3000,
    buff_expired:    3000,
    faction_rank_up: 6000,
    faction_score:    2500,
};

// ── Store ─────────────────────────────────────────────────────────────────

let nextId = 0;
const { subscribe, update } = writable<Notification[]>([]);

function remove(id: number) {
    update(ns => ns.filter(n => n.id !== id));
}

function schedule(notif: Notification) {
    update(ns => [...ns, notif]);
    setTimeout(() => remove(notif.id), notif.duration);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Add an item notification. Identical signature to the old `notificationStore.add`.
 */
function addItem(
    type: 'item_received' | 'item_used' | 'item_equipped' | 'item_unequipped' | 'item_removed',
    item: Item,
    quantity: number
) {
    const isSpecial = type === 'item_received'
        && (item.type === 'weapon' || item.type === 'relic' || item.type === 'general')
        && (item.flags?.includes('legendary') || item.flags?.includes('special'));
    schedule({
        id: nextId++,
        type,
        item,
        quantity,
        isSpecial,
        duration: isSpecial ? 6000 : DURATIONS[type],
    } as ItemNotification);
}

/**
 * XP gained — optionally tagged to a skill.
 * @example notificationStore.addXp(45, 'Woodcutting')
 */
function addXp(amount: number, skill?: string) {
    schedule({
        id: nextId++,
        type: 'xp_gained',
        amount,
        skill,
        duration: DURATIONS.xp_gained,
    } as XpNotification);
}

/**
 * Player or skill level-up.
 * @example notificationStore.addLevelUp(7)
 * @example notificationStore.addLevelUp(3, 'Woodcutting')
 */
function addLevelUp(level: number, skill?: string) {
    schedule({
        id: nextId++,
        type: 'level_up',
        level,
        skill,
        duration: DURATIONS.level_up,
    } as LevelUpNotification);
}

/**
 * Buff applied or expired.
 * @example notificationStore.addBuff('Night Vision', 60, 'applied')
 * @example notificationStore.addBuff('Night Vision', 0, 'expired')
 */
function addBuff(buffName: string, duration_steps: number, state: 'applied' | 'expired') {
    schedule({
        id: nextId++,
        type: state === 'applied' ? 'buff_applied' : 'buff_expired',
        buffName,
        duration_steps: state === 'applied' ? duration_steps : undefined,
        duration: DURATIONS[state === 'applied' ? 'buff_applied' : 'buff_expired'],
    } as BuffNotification);
}

function addFactionScore(factionName: string, amount: number) {
    schedule({
        id: nextId++,
        type: 'faction_score',
        factionName,
        amount,
        duration: DURATIONS.faction_score,
    } as FactionScoreNotification);
}


function addFactionRankUp(factionName: string, rank: number) {
    schedule({
        id: nextId++,
        type: 'faction_rank_up',
        factionName,
        rank,
        duration: DURATIONS.faction_rank_up,
    } as FactionRankUpNotification);
}

export const notificationStore = {
    subscribe,
    /** Existing item API — all current callers work unchanged */
    add: addItem,
    addXp,
    addLevelUp,
    addBuff,
    addFactionScore,
    addFactionRankUp,
};

