import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { playerStore } from '$lib/stores/playerStore';
import { npcStore } from '$lib/stores/npcStore';
import { mapStore } from '$lib/stores/mapStore';
import { messageStore } from '$lib/stores/messageStore';
import * as FarmingService from './FarmingService';
import { checkQuestTriggers } from './QuestService';
import { validateAllData } from './ValidationService';
import { questStore } from '$lib/stores/questStore';
import { getItemById } from './InventoryService';
import playerDefaults from '$lib/data/player';
import type { Player, NPC } from '$lib/types';
import { claimAccumulatedTimePoints } from '$lib/stores/timePointStore';

const SAVE_KEY = 'dawn_journey_save_v3';
const COMBAT_HISTORY_CAP = 100; // keep only last 100 fights

// ---------------------------------------------------------------------------
// Types for the slim save format
// ---------------------------------------------------------------------------

interface SlimInventoryItem {
    instanceId: string;
    id: string;
}

interface SlimEquipmentSlot {
    instanceId: string;
    id: string;
}

interface SlimNpcState {
    swordRank: number;
    heartRank: number;
    affinity: number;
    swordState: string;
    heartState: string;
    requirementSnapshot?: Record<string, any>;
}

interface SlimSave {
    version: 3;
    timestamp: number;
    player: Omit<Player,
        | 'inventory'
        | 'equipment'
        | 'combatHistory'
    > & {
        inventory: SlimInventoryItem[];
        equipment: {
            weapon_slots: (SlimEquipmentSlot | null)[];
            relic_slots: (SlimEquipmentSlot | null)[];
        };
        combatHistory: any[];
    };
    npcs: Record<string, SlimNpcState>;
    mapStore: any;
}

// ---------------------------------------------------------------------------
// Serialisers — strip everything that lives in static data files
// ---------------------------------------------------------------------------

function slimInventory(inventory: Player['inventory']): SlimInventoryItem[] {
    return inventory.map(item => ({
        instanceId: item.instanceId,
        id: item.id,
    }));
}

function slimEquipmentSlot(slot: any): SlimEquipmentSlot | null {
    if (!slot) return null;
    return { instanceId: slot.instanceId, id: slot.id };
}

/**
 * From the full globalNpcs map, save only the mutable runtime fields.
 * Everything else (dialogue, quest definitions, galleryImages, stats…)
 * is re-hydrated from the JSON files on load.
 */
function slimNpcs(globalNpcs: Record<string, NPC>): Record<string, SlimNpcState> {
    const slim: Record<string, SlimNpcState> = {};
    for (const [id, npc] of Object.entries(globalNpcs)) {
        slim[id] = {
            swordRank: npc.swordRank,
            heartRank: npc.heartRank,
            affinity: npc.affinity,
            swordState: npc.swordState,
            heartState: npc.heartState,
            requirementSnapshot: npc.requirementSnapshot ?? {},
        };
    }
    return slim;
}

// ---------------------------------------------------------------------------
// Deserialisers — reconstruct full objects from slim save + static templates
// ---------------------------------------------------------------------------

function expandInventory(slim: SlimInventoryItem[]): Player['inventory'] {
    return slim.map(({ instanceId, id }) => {
        // Use getItemById to read the static template without allocating a new uuid.
        // Then stamp the saved instanceId back on so identity is preserved across sessions.
        const template = getItemById(id);
        if (!template) {
            console.warn(`[SaveLoad] Unknown item template on load: ${id}`);
            return null;
        }
        return { ...JSON.parse(JSON.stringify(template)), instanceId };
    }).filter(Boolean) as Player['inventory'];
}

function expandEquipmentSlot(slim: SlimEquipmentSlot | null): any {
    if (!slim) return null;
    const template = getItemById(slim.id);
    if (!template) {
        console.warn(`[SaveLoad] Unknown equipment template on load: ${slim.id}`);
        return null;
    }
    return { ...JSON.parse(JSON.stringify(template)), instanceId: slim.instanceId };
}

/**
 * Merge slim NPC runtime state back onto the freshly-loaded NPC templates.
 * Called after npcStore.initializeGlobalNpcs() so the templates are ready.
 */
