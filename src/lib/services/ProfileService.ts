import type { Player, Profile } from '$lib/types';
import { createItem, createItems } from './ItemFactory';
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



        // Set initial inventory
        const allItems = getAllItems();

        for (const item of allItems) {
            if (item.flags?.includes('stackable')) {
                newPlayer = addItems(newPlayer, item.id, 99, false);
            } else {
                newPlayer = addItems(newPlayer, item.id, 1, false);
            }
        }

        // Equip weapons
        const equippedWeapons = profile.equippedWeapons.map(weaponId => {
            const weapon = createItem(weaponId);
            return weapon && weapon.type === 'weapon' ? weapon : null;
        });
        newPlayer.equipment.weapon_slots = [...equippedWeapons, ...Array(2 - equippedWeapons.length).fill(null)];

        // Equip relics
        const equippedRelics = profile.equippedRelics.map(relicId => {
            const relic = createItem(relicId);
            return relic && relic.type === 'relic' ? relic : null;
        });
        newPlayer.equipment.relic_slots = [...equippedRelics, ...Array(4 - equippedRelics.length).fill(null)];

        return newPlayer;
    });
}