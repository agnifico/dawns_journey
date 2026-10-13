// Reel physics for the fishing minigame, kept pure so it can be tuned and
// tested headlessly. Bar units are 0..100 with 0 at the bottom.

import type { FishBehaviour } from '$lib/data/fishing';

export interface ReelState {
	zoneY: number;
	zoneV: number;
	zoneSize: number;
	fishY: number;
	fishTarget: number;
	fishSpeed: number;
	retargetIn: number;
	progress: number;
	t: number;
}

export interface ReelParams {
	behaviour: FishBehaviour;
	/** 0..1 from rarity */
	difficulty: number;
	level: number;
	rodTier: number;
}

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
		t: 0
	};
}

// Tuning, checked by simulating thousands of reels (see the commit that added
// this file): a decent player lands most commons and about half of legendaries;
// doing nothing almost never works.
const NET_LIFT = 430;   // units/s² while holding
const NET_FALL = 380;   // units/s² while released
const NET_DRAG = 5;     // velocity decay per second (frame-rate independent)
const FILL = 0.2;       // progress/s with the fish inside the net
const DRAIN = 0.11;     // progress/s outside the net, plus DRAIN_D × difficulty
const DRAIN_D = 0.2;

/** Advances one frame. Returns 'caught' / 'lost' when the reel ends. */
export function stepReel(s: ReelState, p: ReelParams, holding: boolean, dt: number, rand = Math.random): 'caught' | 'lost' | null {
	const d = p.difficulty;
	s.t += dt;

	// Fish movement by behaviour
	s.retargetIn -= dt;
	switch (p.behaviour) {
		case 'darter': // sudden dashes to anywhere, short rests
			if (s.retargetIn <= 0) { s.fishTarget = 5 + rand() * 90; s.retargetIn = 0.7 + rand() * 0.9 - 0.2 * d; s.fishSpeed = 45 + 75 * d; }
			break;
		case 'steady': // smooth sweeps up and down
			s.fishTarget = 52 + 38 * Math.sin(s.t * (0.5 + d * 0.95)) + 6 * Math.sin(s.t * 2.7);
			s.fishSpeed = 40 + 100 * d;
			break;
		case 'sinker': // hangs low and heavy, occasionally surges up
			if (s.retargetIn <= 0) {
				s.fishTarget = rand() < 0.25 + 0.4 * d ? 60 + rand() * 35 : 22 + rand() * 30;
				s.retargetIn = 1 + rand() * 1.2 - 0.5 * d;
				s.fishSpeed = 30 + 100 * d;
			}
			break;
		case 'erratic': // jittery, changes its mind constantly
			if (s.retargetIn <= 0) {
				s.fishTarget = Math.min(95, Math.max(30, s.fishY + (rand() - 0.5) * 80));
				s.retargetIn = 0.25 + rand() * 0.45;
				s.fishSpeed = 40 + 130 * d;
			}
			break;
	}
	const diff = s.fishTarget - s.fishY;
	s.fishY += Math.sign(diff) * Math.min(Math.abs(diff), s.fishSpeed * dt);

	// Catch zone: hold to rise, release to sink
	s.zoneV += (holding ? NET_LIFT : -NET_FALL) * dt;
	s.zoneV *= Math.exp(-NET_DRAG * dt);
	s.zoneY += s.zoneV * dt;
	if (s.zoneY < 0) { s.zoneY = 0; s.zoneV = Math.max(0, s.zoneV) * -0.2; }
	if (s.zoneY > 100 - s.zoneSize) { s.zoneY = 100 - s.zoneSize; s.zoneV = Math.min(0, s.zoneV) * -0.2; }

	const inside = s.fishY >= s.zoneY && s.fishY <= s.zoneY + s.zoneSize;
	s.progress += inside ? FILL * dt : -(DRAIN + DRAIN_D * d) * dt;
	if (s.progress >= 1) return 'caught';
	if (s.progress <= 0) return 'lost';
	return null;
}
