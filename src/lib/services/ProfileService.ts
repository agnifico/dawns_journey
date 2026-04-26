import { createItem } from './ItemFactory';
import { profiles } from '$lib/data/profiles';
import { playerStore } from '$lib/stores/playerStore';
import { getAllItems, addItems } from '$lib/services/InventoryService';

export function applyProfile(profileId: string) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) {
        console.error(`Profile with id ${profileId} not found.`);
        return;
    }

    playerStore.update(player => {
        let newPlayer = { ...player };

        // Set avatar
        newPlayer.profile.avatar = profile.avatar;

        // ── Inventory ──────────────────────────────────────────────────────
        if (profile.id === 'fresh') {
            // New game: 10 bread to start, nothing else
            newPlayer = addItems(newPlayer, 'bread', 10, false);

        } else if (profile.id === 'exhibition') {
            // Exhibition: all items × 1 so the player can explore everything
            const allItems = getAllItems();
            for (const item of allItems) {
                if (item.flags.includes("stackable")) {

                    newPlayer = addItems(newPlayer, item.id, 99, false);
                } else {

                    newPlayer = addItems(newPlayer, item.id, 1, false);
                }
            }
        }
        // Any future profiles: add cases here

        // ── Weapons ────────────────────────────────────────────────────────
        const equippedWeapons = profile.equippedWeapons
            .map(id => {
                const w = createItem(id);
                return w?.type === 'weapon' ? w : null;
            })
            .filter(Boolean);

        newPlayer.equipment.weapon_slots = [
            ...equippedWeapons,
            ...Array(Math.max(0, 2 - equippedWeapons.length)).fill(null)
        ];

        // ── Relics ─────────────────────────────────────────────────────────
        const equippedRelics = profile.equippedRelics
            .map(id => {
                const r = createItem(id);
                return r?.type === 'relic' ? r : null;
            })
            .filter(Boolean);

        newPlayer.equipment.relic_slots = [
            ...equippedRelics,
            ...Array(Math.max(0, 4 - equippedRelics.length)).fill(null)
        ];

        return newPlayer;
    });
}