import type { Enemy } from '../types';

export const allEnemies: Enemy[] = [
    {
        "id": "aquamech_shark",
        "name": "Aquamech Shark",
        "description": "A mechanical shark patrolling the waters.",
        "image": "/images/enemies/aquamech_shark.png",
        "thumbnailImage": "/images/enemies/aquamech_shark.png",
        "types": ["Water"],
        "masteryRequirements": {
            "Water": 40
        },
        "drops": [
            { "itemId": "shark_fin", "quantity": 1 },
            { "itemId": "argentum", "quantity": 100 }
        ]
    },
    {
        "id": "greenhorn",
        "name": "Greenhorn",
        "description": "A novice adventurer, easily defeated.",
        "image": "/images/enemies/greenhorn.png",
        "thumbnailImage": "/images/enemies/greenhorn.png",
        "types": ["Earth"],
        "masteryRequirements": {
            "Earth": 15,
            "Fire": 25,
        },
        "drops": [
            { "itemId": "raw_hide", "quantity": 1 },
            { "itemId": "argentum", "quantity": 100 }
        ]
    },
    {
        "id": "white_wyvern",
        "name": "White Wyvern",
        "description": "A majestic but dangerous white wyvern.",
        "image": "/images/enemies/white_wyvern.png",
        "thumbnailImage": "/images/enemies/white_wyvern.png",
        "types": ["Wind"],
        "masteryRequirements": {
            "Wind": 75
        },
        "drops": [
            { "itemId": "dragon_fang", "quantity": 1 },
            { "itemId": "azurite", "quantity": 1 },
            { "itemId": "argentum", "quantity": 300 }
        ]
    },
    {
        "id": "woodmech_bear",
        "name": "Woodmech Bear",
        "description": "A bear-like automaton made of wood and gears.",
        "image": "/images/enemies/woodmech_bear.png",
        "thumbnailImage": "/images/enemies/woodmech_bear.png",
        "types": ["Earth"],
        "masteryRequirements": {
            "Fire": 50,
            "Earth": 25
        },
        "drops": [
            { "itemId": "raw_hide", "quantity": 3 },
            { "itemId": "blueberries", "quantity": 1 },
            { "itemId": "argentum", "quantity": 100 }
        ]
    }
];