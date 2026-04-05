import type { Set } from '$lib/types';

export const sets: Set[] = [
    {
        id: 'symphony',
        name: 'Symphony of the Stars',
        relicIds: ['freedom_cry', 'lament', 'requiem', 'hymn'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'speed', value: 75 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'elementalAttack', value: 125 }, { name: 'elementalDefence', value: 125 }]
            }
        ]
    },
    {
        id: 'toys',
        name: 'Hela\'s Toys',
        relicIds: ['helas_whip', 'sylvies_shorts', 'iron_shackles', 'spiked_choker'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'maxHp', value: 500 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'physicalAttack', value: 150 }, { name: 'critChance', value: 0.10 }]
            }
        ]
    },
    {
        id: 'fossil',
        name: 'Primordial Fossil',
        relicIds: ['magma_fossil', 'seabed_fossil'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'physicalDefence', value: 50 }, { name: 'elementalDefence', value: 50 }]
            }
        ]
    },
    {
        id: 'beach_day',
        name: 'Beach Day',
        relicIds: ['red_bra', 'purple_bikini', 'pink_sarong', 'orange_bandana', 'blue_undies'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'physicalDefence', value: 100 }, { name: 'elementalDefence', value: 100 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'physicalDefence', value: 150 }, { name: 'elementalDefence', value: 150 }]
            }
        ]
    },
    {
        id: 'sky_jewels',
        name: 'Trinkets of the Sky',
        relicIds: ['ring_of_the_sky', 'sky_bracers', 'sky_amulet'],
        bonuses: [
            {
                pieces: 3,
                stats: [{ name: 'precision', value: 25 }, { name: 'evasion', value: 25 }, { name: "speed", value: 20 }, { name: "physicalAttack", value: 125 }]
            }
        ]
    },
    {
        id: 'dragon_rider',
        name: 'Dragon Rider',
        relicIds: ['dragon_rider_helmet', 'dragon_tooth_amulet'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: "critChance", value: .20 }, { name: "critDamage", value: .40 }]
            }
        ]
    }
];
