// Fishing rules: what can bite where, the roll, and what a catch gives.
// The minigame (FishingGame.svelte) only decides caught / got away.

import { get } from 'svelte/store';
import { playerStore, playerExplorationAbilities } from '$lib/stores/playerStore';
import { phase } from '$lib/stores/timeStore';
import { seasonStore } from '$lib/stores/seasonStore';
import { regionDefinitions } from '$lib/data/regionDefinitions';
import {
	FISH,
	CATCH_OBJECTS,
	FISHING_GEAR,
	REGION_ZONES,
	ZONE_FALLBACK,
	ZONE_NAMES,
	RARITY_WEIGHT,
	RARITY_XP,
	OBJECT_XP,
	GEM_IDS,
	BOTTLE_MESSAGES,
	type FishDef,
	type FishZone,
	type CatchObjectDef
} from '$lib/data/fishing';
import { addItems, countInventoryItem, removeItemsByItemId } from './InventoryService';
import { gainExperience } from './SkillService';
import type { Player } from '$lib/types';

export interface FishingSpot {
	regionId: string;
	regionName: string;
	zone: FishZone;
	zoneName: string;
	/** The player could swim/sail there (meets the region's gates): rare fish bite. */
	reachable: boolean;
}

export type Catch =
	| { kind: 'fish'; fish: FishDef; size: number }
	| { kind: 'object'; object: CatchObjectDef };

