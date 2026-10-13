<script lang="ts">
	// FishingGame.svelte
	// cast → wait (don't strike early: nibbles are fake) → bite (strike in the
	// window) → reel (keep the catch zone on the fish until the meter fills).
	// Junk and treasure skip the reel. One action control throughout:
	// Space / E / Enter, or press-and-hold on the panel. Esc leaves.

	import { onMount, onDestroy } from 'svelte';
	import { fishingStore } from '$lib/stores/fishingStore';
	import { playerStore } from '$lib/stores/playerStore';
	import {
		rollCatch,
		applyCatch,
		getFishingLevel,
		getRodTier,
		nextBait,
		type Catch,
		type CatchResult
	} from '$lib/services/FishingService';
	import { FISHING_GEAR, RARITY_DIFFICULTY, ZONE_NAMES } from '$lib/data/fishing';
	import { countInventoryItem } from '$lib/services/InventoryService';
	import { newReel, stepReel, type ReelState, type ReelParams } from '$lib/services/fishingReel';

	type Phase = 'cast' | 'wait' | 'bite' | 'reel' | 'result' | 'lost';

	$: spot = $fishingStore!;

	let phase: Phase = 'cast';
	let current: Catch | null = null;
	let result: CatchResult | null = null;
	let lostMessage = '';
	let nibble = false;
	let timers: ReturnType<typeof setTimeout>[] = [];
	let raf = 0;

	// Reel state (physics in fishingReel.ts)
	let reel: ReelState | null = null;
	let reelParams: ReelParams | null = null;
	let holding = false;

	$: rodName = FISHING_GEAR.find((g) => g.kind === 'rod' && g.value === getRodTier($playerStore))?.name ?? 'Wooden Fishing Rod';
	$: bait = nextBait($playerStore);
	$: baitName = bait ? FISHING_GEAR.find((g) => g.id === bait!.id)?.name : null;
	$: baitCount = bait ? countInventoryItem($playerStore.inventory, bait.id) : 0;

	const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
		cancelAnimationFrame(raf);
	}

	const difficulty = () =>
		current?.kind === 'fish' ? RARITY_DIFFICULTY[current.fish.rarity] : 0.2;

	function cast() {
		clearTimers();
		result = null;
		phase = 'cast';
		const rolled = rollCatch(spot);
		current = rolled.catch;
		const level = getFishingLevel();
		later(700, () => {
			phase = 'wait';
			const wait = (1600 + Math.random() * 3400) * (rolled.bait === 'fast' ? 0.55 : 1) * Math.max(0.6, 1 - level * 0.03);
			// Fake nibbles to tempt an early strike
			const nibbles = Math.random() < 0.35 + difficulty() * 0.4 ? 1 + Math.floor(Math.random() * 2) : 0;
			for (let i = 0; i < nibbles; i++) {
				const at = 500 + Math.random() * Math.max(200, wait - 900);
				later(at, () => (nibble = true));
				later(at + 260, () => (nibble = false));
			}
			later(wait, bite);
		});
	}

	function bite() {
		phase = 'bite';
		nibble = false;
		const windowMs = current?.kind === 'fish' ? 900 - difficulty() * 350 : 1000;
		later(windowMs, () => {
			if (phase === 'bite') lose('It got away.');
		});
	}

	function strike() {
		clearTimers();
		if (current?.kind === 'object') return land();
		startReel();
	}

	function startReel() {
		if (current?.kind !== 'fish') return;
		phase = 'reel';
		reelParams = {
			behaviour: current.fish.behaviour,
			difficulty: difficulty(),
			level: getFishingLevel(),
			rodTier: getRodTier()
		};
		reel = newReel(reelParams);
		let last = performance.now();
		const step = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const outcome = stepReel(reel!, reelParams!, holding, dt);
			reel = reel; // let Svelte see the mutation
			if (outcome === 'caught') land();
			else if (outcome === 'lost') lose('The line went slack.');
			else raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}

	function land() {
		clearTimers();
		phase = 'result';
		result = applyCatch(current!);
	}

	function lose(msg: string) {
		clearTimers();
		lostMessage = msg;
		phase = 'lost';
	}

	function close() {
		clearTimers();
		fishingStore.set(null);
	}

	// ── Input: one action control ─────────────────────────────────────────────
	function press() {
		if (phase === 'wait') lose('Too early. It swam off.');
		else if (phase === 'bite') strike();
		else if (phase === 'result' || phase === 'lost') cast();
		holding = true;
	}
	function release() {
		holding = false;
	}

	const ACTION_KEYS = new Set([' ', 'e', 'E', 'Enter']);
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') { e.preventDefault(); close(); return; }
		if (!ACTION_KEYS.has(e.key)) return;
		e.preventDefault();
		e.stopPropagation();
		if (e.repeat) return;
		press();
	}
	function onKeyUp(e: KeyboardEvent) {
		if (ACTION_KEYS.has(e.key)) release();
	}

	onMount(() => {
		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);
		cast();
	});
	onDestroy(() => {
		clearTimers();
		window.removeEventListener('keydown', onKeyDown, true);
		window.removeEventListener('keyup', onKeyUp, true);
	});

	const RARITY_COLOR: Record<string, string> = {
		common: '#c9c2b0',
		uncommon: '#6fd08c',
		rare: '#62b6ff',
		legendary: '#f2c14e'
	};

	$: hint = {
		cast: 'Casting...',
		wait: 'Wait for the bite. Nibbles are not bites.',
		bite: 'Strike now!',
		reel: 'Hold to raise the net, release to drop it. Keep the fish inside.',
		result: 'Space / tap to cast again · Esc to leave',
		lost: 'Space / tap to cast again · Esc to leave'
	}[phase];
