import { generalItems } from './generalItems';
import { weapons } from './weapons';
import { relics } from './relics';

export interface Profile {
    id: string;
    name: string;
    avatar: string;
    initialInventory: { itemId: string; amount: number }[];
    equippedWeapons: string[];
    equippedRelics: string[];
    description?: string;
}

export const profiles: Profile[] = [
    {
        id: 'fresh',
        name: 'New Game',
        avatar: '/images/characters/player1.png',
        description: 'Start fresh. Recommended for a first playthrough.',
        initialInventory: [],
        equippedWeapons: [],
        equippedRelics: [],
    },
    {
        id: 'mage',
        name: 'Exhibition',
        avatar: '/images/characters/mage.png',
        description: 'All items unlocked. Explore freely without limits.',
        initialInventory: [],   // handled by ProfileService — all items × 1
        equippedWeapons: ['unity', 'queens_trident'],
        equippedRelics: ['helas_whip', 'sylvies_shorts', 'iron_shackles', 'spiked_choker'],
    },
];