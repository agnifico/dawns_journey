import { derived, writable, get } from 'svelte/store';
import { revolut } from '$lib/stores/timeStore';
import { playerStore } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { toastStore } from '$lib/stores/toastStore';
 
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
 
const REVOLUTS_PER_SEASON = 7;
const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
 
// Manual override — null means "use derived from revolut"
const seasonOverride = writable<Season | null>(null);
 
function derivedSeason($revolut: number): Season {
    const index = Math.floor(($revolut - 1) / REVOLUTS_PER_SEASON) % SEASONS.length;
    return SEASONS[index];
}
 
// The public store — returns override if set, otherwise derives from revolut
export const seasonStore = {
    subscribe: derived(
        [revolut, seasonOverride],
        ([$revolut, $override]): Season => $override ?? derivedSeason($revolut)
    ).subscribe,
 
    setSeason(season: Season) {
        const player = get(playerStore);
 
        if (!player.unlockedTech.includes('thunders_blessing')) {
            toastStore.warning("You need The Thunder's Blessing to change the season.");
            return;
        }
 
        const timePoints = player.timePoints ?? 0;
        if (timePoints < 1) {
            toastStore.warning('You need 1 Time Point to change the season.');
            messageStore.addMessage('Not enough Time Points to change the season.', ['System']);
            return;
        }
 
        playerStore.update(p => ({ ...p, timePoints: (p.timePoints ?? 0) - 1 }));
        seasonOverride.set(season);
        messageStore.addMessage(`The season has shifted to ${season}.`, ['World']);
        toastStore.success(`Season changed to ${season}.`);
    },
 
    // Clears the override — season returns to revolut-derived value
    clearOverride() {
        seasonOverride.set(null);
    }
};