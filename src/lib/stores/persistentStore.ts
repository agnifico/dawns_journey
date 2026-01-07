import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * A writable Svelte store that persists its value in localStorage.
 * @param key The key to use in localStorage.
 * @param startValue The initial value if nothing is in localStorage.
 */
export const persistentStore = <T>(key: string, startValue: T) => {
    const storedValue = browser ? window.localStorage.getItem(key) : null;
    const initialValue = storedValue ? JSON.parse(storedValue) : startValue;
    
    const store = writable<T>(initialValue);

    if (browser) {
        store.subscribe(value => {
            window.localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
};
