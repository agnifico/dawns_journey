import type { Set } from '$lib/types';
import { sets } from '$lib/data/sets';

// Create a lookup map for efficient searching
const relicToSetMap = new Map<string, Set>();

for (const set of sets) {
    for (const relicId of set.relicIds) {
        relicToSetMap.set(relicId, set);
    }
}

/**
 * Retrieves the set definition for a given relic ID.
 * @param relicId The ID of the relic to check.
 * @returns The Set object if the relic is part of a set, otherwise undefined.
 */
export function getSetForRelic(relicId: string): Set | undefined {
    return relicToSetMap.get(relicId);
}
