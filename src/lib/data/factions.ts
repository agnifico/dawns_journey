import type { Faction } from '$lib/types';

export const factions: Record<string, Faction> = {
    "golden_concordat": {
        id: "golden_concordat",
        name: "The Golden Concordat",
        icon: "/game_icons/solis_saints.png",
        score: 0,
        rank: 0,
        ranks: [
            {
                scoreThreshold: 5,
                rewards: [
                    {
                        type: "item",
                        itemId: "bread",
                        quantity: 5
                    }
                ]
            },
            {
                scoreThreshold: 10,
                rewards: [
                    {
                        type: "item",
                        itemId: "bread",
                        quantity: 10,
                    }
                ]
            },
            {
                scoreThreshold: 15,
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
    "the_coalition": {
        id: "the_coalition",
        name: "The Coalition",
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
            {
                scoreThreshold: 15,
                rewards: [
                    {
                        type: "item",
                        itemId: "wood",
                        quantity: 10
                    }
                ]
            },
        ]
    },
    "forest_watchers": {
        id: "forest_watchers",
        name: "Forest Watchers",
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
            {
                scoreThreshold: 15,
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
