import type { Item } from '../types';
import { itemDictionary } from './items';

export interface CraftingRecipe {
    id: string;
    name: string;
    description: string;
    ingredients: { itemId: string; quantity: number }[];
    output: { itemId: string; quantity: number };
    image?: string; // Optional: for recipe book, etc.
}

export const craftingRecipes: CraftingRecipe[] = [
    {
        id: 'basic_sword',
        name: 'Iron Sword',
        description: 'A basic sword crafted from wood and stone.',
        ingredients: [
            { itemId: 'wood', quantity: 1 },
            { itemId: 'stone', quantity: 1 },
        ],
        output: { itemId: 'basic_sword', quantity: 1 },
        image: '/weapons/basic_sword.png',
    },
    {
        id: 'basic_bow',
        name: 'Basic Bow',
        description: 'A simple bow made from wood and feathers.',
        ingredients: [
            { itemId: 'wood', quantity: 2 },
            { itemId: 'feather', quantity: 2 },
        ],
        output: { itemId: 'basic_bow', quantity: 1 },
        image: '/weapons/basic_bow.png',
    },
    {
        id: 'bread',
        name: 'Bread',
        description: 'A loaf of freshly baked bread.',
        ingredients: [
            { itemId: 'wheat', quantity: 3 },
        ],
        output: { itemId: 'bread', quantity: 1 },
        image: '/general/bread.png',
    },
    {
        id: 'unity',
        name: 'Unity',
        description: 'A basic sword crafted from wood and stone.',
        ingredients: [
            { itemId: 'basic_sword', quantity: 1 },
            { itemId: 'emerald', quantity: 1 },
            { itemId: 'citrine', quantity: 1 },
            { itemId: 'aquamarine', quantity: 1 },
            { itemId: 'amethyst', quantity: 1 },
            { itemId: 'sapphire', quantity: 1 },
            { itemId: 'ruby', quantity: 1 },
        ],
        output: { itemId: 'unity', quantity: 1 },
        image: '/weapons/unity.png',
    },

    {
        id: 'advanced_polearm',
        name: 'Advanced Polearm',
        description: 'Basic → Advanced Polearm',
        ingredients: [
            { itemId: 'basic_polearm', quantity: 1 },
        ],
        output: { itemId: 'advanced_polearm', quantity: 1 },
        image: '/weapons/advanced_polearm.png',
    },

    {
        id: 'advanced_claw',
        name: 'Advanced Claw',
        description: 'Basic → Advanced claw',
        ingredients: [
            { itemId: 'basic_claw', quantity: 1 },
        ],
        output: { itemId: 'advanced_claw', quantity: 1 },
        image: '/weapons/advanced_claw.png',
    },

    {
        id: 'advanced_bow',
        name: 'Advanced Bow',
        description: 'Basic → Advanced bow',
        ingredients: [
            { itemId: 'basic_bow', quantity: 1 },
        ],
        output: { itemId: 'advanced_bow', quantity: 1 },
        image: '/weapons/advanced_bow.png',
    },

    {
        id: 'basic_halberd',
        name: 'Basic Halberd',
        description: 'Basic Halberd',
        ingredients: [
            { itemId: 'basic_axe', quantity: 1 },
            { itemId: 'basic_polearm', quantity: 1 },
        ],
        output: { itemId: 'basic_halberd', quantity: 1 },
        image: '/weapons/basic_halberd.png',
    },
    
];
