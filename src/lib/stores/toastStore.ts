/**
 * toastStore.ts
 *
 * Lightweight toast system with three flavours:
 *   'success' — green, subtle blink on entry  (positive outcomes, quest ready)
 *   'info'    — blue, slides in               (neutral info, "You watered the plant")
 *   'warning' — red, shakes on entry          (negative, "Quest failed", "Too weak")
 *
 * Usage:
 *   toastStore.success('NPC rank-up ready!')
 *   toastStore.info('You watered the Moonbloom.')
 *   toastStore.warning('You are too weak to engage.')
 *
 * Optional duration override (ms). Defaults: success 4000, info 3000, warning 5000.
 */

import { writable } from 'svelte/store';

export type ToastFlavour = 'success' | 'info' | 'warning';

export interface Toast {
    id: number;
    message: string;
    flavour: ToastFlavour;
    duration: number;
}

const DEFAULTS: Record<ToastFlavour, number> = {
    success: 4000,
    info:    3000,
    warning: 5000,
};

let nextId = 0;
const { subscribe, update } = writable<Toast[]>([]);

function remove(id: number) {
    update(ts => ts.filter(t => t.id !== id));
}

function push(message: string, flavour: ToastFlavour, duration?: number) {
    const toast: Toast = {
        id: nextId++,
        message,
        flavour,
        duration: duration ?? DEFAULTS[flavour],
    };
    update(ts => [...ts, toast]);
    setTimeout(() => remove(toast.id), toast.duration);
}

export const toastStore = {
    subscribe,
    success: (msg: string, duration?: number) => push(msg, 'success', duration),
    info:    (msg: string, duration?: number) => push(msg, 'info',    duration),
    warning: (msg: string, duration?: number) => push(msg, 'warning', duration),
};