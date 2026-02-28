import type { Faction } from '$lib/types';

export const factions: Record<string, Faction> = {
    "solis_saints": {
        id: "solis_saints",
        name: "Solis Saints",
        icon: "/game_icons/solis_saints.png",
        score: 0,
        rank: 0,
        ranks: [
            {
                scoreThreshold: 1,
                rewards: [
                    {
                        type: "item",
                        itemId: "bread",
                        quantity: 5
                    }
                ]
            },
            {
                scoreThreshold: 2,
                rewards: [
                    {
                        type: "item",
                        itemId: "bread",
                        quantity: 10,
                    }
                ]
            },
            {
                scoreThreshold: 4,
                rewards: [
                    {
                        type: "item",
                        itemId: "bread",
                        quantity: 10,
                    }
                ]
            },
        ]
    },
    "shadowhand": {
        id: "shadowhand",
        name: "Shadowhand",
        icon: "/game_icons/shadowhand.png",
        score: 0,
        rank: 0,
        ranks: [
            {
                scoreThreshold: 5,
                rewards: [
                    {
                        type: "item",
                        itemId: "wood",
                        quantity: 5
                    }
                ]
            },
            {
                scoreThreshold: 10,
                rewards: [
                    {
                        type: "item",
                        itemId: "wood",
                        quantity: 10
                    }
                ]
            },
        ]
    }
};
