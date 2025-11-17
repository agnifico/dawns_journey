import { writable, get } from 'svelte/store';
import type { Player, NPC } from '../types';
import { playerStore } from './playerStore';
import * as NpcService from '../services/NpcService';

const npcModules = {
    'hela': () => import('../assets/data/npcs/hela.json'),
    'sylvie': () => import('../assets/data/npcs/sylvie.json'),
};

export async function getNpcData(npcId: string): Promise<NPC | null> {
    if (npcModules[npcId]) {
        const module = await npcModules[npcId]();
        return module.default as NPC;
    }
    return null;
}

function createNpcStore() {
    const { subscribe, update } = writable({
        npcsInitialized: false,
        globalNpcs: {} as Record<string, NPC>,
    });

    async function initializeGlobalNpcs() {
        let isInitialized = false;
        subscribe(state => { isInitialized = state.npcsInitialized; })();
        if (isInitialized) return;

        const npcIds = Object.keys(npcModules);
        const npcPromises = npcIds.map(id => getNpcData(id));
        const npcTemplates = await Promise.all(npcPromises);

        const globalNpcs: Record<string, NPC> = {};
        npcTemplates.forEach(npcTemplate => {
            if (npcTemplate) {
                globalNpcs[npcTemplate.id] = { ...npcTemplate };
            }
        });
        update(state => ({ ...state, globalNpcs, npcsInitialized: true }));
    }

    function interactTalk(npcId: string) {
        const player = get(playerStore);
        const storeState = get({ subscribe });
        const npc = storeState.globalNpcs[npcId];
        if (!npc) return;

        const { updatedNpc, updatedPlayer } = NpcService.handleTalk(npc, player, storeState.globalNpcs);
        
        playerStore.set(updatedPlayer);
        update(state => ({ ...state, globalNpcs: { ...state.globalNpcs, [npcId]: updatedNpc } }));
    }

    function interactConnect(npcId: string) {
        const player = get(playerStore);
        const storeState = get({ subscribe });
        const npc = storeState.globalNpcs[npcId];
        if (!npc) return;

        const { updatedNpc, updatedPlayer } = NpcService.handleConnect(npc, player, storeState.globalNpcs);

        playerStore.set(updatedPlayer);
        update(state => ({ ...state, globalNpcs: { ...state.globalNpcs, [npcId]: updatedNpc } }));
    }

    function giveItem(npcId: string, itemId: string, quantity: number) {
        const player = get(playerStore);
        const npc = get({ subscribe }).globalNpcs[npcId];
        if (!npc) return;

        const { updatedNpc, updatedPlayer } = NpcService.handleGiveItem(npc, player, itemId, quantity);

        playerStore.set(updatedPlayer);
        update(state => ({ ...state, globalNpcs: { ...state.globalNpcs, [npcId]: updatedNpc } }));
    }

    function loadNpcs(loadedNpcs: Record<string, NPC>) {
        update(s => ({ ...s, globalNpcs: loadedNpcs }));
    }

    return {
        subscribe,
        initializeGlobalNpcs,
        interactTalk,
        interactConnect,
        giveItem,
        loadNpcs,
    };
}

export const npcStore = createNpcStore();