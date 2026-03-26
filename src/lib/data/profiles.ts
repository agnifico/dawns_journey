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
    description?: string;
}

export const profiles: Profile[] = [
    {
        id: 'fresh',
        name: 'Starter',
        avatar: '/images/characters/player1.png',
        description: 'Face the brave new world, with nothing but your curiosity. Most recommneded for a first timer.',
        initialInventory: [],
        equippedWeapons: [],
        equippedRelics: [],
    },
    // {
    //     id: 'shieldmaiden',
    //     name: 'Shieldmaiden',
    //     avatar: '/images/characters/gladiator.png',
    //     description: 'Start with the best-in-slot Defensive gear, and all items unlocked. Use as a testing tool.',
    //     initialInventory: [
    //         ...allWeapons.map(item => ({ itemId: item.id, amount: 1 })),
    //         ...allRelics.map(item => ({ itemId: item.id, amount: 1 })),
    //         ...otherGeneralItems.map(item => ({ itemId: item.id, amount: 5 })),
    //     ],
    //     equippedWeapons: ['pestilence', 'saints_greatsword'],
    //     equippedRelics: ['magma_fossil', 'seabed_fossil', 'orange_bandana', 'pink_sarong'],
    // },
    {
        id: 'mage',
        name: 'Exhibition',
        avatar: '/images/characters/mage.png',
        description: 'Start with all items unlocked and freely look around.',
        initialInventory: [
            ...allWeapons.map(item => ({ itemId: item.id, amount: 1 })),
            ...allRelics.map(item => ({ itemId: item.id, amount: 1 })),
            ...otherGeneralItems.map(item => ({ itemId: item.id, amount: 5 })),
        ],
        equippedWeapons: ['queens_trident', 'unity'],
        equippedRelics: ['helas_whip', 'wicked_jewel', 'sylvies_shorts', 'cygwins_love'],
    },
    
];
