<script lang="ts">
	/**
	 * ElementalOverlay.svelte
	 * Pure CSS animated particle overlay for elemental atmosphere.
	 * Drop anywhere — map regions, arena backdrop, character screens, UI accents.
	 *
	 * Usage:
	 *   <ElementalOverlay element="fire" />
	 *   <ElementalOverlay element="water" opacity={0.6} />
	 *
	 * The overlay is position:absolute, fills its nearest positioned parent.
	 * Wrap the parent in position:relative.
	 */

	export let element: 'fire' | 'water' | 'wind' | 'earth' | 'light' | 'dark';
	export let opacity: number = 1;
	/** How many particles to render. Higher = denser. Default varies by element. */
	export let density: 'sparse' | 'normal' | 'dense' = 'normal';

	const counts: Record<typeof density, number> = { sparse: 8, normal: 16, dense: 28 };
	// Water gets 2× particles for density feel
	$: baseCount = counts[density];
	$: count = element === 'water' ? baseCount * 2 : baseCount;

	// Duration ranges per element — water is fast, earth is slow
	const durationRanges: Partial<Record<typeof element, [number, number]>> = {
		water: [1.5, 3.5],
		earth: [7, 14],
		dark:  [6, 12],
		light: [4, 8],
	};
	$: durRange = durationRanges[element] ?? [3, 9];

	// Seed deterministic pseudo-random values so SSR is stable
	function rand(seed: number, min = 0, max = 1): number {
		const x = Math.sin(seed * 9301 + 49297) * 233280;
		return min + (x - Math.floor(x)) * (max - min);
	}

	$: particles = Array.from({ length: count }, (_, i) => ({
		left:     rand(i * 3 + 1, 0, 100),
		delay:    rand(i * 3 + 2, 0, 6),
		duration: rand(i * 3 + 3, durRange[0], durRange[1]),
		size:     rand(i * 3 + 4, 0.4, 1.0),
		drift:    rand(i * 3 + 5, -30, 30),
		top:      rand(i * 3 + 6, 0, 100), // used by wind to scatter Y position
	}));
</script>