export interface CatchResult {
	isNew: boolean;
	isRecord: boolean;
	xp: number;
	/** Extra lines: treasure contents, bottle messages. */
	notes: string[];
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

function weightedPick<T>(items: T[], weight: (t: T) => number): T | null {
	const total = items.reduce((s, t) => s + weight(t), 0);
	if (total <= 0) return null;
	let r = Math.random() * total;
	for (const t of items) {
		r -= weight(t);
		if (r <= 0) return t;
	}
	return items[items.length - 1];
}

export function getFishingLevel(player: Player = get(playerStore)): number {
	return player.skills.find((s) => s.id === 'fishing')?.level ?? 1;
}

/** Best rod tier the player owns (the wooden rod is always available). */
export function getRodTier(player: Player = get(playerStore)): number {
	let tier = 1;
	for (const g of FISHING_GEAR) {
		if (g.kind === 'rod' && countInventoryItem(player.inventory, g.id) > 0) tier = Math.max(tier, g.value as number);
	}
	return tier;
}

export function describeSpot(regionId: string): FishingSpot {
	const region = regionDefinitions[regionId];
	const zone = REGION_ZONES[regionId] ?? 'C';
	const abilities = get(playerExplorationAbilities);
	const gates = region?.gates ?? null;
	const reachable = !gates || gates.some((g) => (abilities[g.element] ?? 0) >= g.level);
	return { regionId, regionName: region?.name ?? regionId, zone, zoneName: ZONE_NAMES[zone], reachable };
}

/** Fish that can bite here right now, ignoring level. */
function fishInZone(zone: FishZone): FishDef[] {
	const now = get(phase);
	const season = get(seasonStore);
	return FISH.filter(
		(f) =>
			f.zones.includes(zone) &&
			(f.time === 'any' || f.time === now) &&
			(f.seasons.length === 0 || f.seasons.includes(season))
	);
}

/** Everything that could bite at this spot for this player, with weights. */
export function biteTable(spot: FishingSpot, bait: string | null, player: Player = get(playerStore)) {
	const reach = getFishingLevel(player) + (getRodTier(player) - 1);
	const tier = getRodTier(player);
	const ok = (f: FishDef) =>
		f.level <= reach && (spot.reachable || f.rarity === 'common' || f.rarity === 'uncommon');

	let pool = fishInZone(spot.zone).filter(ok);
	if (pool.length === 0 && ZONE_FALLBACK[spot.zone]) pool = fishInZone(ZONE_FALLBACK[spot.zone]!).filter(ok);

	const rareBoost = (bait === 'rare' ? 1.6 : 1) * (1 + 0.25 * (tier - 1));
	return pool.map((f) => ({
		fish: f,
		weight:
			RARITY_WEIGHT[f.rarity] *
			(f.rarity === 'rare' ? rareBoost : f.rarity === 'legendary' ? rareBoost * (1 + 0.25 * (tier - 1)) : 1)
	}));
}

/** The bait that will be used on the next cast, if any. */
export function nextBait(player: Player = get(playerStore)): { id: string; effect: string } | null {
	for (const g of FISHING_GEAR) {
		if (g.kind === 'bait' && countInventoryItem(player.inventory, g.id) > 0) return { id: g.id, effect: g.value as string };
	}
	return null;
}

/** Spends one bait (if any) and rolls what's on the line. */
export function rollCatch(spot: FishingSpot): { catch: Catch; bait: string | null } {
	const player = get(playerStore);
	const bait = nextBait(player);
	if (bait) playerStore.set(removeItemsByItemId(player, bait.id, 1));

	const level = getFishingLevel(player);
	const tier = getRodTier(player);
	const junkChance = Math.max(0.05, 0.14 - level * 0.01);
	const treasureChance = 0.03 + tier * 0.005;

	const r = Math.random();
	if (r < treasureChance || r < treasureChance + junkChance) {
		const kind = r < treasureChance ? 'treasure' : 'junk';
		const object = weightedPick(CATCH_OBJECTS.filter((o) => o.kind === kind), (o) => o.weight)!;
		return { catch: { kind: 'object', object }, bait: bait?.effect ?? null };
	}

	const picked = weightedPick(biteTable(spot, bait?.effect ?? null, player), (e) => e.weight);
	if (!picked) {
		const object = weightedPick(CATCH_OBJECTS.filter((o) => o.kind === 'junk'), (o) => o.weight)!;
		return { catch: { kind: 'object', object }, bait: bait?.effect ?? null };
	}
	const [lo, hi] = picked.fish.size;
	// Skewed towards the small end, so big ones are worth bragging about
	const size = Math.round((lo + (hi - lo) * Math.pow(Math.random(), 1.8)) * 10) / 10;
	return { catch: { kind: 'fish', fish: picked.fish, size }, bait: bait?.effect ?? null };
}

/** Puts the catch in the inventory, logs it, grants XP and any treasure. */
export function applyCatch(c: Catch): CatchResult {
	const notes: string[] = [];
	let isNew = false;
	let isRecord = false;
	let xp = 0;

	playerStore.update((p) => {
		const log = { ...(p.fishLog ?? {}) };
		let next = p;

		if (c.kind === 'fish') {
			const prev = log[c.fish.id];
			isNew = !prev;
			isRecord = !!prev && c.size > (prev.best ?? 0);
			log[c.fish.id] = { count: (prev?.count ?? 0) + 1, best: Math.max(prev?.best ?? 0, c.size) };
			xp = RARITY_XP[c.fish.rarity];
			next = addItems(next, c.fish.id, 1);
		} else {
			const o = c.object;
			isNew = !log[o.id];
			log[o.id] = { count: (log[o.id]?.count ?? 0) + 1 };
			xp = OBJECT_XP[o.kind];
			next = addItems(next, o.id, 1);

			const gem = () => GEM_IDS[randInt(0, GEM_IDS.length - 1)];
			if (o.id === 'gold_coin') {
				const n = randInt(50, 200);
				next = addItems(next, 'argentum', n, false);
				notes.push(`Worth ${n} Argentum.`);
			} else if (o.id === 'jewelry_box') {
				const g = gem();
				next = addItems(next, g, 1);
				notes.push('A gem was tucked inside.');
			} else if (o.id === 'rusty_safe') {
				const n = randInt(300, 800);
				next = addItems(next, 'argentum', n, false);
				notes.push(`You pry it open: ${n} Argentum.`);
			} else if (o.id === 'sunken_treasure') {
				next = addItems(next, 'argentum', 1000, false);
				next = addItems(next, gem(), 1);
				next = addItems(next, gem(), 1);
				notes.push('1000 Argentum and two gems!');
			} else if (o.id === 'message_bottle') {
				notes.push(BOTTLE_MESSAGES[randInt(0, BOTTLE_MESSAGES.length - 1)]);
			}
		}

		next = gainExperience({ ...next, fishLog: log }, 'fishing', xp);
		return next;
	});

	return { isNew, isRecord, xp, notes };
}
