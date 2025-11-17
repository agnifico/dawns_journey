import { writable } from 'svelte/store';

interface ResourceNodeState {
    currentGatherCount: number;
    cooldownEndTime: number; // Using game 'time' (cpt) for cooldown
}

export interface ResourceState {
    resourceNodeStates: { [key: string]: ResourceNodeState }; // Key: mapId-x-y
}

const initialState: ResourceState = {
    resourceNodeStates: {},
};

export const resourceStore = writable<ResourceState>(initialState);
