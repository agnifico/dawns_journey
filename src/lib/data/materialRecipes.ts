import type { CraftingRecipe } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS — Elemental Bars
//
// Recipe structure: 3 gems + 6 secondary ingredient = 1 bar
// Secondary ingredients: island_herb, feather, four_leaf_clover, fire_tulip
// Element → Bar → Sigil → Gem mapping:
//   Fire    → red_bar    → fire_sigil  → ruby
//   Dark    → purple_bar → dark_sigil  → amethyst
//   Light   → light_bar  → light_sigil → citrine
//   Earth   → earth_bar  → earth_sigil → emerald
//   Water   → water_bar  → water_sigil → sapphire
//   Wind    → sky_bar    → wind_sigil  → turquoise
// ─────────────────────────────────────────────────────────────────────────────

export const materialRecipes: CraftingRecipe[] = [
    {
        id: 'craft_red_bar',
        name: 'Red Bar',
        description: 'A Fire-elemental bar smelted from ruby dust and fire tulips.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'ruby',       quantity: 3 },
            { itemId: 'fire_tulip', quantity: 6 },
        ],
        output: { itemId: 'red_bar', quantity: 1 },
        image: '/general/red_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'craft_purple_bar',
        name: 'Purple Bar',
        description: 'A Dark-elemental bar drawn from amethyst and shadowy island herbs.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'amethyst',    quantity: 3 },
            { itemId: 'dragon_fang', quantity: 6 },
        ],
        output: { itemId: 'purple_bar', quantity: 1 },
        image: '/general/purple_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'craft_light_bar',
        name: 'Divine Gold Bar',
        description: 'A Light-elemental bar crystallised from citrine and four-leaf clovers.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'citrine',          quantity: 3 },
            { itemId: 'four_leaf_clover', quantity: 6 },
        ],
        output: { itemId: 'light_bar', quantity: 1 },
        image: '/general/gilded_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'craft_earth_bar',
        name: 'Earth Bar',
        description: 'An Earth-elemental bar drawn from emerald shards and island herbs.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'emerald',     quantity: 3 },
            { itemId: 'island_herb', quantity: 6 },
        ],
        output: { itemId: 'earth_bar', quantity: 1 },
        image: '/general/green_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'craft_water_bar',
        name: 'Water Bar',
        description: 'A Water-elemental bar condensed from sapphire and feathers.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'sapphire', quantity: 3 },
            { itemId: 'island_herb',  quantity: 6 },
        ],
        output: { itemId: 'water_bar', quantity: 1 },
        image: '/general/water_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'craft_sky_bar',
        name: 'Sky Bar',
        description: 'A Wind-elemental bar woven from turquoise dust and feathers.',
        skillId: 'smithing',
        ingredients: [
            { itemId: 'turquoise', quantity: 3 },
            { itemId: 'feather',   quantity: 6 },
        ],
        output: { itemId: 'sky_bar', quantity: 1 },
        image: '/general/sky_bar.png',
        xpYield: 5,
        requiredLevel: 1,
    },
    {
        id: 'a_note',
        name: 'A Handwritten Note',
        description: 'Freshly made paper from a lush leaves, and a message scribbled on it. Transfiguration magic, and the strongest alchemical force - love.',
        skillId: 'alchemy',
        ingredients: [
            { itemId: 'gel_pen', quantity: 1 },
            { itemId: 'leaves',   quantity: 4 },
            { itemId: 'time_point',   quantity: 100 },
        ],
        output: { itemId: 'handwritten_note', quantity: 1 },
        image: '/general/handwritten_note.png',
        xpYield: 500,
        requiredLevel: 1,
    },
];