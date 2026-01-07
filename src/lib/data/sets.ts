import type { Set } from '$lib/types';

export const sets: Set[] = [
    {
        id: 'symphony',
        name: 'Symphony of the Stars',
        relicIds: ['freedom_cry', 'lament', 'requiem', 'hymn'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'speed', value: 15 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'elementalAttack', value: 25 }, { name: 'elementalDefence', value: 25 }]
            }
        ]
    },
    {
        id: 'toys',
        name: 'Hela\'s Toys',
        relicIds: ['helas_whip', 'wachiwis_shorts', 'cygwins_love', 'nualas_scent'],
        bonuses: [
            {
                pieces: 2,
                stats: [{ name: 'maxHp', value: 50 }]
            },
            {
                pieces: 4,
                stats: [{ name: 'physicalAttack', value: 20 }, { name: 'critChance', value: 0.10 }]
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
    }
];
