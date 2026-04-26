import { gearPassives, getGearPassiveById } from '$lib/data/abilities';
import type { Player, StatusEffect } from '$lib/types';

export function resolvePassiveIdsToStatusEffects(
    passiveIds: string[] | undefined,
    source: 'equipment' | 'innate'
): StatusEffect[] {
    return (passiveIds ?? [])
        .map(id => getGearPassiveById(id))
        .filter((p): p is NonNullable<ReturnType<typeof getGearPassiveById>> => !!p)
        .map(p => ({
            id: p.id,
            name: p.name,
            duration: 999,
            remainingTurns: 999,
            inflictedBy: source,
            flags: p.flags,
        }));
}

export function resolvePlayerGearPassives(player: Player): StatusEffect[] {
    const allEquipped = [
        ...(player.equipment.weapon_slots ?? []),
        ...(player.equipment.relic_slots ?? []),
    ].filter(Boolean);

    const passiveIdSet = new Set<string>();
    for (const item of allEquipped) {
        for (const id of item?.gearPassives ?? []) passiveIdSet.add(id);
    }
    return resolvePassiveIdsToStatusEffects(Array.from(passiveIdSet), 'equipment');
}

export function resolveNpcGearPassives(passiveIds: string[] | undefined): StatusEffect[] {
    return resolvePassiveIdsToStatusEffects(passiveIds, 'innate');
}