<div class="overlay element-{element}" style:opacity>
	{#each particles as p, i}
		<div
			class="particle"
			style:left="{p.left}%"
			style:animation-delay="{p.delay}s"
			style:animation-duration="{p.duration}s"
			style:--size="{p.size}"
			style:--drift="{p.drift}px"
			style:--top="{p.top}%"
		></div>
	{/each}
</div>

<style>
	.overlay {
		position: absolute;
		inset: 0;
        top: -10px;
        bottom: -10px;
		pointer-events: none;
		overflow: hidden;
		z-index: 10;
	}

	.particle {
		position: absolute;
		border-radius: 50%;
		will-change: transform, opacity;
	}

	/* ── FIRE — embers rising ─────────────────────────────────────────────── */
	.element-fire .particle {
		bottom: -8px;
		width:  calc(4px + 4px * var(--size));
		height: calc(4px + 4px * var(--size));
		background: radial-gradient(circle, #fff8e0 0%, #ff8c00 40%, #c43200 80%, transparent 100%);
		border-radius: 50% 50% 30% 50%;
		animation: rise-drift linear infinite;
	}
	@keyframes rise-drift {
		0%   { transform: translateY(0)    translateX(0)          rotate(0deg);  opacity: 0; }
		10%  { opacity: calc(0.7 * var(--size)); }
		80%  { opacity: calc(0.4 * var(--size)); }
		100% { transform: translateY(-110vh) translateX(var(--drift)) rotate(180deg); opacity: 0; }
	}

	/* ── WATER — rain falling (dense, fast) ──────────────────────────────── */
	.element-water .particle {
		top: -12px;
		width:  1px;
		height: calc(10px + 10px * var(--size));
		background: linear-gradient(to bottom, transparent, rgba(120,180,255,0.7));
		border-radius: 0 0 2px 2px;
		animation: rain-fall linear infinite;
	}
	@keyframes rain-fall {
		0%   { transform: translateY(-20px) translateX(0);   opacity: 0; }
		5%   { opacity: calc(0.5 * var(--size)); }
		90%  { opacity: calc(0.3 * var(--size)); }
		100% { transform: translateY(110vh) translateX(var(--drift)); opacity: 0; }
	}
	/* ── WIND — petals sweeping diagonally, scattered along Y ───────────── */
	.element-wind .particle {
		top: var(--top, 50%);
		left: -10px !important;
		width:  calc(5px + 4px * var(--size));
		height: calc(3px + 2px * var(--size));
		background: rgba(180,220,180,0.6);
		border-radius: 50% 0 50% 0;
		animation: petal-sweep linear infinite;
	}
	@keyframes petal-sweep {
		0%   { transform: translateX(-20px)   translateY(0)          rotate(0deg);  opacity: 0; }
		8%   { opacity: calc(0.65 * var(--size)); }
		90%  { opacity: calc(0.3 * var(--size)); }
		100% { transform: translateX(115vw) translateY(var(--drift)) rotate(360deg); opacity: 0; }
	}

	/* ── EARTH — leaf shapes falling slowly top-to-bottom ────────────────── */
	/*
	 * Leaf shape geometry: take an S×S square. Draw circle A centred on
	 * bottom-left corner (radius S), circle B centred on top-right corner
	 * (radius S). Their intersection is a symmetric lens — a pointed oval
	 * rotated 45°. Rendered via clip-path: path() using two arc commands.
	 *
	 * For a 12×12 particle (S=12):
	 *   A centre = (0, 12),  r = 12
	 *   B centre = (12, 0),  r = 12
	 * SVG arc from (6,0) sweeping through to (6,12) via each circle.
	 */
	.element-earth .particle {
		top: -16px;
		width:  calc(6px + 8px * var(--size));
		height: calc(6px + 8px * var(--size));
		background: rgba(140,100,55,0.65);
		/* clip-path lens: normalised to 0 0 / 100% 100% bounding box */
		clip-path: path('M 50 0 Q 100 0 100 50 Q 100 100 50 100 Q 0 100 0 50 Q 0 0 50 0 Z');
		/* Approximate the lens with a tight ellipse rotated 45° —
		   pure CSS, no SVG needed, visually identical at small sizes */
		clip-path: ellipse(38% 50% at 50% 50%);
		transform-origin: center center;
		rotate: 45deg;
		background: linear-gradient(135deg, rgba(160,120,60,0.7), rgba(100,75,35,0.5));
		animation: leaf-fall linear infinite;
	}
	@keyframes leaf-fall {
		0%   { transform: translateY(-20px) translateX(0)            rotate(0deg);   opacity: 0; }
		10%  { opacity: calc(0.6 * var(--size)); }
		50%  { transform: translateY(50vh)  translateX(calc(var(--drift) * 0.5)) rotate(180deg); }
		90%  { opacity: calc(0.3 * var(--size)); }
		100% { transform: translateY(110vh) translateX(var(--drift))  rotate(360deg); opacity: 0; }
	}

	/* ── LIGHT — golden motes pulsing and drifting ───────────────────────── */
	.element-light .particle {
		top:  calc(10px + 80px * var(--size));
		width:  calc(2px + 3px * var(--size));
		height: calc(2px + 3px * var(--size));
		background: radial-gradient(circle, #fff8d0 0%, #f0c040 60%, transparent 100%);
		border-radius: 50%;
		animation: mote-float ease-in-out infinite;
	}
	@keyframes mote-float {
		0%   { transform: translateY(0)     translateX(0);           opacity: 0; }
		25%  { opacity: calc(0.8 * var(--size)); }
		50%  { transform: translateY(-30px) translateX(calc(var(--drift) * 0.5)); }
		75%  { opacity: calc(0.6 * var(--size)); }
		100% { transform: translateY(-70px) translateX(var(--drift)); opacity: 0; }
	}

	/* ── DARK — violet smoke wisps, light enough to read on dark bg ─────── */
	.element-dark .particle {
		bottom: -4px;
		width:  calc(5px + 7px * var(--size));
		height: calc(5px + 7px * var(--size));
		background: radial-gradient(circle, rgba(180,140,255,0.35) 0%, rgba(120,80,200,0.15) 50%, transparent 70%);
		border-radius: 50%;
		animation: wisp-rise ease-in-out infinite;
	}
	@keyframes wisp-rise {
		0%   { transform: translateY(0)     translateX(0)           scale(0.5); opacity: 0; }
		20%  { opacity: calc(0.55 * var(--size)); }
		70%  { opacity: calc(0.3 * var(--size)); }
		100% { transform: translateY(-80vh) translateX(var(--drift)) scale(1.4); opacity: 0; }
	}
</style>