function expandNpcs(
    slimNpcs: Record<string, SlimNpcState>,
    fullNpcs: Record<string, NPC>
): Record<string, NPC> {
    const result: Record<string, NPC> = { ...fullNpcs };
    for (const [id, slim] of Object.entries(slimNpcs)) {
        if (result[id]) {
            result[id] = {
                ...result[id],           // all static data from JSON file
                swordRank: slim.swordRank,
                heartRank: slim.heartRank,
                affinity: slim.affinity,
                swordState: slim.swordState as any,
                heartState: slim.heartState as any,
                requirementSnapshot: slim.requirementSnapshot ?? {},
            };
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// deepMerge (kept for player defaults migration)
// ---------------------------------------------------------------------------

function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    let output = { ...target } as T & U;
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function saveGame() {
    if (!browser) return;

    try {
        const player = get(playerStore);
        const globalNpcs = get(npcStore).globalNpcs;
        const mapState = get(mapStore);

        const save: SlimSave = {
            version: 3,
            timestamp: Date.now(),
            player: {
                ...player,
                lastPlayedTimestamp: Date.now(),
                // Slim down the three big fields
                inventory: slimInventory(player.inventory),
                equipment: {
                    weapon_slots: player.equipment.weapon_slots.map(slimEquipmentSlot),
                    relic_slots: player.equipment.relic_slots.map(slimEquipmentSlot),
                },
                // Cap combat history so it never grows unbounded
                combatHistory: player.combatHistory.slice(-COMBAT_HISTORY_CAP),
            },
            npcs: slimNpcs(globalNpcs),
            mapStore: mapState,
        };

        const serialised = JSON.stringify(save);

        // Warn in dev if save is getting large (>3 MB of the ~5 MB budget)
        if (serialised.length > 3_000_000) {
            console.warn(`[SaveLoad] Save size is ${(serialised.length / 1024).toFixed(0)} KB — approaching localStorage limit.`);
        }

        localStorage.setItem(SAVE_KEY, serialised);

        // Clean up old save key if present
        localStorage.removeItem('dawn_journey_save_v2');

        messageStore.addMessage('Game Saved!', ['System']);
    } catch (error) {
        console.error('Error saving game:', error);
        messageStore.addMessage('An error occurred while saving your game.', ['System']);
    }
}

export async function loadGame() {
    if (!browser) return;

    const savedDataString = localStorage.getItem(SAVE_KEY)
        ?? localStorage.getItem('dawn_journey_save_v2'); // fallback for old saves

    if (!savedDataString) {
        messageStore.addMessage('No save data found to load.', ['System']);
        return;
    }

    try {
        const savedData = JSON.parse(savedDataString);
        const isLegacyFormat = !savedData.version || savedData.version < 3;

        // ── NPC store must be initialised first so templates are available ──
        await npcStore.initializeGlobalNpcs();

        // ── Player ──────────────────────────────────────────────────────────
        if (savedData.player) {
            let loadedPlayer: Player;

            if (isLegacyFormat) {
                // Old save: player had full item objects — use as-is via deepMerge
                loadedPlayer = deepMerge(playerDefaults, savedData.player);
            } else {
                // New slim save: reconstruct inventory & equipment from templates
                const slim = savedData.player;
                loadedPlayer = deepMerge(playerDefaults, {
                    ...slim,
                    inventory: expandInventory(slim.inventory),
                    equipment: {
                        weapon_slots: slim.equipment.weapon_slots.map(expandEquipmentSlot),
                        relic_slots: slim.equipment.relic_slots.map(expandEquipmentSlot),
                    },
                });
            }

            if (loadedPlayer.level === undefined) loadedPlayer.level = 1;
            if (loadedPlayer.xp === undefined) loadedPlayer.xp = 0;

            const updatedPlayer = FarmingService.calculateOfflineGrowth(loadedPlayer);
            const updatedPlayer2 = claimAccumulatedTimePoints(updatedPlayer);
            playerStore.set({ ...updatedPlayer2, isInitialized: true });
        }

        // ── Map ─────────────────────────────────────────────────────────────
        if (savedData.mapStore) {
            mapStore.set(savedData.mapStore);
        }

        // ── NPCs ─────────────────────────────────────────────────────────────
        if (savedData.npcs) {
            if (isLegacyFormat) {
                // Old format: full NPC objects — load directly
                npcStore.loadNpcs(savedData.npcs);
            } else {
                // New format: merge slim runtime state onto fresh templates
                const freshNpcs = get(npcStore).globalNpcs;
                const expandedNpcs = expandNpcs(savedData.npcs, freshNpcs);
                npcStore.loadNpcs(expandedNpcs);
            }
        }

        // ── Post-load ────────────────────────────────────────────────────────
        let player = get(playerStore);
        player = checkQuestTriggers(player);
        playerStore.set(player);

        validateAllData(get(questStore), get(npcStore));

        messageStore.addMessage('Game Loaded!', ['System']);
        goto('/map');

    } catch (error) {
        console.error('Error loading game:', error);
        messageStore.addMessage('Failed to load save data. The file may be corrupt.', ['System']);
    }
}

export function clearSave() {
    if (!browser) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('dawn_journey_save_v2');
    window.location.reload();
}

// ---------------------------------------------------------------------------
// Debug helper — call from browser console: window.__saveSize()
// ---------------------------------------------------------------------------
if (browser) {
    (window as any).__saveSize = () => {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) { console.log('No save found.'); return; }
        console.log(`Save size: ${(raw.length / 1024).toFixed(1)} KB`);
        try {
            const parsed = JSON.parse(raw);
            console.log('Inventory items:', parsed.player?.inventory?.length ?? '?');
            console.log('NPCs saved:', Object.keys(parsed.npcs ?? {}).length);
            console.log('Combat history entries:', parsed.player?.combatHistory?.length ?? '?');
        } catch { /* silent */ }
    };
}