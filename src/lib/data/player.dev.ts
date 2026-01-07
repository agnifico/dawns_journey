import type { Player } from '../types';
import { player as basePlayer } from './player';
import { deepmerge } from 'deepmerge-ts';

const devOverrides: Partial<Player> = {
    equipment: {
        weapon_slots: [
            {
                id: "vine_whip",
                name: "Vine Whip",
                description: "A flexible whip made of enchanted vines, entangling foes.",
                image: "/weapons/vine_whip.png",
                type: "weapon",
                stats: [{ name: "physicalAttack", value: 75 }, { name: "speed", value: 5 }],
                element: "Earth",
                mastery: 15,
                flags: ["special"],
                exploration: [{ name: "Earth", level: 1 }]
            },
            null
        ],
        relic_slots: [null, null, null, null],
    },
    worldTags: [
        "sylvie_sword_1_complete",
        "sylvie_sword_2_complete",
        "sylvie_sword_3_complete",
        "can_fight_hela"
    ],
};

export const playerDev: Player = deepmerge(basePlayer, devOverrides) as Player;

export default playerDev;