</script>

<div class="fishing-backdrop">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fishing-panel"
		on:pointerdown|preventDefault={press}
		on:pointerup={release}
		on:pointerleave={release}
		on:pointercancel={release}
	>
		<header class="head">
			<div>
				<span class="spot">{spot.regionName}</span>
				<span class="zone">{ZONE_NAMES[spot.zone]}{spot.reachable ? '' : ' · from the shore'}</span>
			</div>
			<button class="close" on:pointerdown|stopPropagation on:click={close} aria-label="Stop fishing">Esc ✕</button>
		</header>

		<div class="stage">
			<div class="water" class:reeling={phase === 'reel'}>
				<div class="sky"></div>
				{#if phase !== 'result'}
					<div class="line" class:taut={phase === 'reel' || phase === 'bite'}></div>
				{/if}
				{#if phase !== 'result'}
					<div class="bobber-wrap" class:casting={phase === 'cast'} class:nibble class:bite={phase === 'bite'}>
						<span class="ring"></span>
						<img src="/fishing/gear/bobber.png" alt="" class="bobber" />
						{#if phase === 'bite'}<span class="alert">!</span>{/if}
					</div>
				{/if}

				{#if phase === 'result' && current && result}
					<div class="result">
						<img
							src={current.kind === 'fish' ? current.fish.image : current.object.image}
							alt=""
							class="catch-img"
						/>
						<div class="catch-name">
							{current.kind === 'fish' ? current.fish.name : current.object.name}
						</div>
						<div class="catch-meta">
							{#if current.kind === 'fish'}
								<span style="color: {RARITY_COLOR[current.fish.rarity]}">{current.fish.rarity}</span>
								· {current.size} cm
							{:else}
								<span style="color: {current.object.kind === 'treasure' ? '#f2c14e' : '#9a937f'}">{current.object.kind}</span>
							{/if}
							· +{result.xp} XP
						</div>
						<div class="badges">
							{#if result.isNew}<span class="badge new">New!</span>{/if}
							{#if result.isRecord}<span class="badge record">Record!</span>{/if}
						</div>
						{#each result.notes as note}<p class="note">{note}</p>{/each}
					</div>
				{/if}

				{#if phase === 'lost'}
					<div class="lost">{lostMessage}</div>
				{/if}
			</div>

			{#if phase === 'reel' && reel}
				<div class="reel">
					<div class="bar">
						<div class="net" class:hooked={reel.fishY >= reel.zoneY && reel.fishY <= reel.zoneY + reel.zoneSize} style="bottom: {reel.zoneY}%; height: {reel.zoneSize}%"></div>
						{#if current?.kind === 'fish'}
							<img
								class="reel-fish"
								src={current.fish.image}
								alt=""
								style="bottom: calc({reel.fishY}% - 14px)"
							/>
						{/if}
					</div>
					<div class="meter"><div class="meter-fill" style="height: {Math.max(0, reel.progress) * 100}%"></div></div>
				</div>
			{/if}
		</div>

		<footer class="foot">
			<span class="hint" class:urgent={phase === 'bite'}>{hint}</span>
			<span class="tackle">
				{rodName}{#if baitName} · {baitName} ×{baitCount}{/if}
			</span>
		</footer>
	</div>
</div>

<style>
	.fishing-backdrop {
		position: fixed;
		inset: 0;
		z-index: 900;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.55);
	}
	.fishing-panel {
		width: min(600px, calc(100vw - 32px));
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		background: var(--surface-2, #2a2117);
		border: 3px solid #00000080;
		box-shadow: #00000056 0 -6px 0 2px inset;
		font-family: var(--font-family-pixel);
		color: #e4d8be;
		user-select: none;
		touch-action: none;
		overflow: hidden;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.25);
	}
	.spot { font-size: 0.95rem; color: #f2e3bd; margin-right: 8px; }
	.zone { font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(200, 169, 110, 0.6); }
	.close {
		background: none;
		border: 1px solid rgba(200, 169, 110, 0.3);
		border-radius: 4px;
		color: rgba(200, 169, 110, 0.7);
		font: inherit;
		font-size: 0.6rem;
		padding: 2px 6px;
		cursor: pointer;
	}

	.stage {
		display: flex;
		gap: 8px;
		padding: 10px;
		height: 260px;
	}

	/* ── Water scene ── */
	.water {
		position: relative;
		flex: 1;
		border-radius: 8px;
		overflow: hidden;
		background: linear-gradient(180deg, #3e7fb8 0%, #2c6496 45%, #1d4a73 100%);
		background-image:
			repeating-linear-gradient(170deg, transparent 0 18px, rgba(255, 255, 255, 0.05) 18px 20px),
			linear-gradient(180deg, #3e7fb8 0%, #2c6496 45%, #1d4a73 100%);
		animation: drift 6s linear infinite;
	}
	@keyframes drift { to { background-position: 0 40px, 0 0; } }
	.sky {
		position: absolute;
		inset: 0 0 auto 0;
		height: 22%;
		background: linear-gradient(180deg, #9cc7e6, #6ea6d0);
		border-bottom: 2px solid rgba(255, 255, 255, 0.35);
	}
	.line {
		position: absolute;
		left: 50%;
		top: 0;
		height: 52%;
		width: 1px;
		background: rgba(255, 255, 255, 0.55);
		transform-origin: top;
		transform: rotate(6deg);
	}
	.line.taut { background: rgba(255, 255, 255, 0.9); transform: rotate(2deg); }

	.bobber-wrap {
		position: absolute;
		left: 50%;
		top: 52%;
		transform: translate(-50%, -50%);
		transition: transform 0.12s ease-out;
	}
	.bobber {
		width: 40px;
		height: 40px;
		image-rendering: pixelated;
		animation: bob 1.6s ease-in-out infinite;
		display: block;
	}
	@keyframes bob { 50% { transform: translateY(3px); } }
	.ring {
		position: absolute;
		left: 50%;
		top: 70%;
		width: 60px;
		height: 16px;
		margin-left: -30px;
		border: 2px solid rgba(255, 255, 255, 0.35);
		border-radius: 50%;
		animation: ripple 2.2s ease-out infinite;
	}
	@keyframes ripple { from { transform: scale(0.5); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }
	.bobber-wrap.casting { animation: cast-in 0.7s ease-out; }
	@keyframes cast-in { from { transform: translate(-260%, -260%) scale(0.6); opacity: 0.4; } }
	.bobber-wrap.nibble { transform: translate(-50%, -38%); }
	.bobber-wrap.bite { transform: translate(-50%, -10%); }
	.bobber-wrap.bite .ring { border-color: #fff; animation-duration: 0.5s; }
	.alert {
		position: absolute;
		left: 50%;
		top: -26px;
		transform: translateX(-50%);
		font-size: 1.6rem;
		color: #ffdf5e;
		text-shadow: 2px 2px 0 #000;
		animation: pop 0.25s ease-out;
	}
	@keyframes pop { from { transform: translateX(-50%) scale(0.3); } }

	.result, .lost {
		position: absolute;
		inset: 22% 0 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		text-align: center;
		padding: 0 16px;
		background: rgba(10, 24, 40, 0.55);
	}
	.catch-img {
		width: 72px;
		height: 72px;
		image-rendering: pixelated;
		filter: drop-shadow(0 3px 0 rgba(0, 0, 0, 0.5));
		animation: pop-in 0.35s ease-out;
	}
	@keyframes pop-in { from { transform: translateY(30px) scale(0.6); opacity: 0; } }
	.catch-name { font-size: 1.05rem; color: #fff6dc; }
	.catch-meta { font-size: 0.65rem; color: rgba(228, 216, 190, 0.85); text-transform: capitalize; }
	.badges { display: flex; gap: 6px; min-height: 16px; }
	.badge { font-size: 0.6rem; padding: 1px 6px; border-radius: 3px; color: #1a1610; }
	.badge.new { background: #6fd08c; }
	.badge.record { background: #f2c14e; }
	.note { margin: 2px 0 0; font-family: 'Lexend'; font-style: italic; font-size: 0.78rem; color: #f2e3bd; max-width: 360px; }
	.lost { font-size: 0.9rem; color: #f2e3bd; }

	/* ── Reel ── */
	.reel { display: flex; gap: 6px; }
	.bar {
		position: relative;
		width: 54px;
		border-radius: 6px;
		background: linear-gradient(180deg, #1b3e5e, #0f2538);
		border: 2px solid rgba(0, 0, 0, 0.6);
		overflow: hidden;
	}
	.net {
		position: absolute;
		left: 3px;
		right: 3px;
		border-radius: 4px;
		background: rgba(111, 208, 140, 0.35);
		border: 2px solid rgba(111, 208, 140, 0.55);
		transition: background 0.1s, border-color 0.1s;
	}
	.net.hooked {
		background: rgba(111, 208, 140, 0.45);
		border-color: #8ef0aa;
	}
	.reel-fish {
		position: absolute;
		left: 50%;
		width: 28px;
		height: 28px;
		margin-left: -14px;
		image-rendering: pixelated;
	}
	.meter {
		position: relative;
		width: 12px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.45);
		border: 2px solid rgba(0, 0, 0, 0.6);
		overflow: hidden;
	}
	.meter-fill {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(0deg, #e0a040, #f2c14e);
	}

	.foot {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 7px 12px 10px;
		font-size: 0.62rem;
		color: rgba(228, 216, 190, 0.75);
	}
	.hint.urgent { color: #ffdf5e; }
	.tackle { color: rgba(200, 169, 110, 0.6); white-space: nowrap; }
</style>
