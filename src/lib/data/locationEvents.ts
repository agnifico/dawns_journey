import type { LocationEvent } from '../types';

export const locationEventDefinitions: { [id: string]: LocationEvent } = {
    campfire: {
        id: 'campfire',
        name: 'Campfire',
        image: './locations/campfire.png',
        shortDesc: 'A warm, inviting campfire.',
        stepOnMessage: 'You find a warm campfire.',
        message: 'You rest by the fire and restore some HP.',
        effects: [{ type: 'RESTORE_HP', value: 9999 }],
    },
    aura_shrine: {
        id: 'aura_shrine',
        name: 'Aura Shrine',
        image: './locations/auraShrine.png',
        shortDesc: 'An ancient, humming shrine.',
        stepOnMessage: 'You discover an ancient Aura Shrine.',
        message: 'You feel a calming energy wash over you, restoring your Aura.',
        actions: [
            {
                text: 'Revere the shrine',
                effects: [{ type: 'RESTORE_AURA', value: 100 }],
            },
        ],
    },
    treasure_chest: {
        id: 'treasure_chest',
        name: 'Treasure Chest',
        image: './locations/treasure_chest.png',
        shortDesc: 'A weathered treasure chest.',
        stepOnMessage: 'You found a treasure chest!',
        message: 'You opened the chest and found a Potion!',
        effects: [{ type: 'GIVE_ITEM', itemId: 'citrine', quantity: 99 }],
    },
    offering_altar: {
        id: 'offering_altar',
        name: 'Offering Altar',
        image: './locations/altar.png',
        shortDesc: 'A strange altar humming with energy.',
        stepOnMessage: 'You approach a mysterious altar.',
        message: 'You offered a stone and feel a surge of power!',
        actions: [
            {
                text: 'Offer a Stone',
                effects: [
                    { type: 'TAKE_ITEM', itemId: 'stone', quantity: 1 },
                    { type: 'RESTORE_AURA', value: 50 }
                ],
            },
        ],
    },
    gem_trap: {
        id: 'gem_trap',
        name: 'Suspicious Nook',
        image: './locations/nook.png',
        shortDesc: 'A small nook in the wall. Something glitters inside.',
        stepOnMessage: 'You see a glittering gem inside a nook.',
        message: 'You swapped the stone for the gem.',
        actions: [
            {
                text: 'Swap a Stone for the Gem',
                effects: [
                    { type: 'SWAP_ITEM', takeItemId: 'stone', takeQuantity: 99, giveItemId: 'amethyst', giveQuantity: 99 }
                ],
            },
        ],
    },
};
