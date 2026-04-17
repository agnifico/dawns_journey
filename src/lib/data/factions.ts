import type { Faction } from '$lib/types';

export const factions: Record<string, Faction> = {
    "the_coalition": {
        id: "the_coalition",
        name: "The Coalition",
        icon: "/game_icons/rebels_sword.png",
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
        icon: "/game_icons/forest_brooch.png",
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
    "golden_concordat": {
        id: "golden_concordat",
        name: "The Golden Concordat",
        icon: "/game_icons/golden_concordat.png",
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

    "south_sea_empire": {
        id: "south_sea_empire",
        name: "Southern Sea Empire",
        icon: "/game_icons/south_sea_empire.png",
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
    "dawn": {
        id: "dawn",
        name: "Dawn",
        icon: "/game_icons/sunwheel.png",
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
