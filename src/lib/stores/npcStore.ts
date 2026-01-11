import { writable, get } from 'svelte/store';
import type { Player, NPC, GiftingOption } from '../types';
import { playerStore } from './playerStore';
import { questStore } from './questStore';
import { messageStore } from './messageStore';
import * as NpcService from '../services/NpcService';

const npcModules = {
    'hela': () => import('../assets/data/npcs/hela.json'),
    'sylvie': () => import('../assets/data/npcs/sylvie.json'),
    'guinevere': () => import('../assets/data/npcs/guinevere.json'),
    'claudia': () => import('../assets/data/npcs/claudia.json'),
    'marjane': () => import('../assets/data/npcs/marjane.json'),
    'hanabi': () => import('../assets/data/npcs/hanabi.json'),
    'veres': () => import('../assets/data/npcs/veres.json'),
    'akari': () => import('../assets/data/npcs/akari.json'),
    'cygwin': () => import('../assets/data/npcs/cygwin.json'),
    'nyx': () => import('../assets/data/npcs/nyx.json'),
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

    function applyCombatAftermath(npcId: string, aftermath: { value?: number }) {
        if (aftermath.value === undefined) return;
    
        update(s => {
            const npcToUpdate = s.globalNpcs[npcId];
            if (!npcToUpdate) return s;
    
            // Ensure affinity doesn't go below 0
            const newAffinity = Math.max(0, npcToUpdate.affinity + aftermath.value);
            let newHeartState = npcToUpdate.heartState;
    
            if (newAffinity >= 10 && npcToUpdate.heartState !== 'READY_FOR_RANK_UP') {
                newHeartState = 'READY_FOR_RANK_UP';
                messageStore.addMessage(`You feel your connection with ${npcToUpdate.name} has deepened. You should Talk to them.`, ['World', 'Update']);
            }
    
            const newNpc = { ...npcToUpdate, affinity: newAffinity, heartState: newHeartState };
            return { ...s, globalNpcs: { ...s.globalNpcs, [npcId]: newNpc }};
        });
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
        applyCombatAftermath,
        loadNpcs,
        set
    };
}

export const npcStore = createNpcStore();
