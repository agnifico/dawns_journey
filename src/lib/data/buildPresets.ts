// $lib/data/buildPresets.ts
export interface BuildPreset {
    id: string;
    name: string;
    weapons: string[];          // up to 2
    relics: string[];            // up to 4
}

export const buildPresets: BuildPreset[] = [
    {
        id: 'glass_phys',
        name: 'Glass Cannon — Physical',
        weapons: ['raikiri', 'spiked_warhammer'],
        relics: ['ring_of_the_sky', 'sky_bracers', 'sky_amulet', 'dragon_rider_helmet'],
    },
    {
        id: 'glass_ele',
        name: 'Glass Cannon — Elemental',
        weapons: ['dawnbringer', 'queens_trident'],
        relics: ['helas_whip', 'spiked_choker', 'red_scarf', 'dragon_tooth_amulet'],
    },
    {
        id: 'tank',
        name: 'Tank — Aura Wall',
        weapons: ['pleasure', 'mountain_breaker'],
        relics: ['helas_whip', 'purple_bikini', 'iron_shackles', 'spiked_choker'],
    },
    {
        id: 'crit_fisher',
        name: 'Crit Fisher',
        weapons: ['spiked_warhammer', 'vampiric_sword'],
        relics: ['dragon_rider_helmet', 'dragon_tooth_amulet', 'blue_undies', 'spiked_choker'],
    },
];