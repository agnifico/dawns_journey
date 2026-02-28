import type { Item } from '../types';
import { generalItems } from './generalItems';
import { homesteadItems } from './homesteadItems';
import { relics } from './relics';
import { weapons } from './weapons';

const allItems: Item[] = [...generalItems, ...homesteadItems, ...relics, ...weapons];

const generateItemDictionary = (items: Item[]): { [key: string]: Item } => {
    return items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
};

export const items: Item[] = allItems;
export const itemDictionary: { [key: string]: Item } = generateItemDictionary(allItems);
