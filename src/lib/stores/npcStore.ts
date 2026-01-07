import { writable, get } from 'svelte/store';
import type { Player, NPC, GiftingOption } from '../types';
import { playerStore } from './playerStore';
import { questStore } from './questStore';
import * as NpcService from '../services/NpcService';

const npcModules = {
    'hela': () => import('../assets/data/npcs/hela.json'),
    'sylvie': () => import('../assets/data/npcs/sylvie.json'),
    'guinevere': () => import('../assets/data/npcs/guinevere.json'),
    'claudia': () => import('../assets/data/npcs/claudia.json'),
    'marjane': () => import('../assets/data/npcs/marjane.json'),
    'hanabi': () => import('../assets/data/npcs/hanabi.json'),
    'veres': () => import('../assets/data/npcs/veres.json'),
};

export async function getNpcData(npcId: string): Promise<NPC | null> {
    if (npcModules[npcId]) {
        const module = await npcModules[npcId]();
        return module.default as NPC;
    }
    return null;
}

function createNpcStore() {
    const { subscribe, update, set } = writable({
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
                // Register quests for this NPC
                npcTemplate.swordRanks.forEach(rankData => {
                    if (rankData.questId) {
                        questStore.registerQuest(rankData, npcTemplate.id);
                    }
                });
                npcTemplate.heartRanks.forEach(rankData => {
                    if (rankData.questId) {
                        questStore.registerQuest(rankData, npcTemplate.id);
                    }
                });

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

    function fulfillGiftingOption(npcId: string, option: GiftingOption) {
        const player = get(playerStore);
        const npc = get({ subscribe }).globalNpcs[npcId];
        if (!npc || !player) return;

        const { updatedNpc, updatedPlayer } = NpcService.fulfillGiftingOption(npc, player, option);

        playerStore.set(updatedPlayer);
        update(state => ({ ...state, globalNpcs: { ...state.globalNpcs, [npcId]: updatedNpc } }));
    }

    function loadNpcs(loadedNpcs: Record<string, NPC>) {
        // When loading NPCs from a save, we need to re-register their quests
        // to ensure the quest definitions are up-to-date, but the state will be preserved.
        Object.values(loadedNpcs).forEach(npc => {
            npc.swordRanks.forEach(rankData => {
                if (rankData.questId) {
                    questStore.registerQuest(rankData, npc.id);
                }
            });
            npc.heartRanks.forEach(rankData => {
                if (rankData.questId) {
                    questStore.registerQuest(rankData, npc.id);
                }
            });
        });
        update(s => ({ ...s, globalNpcs: loadedNpcs }));
    }

    return {
        subscribe,
        initializeGlobalNpcs,
        interactTalk,
        fulfillGiftingOption,
        loadNpcs,
        set
    };
}

export const npcStore = createNpcStore();
