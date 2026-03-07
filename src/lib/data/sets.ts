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
        relicIds: ['helas_whip', 'sylvies_shorts', 'nualas_hood', 'wicked_jewel'],
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
        relicIds: ['green_bra', 'green_bikini', 'pink_sarong', 'orange_bandana'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'physicalDefence', value: 100 }, { name: 'elementalDefence', value: 100 }]
            },
            {
                pieces: 3,
                stats: [{ name: 'physicalDefence', value: 150 }, { name: 'elementalDefence', value: 150 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'physicalDefence', value: 200 }, { name: 'elementalDefence', value: 200 }]
            }
        ]
    },
    {
        id: 'sky_jewels',
        name: 'Trinkets of the Sky Goddes',
        relicIds: ['ring_of_the_sky', 'brooch_of_the_sky'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'precision', value: 20 }, { name: 'evasion', value: 20 }]
            }
        ]
    },
    {
        id: 'dragon_rider',
        name: 'Dragon Rider',
        relicIds: ['dragon_rider_helmet', 'bite_mark'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: "critChance", value: .20 }, { name: "critDamage", value: .40 }]
            }
        ]
    }
];
