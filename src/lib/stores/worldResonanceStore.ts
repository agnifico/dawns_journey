import { playerStore } from '$lib/stores/playerStore';
import { notificationStore } from '$lib/stores/notificationStore';
import type { Player, PlayerBaseStats } from '$lib/types';
import { toastStore } from './toastStore';
import { countInventoryItem, removeItemsByItemId } from '$lib/services/InventoryService';

const MS_PER_RESONANCE_TICK = 96 * 60 * 1_000; // 96 minutes = 1 resonance point
const RESONANCE_PER_DAY     = 15;               // sanity-check: 1440min / 96min = 15 ✓

/**
 * Called once on app load (alongside claimAccumulatedTimePoints).
 *
 * Calculates how many 96-minute ticks have elapsed since the player's last
 * World Resonance claim, awards that many points, and banks the remainder
 * so no time is ever lost between sessions.
 *
 * Uses player.lastTimePointClaimTimestamp as the shared clock — both systems
 * run off the same "when did this player last log in" anchor, so you don't
 * need a second timestamp field on Player.
 */
export function claimAccumulatedWorldResonance(player: Player): Player {
    const now = Date.now();
    const lastClaim = player.lastTimePointClaimTimestamp ?? now;

    const elapsedMs = now - lastClaim;
    const wholePoints = Math.floor(elapsedMs / MS_PER_RESONANCE_TICK);

    if (wholePoints <= 0) {
        return player;
    }

    const gained = wholePoints;
    const updatedPlayer: Player = {
        ...player,
        worldResonance: (player.worldResonance ?? 0) + gained,
        // Note: lastTimePointClaimTimestamp is NOT updated here.
        // timePointStore owns that timestamp. We just read it.
    };

    // Fire a notification if the player gained anything meaningful
    if (gained > 0) {
        // notificationStore.addWorldResonance(gained);
        toastStore.success(`You gained ${gained} World Resonance!`);
    }

    return updatedPlayer;
}


/**
 * Spend a Level Point to gain a permanent stat increase.
 * Called from the Level Points UI (to be built later).
 *
 * statKey: keyof PlayerBaseStats — e.g. 'physicalAttack', 'maxHp'
 *
 * Spend values (1 point =):
 *   physicalAttack / physicalDefence / elementalAttack / elementalDefence → +10
 *   precision / speed / evasion                                           → +1.5
 *   critChance                                                             → +0.01  (1%)
 *   critDamage                                                             → +0.02  (2%)
 *   maxHp / maxAuraShield                                                  → +15
 */
const LEVEL_POINT_SPEND_VALUES: Partial<Record<keyof import('$lib/types').PlayerBaseStats, number>> = {
    physicalAttack:   10,
    physicalDefence:  10,
    elementalAttack:  10,
    elementalDefence: 10,
    precision:        1.5,
    speed:            1.5,
    evasion:          1.5,
    critChance:       0.01,
    critDamage:       0.02,
    maxHp:            15,
    maxAuraShield:    15,
};

export function spendLevelPoint(statKey: keyof PlayerBaseStats): void {
    playerStore.update(player => {
        if (countInventoryItem(player.inventory, 'level_up_point') <= 0) {
            return player;
        }

        const gain = LEVEL_POINT_SPEND_VALUES[statKey];
        if (gain === undefined) {
            console.warn(`[worldResonanceStore] ${statKey} is not a spendable stat.`);
            return player;
        }

        const updatedPlayer = removeItemsByItemId(player, 'level_up_point', 1);

        return {
            ...updatedPlayer,
            baseStats: {
                ...updatedPlayer.baseStats,
                [statKey]: (updatedPlayer.baseStats[statKey] as number) + gain,
            },
        };
    });
}
