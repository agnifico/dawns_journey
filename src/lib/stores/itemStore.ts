import { readable } from 'svelte/store';
import type { Item } from '../types';
import { items as generalItems } from '../data/items';
import { homesteadItems } from '../data/homesteadItems';

const allItems: Item[] = [...generalItems, ...homesteadItems];

const itemMap = new Map(allItems.map(item => [item.id, item]));

export const items = readable<Item[]>(allItems);

export function getItemById(id: string): Item | undefined {
    return itemMap.get(id);
}