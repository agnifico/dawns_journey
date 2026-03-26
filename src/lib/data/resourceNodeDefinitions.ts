import type { ResourceNode } from '../types';

export const resourceNodeDefinitions: { [key: string]: ResourceNode } = {

    // ─── Existing ────────────────────────────────────────────────────────────────

    oak_tree: {
        id: 'oak_tree',
        name: 'Oak Tree',
        skillId: 'woodcutting',
        requiredLevel: 1,
        reward: { itemId: 'wood', amount: 1 },
        cooldown: 3,
        image: './locations/tree.png',
        dialogue: { success: 'You chop down the oak tree.', failure: 'The oak tree has already been harvested.' },
        maxGathers: 10,
        xpPerLevel: 10
    },
    gem_fountain: {
        id: 'gem_fountain',
        name: 'Gem Fountain',
        skillId: 'alchemy',
        requiredLevel: 1,
        reward: { itemId: 'turquoise', amount: 1 },
        cooldown: 3,
        image: './locations/fountain.png',
        dialogue: { success: 'You find a shiny gem in the fountain!', failure: 'The fountain is out of gems.' },
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
        dialogue: { success: 'You gather wood from the log.', failure: 'The log is bare.' },
        maxGathers: 2,
        xpPerLevel: 5
    },
    big_mushroom: {
        id: 'big_mushroom',
        name: 'Big Mushroom',
        skillId: 'alchemy',
        requiredLevel: 1,
        reward: { itemId: 'mushroom', amount: 2 },
        cooldown: 2,
        image: './locations/big_mushroom.png',
        dialogue: { success: 'You pick the big mushroom.', failure: 'The mushroom has already been picked.' },
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
        dialogue: { success: 'You mine the rock.', failure: 'The rock has been mined out.' },
        maxGathers: 10,
        xpPerLevel: 12
    },

    // ─── Woodcutting tier: basic_tree < swamp_tree < evergreen_tree < red_palm_tree ──

    basic_tree: {
        id: 'basic_tree',
        name: 'Young Tree',
        skillId: 'woodcutting',
        requiredLevel: 1,
        reward: { itemId: 'wood', amount: 1 },
        cooldown: 2,
        image: './locations/basic_tree.png',
        dialogue: { success: 'You cut down the young tree.', failure: 'This tree has been stripped bare.' },
        maxGathers: 6,
        xpPerLevel: 6
    },
    wood_log: {
        // Alias for tree_log — same tier, same rewards
        id: 'wood_log',
        name: 'Fallen Log',
        skillId: 'woodcutting',
        requiredLevel: 1,
        reward: { itemId: 'wood', amount: 2 },
        cooldown: 1,
        image: './locations/tree_log.png',
        dialogue: { success: 'You pry some wood from the fallen log.', failure: 'The log has nothing left to give.' },
        maxGathers: 3,
        xpPerLevel: 5
    },
    swamp_tree: {
        id: 'swamp_tree',
        name: 'Swamp Tree',
        skillId: 'woodcutting',
        requiredLevel: 2,
        reward: { itemId: 'wood', amount: 2 },
        cooldown: 3,
        image: './locations/swamp_tree.png',
        dialogue: { success: 'You hack through the dense swamp wood.', failure: 'The swamp tree has already been felled.' },
        maxGathers: 8,
        xpPerLevel: 14
    },
    evergreen_tree: {
        id: 'evergreen_tree',
        name: 'Evergreen Tree',
        skillId: 'woodcutting',
        requiredLevel: 3,
        reward: { itemId: 'wood', amount: 3 },
        cooldown: 4,
        image: './locations/evergreen_tree.png',
        dialogue: { success: 'You fell the towering evergreen.', failure: 'The evergreen has already been harvested.' },
        maxGathers: 8,
        xpPerLevel: 20
    },
    red_palm_tree: {
        id: 'red_palm_tree',
        name: 'Red Palm Tree',
        skillId: 'woodcutting',
        requiredLevel: 4,
        reward: { itemId: 'wood', amount: 4 },
        cooldown: 5,
        image: './locations/red_palm_tree.png',
        dialogue: { success: 'You cut through the striking red palm.', failure: 'The red palm has already been harvested.' },
        maxGathers: 6,
        xpPerLevel: 28
    },

    // ─── Alchemy — Mushrooms (green lv1 / blue lv2 / yellow lv3) ────────────────

    green_mushroom: {
        id: 'green_mushroom',
        name: 'Green Mushroom',
        skillId: 'alchemy',
        requiredLevel: 1,
        reward: { itemId: 'mushroom', amount: 2 },
        cooldown: 2,
        image: './locations/green_mushroom.png',
        dialogue: { success: 'You harvest the green mushroom.', failure: 'The mushroom has already been picked.' },
        maxGathers: 6,
        xpPerLevel: 8
    },
    green_mushroom_mini: {
        id: 'green_mushroom_mini',
        name: 'Green Mushroom Cluster',
        skillId: 'alchemy',
        requiredLevel: 1,
        reward: { itemId: 'mushroom', amount: 1 },
        cooldown: 1,
        image: './locations/green_mushroom_mini.png',
        dialogue: { success: 'You pick a small cluster of green mushrooms.', failure: 'These mushrooms have already been picked.' },
        maxGathers: 4,
        xpPerLevel: 5
    },
    blue_mushroom: {
        id: 'blue_mushroom',
        name: 'Blue Mushroom',
        skillId: 'alchemy',
        requiredLevel: 2,
        reward: { itemId: 'mushroom', amount: 2 },
        cooldown: 3,
        image: './locations/blue_mushroom.png',
        dialogue: { success: 'You harvest the luminous blue mushroom.', failure: 'The blue mushroom has already been picked.' },
        maxGathers: 5,
        xpPerLevel: 14
    },
    blue_mushroom_mini: {
        id: 'blue_mushroom_mini',
        name: 'Blue Mushroom Cluster',
        skillId: 'alchemy',
        requiredLevel: 2,
        reward: { itemId: 'mushroom', amount: 1 },
        cooldown: 2,
        image: './locations/blue_mushroom_mini.png',
        dialogue: { success: 'You pick a small cluster of blue mushrooms.', failure: 'These blue mushrooms have already been picked.' },
        maxGathers: 4,
        xpPerLevel: 10
    },
    yellow_mushroom: {
        id: 'yellow_mushroom',
        name: 'Yellow Mushroom',
        skillId: 'alchemy',
        requiredLevel: 3,
        reward: { itemId: 'mushroom', amount: 2 },
        cooldown: 4,
        image: './locations/yellow_mushroom.png',
        dialogue: { success: 'You harvest the golden yellow mushroom.', failure: 'The yellow mushroom has already been picked.' },
        maxGathers: 5,
        xpPerLevel: 20
    },
    yellow_mushroom_mini: {
        id: 'yellow_mushroom_mini',
        name: 'Yellow Mushroom Cluster',
        skillId: 'alchemy',
        requiredLevel: 3,
        reward: { itemId: 'mushroom', amount: 1 },
        cooldown: 3,
        image: './locations/yellow_mushroom_mini.png',
        dialogue: { success: 'You pick a small cluster of yellow mushrooms.', failure: 'These yellow mushrooms have already been picked.' },
        maxGathers: 4,
        xpPerLevel: 14
    },

    // ─── Alchemy — Flowers (red lv2 / blue lv3) ─────────────────────────────────

    red_flowers: {
        id: 'red_flowers',
        name: 'Red Wildflowers',
        skillId: 'alchemy',
        requiredLevel: 2,
        reward: { itemId: 'fire_tulip', amount: 1 },
        cooldown: 3,
        image: './locations/red_flowers.png',
        dialogue: { success: 'You carefully pick the red wildflowers.', failure: 'These flowers have already been gathered.' },
        maxGathers: 5,
        xpPerLevel: 12
    },
    blue_flowers: {
        id: 'blue_flowers',
        name: 'Blue Wildflowers',
        skillId: 'alchemy',
        requiredLevel: 3,
        reward: { itemId: 'island_herb', amount: 1 },
        cooldown: 4,
        image: './locations/blue_flowers.png',
        dialogue: { success: 'You carefully pick the rare blue wildflowers.', failure: 'These flowers have already been gathered.' },
        maxGathers: 4,
        xpPerLevel: 20
    },

    // ─── Mining — Boulder (lv1 stone) / Red Crystal (lv3 rare) ──────────────────

    boulder: {
        id: 'boulder',
        name: 'Boulder',
        skillId: 'mining',
        requiredLevel: 1,
        reward: { itemId: 'stone', amount: 2 },
        cooldown: 4,
        image: './locations/boulder.png',
        dialogue: { success: 'You chip stone from the boulder.', failure: 'The boulder has been stripped of loose stone.' },
        maxGathers: 8,
        xpPerLevel: 10
    },
    red_crystal: {
        id: 'red_crystal',
        name: 'Red Crystal Formation',
        skillId: 'mining',
        requiredLevel: 3,
        reward: { itemId: 'ruby', amount: 1 },
        cooldown: 8,
        image: './locations/red_crystal.png',
        dialogue: { success: 'You extract a glowing red crystal.', failure: 'The crystal formation is spent for now.' },
        maxGathers: 3,
        xpPerLevel: 35
    },
};