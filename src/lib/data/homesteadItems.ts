import type { Item } from '../types';
import { cropDefinitions } from './cropDefinitions';
import { generalItems } from './generalItems';

const generalItemsDictionary = generalItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {} as { [key: string]: Item });

export const homesteadItems: Item[] = [];

// Add Compost Item
homesteadItems.push({
    id: 'compost',
    name: 'Compost',
    description: 'Rich, nutrient-dense soil amendment. Required for heavy-feeding crops.',
    image: '/general/compost.png', // Assuming a path, will need asset
    type: 'general',
    flags: ['homestead_resource', 'stackable']
});

for (const plantId in cropDefinitions) {
    const plantDef = cropDefinitions[plantId];
    const yieldedItem = generalItemsDictionary[plantDef.yields];
    if (!yieldedItem) continue; // Skip if the yielded item doesn't exist

    // Add the corresponding seed item
    const seedImage = '/crops/seeds_generic.png';
    
    let seedName = `${yieldedItem.name} Seed`;
    if (plantDef.yields === 'mushroom') seedName = 'Mushroom Spores';
    if (plantDef.yields === 'wasabi') seedName = 'Wasabi Rhizome';
    if (plantDef.yields === 'saffron') seedName = 'Saffron Corm';
    if (plantDef.yields === 'ginseng') seedName = 'Ginseng Root';

    homesteadItems.push({
        id: plantDef.seedItemId,
        name: seedName,
        description: `Seeds for planting a ${plantDef.name}.`,
        image: seedImage,
        type: 'general',
        flags: ['seed', 'stackable'],
        plantId: plantDef.id, // Link to the plant definition
    });
}

// Add Animal Products
// homesteadItems.push(
//     {
//         id: 'egg',
//         name: 'Egg',
//         description: 'A fresh egg from a chicken.',
//         image: '/crops/egg.png',
//         type: 'general',
//         flags: ['animal_product', 'stackable']
//     },
//     {
//         id: 'milk',
//         name: 'Milk',
//         description: 'A bottle of fresh milk from a cow.',
//         image: '/crops/milk.png',
//         type: 'general',
//         flags: ['animal_product', 'stackable']
//     }
// );
