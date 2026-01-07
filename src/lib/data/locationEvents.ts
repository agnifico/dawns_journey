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
        image: './locations/house.png',
        shortDesc: 'A dilapidated, abandoned shack.',
        stepOnMessage: 'You look around in the abandoned shack and find a treasure chest!',
        message: 'You opened the chest and found a stash of mead. That could come in handy someday!',
        effects: [{ type: 'GIVE_ITEM', itemId: 'forza_mead', quantity: 4 }],
    },
    ancient_dragons_fang_shrine: {
        id: 'ancient_dragons_fang_shrine',
        name: 'Ancient Dragon\'s Fang Shrine',
        image: './locations/rune.png',
        shortDesc: 'A rune circle shrine to the Ancient Dragon.',
        stepOnMessage: 'At the base of the giant fang of the ancient being, a few lamps still glow. It is circled by several runes and stones, in a seemingly cyclic fashion. One of the segments seem broken...',
        message: 'You entered the circle. You place a stone, completing the circle, and feel a surge of power!',
        actions: [
            {
                text: 'Enter rune circle',
                effects: [
                    { type: 'TAKE_ITEM', itemId: 'stone', quantity: 1 },
                    { type: 'RESTORE_AURA', value: 50 }
                ],
            },
        ],
    },
    small_cave_1: {
        id: 'small_cave_1',
        name: 'Small cave in the woods',
        image: './locations/crevice.png',
        shortDesc: 'A small caved-in section of a small hill.',
        stepOnMessage: 'You see something glittering in there.',
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
