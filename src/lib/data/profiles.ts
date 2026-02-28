import type { Item } from '$lib/types';
import { generalItems } from './generalItems';
import { weapons } from './weapons';
import { relics } from './relics';

// Extract all weapons, relics, and other general items
const allWeapons = weapons;
const allRelics = relics;
const otherGeneralItems = generalItems.filter(item => item.type === 'general');

export interface Profile {
    id: string;
    name: string;
    avatar: string;
    initialInventory: { itemId: string; amount: number }[];
    equippedWeapons: string[];
    equippedRelics: string[];
}

export const profiles: Profile[] = [
    {
        id: 'fresh',
        name: 'Fresh',
        avatar: '/images/characters/player1.png',
        initialInventory: [],
        equippedWeapons: [],
        equippedRelics: [],
    },
    {
        id: 'shieldmaiden',
        name: 'Shieldmaiden',
        avatar: '/images/characters/gladiator.png',
        initialInventory: [
            ...allWeapons.map(item => ({ itemId: item.id, amount: 1 })),
            ...allRelics.map(item => ({ itemId: item.id, amount: 1 })),
            ...otherGeneralItems.map(item => ({ itemId: item.id, amount: 5 })),
        ],
        equippedWeapons: ['pestilence', 'saints_greatsword'],
        equippedRelics: ['magma_fossil', 'seabed_fossil', 'orange_bandana', 'pink_sarong'],
    },
    {
        id: 'mage',
        name: 'Mage',
        avatar: '/images/characters/mage.png',
        initialInventory: [
            ...allWeapons.map(item => ({ itemId: item.id, amount: 1 })),
            ...allRelics.map(item => ({ itemId: item.id, amount: 1 })),
            ...otherGeneralItems.map(item => ({ itemId: item.id, amount: 5 })),
        ],
        equippedWeapons: ['queens_trident', 'unity'],
        equippedRelics: ['helas_whip', 'wicked_jewel', 'sylvies_shorts', 'cygwins_love'],
    },
    
];
