import type { LocationEvent } from '$lib/types';

export const locationEventDefinitions: { [id: string]: LocationEvent } = {

    // ─── Existing events (unchanged) ─────────────────────────────────────────────

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
        actions: [{ text: 'Revere the shrine', effects: [{ type: 'RESTORE_AURA', value: 100 }] }],
        reusable: true
    },
    treasure_chest: {
        id: 'treasure_chest',
        name: 'Abandoned Shack',
        image: '/locations/shack.jpg',
        shortDesc: 'A weathered treasure chest.',
        stepOnMessage: ["You've found a treasure chest!", "You opened the chest and found a stash of mead!", "Go give it to Hela, you know she'll like it"],
        message: ["You opened the chest and found a stash of mead!", "Go give it to Hela, you know she'll like it"],
        effects: [{ type: 'give_item', itemId: 'forza_mead', quantity: 10 }],
        afterDescription: 'An empty treasure chest. You remember finding some mead here.',
    },
    ancient_dragons_fang_shrine: {
        id: 'ancient_dragons_fang_shrine',
        name: "Ancient Dragon's Fang Shrine",
        image: '/locations/rune.png',
        shortDesc: "A rune circle shrine to the Ancient Dragon.",
        stepOnMessage: 'At the base of the giant fang of the ancient being, a few lamps still glow.',
        message: 'You place a stone, completing the circle, and feel a surge of power!',
        actions: [{
            text: 'Complete the circle',
            effects: [{ type: 'TAKE_ITEM', itemId: 'stone', quantity: 1 }, { type: 'RESTORE_AURA', value: 50 }]
        }],
    },
    malefic_cave: {
        id: 'malefic_cave',
        name: 'Malefic Cave',
        image: '/locations/crevice.png',
        shortDesc: 'A dark aura emanates from the cave.',
        stepOnMessage: ["You feel a nauseating dark aura seeping out of the small crevice by the hill.", "You dare to venture in, finding a crack in the ground, with the dragon's lifeforce oozing out, but with maleficence."],
        message: ["You unleash your command over the elements and manage to contain the energy into the Empty Energy Orb Veres gave you.", "The bulk of the unbound malefic energy is now contained. The area should be safe.", "You should let Veres know."],
        actions: [{
            text: 'Contain the unbound energy using your Elemental powers.',
            effects: [{ type: 'SWAP_ITEM', takeItemId: 'empty_energy_orb', takeQuantity: 1, giveItemId: 'dragon_energy_orb', giveQuantity: 1 }]
        }],
    },
    F1: {
        id: 'F1',
        name: 'Forgotten Shrine',
        shortDesc: 'A forgotten shrine humming with a faint energy.',
        image: '/locations/tower1-landscape.png',
        reusable: false,
        stepOnMessage: "You've discovered a Forgotten Shrine.",
        message: 'The air is thick with old magic. A single button on a pedestal seems to be the only point of interaction.',
        requirementNotMetMessage: 'The shrine is dormant. Perhaps someone needs to tell you about it first.',
        requirement: { type: 'have_tag', tag: 'claudia_ready_for_f1' },
        actions: [{
            text: 'Press the Button',
            effects: [{ type: 'add_tag', tag: 'f1_complete' }, { type: 'give_item', itemId: 'turquoise', quantity: 1 }]
        }]
    },
    F2: {
        id: 'F2',
        name: 'Decrepit Spire',
        shortDesc: 'A decrepit spire pulsing with a strange light.',
        image: '/locations/tower2-landscape.png',
        reusable: false,
        stepOnMessage: "You've found a Decrepit Spire.",
        message: 'The structure is ancient, yet a single button on a console seems to be active.',
        requirementNotMetMessage: 'The spire is dormant. Perhaps someone needs to tell you about it first.',
        requirement: { type: 'have_tag', tag: 'cygwin_ready_for_f2' },
        actions: [{
            text: 'Press the Button',
            effects: [{ type: 'add_tag', tag: 'f2_complete' }, { type: 'give_item', itemId: 'citrine', quantity: 1 }]
        }]
    },
    F3: {
        id: 'F3',
        name: 'The Shattered Crossroads',
        image: '/locations/tower3-landscape.png',
        shortDesc: 'The path ahead diverges. A choice must be made.',
        stepOnMessage: 'You stand at a shattered crossroads, the path ahead diverging.',
        message: 'Both the Solis Saints and the Shadowhand have presented you with an ultimatum. Your decision will shape your future alliances. Who will you side with?',
        actions: [
            {
                text: 'Side with the Solis Saints',
                requirement: { type: 'have_tag', tag: 'guinevere_ready_for_f3' },
                effects: [
                    { type: 'set_quest_state', questId: 'guinevere_sword_4', state: 'COMPLETED' },
                    { type: 'set_quest_state', questId: 'akari_sword_2', state: 'FAILED' },
                    { type: 'add_reputation', faction: 'solis_saints', amount: 25 },
                    { type: 'add_reputation', faction: 'shadowhand', amount: -15 },
                    { type: 'add_tag', tag: 'chose_solis_saints' }
                ],
                responseMessage: 'You have chosen to align with the Solis Saints. The path of light is now clearer, but shadows of resentment may follow.'
            },
            {
                text: 'Side with the Shadowhand',
                requirement: { type: 'have_tag', tag: 'akari_ready_for_f3' },
                effects: [
                    { type: 'set_quest_state', questId: 'akari_sword_2', state: 'COMPLETED' },
                    { type: 'set_quest_state', questId: 'guinevere_sword_4', state: 'FAILED' },
                    { type: 'add_reputation', faction: 'shadowhand', amount: 25 },
                    { type: 'add_reputation', faction: 'solis_saints', amount: -15 },
                    { type: 'add_tag', tag: 'chose_shadowhand' }
                ],
                responseMessage: "You have cast your lot with the Shadowhand. You gain favour in the underworld, but have made a powerful enemy in the light."
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
        actions: [{ text: 'Travel', effects: [{ type: 'switch_map', mapId: 'cathedral', x: 14, y: 31 }] }],
        reusable: true
    },
    teleport_to_dragon_island: {
        id: 'teleport_to_dragon_island',
        name: 'Teleporter to Dragon Island',
        image: '/locations/shrine.png',
        shortDesc: 'A strange portal humming with energy.',
        stepOnMessage: 'You found a teleporter to Dragon Island.',
        message: 'Do you want to travel to Dragon Island?',
        actions: [{ text: 'Travel', effects: [{ type: 'switch_map', mapId: 'dragon_island', x: 27, y: 1 }] }],
        reusable: true
    },

    // ─── Boats ───────────────────────────────────────────────────────────────────

    boat_to_mainland: {
        id: 'boat_to_mainland',
        name: 'Boat to the Mainland',
        image: '/locations/boat.png',
        shortDesc: 'A sturdy boat moored at the dock.',
        stepOnMessage: 'A weather-beaten boat sits ready at the dock.',
        message: 'The mainland is a long way off. The boat could take you there — if you\'re ready.',
        actions: [{ text: 'Set sail', effects: [{ type: 'switch_map', mapId: 'mainland', x: 0, y: 0 }] }],
        reusable: true
    },
    boat_to_pleasure_island: {
        id: 'boat_to_pleasure_island',
        name: 'Boat to Pleasure Island',
        image: '/locations/boat.png',
        shortDesc: 'A small vessel pointed northeast.',
        stepOnMessage: 'A small boat is moored here, pointed toward the island to the northeast.',
        message: 'Pleasure Island sits out there in the water, vivid and strange. The boat is seaworthy.',
        actions: [{ text: 'Head to Pleasure Island', effects: [{ type: 'switch_map', mapId: 'dragon_island', x: 2, y: 2 }] }],
        reusable: true
    },

    // ─── Treasure chests ─────────────────────────────────────────────────────────

    big_chest0: {
        id: 'big_chest0',
        name: 'Ancient Chest',
        image: '/locations/big_chest.png',
        shortDesc: 'A large, ornate chest half-buried in the earth.',
        stepOnMessage: 'You stumble upon an ancient chest, its lock long since rusted open.',
        message: 'Inside, amongst the dust, something still gleams.',
        effects: [{ type: 'give_item', itemId: 'gold', quantity: 3 }, { type: 'give_item', itemId: 'stone', quantity: 5 }],
        afterDescription: 'An empty ancient chest. You cleaned it out.',
        reusable: false
    },
    big_chest1: {
        id: 'big_chest1',
        name: 'Sunken Cache',
        image: '/locations/big_chest.png',
        shortDesc: 'A waterlogged chest washed up from somewhere deeper.',
        stepOnMessage: 'A heavy chest sits at the waterline, barnacled and salt-stained.',
        message: 'The contents are waterlogged but intact. Someone stashed this deliberately.',
        effects: [{ type: 'give_item', itemId: 'fish', quantity: 5 }, { type: 'give_item', itemId: 'coral_reef', quantity: 3 }, { type: 'give_item', itemId: 'sapphire', quantity: 1 }],
        afterDescription: 'A salt-stained empty chest. You took what was worth taking.',
        reusable: false
    },
    big_chest2: {
        id: 'big_chest2',
        name: "Ranger's Stash",
        image: '/locations/big_chest.png',
        shortDesc: 'A sturdy chest half-hidden beneath a fallen log.',
        stepOnMessage: "You nearly trip over a chest hidden under a fallen log. Someone didn't want this found.",
        message: "The chest is packed with care. Whoever left this knew what they were doing.",
        effects: [{ type: 'give_item', itemId: 'wood', quantity: 8 }, { type: 'give_item', itemId: 'leaves', quantity: 5 }, { type: 'give_item', itemId: 'island_herb', quantity: 3 }],
        afterDescription: "A hidden chest, emptied. It smells faintly of the forest.",
        reusable: false
    },
    big_chest3: {
        id: 'big_chest3',
        name: 'Dragon Empire Reliquary',
        image: '/locations/big_chest.png',
        shortDesc: 'A chest bearing the crest of the old dragon sovereigns.',
        stepOnMessage: 'The chest before you is carved from dark stone and inlaid with gold. The crest on the lid is not human.',
        message: "The interior is lined with velvet that has survived centuries intact. The Dragon Empire built things to last.",
        effects: [
            { type: 'give_item', itemId: 'dragon_fang', quantity: 2 },
            { type: 'give_item', itemId: 'gold', quantity: 5 },
            { type: 'give_item', itemId: 'turquoise', quantity: 3 },
            { type: 'add_tag', tag: 'found_dragon_empire_chest' }
        ],
        afterDescription: "A stone reliquary, emptied. The crest of the Dragon Empire still watches from the lid.",
        reusable: false
    },

    // ─── Legendary swords ────────────────────────────────────────────────────────
    // Nine blades of the Dragon Empire's sovereign guard, hidden across the island.
    // Each requires a different element gate. Collectively they tell the story of the
    // last Dragon Sovereign — piece by piece through their inscriptions.

    legendary_sword1: {
        id: 'legendary_sword1',
        name: 'Blade of the First Accord',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade half-swallowed by the earth, still perfectly balanced.',
        stepOnMessage: 'Something catches the light beneath the soil. You dig — and find a sword.',
        message: "The inscription reads: 'To guard is not to rule. The first accord was made in trust, and trust is what we leave behind.'",
        requirement: { type: 'have_tag', tag: 'found_dragon_empire_chest' },
        requirementNotMetMessage: 'Something is buried here. You sense it, but cannot reach it yet.',
        effects: [{ type: 'give_item', itemId: 'dragon_fang', quantity: 1 }, { type: 'add_tag', tag: 'legendary_sword1_found' }],
        afterDescription: 'An empty impression in the earth where a sword once rested.',
        reusable: false
    },
    legendary_sword2: {
        id: 'legendary_sword2',
        name: 'Blade of Still Water',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade resting at the bottom of a shallow pool, untouched by rust.',
        stepOnMessage: 'The water here is unnaturally still. Beneath the surface, something glints.',
        message: "The inscription reads: 'Power without stillness is just noise. We were taught to listen before we were taught to act.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword1_found' },
        requirementNotMetMessage: 'The water is still. Something waits beneath, but not for you. Not yet.',
        effects: [{ type: 'give_item', itemId: 'sapphire', quantity: 1 }, { type: 'add_tag', tag: 'legendary_sword2_found' }],
        afterDescription: 'A shallow, still pool. The sword is gone. The water remains.',
        reusable: false
    },
    legendary_sword3: {
        id: 'legendary_sword3',
        name: 'Blade of the Open Mountain',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade driven into the mountainside at the exact height of a dragon\'s eye-level.',
        stepOnMessage: 'The stone here has been shaped — not broken, shaped. A blade stands in it like a marker.',
        message: "The inscription reads: 'The mountain does not belong to those who climb it. The mountain belongs to itself. We only borrowed the view.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword2_found' },
        requirementNotMetMessage: 'A blade stands in the stone. Something stops your hand from reaching it.',
        effects: [{ type: 'give_item', itemId: 'stone', quantity: 5 }, { type: 'add_tag', tag: 'legendary_sword3_found' }],
        afterDescription: 'A shaped stone with a clean slot where the blade once stood.',
        reusable: false
    },
    legendary_sword4: {
        id: 'legendary_sword4',
        name: 'Blade of the Forest Pact',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade overgrown with living vines that part when you reach for it.',
        stepOnMessage: 'The vines here have grown in a perfect circle around something. As you approach, they shift.',
        message: "The inscription reads: 'The forest remembers every pact ever made beneath its canopy. We made many. We kept them all.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword3_found' },
        requirementNotMetMessage: 'The vines move. You sense you are not ready to receive what they guard.',
        effects: [{ type: 'give_item', itemId: 'wood', quantity: 5 }, { type: 'give_item', itemId: 'leaves', quantity: 3 }, { type: 'add_tag', tag: 'legendary_sword4_found' }],
        afterDescription: 'A ring of vines with a hollow centre. The forest pact is carried elsewhere now.',
        reusable: false
    },
    legendary_sword5: {
        id: 'legendary_sword5',
        name: 'Blade of Equanimity',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade floating an inch above a flat stone, held by something you cannot see.',
        stepOnMessage: 'A sword hovers above a flat stone. No mechanism. No magic you can name. It simply waits.',
        message: "The inscription reads: 'We did not seek to be above. We sought only to be present. Equanimity is not absence of feeling — it is the choice to feel without being destroyed by it.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword4_found' },
        requirementNotMetMessage: 'The sword floats above the stone. You reach — and your hand passes through.',
        effects: [{ type: 'give_item', itemId: 'citrine', quantity: 2 }, { type: 'add_tag', tag: 'legendary_sword5_found' }],
        afterDescription: 'A flat stone, empty. Whatever held the blade in place has gone with it.',
        reusable: false
    },
    legendary_sword6: {
        id: 'legendary_sword6',
        name: 'Blade of the Deep Accord',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade sunk to its hilt in the seafloor, visible only at low tide.',
        stepOnMessage: 'The tide pulls back to reveal something embedded in the seabed. You wade in.',
        message: "The inscription reads: 'We made a pact with what lives below. Not to control it — to coexist. The deep keeps its own counsel. We respected that.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword5_found' },
        requirementNotMetMessage: 'The tide is wrong. Come back when the water shows you what it hides.',
        effects: [{ type: 'give_item', itemId: 'coral_reef', quantity: 3 }, { type: 'give_item', itemId: 'azurite', quantity: 1 }, { type: 'add_tag', tag: 'legendary_sword6_found' }],
        afterDescription: 'A narrow slot in the seabed where the blade once stood. The tide covers it again.',
        reusable: false
    },
    legendary_sword7: {
        id: 'legendary_sword7',
        name: 'Blade of the Last Sovereign',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade embedded in a throne no one has sat in for centuries.',
        stepOnMessage: 'The throne is carved from a single piece of black stone. The blade stands upright in the seat, as if placed there deliberately.',
        message: "The inscription reads: 'I leave this last. Not because I am defeated — because I choose to lay it down. A sovereign who cannot relinquish power was never truly sovereign. This island will remember us by what we built. Not by what we took.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword6_found' },
        requirementNotMetMessage: 'The throne waits. The blade stands in it. Something tells you the time is not right.',
        effects: [{ type: 'give_item', itemId: 'dragon_fang', quantity: 3 }, { type: 'give_item', itemId: 'gold', quantity: 3 }, { type: 'add_tag', tag: 'legendary_sword7_found' }],
        afterDescription: 'A black stone throne with an empty seat. The blade is carried elsewhere now.',
        reusable: false
    },
    legendary_sword8: {
        id: 'legendary_sword8',
        name: 'Blade of Witness',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A blade wedged into the cliff face at the island\'s highest point.',
        stepOnMessage: 'At the peak, a single blade faces outward — as if it has been watching the horizon for centuries.',
        message: "The inscription reads: 'To witness is also to serve. We watched, and in watching, we held a space for what might return. Something always returns.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword7_found' },
        requirementNotMetMessage: 'The blade faces the horizon. It does not turn toward you. Not yet.',
        effects: [{ type: 'give_item', itemId: 'feather', quantity: 3 }, { type: 'give_item', itemId: 'ruby', quantity: 1 }, { type: 'add_tag', tag: 'legendary_sword8_found' }],
        afterDescription: 'A slot in the cliff face where the blade once watched the horizon.',
        reusable: false
    },
    legendary_sword9: {
        id: 'legendary_sword9',
        name: 'Blade of Return',
        image: '/locations/legendary_sword.png',
        shortDesc: 'The ninth blade. It was waiting for you specifically.',
        stepOnMessage: 'There is nothing remarkable about this spot. Except the sword, standing in open ground, pointing skyward.',
        message: "There is no inscription. There is a carving, though — a small dragon curled around a human figure. Both are smiling. Beneath it, in a script older than the island's current name, a single word you somehow understand: 'Welcome back.'",
        requirement: { type: 'have_tag', tag: 'legendary_sword8_found' },
        requirementNotMetMessage: 'A sword stands in open ground. You reach for it — and something stops you. Eight things still need doing.',
        effects: [
            { type: 'give_item', itemId: 'dragon_fang', quantity: 5 },
            { type: 'give_item', itemId: 'gold', quantity: 5 },
            { type: 'give_item', itemId: 'turquoise', quantity: 5 },
            { type: 'add_tag', tag: 'legendary_sword9_found' },
            { type: 'add_tag', tag: 'all_legendary_swords_found' },
            { type: 'add_world_resonance', amount: 20 }
        ],
        afterDescription: "An open patch of ground. Something about this spot feels like a threshold you crossed.",
        reusable: false
    },

    // ─── Dragon Empire lore ───────────────────────────────────────────────────────

    dragonblood_tree: {
        id: 'dragonblood_tree',
        name: 'Dragonblood Tree',
        image: '/locations/dragonblood_tree.png',
        shortDesc: 'A tree that blooms in all seasons, fed by something deep beneath the earth.',
        stepOnMessage: "The tree ahead is impossible — lush and blooming in the middle of the mountain rock, untouched by the cold.",
        message: [
            "Up close, the bark is warm. Not warm like sunlight — warm like something alive underneath.",
            "The roots go down deeper than they should. Reaching for something.",
            "The Dragon Empire planted these across the island as living markers — places where the earth's energy ran close to the surface.",
            "They called them Breath Points. The dragons believed the island itself was a living thing, and these trees were where it exhaled.",
            "This one is still breathing.",
        ],
        actions: [
            {
                text: 'Rest beneath the tree',
                effects: [
                    { type: 'RESTORE_HP', value: 300 },
                    { type: 'RESTORE_AURA', value: 50 },
                    { type: 'add_tag', tag: 'visited_dragonblood_tree' }
                ]
            }
        ],
        reusable: true
    },
    ruined_quarters: {
        id: 'ruined_quarters',
        name: 'Ruined Quarters',
        image: '/locations/ruined_quarters.png',
        shortDesc: 'The remnants of a Dragon Empire settlement, reclaimed by mountain rock and moss.',
        stepOnMessage: "The stone here is worked. Not natural. Someone built this.",
        message: [
            "The walls are still partially standing — low, arched ceilings, doorways sized for something taller than a person.",
            "The Dragon Empire built their living quarters like this: communal, open, with shared walls between families.",
            "They believed separation was the beginning of fear.",
            "Most of the interior has collapsed. But in the corner, a mosaic survives — tiles depicting a dragon and a human sharing a meal.",
            "The craftsmanship is extraordinary. Someone spent a long time on this.",
            "Someone wanted it to be remembered.",
        ],
        actions: [
            {
                text: 'Search the ruins',
                effects: [
                    { type: 'give_item', itemId: 'stone', quantity: 3 },
                    { type: 'give_item', itemId: 'gold', quantity: 1 },
                    { type: 'add_tag', tag: 'visited_ruined_quarters' }
                ]
            }
        ],
        afterDescription: 'Ruined quarters of the Dragon Empire. The mosaic on the wall is still intact.',
        reusable: false
    },
    mountain_lair: {
        id: 'mountain_lair',
        name: "Veres' Lair",
        image: '/locations/mountain_lair.png',
        shortDesc: "A private alcove in the mountain. This is Veres' space.",
        stepOnMessage: "The stone here has been arranged, not placed by nature. Someone made this comfortable on purpose.",
        message: [
            "There is a low stone shelf with a few objects on it — a folded cloth, a worn journal, something that might be a pressed flower.",
            "A wide ledge faces the view. The whole island is visible from here.",
            "You understand immediately why she chose this spot.",
            "She can see everything. And everything that wants to find her has to climb to get here.",
        ],
        requirement: {
            operator: 'AND',
            conditions: [
                { type: 'have_tag', tag: 'veres_sword_5_complete' },
                { type: 'npc_rank', npcId: 'veres', rankType: 'heart', value: 3 }
            ]
        },
        requirementNotMetMessage: "This feels like someone's private space. You shouldn't be here yet.",
        actions: [
            {
                text: 'Stay a while',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_tag', tag: 'visited_veres_lair' }
                ]
            }
        ],
        reusable: true
    },

    // ─── Waterfall ───────────────────────────────────────────────────────────────

    waterfall_magic: {
        id: 'waterfall_magic',
        name: 'The Singing Falls',
        image: '/locations/waterfall.png',
        shortDesc: 'A waterfall nestled deep in the mountain forest. The water sings.',
        stepOnMessage: "You hear it before you see it — a sound just below music, just above silence.",
        message: [
            "The waterfall is tucked into a fold of the mountain, surrounded on three sides by old-growth trees.",
            "The mist catches the light in a way that doesn't entirely make physical sense.",
            "The Dragon Empire called places like this Resonance Pools — points where water, earth, and the island's living energy converged.",
            "The water here is cold and extraordinarily clear.",
            "You get the feeling that if you stayed long enough, you'd understand something you currently don't have words for.",
        ],
        actions: [
            {
                text: 'Bathe in the falls',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_world_resonance', amount: 3 },
                    { type: 'add_tag', tag: 'visited_waterfall_magic' }
                ]
            }
        ],
        reusable: true
    },

    // ─── Hela's portal ────────────────────────────────────────────────────────────

    hells_glow: {
        id: 'hells_glow',
        name: "Hell's Glow",
        image: '/locations/hells_glow.png',
        shortDesc: "The ground glows red here. Something came through from below.",
        stepOnMessage: "The ground beneath your feet is warm. Uncomfortably warm. And it glows — faintly, deep red, from somewhere underneath.",
        message: [
            "This is where Hela came through.",
            "The portal has since closed — she didn't come here to stay, after all, she came to investigate — but the residual energy hasn't dissipated.",
            "The ground remembers the passage of something immense.",
            "Standing in it feels like standing at the edge of something vast.",
            "Not dangerous. Just... big.",
            "You feel, briefly, very small. Then you feel, briefly, very awake.",
        ],
        actions: [
            {
                text: 'Stand in the glow',
                effects: [
                    { type: 'RESTORE_AURA', value: 1000 },
                    { type: 'give_item', itemId: 'fire_tulip', quantity: 2 },
                    // { type: 'add_buff', buffId: 'hells_warmth', duration: 100 }
                ]
            }
        ],
        reusable: true
    },

    // ─── Claudia & Cygwin expedition machines — the new F1/F2/F3 ─────────────────
    // Three field tests of the energy-harvesting technology. Deeper, more ambitious,
    // and more destabilising than the old spire activations.

    red_extractor: {
        id: 'red_extractor',
        name: 'Red Extractor',
        image: '/locations/red_extractor.png',
        shortDesc: "A Saints-built machine drilling into the island's energy substrate.",
        stepOnMessage: "The machine hums at a frequency that sits just wrong in your teeth.",
        message: [
            "The Extractor is Claudia's design — you can tell from the handwriting on the maintenance panel.",
            "It's pulling something up from deep below the surface. Not oil. Not water.",
            "The readings on the display are in a unit you don't recognise.",
            "The machine is working exactly as intended.",
            "That's what worries you.",
        ],
        requirement: { type: 'have_tag', tag: 'can_interact_extractor' },
        requirementNotMetMessage: "The machine is running. You don't have clearance to interfere with it yet.",
        actions: [
            {
                text: 'Read the output data',
                effects: [
                    { type: 'add_tag', tag: 'red_extractor_read' },
                    { type: 'give_item', itemId: 'azurite', quantity: 1 }
                ]
            }
        ],
        afterDescription: "The Red Extractor continues to hum. You know what it's pulling up now.",
        reusable: false
    },
    underground_well1: {
        id: 'underground_well1',
        name: 'Underground Well — Site One',
        image: '/locations/underground_well.png',
        shortDesc: "A shaft bored straight down into the island's core. First of its kind.",
        stepOnMessage: "A reinforced shaft drops straight into the earth. Cold air rises from it, carrying something metallic.",
        message: [
            "Well One is Cygwin's project — the first bore site, placed deliberately far from the Dragon Empire ruins.",
            "She chose this location after three weeks of resonance mapping.",
            "The shaft goes down 200 metres. At the bottom, the island's energy runs like a river.",
            "Cygwin's notes, pinned to the side of the casing, read: 'Output stable. Resonance bleed: 0.3%. Within tolerance. For now.'",
            "'For now' is underlined twice.",
        ],
        requirement: { type: 'have_tag', tag: 'cygwin_ready_for_f2' },
        requirementNotMetMessage: "A bore shaft drops into the dark. You have no business here yet.",
        actions: [
            {
                text: "Read Cygwin's field notes",
                effects: [
                    { type: 'add_tag', tag: 'underground_well1_read' },
                    { type: 'give_item', itemId: 'stone', quantity: 2 }
                ]
            }
        ],
        afterDescription: "Well One continues its work. Cygwin's notes are still pinned to the casing.",
        reusable: false
    },

    underground_well2: {
        id: 'underground_well2',
        name: 'Underground Well — Site Two',
        image: '/locations/underground_well.png',
        shortDesc: "A shaft bored straight down into the island's core. First of its kind.",
        stepOnMessage: "A reinforced shaft drops straight into the earth. Cold air rises from it, carrying something metallic.",
        message: [
            "Well Two is Cygwin's project — the first bore site, placed deliberately far from the Dragon Empire ruins.",
            "She chose this location after three weeks of resonance mapping.",
            "The shaft goes down 200 metres. At the bottom, the island's energy runs like a river.",
            "Claudia's notes, pinned to the side of the casing, read: 'Output stable. Resonance bleed: 0.3%. Within tolerance. For now.'",
            "'For now' is underlined twice.",
        ],
        requirement: { type: 'have_tag', tag: 'cygwin_ready_for_f2' },
        requirementNotMetMessage: "A bore shaft drops into the dark. You have no business here yet.",
        actions: [
            {
                text: "Read Claudia's field notes",
                effects: [
                    { type: 'add_tag', tag: 'underground_well1_read' },
                    { type: 'give_item', itemId: 'stone', quantity: 2 }
                ]
            }
        ],
        afterDescription: "Well One continues its work. Cygwin's notes are still pinned to the casing.",
        reusable: false
    },

    // ─── NPC private spaces — unlocked at max sword + heart rank ─────────────────

    sylvies_home: {
        id: 'sylvies_home',
        name: "Sylvie's Home",
        image: '/locations/sylvies_home.png',
        shortDesc: "A small house at the forest's edge. Lived-in, warm, entirely hers.",
        stepOnMessage: "The door is open. That means you're welcome.",
        message: [
            "The inside is exactly what you'd expect — practical, but with small signs of care everywhere.",
            "A bow hung on the wall. A jar of dried herbs on the sill.",
            "A blanket on the chair that has clearly been slept under many times.",
            "She's left a note on the table.",
            "'Back later. You know where everything is. —S'",
            "You do know where everything is.",
            "That means something.",
        ],
        requirement: {
            operator: 'AND',
            conditions: [
                { type: 'have_tag', tag: 'sylvie_sword_6_complete' },
                { type: 'npc_rank', npcId: 'sylvie', rankType: 'heart', value: 1 }
            ]
        },
        requirementNotMetMessage: "The door is closed. You're not quite close enough yet for it to be open for you.",
        actions: [
            {
                text: 'Wait for her',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_tag', tag: 'visited_sylvies_home' }
                ]
            }
        ],
        reusable: true
    },
    commanders_tent: {
        id: 'commanders_tent',
        name: "Commanders' Tent",
        image: '/locations/commanders_tent.png',
        shortDesc: "The field tent shared by Claudia and Cygwin. Maps everywhere. A second bunk.",
        stepOnMessage: "The tent flap is tied back — an invitation, if you know how to read it.",
        message: [
            "The tent is all business on the surface — maps pinned to every surface, equipment stacked with military precision.",
            "But there are signs, if you look: two mugs, both still warm. A single candle burned low.",
            "A jacket draped over the back of a chair that doesn't belong to either of them.",
            "That's yours.",
            "They left it there on purpose.",
            "On the table, a note in Claudia's handwriting: 'We'll be back by Duskfall. Don't go anywhere.'",
            "Cygwin has added, underneath, in much smaller writing: 'Please.'",
        ],
        requirement: {
            operator: 'AND',
            conditions: [
                { type: 'npc_rank', npcId: 'claudia', rankType: 'sword', value: 5 },
                { type: 'npc_rank', npcId: 'claudia', rankType: 'heart', value: 3 },
                { type: 'npc_rank', npcId: 'cygwin', rankType: 'sword', value: 5 },
                { type: 'npc_rank', npcId: 'cygwin', rankType: 'heart', value: 3 }
            ]
        },
        requirementNotMetMessage: "The tent flap is tied shut. Not for you. Not yet.",
        actions: [
            {
                text: 'Stay',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_tag', tag: 'visited_commanders_tent' }
                ]
            }
        ],
        reusable: true
    },

    // ─── Miscellaneous ────────────────────────────────────────────────────────────

    secret_cave: {
        id: 'secret_cave',
        name: 'Secret Cave',
        image: '/locations/secret_cave.png',
        shortDesc: 'A narrow cave entrance disguised by overgrowth.',
        stepOnMessage: "The vegetation here moves in a way that has nothing to do with the wind.",
        message: [
            "Inside, the cave opens up into a wide chamber.",
            "The walls are covered in carvings — not Dragon Empire script, something older.",
            "In the centre, a small spring. The water glows faintly.",
            "You get the sense this place has been waiting, very patiently, for someone to find it.",
        ],
        actions: [
            {
                text: 'Drink from the spring',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_world_resonance', amount: 5 },
                    { type: 'add_tag', tag: 'found_secret_cave' }
                ]
            }
        ],
        afterDescription: "A hidden chamber with ancient carvings and a glowing spring. You've been here.",
        reusable: false
    },
};