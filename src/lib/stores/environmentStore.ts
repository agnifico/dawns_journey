import { writable } from 'svelte/store';

export type HomesteadEnvironment = 'env_open_field' | 'env_greenhouse' | 'env_forest_floor';

export const currentEnvironment = writable<HomesteadEnvironment>('env_open_field');
