import { writable } from 'svelte/store';
import type { Item } from '$lib/types';

export type NotificationType = 'item_received' | 'item_used' | 'item_equipped' | 'item_unequipped';

export interface Notification {
    id: number;
    type: NotificationType;
    item: Item;
    quantity: number;
}

let nextId = 0;

const { subscribe, update } = writable<Notification[]>([]);

function addNotification(type: NotificationType, item: Item, quantity: number) {
    const newNotification = { id: nextId++, type, item, quantity };
    update(notifications => [...notifications, newNotification]);
    setTimeout(() => {
        removeNotification(newNotification.id);
    }, 3000);
}

function removeNotification(id: number) {
    update(notifications => notifications.filter(n => n.id !== id));
}

export const notificationStore = {
    subscribe,
    add: addNotification,
};
