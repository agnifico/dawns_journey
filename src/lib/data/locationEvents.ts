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
        effects: [{ type: 'RESTORE_HP', value: 9999 }],
        reusable: true
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
        reusable: true
    },
    treasure_chest: {
        id: 'treasure_chest',
        name: 'Abandoned Shack',
        image: '/locations/shack.jpg',
        shortDesc: 'A weathered treasure chest.',
        stepOnMessage: ['You\'ve found a treasure chest!', 'You opened the chest and found a stash of mead!', 'Go give it to Hela, you know she\'ll like it',],
        message: ['You opened the chest and found a stash of mead!', 'Go give it to Hela, you know she\'ll like it'],
        effects: [{ type: 'give_item', itemId: 'forza_mead', quantity: 10 }],
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
    malefic_cave: {
        id: 'malefic_cave',
        name: 'Malefic Cave',
        image: '/locations/crevice.png',
        shortDesc: 'A dark aura emanates from the cave.',
        stepOnMessage: ['You feel a nauseating dark aura seeping out of the small crevice by the hill.', 'You dare to venture in, finding a crack in the ground, with the dragon\'s lifeforce oozing out, but with maleficence.'],
        message: ['You unleash your command over the elements and manage to contain the energy into the Empty Energy Orb Veres gave you.', 'The bulk of the unbound malefic energy is now contained. The area should be safe.', 'You should let Veres know.'],
        actions: [
            {
                text: 'Contain the unbound energy using your Elemental powers.',
                effects: [
                    { type: 'SWAP_ITEM', takeItemId: 'empty_energy_orb', takeQuantity: 1, giveItemId: 'dragon_energy_orb', giveQuantity: 1 }
                ],
            },
        ],
    },

    // New Events (integrated into the correct structure)
    F1: {
        id: "F1",
        name: "Forgotten Shrine",
        shortDesc: "A forgotten shrine humming with a faint energy.",
        image: "/locations/tower1-landscape.png",
        reusable: false,
        coords: { x: 26, y: 13 },
        stepOnMessage: "You've discovered a Forgotten Shrine.",
        message: "The air is thick with old magic. A single button on a pedestal seems to be the only point of interaction.",
        requirementNotMetMessage: "The shrine is dormant. Perhaps someone needs to tell you about it first.",
        requirement: {
            "type": "have_tag",
            "tag": "claudia_ready_for_f1"
        },
        actions: [
            {
                "text": "Press the Button",
                "effects": [
                    { "type": "add_tag", "tag": "f1_complete" },
                    { "type": "give_item", "itemId": "turquoise", "quantity": 1 }
                ]
            }
        ]
    },
    F2: {
        id: "F2",
        name: "Decrepit Spire",
        shortDesc: "A decrepit spire pulsing with a strange light.",
        image: "/locations/tower2-landscape.png",
        reusable: false,
        coords: { x: 22, y: 13 },
        stepOnMessage: "You've found a Decrepit Spire.",
        message: "The structure is ancient, yet a single button on a console seems to be active.",
        requirementNotMetMessage: "The spire is dormant. Perhaps someone needs to tell you about it first.",
        requirement: {
            "type": "have_tag",
            "tag": "cygwin_ready_for_f2"
        },
        actions: [
            {
                "text": "Press the Button",
                "effects": [
                    { "type": "add_tag", "tag": "f2_complete" },
                    { "type": "give_item", "itemId": "citrine", "quantity": 1 }
                ]
            }
        ]
    },
    F3: {
        id: "F3",
        name: "The Shattered Crossroads",
        image: "/locations/tower3-landscape.png",
        shortDesc: "The path ahead diverges. A choice must be made.",
        stepOnMessage: "You stand at a shattered crossroads, the path ahead diverging.",
        message: "Both the Solis Saints and the Shadowhand have presented you with an ultimatum. Your decision will shape your future alliances. Who will you side with?",
        actions: [
            {
                text: "Side with the Solis Saints",
                requirement: { "type": "have_tag", "tag": "guinevere_ready_for_f3" },
                effects: [
                    { type: "set_quest_state", questId: "guinevere_sword_4", state: "COMPLETED" },
                    { type: "set_quest_state", questId: "akari_sword_2", state: "FAILED" },
                    { type: "add_reputation", faction: "solis_saints", amount: 25 },
                    { type: "add_reputation", faction: "shadowhand", amount: -15 },
                    { type: "add_tag", tag: "chose_solis_saints" }
                ],
                responseMessage: "You have chosen to align with the Solis Saints. The path of light is now clearer, but shadows of resentment may follow."
            },
            {
                text: "Side with the Shadowhand",
                requirement: { "type": "have_tag", "tag": "akari_ready_for_f3" },
                effects: [
                    { type: "set_quest_state", questId: "akari_sword_2", state: "COMPLETED" },
                    { type: "set_quest_state", questId: "guinevere_sword_4", state: "FAILED" },
                    { type: "add_reputation", faction: "shadowhand", amount: 25 },
                    { type: "add_reputation", faction: "solis_saints", amount: -15 },
                    { type: "add_tag", tag: "chose_shadowhand" }
                ],
                responseMessage: "You have cast your lot with the Shadowhand. You gain favor in the underworld, but have made a powerful enemy in the light."
            }
        ]
    },
    teleport_to_cathedral: {
        id: 'teleport_to_cathedral',
        name: 'Teleporter to Cathedral',
        image: '/locations/shrine.png',
        shortDesc: 'A strange portal humming with energy.',
        stepOnMessage: 'You found a teleporter to the Cathedral.',
        message: 'Do you want to travel to the Cathedral?',
        actions: [
            {
                text: 'Travel',
                effects: [{ type: 'switch_map', mapId: 'cathedral', x: 14, y: 31 }],
            },
        ],
        reusable: true
    },
    teleport_to_dragon_island: {
        id: 'teleport_to_dragon_island',
        name: 'Teleporter to Dragon Island',
        image: '/locations/shrine.png',
        shortDesc: 'A strange portal humming with energy.',
        stepOnMessage: 'You found a teleporter to Dragon Island.',
        message: 'Do you want to travel to Dragon Island?',
        actions: [
            {
                text: 'Travel',
                effects: [{ type: 'switch_map', mapId: 'dragon_island', x: 27, y: 1 }],
            },
        ],
        reusable: true
    }
};
