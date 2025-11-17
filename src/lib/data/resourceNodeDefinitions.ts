import type { ResourceNode } from '../types';

export const resourceNodeDefinitions: { [key: string]: ResourceNode } = {
    oak_tree: {
        id: 'oak_tree',
        name: 'Oak Tree',
        skillId: 'woodcutting',
        requiredLevel: 1,
        reward: { itemId: 'wood', amount: 1 },
        cooldown: 5,
        image: './locations/tree.png',
        dialogue: {
            success: 'You chop down the oak tree.',
            failure: 'The oak tree has already been harvested.'
        },
        maxGathers: 10,
        xpPerLevel: 10
    },
    tree_log: {
        id: 'tree_log',
        name: 'Tree Log',
        skillId: 'woodcutting',
        requiredLevel: 1,
        reward: { itemId: 'wood', amount: 1 },
        cooldown: 1,
        image: './locations/tree_log.png',
        dialogue: {
            success: 'You gather wood from the log.',
            failure: 'The log is bare.'
        },
        maxGathers: 2,
        xpPerLevel: 5
    },
    big_mushroom: {
        id: 'big_mushroom',
        name: 'Big Mushroom',
        skillId: 'herblore',
        requiredLevel: 1,
        reward: { itemId: 'shrooms', amount: 2 },
        cooldown: 2,
        image: './locations/big_mushroom.png',
        dialogue: {
            success: 'You pick the big mushroom.',
            failure: 'The mushroom has already been picked.'
        },
        maxGathers: 5,
        xpPerLevel: 8
    },
    rock_mine: {
        id: 'rock_mine',
        name: 'Rock Mine',
        skillId: 'mining',
        requiredLevel: 1,
        reward: { itemId: 'stone', amount: 1 },
        cooldown: 5,
        image: './locations/rock_mine.png',
        dialogue: {
            success: 'You mine the rock.',
            failure: 'The rock has been mined out.'
        },
        maxGathers: 10,
        xpPerLevel: 12
    }
};