import type { Item } from '../types';
import { items } from '../data/items';

const allItems: Item[] = items;

const itemMap = new Map(allItems.map(item => [item.id, item]));

export function getAllItems(): Item[] {
    return allItems;
}

export function getItemById(id: string): Item | undefined {
    return itemMap.get(id);
}
