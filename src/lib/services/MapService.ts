import { get } from 'svelte/store';
import { mapStore } from '$lib/stores/mapStore';
import { regionDefinitions } from '$lib/data/regionDefinitions';
import type { MapData, Position, RegionDefinition, NPC, NpcPosition } from '$lib/types';

export const loadMap = async (mapId: string): Promise<MapData | null> => {
    const existingMaps = get(mapStore).maps;
    if (existingMaps[mapId]) {
        mapStore.update(s => ({ ...s, currentMapId: mapId }));
        return existingMaps[mapId];
    }

    try {
        const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
        const mapPath = `/src/lib/data/maps/final/${mapId}.json`;

        if (!mapModules[mapPath]) {
            throw new Error(`Map with id '${mapId}' not found.`);
        }

        const mapModule = await mapModules[mapPath]();
        const mapData = mapModule.default as MapData;

        // Ensure the objects array exists
        if (!mapData.objects) {
            mapData.objects = [];
        }

        mapStore.setMapData(mapId, mapData);
        mapStore.update(s => ({ ...s, currentMapId: mapId }));
        return mapData;
    } catch (error) {
        console.error(`Failed to load map: ${mapId}`, error);
        return null;
    }
};

export function getRegionForPosition(position: { x: number, y: number }, mapData: MapData) {
    const region = (mapData.regions || []).find(r =>
        position.x >= r.x && position.x < r.x + r.width &&
        position.y >= r.y && position.y < r.y + r.height
    );
    const regionType = region ? region.regionType : mapData.defaultRegion;
    return regionDefinitions[regionType];
};

// MapService.ts
// Drop-in replacement — resolveNpcPosition added at the bottom.
// Everything above getRegionForPosition is unchanged from your original.




// ─── New: NPC position resolver ───────────────────────────────────────────────

/**
 * Resolves the map position an NPC should occupy given the current context.
 *
 * Priority (first match wins):
 *   1. requiredTag matches AND phase matches
 *   2. requiredTag matches (no phase restriction on the entry)
 *   3. phase matches (no tag restriction on the entry)
 *   4. default: true
 *
 * Returns null if:
 *   - The NPC has no mapPositions defined (caller should use static map coords)
 *   - No entry matches the current mapId
 *
 * @param npc           The NPC data object
 * @param mapId         The map currently loaded
 * @param playerTags    Player's worldTags array
 * @param currentPhase  'Dawnrise' | 'Duskfall'
 */
export function resolveNpcPosition(
    npc: NPC,
    mapId: string,
    playerTags: string[],
    currentPhase: 'Dawnrise' | 'Duskfall'
): { x: number; y: number } | null {
    if (!npc.mapPositions || npc.mapPositions.length === 0) {
        // No override table — caller uses static map object coords
        return null;
    }

    // Filter to entries valid for this map
    const candidates = npc.mapPositions.filter(p => p.mapId === mapId);
    if (candidates.length === 0) {
        // NPC has position data but none for this map — don't render them here
        return null;
    }

    const hasTag = (tag: string) => playerTags.includes(tag);
    const phaseMatches = (p: NpcPosition) =>
        p.phase === undefined || p.phase === currentPhase;
    const tagMatches = (p: NpcPosition) =>
        p.requiredTag === undefined || hasTag(p.requiredTag);

    // Priority 1: tag + phase both match
    const tagAndPhase = candidates.find(
        p => p.requiredTag !== undefined && phaseMatches(p) && hasTag(p.requiredTag)
    );
    if (tagAndPhase) return { x: tagAndPhase.x, y: tagAndPhase.y };

    // Priority 2: tag matches, no phase restriction
    const tagOnly = candidates.find(
        p => p.requiredTag !== undefined && p.phase === undefined && hasTag(p.requiredTag)
    );
    if (tagOnly) return { x: tagOnly.x, y: tagOnly.y };

    // Priority 3: phase matches, no tag restriction
    const phaseOnly = candidates.find(
        p => p.requiredTag === undefined && phaseMatches(p)
    );
    if (phaseOnly) return { x: phaseOnly.x, y: phaseOnly.y };

    // Priority 4: default fallback
    const defaultPos = candidates.find(p => p.default === true);
    if (defaultPos) return { x: defaultPos.x, y: defaultPos.y };

    // Nothing matched — NPC absent from this map at this time
    return null;
}