/**
 * nudgeStore.ts
 *
 * Persistent nudges for player-action-required events:
 *   - NPC ready for a rank up
 *   - Quest ready to turn in
 *
 * Unlike toasts (auto-dismiss), nudges stay visible until the player
 * explicitly dismisses them. They render via the existing GeneralMessage
 * component (or a dedicated NudgePanel — see GeneralMessage.svelte patch).
 *
 * USAGE:
 *   nudgeStore.push({ type: 'npc_rank_ready', npcName: 'Mira', npcId: 'mira' });
 *   nudgeStore.push({ type: 'quest_ready',    questTitle: 'The Missing Ore', questId: 'q_missing_ore' });
 *   nudgeStore.dismiss(id);
 *   nudgeStore.dismissAll();
 *
 * The store is an array so multiple nudges can stack (e.g. two NPCs ready
 * at once). The UI shows them one at a time with prev/next, or as a list.
 */

import { writable } from 'svelte/store';

// ── Types ─────────────────────────────────────────────────────────────────

export type NudgeType = 'npc_rank_ready' | 'quest_ready';

interface BaseNudge {
    id: number;
    type: NudgeType;
}

export interface NpcRankNudge extends BaseNudge {
    type: 'npc_rank_ready';
    npcName: string;
    npcId: string;
}

export interface QuestReadyNudge extends BaseNudge {
    type: 'quest_ready';
    questTitle: string;
    questId: string;
    /** NPC to turn the quest in to, if known */
    npcName?: string;
}

export type Nudge = NpcRankNudge | QuestReadyNudge;

// ── Store ─────────────────────────────────────────────────────────────────

let nextId = 0;
const { subscribe, update } = writable<Nudge[]>([]);

/**
 * Push a nudge. Deduplicates by type+id so the same nudge can't stack.
 */
function push(nudge: Omit<Nudge, 'id'>) {
    update(ns => {
        // Deduplicate: don't re-add if an identical nudge is already queued
        const isDuplicate = ns.some(n => {
            if (n.type !== nudge.type) return false;
            if (n.type === 'npc_rank_ready' && nudge.type === 'npc_rank_ready')
                return n.npcId === nudge.npcId;
            if (n.type === 'quest_ready' && nudge.type === 'quest_ready')
                return n.questId === nudge.questId;
            return false;
        });
        if (isDuplicate) return ns;
        return [...ns, { ...nudge, id: nextId++ } as Nudge];
    });
}

function dismiss(id: number) {
    update(ns => ns.filter(n => n.id !== id));
}

function dismissAll() {
    update(() => []);
}

/** Remove any nudge for a specific NPC (call when player talks to them) */
function dismissNpc(npcId: string) {
    update(ns => ns.filter(n => !(n.type === 'npc_rank_ready' && n.npcId === npcId)));
}

/** Remove any nudge for a specific quest (call on turn-in / fail) */
function dismissQuest(questId: string) {
    update(ns => ns.filter(n => !(n.type === 'quest_ready' && n.questId === questId)));
}

export const nudgeStore = {
    subscribe,
    push,
    dismiss,
    dismissAll,
    dismissNpc,
    dismissQuest,
};