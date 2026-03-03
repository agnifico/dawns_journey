/**
 * timePointStore.ts
 *
 * Time Points are earned at 1 per real-world minute of elapsed time —
 * including time spent offline. They accumulate honestly from the moment
 * the player starts the game, exactly like a Stardew/RS idle system.
 *
 * How it works:
 *   - `player.lastTimePointClaimTimestamp` stores the last time points
 *     were claimed (Unix ms). Set to Date.now() on new game start.
 *   - On app load call `claimAccumulatedTimePoints(player)` which calculates
 *     elapsed minutes, awards that many `time_point` items, and updates the
 *     timestamp. Returns the updated player.
 *   - There is no interval, no page-scoping, no trickery.
 *
 * Add to Player type:
 *   lastTimePointClaimTimestamp: number;
 *
 * Call `claimAccumulatedTimePoints` in the same place you call
 * `initHomesteadOnLoad` — both are offline-simulation steps that
 * should run once on app boot.
 */

import { addItems } from '$lib/services/InventoryService';
import type { Player } from '$lib/types';

const MS_PER_MINUTE = 60_000;

/**
 * Calculates how many minutes have elapsed since the player last claimed
 * Time Points, awards that many to the inventory, and resets the claim
 * timestamp. Fractional minutes are banked — the sub-minute remainder is
 * preserved in the timestamp so no time is ever lost between sessions.
 *
 * Call this on app load, after loading save data.
 */
export function claimAccumulatedTimePoints(player: Player): Player {
    const now = Date.now();
    const lastClaim = player.lastTimePointClaimTimestamp ?? now;

    const elapsedMs = now - lastClaim;
    const wholeMinutes = Math.floor(elapsedMs / MS_PER_MINUTE);
    const remainderMs = elapsedMs % MS_PER_MINUTE;

    if (wholeMinutes <= 0) {
        // Less than a minute has passed — nothing to award yet, but update
        // timestamp so the remainder starts banking from now
        return {
            ...player,
            lastTimePointClaimTimestamp: now - remainderMs,
        };
    }

    const updatedPlayer = addItems(player, 'time_point', wholeMinutes);

    return {
        ...updatedPlayer,
        // Advance only by whole minutes so the remainder carries forward
        lastTimePointClaimTimestamp: lastClaim + (wholeMinutes * MS_PER_MINUTE),
    };
}

/**
 * Returns how many Time Points the player currently holds in inventory.
 * Convenience helper for template display.
 */
export function getTimePointCount(inventory: { id: string }[]): number {
    return inventory.filter(item => item.id === 'time_point').length;
}