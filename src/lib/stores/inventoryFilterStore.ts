import { writable } from 'svelte/store';
import type { Item } from '$lib/types';

export type StatSort = {
    statId: string; // Changed from keyof Item['baseStats']
    direction: 'asc' | 'desc';
};

export interface InventoryFilters {
    elementFilter: string | null;
    tagFilters: string[];
    statSort: StatSort | null;
}

const initialFilters: InventoryFilters = {
    elementFilter: null,
    tagFilters: [],
    statSort: null,
};

export const inventoryFilterStore = writable<InventoryFilters>(initialFilters);

export function resetFilters() {
    inventoryFilterStore.set(initialFilters);
}

export function toggleTagFilter(tag: string) {
    inventoryFilterStore.update(filters => {
        const newTagFilters = filters.tagFilters.includes(tag)
            ? filters.tagFilters.filter(t => t !== tag)
            : [...filters.tagFilters, tag];
        return { ...filters, tagFilters: newTagFilters };
    });
}

export function clearTagFilter() {
    inventoryFilterStore.update(filters => {
        return { ...filters, tagFilters: [] };
    });
}

export function setElementFilter(element: string | null) {
    inventoryFilterStore.update(filters => ({ ...filters, elementFilter: element }));
}

export function setStatSort(statId: keyof Item['baseStats'], direction: 'asc' | 'desc') {
    inventoryFilterStore.update(filters => ({ ...filters, statSort: { statId, direction } }));
}

export function clearStatSort() {
    inventoryFilterStore.update(filters => ({ ...filters, statSort: null }));
}
