import { writable, get } from 'svelte/store';
import type { Player, NPC, GiftingOption } from '../types';
import { playerStore } from './playerStore';
import { questStore } from './questStore';
import { messageStore } from './messageStore';
import * as NpcService from '../services/NpcService';
import { toastStore } from './toastStore';

const npcModules = {
    'hela': () => import('../assets/data/npcs/hela.json'),
    'sylvie': () => import('../assets/data/npcs/sylvie.json'),
    'guinevere': () => import('../assets/data/npcs/guinevere.json'),
    'claudia': () => import('../assets/data/npcs/claudia.json'),
    'marjane': () => import('../assets/data/npcs/marjane.json'),
    'aoife': () => import('../assets/data/npcs/aoife.json'),
    'veres': () => import('../assets/data/npcs/veres.json'),
    'akari': () => import('../assets/data/npcs/akari.json'),
    'cygwin': () => import('../assets/data/npcs/cygwin.json'),
    'verona': () => import('../assets/data/npcs/verona.json'),
    'ariana': () => import('../assets/data/npcs/ariana.json'),
    'bonnie': () => import('../assets/data/npcs/bonnie.json'),
    'minerva': () => import('../assets/data/npcs/minerva.json'),
    'nemesis': () => import('../assets/data/npcs/nemesis.json'),
};

export async function getNpcData(npcId: string): Promise<NPC | null> {
    if (npcModules[npcId]) {
        const module = await npcModules[npcId]();
        return module.default as NPC;
    }
    return null;
}

/**
 * Registers all quests from a rank slot.
 * Handles both plain RankData and { variants: RankData[] } slots.
 */
function registerRankSlots(slots: any[], npcId: string) {
    for (const slot of slots) {
        if ('questId' in slot) {
            // Plain RankData
            questStore.registerQuest(slot, npcId);
        } else if ('variants' in slot) {
            // Variant slot — register every alternative so all quests exist in the store
            for (const variant of slot.variants) {
                if (variant.questId) {
                    questStore.registerQuest(variant, npcId);
                }
            }
        }
    }
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
                registerRankSlots(npcTemplate.swordRanks, npcTemplate.id);
                registerRankSlots(npcTemplate.heartRanks, npcTemplate.id);
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

    function applyCombatAftermath(npcId: string, outcome: 'win' | 'lose') {
        const player = get(playerStore);
        const storeState = get({ subscribe });
        const npc = storeState.globalNpcs[npcId];
        if (!npc) return;

        // Use selectBattleAftermath so requirement fields on aftermaths are evaluated
        const aftermath = NpcService.selectBattleAftermath(npc, player, storeState.globalNpcs, outcome);
        if (!aftermath) return;

        if (aftermath.dialogue?.length) {
            // Dialogue is shown by the combat resolution UI — pass it back or display it here
            // depending on your combat flow. Keeping existing pattern of just applying affinity.
        }

        if (aftermath.value === undefined) return;

        update(s => {
            const npcToUpdate = s.globalNpcs[npcId];
            if (!npcToUpdate) return s;

            const newAffinity = Math.max(0, npcToUpdate.affinity + aftermath.value);
            let newHeartState = npcToUpdate.heartState;

            if (newAffinity >= 10 && npcToUpdate.heartState !== 'READY_FOR_RANK_UP') {
                newHeartState = 'READY_FOR_RANK_UP';
                messageStore.addMessage(`You feel your connection with ${npcToUpdate.name} has deepened. You should Talk to them.`, ['World', 'Update']);
                toastStore.info(`You should Talk to ${npcToUpdate.name}.`);
            }

            const newNpc = { ...npcToUpdate, affinity: newAffinity, heartState: newHeartState };
            return { ...s, globalNpcs: { ...s.globalNpcs, [npcId]: newNpc } };
        });
    }

    function loadNpcs(loadedNpcs: Record<string, NPC>) {
        Object.values(loadedNpcs).forEach(npc => {
            registerRankSlots(npc.swordRanks, npc.id);
            registerRankSlots(npc.heartRanks, npc.id);
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