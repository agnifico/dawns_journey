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
    boat_to_cathedral: {
        id: 'boat_to_cathedral',
        name: 'A Boat',
        image: '/locations/boat1.png',
        shortDesc: 'A boat with a route charted for the Shimmering Isles - Home of The Golden Concordat.',
        stepOnMessage: 'This is the boat Cygwin and Claudia might have used to get to this island. It will lead to their home base.',
        message: 'Do you want to travel to the Cathedral in The Shimmering Isles?',
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
        image: '/locations/boat2.png',
        shortDesc: 'A sturdy boat moored at the dock.',
        stepOnMessage: 'A weather-beaten boat sits ready at the dock.',
        message: 'The mainland is a long way off. The boat could take you there — if you\'re ready.',
        actions: [{ text: 'Set sail', effects: [{ type: 'switch_map', mapId: 'dragon_island', x: 6, y: 25 }] }],
        reusable: true
    },
    boat_to_pleasure_island: {
        id: 'boat_to_pleasure_island',
        name: 'Boat to Pleasure Island',
        image: '/locations/boat1.png',
        shortDesc: 'A small vessel pointed northeast.',
        stepOnMessage: 'A small boat is moored here, pointed toward the island to the northeast.',
        message: 'Pleasure Island sits out there in the water, vivid and strange. The boat is seaworthy.',
        actions: [{ text: 'Head to Pleasure Island', effects: [{ type: 'switch_map', mapId: 'dragon_island', x: 13, y: 13 }] }],
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
        effects: [{ type: 'give_item', itemId: 'roasted_chicken', quantity: 3 }, { type: 'give_item', itemId: 'stone', quantity: 5 }],
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
        actions: [{ text: 'Open the chest', effects: [{ type: 'give_item', itemId: 'red_wine', quantity: 3 }, { type: 'give_item', itemId: 'white_wine', quantity: 3 }, { type: 'give_item', itemId: 'forza_mead', quantity: 5 }, { type: 'give_item', itemId: 'lube', quantity: 1 }, { type: 'add_tag', tag: 'found_swamp_chest' }] }],
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
        image: '/locations/sword5.png',
        shortDesc: 'A blade half-swallowed by the earth, still perfectly balanced.',
        stepOnMessage: 'Something catches the light beneath the soil. You dig — and find a sword.',
        message: "The inscription reads: 'To guard is not to rule. The first accord was made in trust, and trust is what we leave behind.'",
        requirementNotMetMessage: 'Something is buried here. You sense it, but cannot reach it yet.',
        actions: [{ text: 'Revere the shrine', effects: [{ type: 'give_item', itemId: 'amaterasu', quantity: 1 }, { type: 'add_tag', tag: 'legendary_sword1_found' }] }],

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
        image: '/locations/sword2.png',
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
        image: '/locations/sword3.png',
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
        image: '/locations/sword2.png',
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
        image: '/locations/sword3.png',
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
        image: '/locations/sword4.png',
        shortDesc: 'The ninth blade. It was waiting for you specifically.',
        stepOnMessage: 'There is nothing remarkable about this spot. Except the sword, standing in open ground, pointing skyward.',
        message: "There is no inscription. There is a carving, though — a small dragon curled around a human figure. Both are smiling. Beneath it, in a script older than the island's current name, a single word you somehow understand: 'Welcome back.'",
        // requirement: { type: 'have_tag', tag: 'legendary_sword8_found' },
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
            "The Extractor is pulling something up from deep below the surface. Not oil. Not water.",
            "The readings on the display are in a unit you don't recognise.",
            "Parts of the machine have gone through some wear and tear.",
            "And yet, the machine is working exactly as intended.",
            "That's what worries you.",
        ],
        requirementNotMetMessage: "The machine is running, but seems partially damaged. You don't have clearance to interfere with it yet.",
        actions: [
            {
                text: 'Fix the damaged parts',
                requirement: { type: 'have_tag', tag: 'cygwin_extractor_clearance' },
                effects: [
                    { type: 'add_tag', tag: 'red_extractor_read' },
                    { type: 'TAKE_ITEM', itemId: 'wood', quantity: 10 },
                    { type: 'TAKE_ITEM', itemId: 'stone', quantity: 10 }
                ]
            }
        ],
        afterDescription: "The Red Extractor continues to hum louder. You know what it's pulling up now. Some form of primal, magical energy.",
        reusable: false
    },
    underground_well1: {
        id: 'underground_well1',
        name: 'Underground Well — Site One',
        image: '/locations/underground_well1.png',
        shortDesc: "A shaft bored straight down into the island's core. First of its kind.",
        stepOnMessage: "A reinforced shaft drops straight into the earth. Cold air rises from it, carrying something metallic.",
        message: [
            "Well One is Cygwin's project — the first bore site, placed deliberately far from the Dragon Empire ruins.",
            "She chose this location after three weeks of resonance mapping.",
            "The shaft goes down 200 metres. At the bottom, the island's energy runs like a river.",
            "Cygwin's notes, pinned to the side of the casing, read: 'Output stable. Resonance bleed: 0.3%. Within tolerance. For now.'",
            "'For now' is underlined twice.",
        ],
        requirementNotMetMessage: "A bore shaft drops into the dark. You have no business here yet.",
        actions: [
            {
                requirement: { type: 'have_tag', tag: 'underground_wells_clearance1' },
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
        image: '/locations/underground_well2.png',
        shortDesc: "A shaft bored straight down into the island's core. First of its kind.",
        stepOnMessage: "A reinforced shaft drops straight into the earth. Cold air rises from it, carrying something metallic.",
        message: [
            "Well Two is Cygwin's project — the first bore site, placed deliberately far from the Dragon Empire ruins.",
            "She chose this location after three weeks of resonance mapping.",
            "The shaft goes down 200 metres. At the bottom, the island's energy runs like a river.",
            "Claudia's notes, pinned to the side of the casing, read: 'Output stable. Resonance bleed: 0.3%. Within tolerance. For now.'",
            "'For now' is underlined twice.",
        ],
        requirementNotMetMessage: "A bore shaft drops into the dark. You have no business here yet.",
        actions: [
            {
                text: "Read Claudia's field notes",
                requirement: { type: 'have_tag', tag: 'underground_wells_clearance2' },
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
        
        requirementNotMetMessage: "The tent flap is tied shut. Not for you. Not yet.",
        actions: [
            {
                requirement: {
                    operator: 'AND',
                    conditions: [
                        { type: 'npc_rank', npcId: 'claudia', rankType: 'sword', value: 5 },
                        { type: 'npc_rank', npcId: 'claudia', rankType: 'heart', value: 3 },
                        { type: 'npc_rank', npcId: 'cygwin', rankType: 'sword', value: 5 },
                        { type: 'npc_rank', npcId: 'cygwin', rankType: 'heart', value: 3 }
                    ]
                },
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

    empty_sword_site_claudia: {
        id: 'empty_sword_site_claudia',
        name: 'Empty Sword Site',
        image: '/locations/sword5.png',
        shortDesc: 'Something was pulled from the earth here. Recently.',
        stepOnMessage: [
            'The ground here is disturbed.',
            'Not by weather. Not by animals.',
            'Something was drawn upward from this spot.',
            'The earth around it is scorched in a perfect circle.',
            'Whatever was here — it\'s gone.'
        ],
        message: [
            'You\'ve seen this before.',
            'The same scorch pattern. The same upward displacement.',
            'This is a nucleation site.',
            'Someone pulled a sword from this ground.',
            'Recently — the earth hasn\'t fully closed over the wound yet.',
            'You think about Claudia.',
            'The way she talks about the extraction work.',
            'The way she doesn\'t quite meet your eyes when she does.'
        ],
        requirement: {
            type: 'have_tag',
            tag: 'claudia_sword_1_complete'
        },
        requirementNotMetMessage: [
            'The ground here is disturbed.',
            'Not by weather. Not by animals.',
            'Something was drawn upward from this spot.',
            'The earth around it is scorched in a perfect circle.',
            'Whatever was here — it\'s gone.'
        ],
        reusable: false,
        afterDescription: 'An empty nucleation site. Claudia was here first.',
        actions: [
            {
                text: 'Investigate',
                requirement: {
                    type: 'have_tag',
                    tag: 'claudia_sword_1_complete'
                },
                effects: [
                    { type: 'add_tag', tag: 'found_claudia_sword_site' }
                ],
                responseMessage: [
                    'The scorch mark is cold now.',
                    'Whatever resonance was here has moved on.',
                    'Moved on — or been moved.',
                    'You file this away.',
                    'A conversation worth having, when the time is right.'
                ]
            }
        ]
    },

    empty_sword_site_cygwin: {
        id: 'empty_sword_site_cygwin',
        name: 'Empty Sword Site',
        image: '/locations/sword1.png',
        shortDesc: 'The rock here is cracked. Something was pulled free.',
        stepOnMessage: [
            'The stone here is split.',
            'Not by erosion. The crack runs straight down — deliberate.',
            'Something was embedded deep in this rock.',
            'And then someone took it.'
        ],
        message: [
            'You crouch and run your hand along the crack.',
            'The edges are clean. Precise.',
            'The same pattern as the other sites.',
            'But this one goes deeper.',
            'Whatever was held here had been here longer.',
            'You think about Cygwin.',
            'The way she talks about the ground remembering things.',
            'She wasn\'t speaking abstractly.'
        ],
        requirement: {
            type: 'have_tag',
            tag: 'cygwin_sword_1_complete'
        },
        requirementNotMetMessage: [
            'The stone here is split.',
            'Not by erosion. The crack runs straight down — deliberate.',
            'Something was embedded deep in this rock.',
            'And then someone took it.'
        ],
        reusable: false,
        afterDescription: 'An empty nucleation site. Cygwin was here first.',
        actions: [
            {
                text: 'Investigate',
                requirement: {
                    type: 'have_tag',
                    tag: 'cygwin_sword_1_complete'
                },
                effects: [
                    { type: 'add_tag', tag: 'found_cygwin_sword_site' }
                ],
                responseMessage: [
                    'The split rock is cold.',
                    'No residual energy. Whatever was here is long gone.',
                    'Gone, and being used.',
                    'You wonder what Cygwin is planning.',
                    'You suspect she already has an answer.',
                    'You suspect she always does.'
                ]
            }
        ]
    },

    // ─── Claudia SR2 — Platform inspection ───────────────────────────────────

    platform_inspection: {
        id: 'platform_inspection',
        name: 'The Extraction Platform',
        image: '/locations/red_extractor.png',
        shortDesc: 'The main Coalition extraction platform. Claudia is already here.',
        stepOnMessage: 'The machinery hums loudly. Something is off about the angle.',
        message: [
            "The platform is larger up close — red metal, two stories of extraction equipment, the drill housing angled into the substrate below the sand.",
            "Claudia is already here, crouching near the drill housing with a measuring tool, frowning.",
            "She looks up when you arrive.",
            '"See that?" She points at the drill head. "Three degrees off true. At this depth that\'s — significant."',
            'The leakage has been going somewhere it was never supposed to go.',
        ],
        effects: [{ type: 'add_tag', tag: 'platform_inspected' }],
        afterDescription: 'The extraction platform. Three degrees off true. You know what that means now.',
        reusable: false
    },

    // ─── Claudia SR3 — Mistweaver site ───────────────────────────────────────

    mistweaver_site: {
        id: 'mistweaver_site',
        name: 'The River Fork',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A fork in the eastern river. The water moves strangely here.',
        stepOnMessage: 'The water slows at the fork. Something beneath the surface catches the light.',
        message: [
            'The river splits here, the two channels moving at different speeds around a low bank of silt.',
            'Half-buried in that bank — a sword.',
            'It emerges from the earth the way all of them do: partially, patient, waiting.',
            'The water moves around it without touching it.',
            'You reach down. It comes free without resistance.',
        ],
        effects: [
            { type: 'give_item', itemId: 'mistweaver', quantity: 1 },
            { type: 'add_tag', tag: 'mistweaver_found' }
        ],
        afterDescription: 'A bank of silt at the river fork. The impression where the sword rested is still there.',
        reusable: false
    },

    // ─── Cygwin SR2 — Substrate mapping walk ─────────────────────────────────

    substrate_mapping_site: {
        id: 'substrate_mapping_site',
        name: 'The Southern Resonance Point',
        image: '/locations/underground_well.png',
        shortDesc: 'A site Cygwin has been mapping for weeks. The ground hums here.',
        stepOnMessage: 'The humming in the earth is stronger here than anywhere else on the southern path.',
        message: [
            'Cygwin has a marker here — a small iron stake driven into the ground, a reading on a strip of paper tied to it.',
            '"Output: 4.7. Bleed: 0.8%. Rising."',
            "The substrate resonance at this point is higher than the wells. Significantly higher.",
            "This is not where the extraction equipment is pointed.",
            "This is where the energy is actually going.",
            "The leakage from the wells is accumulating here.",
            "You should tell Cygwin.",
        ],
        effects: [{ type: 'add_tag', tag: 'resonance_point_found' }],
        afterDescription: "A resonance point Cygwin has been tracking. The reading on the stake is still rising.",
        reusable: false
    },

    // ─── Cygwin SR3 — Groundbreaker site ─────────────────────────────────────

    groundbreaker_site: {
        id: 'groundbreaker_site',
        name: 'The Stone Circle',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A circle of standing stones on the mountain plateau. Something stands at the centre.',
        stepOnMessage: 'The stones here were placed. Not by the Dragon Empire — older than that.',
        message: [
            'A circle of standing stones, each one taller than a person, arranged with deliberate precision.',
            'At the centre: a sword, driven into the bedrock to the hilt.',
            'Not emerged — driven. As if someone placed it here on purpose and walked away.',
            'The stone around the blade shows no stress fractures. It went in cleanly.',
            'You take hold of it. It comes out the same way — cleanly, completely, like a key from a lock.',
        ],
        effects: [
            { type: 'give_item', itemId: 'groundbreaker', quantity: 1 },
            { type: 'add_tag', tag: 'groundbreaker_found' }
        ],
        afterDescription: 'A circle of standing stones with a clean slot at the centre where the sword rested.',
        reusable: false
    },

    // ─── Gwen SR1 — Ruined Quarters (extended, replaces existing) ────────────
    // Note: ruined_quarters already exists in locationEvents.ts as a lore event.
    // This version is gated by gwen_sr1_started and gives research_materials.
    // Recommend renaming this gwen_ruined_quarters to avoid collision.

    gwen_ruined_quarters: {
        id: 'gwen_ruined_quarters',
        name: 'Ruined Quarters — Research Survey',
        image: '/locations/ruined_quarters.png',
        shortDesc: 'The Dragon Empire ruins. Gwen needs specific inscriptions from the inner walls.',
        stepOnMessage: "The inner walls are more intact than the outer ones. The inscriptions here are still legible.",
        message: [
            'The inner chamber of the Ruined Quarters survived the collapse — low ceiling, stone walls, the inscriptions Gwen described.',
            'Pre-Concordat script. Dense, pictographic, describing the Theosi without hierarchy or ranking.',
            'Here they simply are.',
            'You make rubbings of the clearest panels. A partial glossary. Enough to work from.',
            'There is one inscription you cannot copy — it covers an entire wall and the text is too fine for a rubbing.',
            'You memorise the shape of it instead.',
        ],
        requirement: { type: 'have_tag', tag: 'gwen_sr1_started' },
        requirementNotMetMessage: "The ruins are open but you don't know what you're looking for yet. Talk to Guinevere first.",
        effects: [
            { type: 'give_item', itemId: 'research_materials', quantity: 1 },
            { type: 'add_tag', tag: 'ruined_quarters_surveyed' }
        ],
        afterDescription: 'The inner chamber of the ruins. Your rubbings are done. The wall inscription stays in your memory.',
        reusable: false
    },

    // ─── Gwen SR2 — Her Majesty's Watch site ─────────────────────────────────

    her_majestys_watch_site: {
        id: 'her_majestys_watch_site',
        name: 'The Shrine Sanctum',
        image: '/locations/legendary_sword.png',
        shortDesc: 'The inner sanctum of the Dragon Shrine. Something is waiting here.',
        stepOnMessage: 'The air in here is heavier. Something in the stone is paying attention.',
        message: [
            'The inner sanctum is a circular chamber, stone, very old — older than the shrine built around it.',
            "Her Majesty's Watch stands at the centre.",
            'Not a conventional sword. A greatsword with a living eye set into the crossguard — iris moving slowly, tracking nothing in particular. Or everything.',
            'It emerges from the floor at exactly the angle of something that has been waiting to be retrieved.',
            'Gwen is behind you. She has stood in this doorway many times.',
            'She has not been able to cross the threshold to touch it.',
            'You cross it. You take it. It comes free without a sound.',
        ],
        requirement: { type: 'have_tag', tag: 'gwen_sr2_started' },
        requirementNotMetMessage: "The sanctum is accessible but you have no reason to be here yet.",
        effects: [
            { type: 'give_item', itemId: 'her_majestys_watch', quantity: 1 },
            { type: 'add_tag', tag: 'watch_found' }
        ],
        afterDescription: 'The shrine sanctum. The floor where the Watch stood is unmarked. It left no impression.',
        reusable: false
    },

    // ─── Dragonblood Tree — choice version (replaces existing rest-only version) ──
    // Note: dragonblood_tree already exists as a reusable rest point.
    // This version fires when gwen_tree_quest_started is set.
    // Recommend handling via requirement so existing event stays for casual visitors.

    dragonblood_tree: {
        id: 'dragonblood_tree',
        name: 'Dragonblood Tree',
        image: '/locations/dragonblood_tree.png',
        shortDesc: 'Gwen wants the heartwood. Verona has something to say about that.',
        stepOnMessage: 'Verona is standing at the base of the tree. She was waiting for you.',
        message: [
            'The tree pulses with the same slow rhythm as the substrate beneath the island.',
            "Verona doesn't speak immediately. She lets you look at it first.",
            '"Guinevere wants the heartwood. I understand why."',
            '"This tree is a stabilising point. The island\'s energy runs through it the way water runs through roots."',
            '"Cutting it won\'t destroy anything. But the sword sites will become more volatile. The discharge patches will spread."',
            '"The tree grows back. The question is what happens in between."',
            '"I\'m not here to make the choice for you."',
        ],
        requirement: { type: 'have_tag', tag: 'guinevere_sword_2_started' },
        requirementNotMetMessage: 'The tree stands. You can rest beneath it.',
        actions: [
            {
                text: 'Cut the tree for Guinevere',
                // requirement: { type: 'have_tag', tag: 'woodcutting_level_1' },
                effects: [
                    { type: 'give_item', itemId: 'dragonblood_heartwood', quantity: 1 },
                    { type: 'add_tag', tag: 'tree_cut' },
                    { type: 'add_tag', tag: 'substrate_destabilised' },
                    { type: 'add_tag', tag: 'verona_dragonblood_tree' }
                ],
                responseMessage: "The heartwood is deep red, warm to the touch. The pulse in the ground stutters — then resumes, slower."
            },
            {
                text: 'Leave the tree standing',
                effects: [
                    { type: 'add_tag', tag: 'tree_spared' },
                    { type: 'add_tag', tag: 'verona_dragonblood_tree' }
                ],
                responseMessage: "You step back. The tree stands. The pulse continues, steady. Verona exhales beside you."
            }
        ],
        reusable: false
    },

    // ─── Glacier — Frostfall site ─────────────────────────────────────────────

    frostfall_site: {
        id: 'frostfall_site',
        name: 'The Glacier Shelf',
        image: '/locations/legendary_sword.png',
        shortDesc: 'A wide shelf of ancient ice. A sword is suspended inside it.',
        stepOnMessage: 'The ice here is older than the glacier above it. Something is preserved inside.',
        message: [
            'The shelf extends from the glacier face, flat and pale blue.',
            'Frostfall is here — not in the ground but in the ice itself.',
            'The blade is visible through six inches of ice, perfectly still, untouched by centuries.',
            'You press your hand to the surface.',
            'The ice cracks — not explosively, cleanly, along precise lines, like it was waiting for exactly this.',
            'Gwen watches from ten feet back.',
            'She says nothing for a long moment.',
        ],
        requirement: { type: 'have_tag', tag: 'glacier_reached' },
        requirementNotMetMessage: 'The glacier shelf is ahead. You need to get there first.',
        effects: [
            { type: 'give_item', itemId: 'frostfall', quantity: 1 },
            { type: 'add_tag', tag: 'frostfall_found' }
        ],
        afterDescription: 'A glacier shelf with a clean crack running through it where the ice released the sword.',
        reusable: false
    },

    // ─── Warm Spring ──────────────────────────────────────────────────────────

    warm_spring: {
        id: 'warm_spring',
        name: 'The Warm Spring',
        image: '/locations/campfire2.png',
        shortDesc: 'A thermal spring inside the glacier territory. Impossibly warm.',
        stepOnMessage: 'The temperature rises sharply. Steam rises from still water ahead.',
        message: [
            'A pool of perfectly still water, fed by something volcanic far beneath the ice.',
            'The glacier walls around it are curved smooth by decades of warmth.',
            'This spring has been here longer than the ice that surrounds it.',
            'Gwen is sitting at the edge.',
            'She has been here before, by the look of her — settled, like she knew this was coming.',
            'She does not speak immediately.',
            'For once, neither of you need to.',
        ],
        actions: [
            {
                text: 'Sit with her',
                effects: [
                    { type: 'RESTORE_HP', value: 9999 },
                    { type: 'RESTORE_AURA', value: 100 },
                    { type: 'add_tag', tag: 'warm_spring_visited' },
                    { type: 'add_world_resonance', amount: 5 }
                ]
            }
        ],
        reusable: true
    },

    // ─── Discharge sites — Hela SR1 ───────────────────────────────────────────

    discharge_site_1: {
        id: 'discharge_site_1',
        name: 'The Burned Patch',
        image: '/locations/hells_glow.png',
        shortDesc: 'Scorched earth in a perfect circle. The ground beneath is still warm.',
        stepOnMessage: 'The grass is burned in a perfect circle. The ground beneath your feet is warm.',
        message: [
            'A circle of scorched earth, ten feet across, ash at the centre fading to yellow at the edges.',
            'The ground is warm — the warmth of something that passed through recently and left heat behind.',
            'This is what happens when a soul tries to pass through a blocked substrate and has nowhere to go.',
            'The energy discharges. The earth remembers it.',
            'Hela will want the exact location.',
        ],
        effects: [{ type: 'add_tag', tag: 'discharge_site_1_found' }],
        afterDescription: 'A circle of scorched earth. Still warm. Hela knows about this one now.',
        reusable: false
    },

    discharge_site_2: {
        id: 'discharge_site_2',
        name: 'The Second Scar',
        image: '/locations/hells_glow.png',
        shortDesc: 'A larger discharge site. More recent. The cracks go deep.',
        stepOnMessage: 'Larger than the first. The burn pattern has depth to it — the earth cracked, not just scorched.',
        message: [
            'Fifteen feet across. The earth at the centre fractured — a spiderweb of fine cracks radiating outward.',
            'More energy. More pressure. More souls that could not pass through.',
            'The substrate beneath Ashenfall is getting worse, not better.',
            'This discharge is newer than the first. Days newer.',
            'Hela will want to know this too.',
        ],
        effects: [{ type: 'add_tag', tag: 'discharge_site_2_found' }],
        afterDescription: 'A cracked scar in the earth. Newer than the first. The substrate is deteriorating.',
        reusable: false
    },

    // ─── Faraway Archipelago — Dawnbringer ────────────────────────────────────

    dawnbringer_site: {
        id: 'dawnbringer_site',
        name: 'The Farthest Shore',
        image: '/locations/legendary_sword.png',
        shortDesc: "The edge of the known map. Something has been waiting here a very long time.",
        stepOnMessage: "The ocean beyond this shore has no name yet. The ground here feels unlike anywhere else.",
        message: [
            'The shore is quiet.',
            'The water is dark and moves in patterns that do not match the wind.',
            'Dawnbringer is at the waterline — half in sand, half in shallow water.',
            'It has been here the longest of any of them.',
            'You reach for it.',
            'There is a moment of resistance. Not from the site — from the sword itself.',
            'Like something that has been waiting so long it forgot how to let go.',
            'And then it does.',
        ],
        requirement: { type: 'have_tag', tag: 'hela_sr4_complete' },
        requirementNotMetMessage: "Something is here. You can feel it. But the time is not right.",
        effects: [
            { type: 'give_item', itemId: 'dawnbringer', quantity: 1 },
            { type: 'add_tag', tag: 'dawnbringer_found' },
            { type: 'add_world_resonance', amount: 20 }
        ],
        afterDescription: "The waterline where Dawnbringer rested. The sand has settled back as if it was never disturbed.",
        reusable: false
    },

};