import { v4 as uuidv4 } from 'uuid';
import type { Item } from '$lib/types';
import { items } from '$lib/data/items';
import { weapons } from '$lib/data/weapons';
import { relics } from '$lib/data/relics';

// Combine all item templates into one map for easy lookup.
const itemTemplates = new Map<string, Item>();
items.forEach(item => itemTemplates.set(item.id, item));
weapons.forEach(item => itemTemplates.set(item.id, item));
relics.forEach(item => itemTemplates.set(item.id, item));


/**
 * Creates a new, unique instance of an item based on its template ID.
 * @param itemId The ID of the item template to instantiate.
 * @returns A new Item object with a unique instanceId, or undefined if the template doesn't exist.
 */
export function createItem(itemId: string): Item | undefined {
    const template = itemTemplates.get(itemId);
    if (!template) {
        console.warn(`[ItemFactory] No item template found for ID: ${itemId}`);
        return undefined;
    }

    // Deep copy the template to create a new object
    const newItem: Item = JSON.parse(JSON.stringify(template));

    // Assign a unique instance ID
    // @ts-ignore
    newItem.instanceId = uuidv4();

    return newItem;
}

/**
 * Creates multiple instances of an item.
 * @param itemId The ID of the item template to instantiate.
 * @param quantity The number of instances to create.
 * @returns An array of new Item objects.
 */
export function createItems(itemId: string, quantity: number): Item[] {
    const createdItems: Item[] = [];
    for (let i = 0; i < quantity; i++) {
        const newItem = createItem(itemId);
        if (newItem) {
            createdItems.push(newItem);
        }
    }
    return createdItems;
}
