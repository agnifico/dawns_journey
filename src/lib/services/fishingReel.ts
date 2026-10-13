// Reel physics for the fishing minigame, kept pure so it can be tuned and
// tested headlessly. Bar units are 0..100 with 0 at the bottom.
//
// Learning curve by rarity: commons wander in a narrow band and can't be lost
// (the gold bar only fills), so a new player just learns "keep the fish in the
// net". Uncommons roam wider and the bar drains after a short slip; rare and
// legendary use the whole bar and drain at once.

import type { FishBehaviour, FishRarity } from '$lib/data/fishing';

export interface ReelState {
	zoneY: number;
	zoneV: number;
	zoneSize: number;
	fishY: number;
	fishTarget: number;
	fishSpeed: number;
	retargetIn: number;
	progress: number;
	/** Seconds the fish has been outside the net (for the drain grace period). */
	outsideFor: number;
	t: number;
}

export interface ReelParams {
	behaviour: FishBehaviour;
	rarity: FishRarity;
	/** 0..1 from rarity */
	difficulty: number;
	level: number;
	rodTier: number;
}

interface RarityRules {
	/** Gold bar fill per second with the fish in the net. */
	fill: number;
	/** Seconds outside the net before the bar starts draining. */
	grace: number;
	/** Gold bar drain per second once draining. */
	drain: number;
	/** How much of the bar (0..100) the fish roams, centred. */
	range: number;
}

export const RARITY_RULES: Record<FishRarity, RarityRules> = {
	common:    { fill: 0.22, grace: Infinity, drain: 0,    range: 44 },
	uncommon:  { fill: 0.2,  grace: 1.0,      drain: 0.17, range: 64 },
	rare:      { fill: 0.18, grace: 0,        drain: 0.3,  range: 82 },
	legendary: { fill: 0.16, grace: 0,        drain: 0.4,  range: 95 }
};

// The net. Its top speed (accel / drag ≈ 130 units/s either way) is kept
// above the fastest fish, so a released net can always follow a diving fish.
const NET_LIFT = 650;   // units/s² while holding
const NET_FALL = 650;   // units/s² while released
const NET_DRAG = 5;     // velocity decay per second (frame-rate independent)
const FISH_EASE = 4;    // how quickly a fish closes on its target (higher = snappier)
const FISH_MAX = 105;   // units/s, below the net's top speed

export function newReel(p: ReelParams): ReelState {
	return {
		zoneY: 30,
		zoneV: 0,
		zoneSize: Math.min(40, Math.max(14, 30 - p.difficulty * 14 + (p.rodTier - 1) * 2 + p.level * 0.3)),
		fishY: 50,
		fishTarget: 50,
		fishSpeed: 60,
		retargetIn: 0,
		progress: 0.3,
		outsideFor: 0,
		t: 0
	};
}

/** Advances one frame. Returns 'caught' / 'lost' when the reel ends. */
export function stepReel(s: ReelState, p: ReelParams, holding: boolean, dt: number, rand = Math.random): 'caught' | 'lost' | null {
	const d = p.difficulty;
	const rules = RARITY_RULES[p.rarity];
	s.t += dt;

	// Where the fish wants to be, as 0..1 across its range
	s.retargetIn -= dt;
	let u: number | null = null;
	switch (p.behaviour) {
		case 'darter': // dashes somewhere new, then rests
			if (s.retargetIn <= 0) { u = rand(); s.retargetIn = 0.9 + rand() * 1.0 - 0.3 * d; s.fishSpeed = 45 + 60 * d; }
			break;
		case 'steady': // smooth sweeps up and down
			u = 0.5 + 0.45 * Math.sin(s.t * (0.5 + d * 0.9)) + 0.05 * Math.sin(s.t * 2.7);
			s.fishSpeed = 40 + 60 * d;
			break;
		case 'sinker': // hangs low and heavy, occasionally surges up
			if (s.retargetIn <= 0) {
				u = rand() < 0.25 + 0.4 * d ? 0.65 + rand() * 0.35 : rand() * 0.4;
				s.retargetIn = 1.1 + rand() * 1.2 - 0.5 * d;
				s.fishSpeed = 30 + 65 * d;
			}
			break;
		case 'erratic': // jittery, changes its mind often
			if (s.retargetIn <= 0) {
				const cur = (s.fishY - (50 - rules.range / 2)) / rules.range;
				u = cur + (rand() - 0.5) * 0.7;
				s.retargetIn = 0.45 + rand() * 0.5 - 0.15 * d;
				s.fishSpeed = 35 + 70 * d;
			}
			break;
	}
	if (u !== null) s.fishTarget = 50 - rules.range / 2 + Math.min(1, Math.max(0, u)) * rules.range;

	// Ease towards the target (readable), capped below the net's top speed
	const diff = s.fishTarget - s.fishY;
	const eased = diff * (1 - Math.exp(-FISH_EASE * dt));
	const cap = Math.min(s.fishSpeed, FISH_MAX) * dt;
	s.fishY += Math.max(-cap, Math.min(cap, eased));

	// Net: hold to rise, release to sink
	s.zoneV += (holding ? NET_LIFT : -NET_FALL) * dt;
	s.zoneV *= Math.exp(-NET_DRAG * dt);
	s.zoneY += s.zoneV * dt;
	if (s.zoneY < 0) { s.zoneY = 0; s.zoneV = Math.max(0, s.zoneV) * -0.2; }
	if (s.zoneY > 100 - s.zoneSize) { s.zoneY = 100 - s.zoneSize; s.zoneV = Math.min(0, s.zoneV) * -0.2; }

	if (isInside(s)) {
		s.outsideFor = 0;
		s.progress += rules.fill * dt;
	} else {
		s.outsideFor += dt;
		if (s.outsideFor > rules.grace) s.progress -= rules.drain * dt;
	}
	if (s.progress >= 1) return 'caught';
	if (s.progress <= 0) return 'lost';
	return null;
}

export function isInside(s: ReelState): boolean {
	return s.fishY >= s.zoneY && s.fishY <= s.zoneY + s.zoneSize;
}

/** True while the gold bar is dropping (the UI tints the meter). */
export function isDraining(s: ReelState, p: ReelParams): boolean {
	return !isInside(s) && s.outsideFor > RARITY_RULES[p.rarity].grace;
}
