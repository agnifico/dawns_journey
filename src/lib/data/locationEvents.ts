import type { LocationEvent } from '$lib/types';

export const locationEventDefinitions: { [id: string]: LocationEvent } = {
    // Restored from v58
    campfire: {
        id: 'campfire',
        name: 'Campfire',
        image: '/locations/campfire.png',
        shortDesc: 'A warm, inviting campfire.',
        stepOnMessage: 'You find a warm campfire.',
        message: 'You rest by the fire and restore some HP.',
        effects: [{ type: 'RESTORE_HP', value: 25 }],
    },
    aura_shrine: {
        id: 'aura_shrine',
        name: 'Aura Shrine',
        image: '/locations/shrine.png',
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
        image: '/locations/chest.png',
        shortDesc: 'A weathered treasure chest.',
        stepOnMessage: 'You\'ve found a treasure chest!',
        message: 'You opened the chest and found a stash of mead!',
        effects: [{ type: 'GIVE_ITEM', itemId: 'forza_mead', quantity: 1 }],
        afterDescription: 'An empty treasure chest. You remember finding some mead here.',
    },
    ancient_dragons_fang_shrine: {
        id: 'ancient_dragons_fang_shrine',
        name: 'Ancient Dragon\'s Fang Shrine',
        image: '/locations/rune.png',
        shortDesc: 'A rune circle shrine to the Ancient Dragon.',
        stepOnMessage: 'At the base of the giant fang of the ancient being, a few lamps still glow.',
        message: 'You place a stone, completing the circle, and feel a surge of power!',
        actions: [
            {
                text: 'Complete the circle',
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
        image: '/locations/crevice.png',
        shortDesc: 'A small caved-in section of a small hill.',
        stepOnMessage: 'You see something glittering in there.',
        message: 'You swapped the stone for the gem.',
        actions: [
            {
                text: 'Swap a Stone for the Gem',
                effects: [
                    { type: 'SWAP_ITEM', takeItemId: 'stone', takeQuantity: 1, giveItemId: 'amethyst', giveQuantity: 1 }
                ],
            },
        ],
    },

    // New Events (integrated into the correct structure)
    "F1": {
        "id": "F1",
        "name": "Forgotten Shrine",
        "image": "/locations/tower.png",
        "coords": { "x": 22, "y": 13 },
        "stepOnMessage": "You've discovered a Forgotten Shrine, humming with a faint energy.",
        "message": "The air is thick with old magic. A single button on a pedestal seems to be the only point of interaction.",
        "actions": [
            {
                "text": "Press the Button",
                "effects": [
                    { "type": "add_tag", "tag": "f1_complete" },
                    { "type": "give_item", "itemId": "aquamarine", "quantity": 1 },
                    { "type": "complete_quest_stage" }
                ]
            }
        ]
    },
    "F2": {
        "id": "F2",
        "name": "Decrepit Spire",
        "image": "/locations/tower.png",
        "coords": { "x": 26, "y": 13 },
        "stepOnMessage": "You've found a Decrepit Spire, pulsing with a strange light.",
        "message": "The structure is ancient, yet a single button on a console seems to be active.",
        "actions": [
            {
                "text": "Press the Button",
                "effects": [
                    { "type": "add_tag", "tag": "f2_complete" },
                    { "type": "give_item", "itemId": "citrine", "quantity": 1 },
                    { "type": "complete_quest_stage" }
                ]
            }
        ]
    },
    "F3": {
        "id": "F3",
        "name": "Altar of Fates",
        "image": "/locations/tower.png",
        "coords": { "x": 25, "y": 9 },
        "stepOnMessage": "You've reached the Altar of Fates. The air crackles with power and impending decision.",
        "message": "This is the final tower. Its energy is unstable. You feel two powerful forces pulling you in different directions. Your choice here will have consequences.",
        "actions": [
            {
                "text": "Channel the Altar's Energy",
                "effects": [
                    { "type": "give_item", "itemId": "amethyst", "quantity": 1 },
                    { "type": "trigger_faction_choice" }
                ]
            }
        ]
    }
};
