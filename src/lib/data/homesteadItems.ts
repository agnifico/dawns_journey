import type { Item } from '../types';
import { cropDefinitions } from './cropDefinitions';
import { generalItems } from './generalItems';

const existingSeedImages = [
    "potato", "wheat", "carrot", "kale", "parsnip", 
    "beetroot", "cabbage", "cauliflower", "pumpkin", 
    "radish", "sunflower"
];

export const homesteadItems: Item[] = [];

// Add Compost Item
homesteadItems.push({
    id: 'compost',
    name: 'Compost',
    description: 'Rich, nutrient-dense soil amendment. Required for heavy-feeding crops.',
    image: '/general/compost.png', // Assuming a path, will need asset
    type: 'general',
    flags: ['homestead_resource']
});

const generalItemIds = new Set(generalItems.map(item => item.id));

for (const cropId in cropDefinitions) {
    const cropDef = cropDefinitions[cropId];

    // Add the harvested crop item, only if it doesn't exist in general items
    if (!generalItemIds.has(cropDef.id)) {
        homesteadItems.push({
            id: cropDef.id,
            name: cropDef.name,
            description: `A harvested ${cropDef.name}.`,
            image: cropDef.growthStages[cropDef.growthStages.length - 1]?.imagePath || '/crops/crate_base.png',
            type: 'general',
            flags: ['crop']
        });
    }

    // Add the corresponding seed item
    const seedImage = existingSeedImages.includes(cropDef.id) 
        ? `/crops/${cropDef.id}_00.png` 
        : '/crops/seeds_generic.png';
    
    let seedName = `${cropDef.name} Seed`;
    if (cropDef.id === 'mushroom') seedName = 'Mushroom Spores';
    if (cropDef.id === 'wasabi') seedName = 'Wasabi Rhizome';
    if (cropDef.id === 'saffron') seedName = 'Saffron Corm';
    if (cropDef.id === 'ginseng') seedName = 'Ginseng Root';

    homesteadItems.push({
        id: cropDef.seedItemId,
        name: seedName,
        description: `Seeds for planting ${cropDef.name}.`,
        image: seedImage,
        type: 'general',
        flags: ['seed']
    });
}