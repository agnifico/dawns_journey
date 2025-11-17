import { writable, derived } from 'svelte/store';

// The master game time, measured in player steps.
export const time = writable(0);

const STEPS_PER_PHASE = 50;
const STEPS_PER_REVOLUT = STEPS_PER_PHASE * 2;

// A derived store that calculates the current day, called a Revolut.
export const revolut = derived(
    time,
    $time => Math.floor($time / STEPS_PER_REVOLUT) + 1
);

// A derived store that automatically calculates the time of day.
export const phase = derived(
    time,
    $time => (($time % STEPS_PER_REVOLUT) < STEPS_PER_PHASE ? 'Dawnrise' : 'Duskfall')
);

// A derived store that calculates the time within the current phase (0-49).
export const timeInPhase = derived(
    time,
    $time => $time % STEPS_PER_PHASE
);

// A derived store that creates a formatted time string.
export const formattedTime = derived(
    [revolut, phase, timeInPhase],
    ([$revolut, $phase, $timeInPhase]) => {
        return `Revolut ${$revolut} - ${$phase} +${$timeInPhase}`;
    }
);
