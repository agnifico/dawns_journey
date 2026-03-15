<script lang="ts">
	import { onMount } from 'svelte';

	export let value: number;
	export let elements: string[] = [];

	const BAYER4 = [
		[ 0,  8,  2, 10],
		[12,  4, 14,  6],
		[ 3, 11,  1,  9],
		[15,  7, 13,  5]
	];

	// Each element gets a colour for its bloom zone.
	// Rich/saturated — they sit on near-black so they need punch.
	const ELEMENT_COLORS: Record<string, number[]> = {
		fire:  [140,  38,  12],
		water: [ 18,  72, 118],
		wind:  [ 16, 108, 128],
		earth: [ 24,  88,  38],
		light: [120, 100,  12],
		dark:  [ 64,  22, 108],
	};

	const DEFAULT_COLOR = [60, 48, 24];
	const BAYER_NORM = 1 / 16;

	function addColor(base: number[], add: number[], strength: number): number[] {
		return [
			Math.min(255, Math.round(base[0] + add[0] * strength)),
			Math.min(255, Math.round(base[1] + add[1] * strength)),
			Math.min(255, Math.round(base[2] + add[2] * strength)),
		];
	}

	let canvas: HTMLCanvasElement;
	let shell: HTMLDivElement;

	function draw() {
		if (!canvas || !shell) return;

		const W = shell.parentElement?.clientWidth || 400;
		const H = 76;
		const SCALE = 3;
		const pw = Math.ceil(W / SCALE);
		const ph = Math.ceil(H / SCALE);

		canvas.width  = pw;
		canvas.height = ph;
		canvas.style.width  = W + 'px';
		canvas.style.height = H + 'px';

		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const img = ctx.createImageData(pw, ph);
		const d = img.data;

		const dark = [8, 12, 16];

		const cols = elements.map(e => ELEMENT_COLORS[e.toLowerCase()] ?? DEFAULT_COLOR);
		const count = cols.length;

		// Space blooms evenly across the left 55% of width
		// 1 element → centre at 20%
		// 2 elements → 12% and 45%
		// 3+ → evenly distributed 10%–55%
		const centres = count === 0
			? [0.20]
			: count === 1
				? [0.20]
				: cols.map((_, i) => 0.10 + (i / (count - 1)) * 0.45);

		for (let py = 0; py < ph; py++) {
			for (let px = 0; px < pw; px++) {
				const fx = px / pw;
				const fy = py / ph;
				const bayer = BAYER4[py % 4][px % 4] * BAYER_NORM;

				let col = [...dark];

				// Additive bloom per element — each contributes independently
				for (let ei = 0; ei < cols.length; ei++) {
					const cx = centres[ei];
					const dx = fx - cx;
					const dy = (fy - 0.5) * 1.2;
					const dist = Math.sqrt(dx * dx * 0.5 + dy * dy);
					const strength = Math.max(0, 1 - dist / 0.55);
					if (bayer < strength) {
						col = addColor(col, cols[ei], strength * 0.95);
					}
				}

				// Right vignette
				const vig = Math.max(0, (fx - 0.50) / 0.50);
				if (bayer < vig * 0.80) {
					col = [
						Math.round(col[0] * (1 - vig * 0.55)),
						Math.round(col[1] * (1 - vig * 0.55)),
						Math.round(col[2] * (1 - vig * 0.55)),
					];
				}

				const i = (py * pw + px) * 4;
				d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
			}
		}

		ctx.putImageData(img, 0, 0);
	}

	onMount(() => {
		draw();
		const ro = new ResizeObserver(() => draw());
		ro.observe(shell);
		return () => ro.disconnect();
	});

	// Reactive: redraw whenever elements array or value changes
	$: elements, value, canvas && shell && draw();

</script>

<div class="wr-header" bind:this={shell}>
	<canvas bind:this={canvas} class="wr-canvas"></canvas>
	<div class="wr-overlay">
		<div class="wr-number">{value}</div>
		<div class="wr-divider"></div>
		<div class="wr-meta">
			<span class="wr-eyebrow">WORLD RESONANCE</span>
			{#if elements.length > 0}
				<span class="wr-elements">{elements.map(e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join(' · ')}</span>
			{/if}
		</div>
		{#if elements.length > 0}
			<div class="wr-dots">
				{#each elements as el}
					<div
						class="wr-dot"
						style="background: var(--element-{el.toLowerCase()}, #c8a96e);
						       box-shadow: 0 0 6px var(--element-{el.toLowerCase()}, #c8a96e);"
					></div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.wr-header {
		position: relative;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid rgba(196, 154, 54, 0.602);
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		box-shadow: #00000056 0 6px 0 3px;
		margin-bottom: 1rem;
	}

	.wr-canvas {
		display: block;
		max-width: 100%;
		height: 76px;
		image-rendering: pixelated;
	}

	.wr-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		padding: 0 20px;
		gap: 0;
		pointer-events: none;
	}

	.wr-number {
		font-family: var(--font-family-main);
		font-family: "Lexend";
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.03em;
		color: rgba(150, 215, 245, 0.95);
		min-width: 72px;
		text-align: right;
		flex-shrink: 0;
	}

	.wr-divider {
		width: 1px;
		height: 32px;
		background: linear-gradient(to bottom, transparent, rgba(150, 210, 240, 0.2), transparent);
		margin: 0 18px;
		flex-shrink: 0;
	}

	.wr-meta {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
	}

	.wr-eyebrow {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: rgb(255, 255, 255);
	}

	.wr-elements {
		font-family: var(--font-family-pixel);
		font-size: 1rem;
		font-weight: 600;
		color: rgba(210, 235, 250, 0.9);
		letter-spacing: 0.01em;
	}

	.wr-dots {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex-shrink: 0;
	}

	.wr-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}

	:global(:root) {
		--element-fire:  #cc4113;
		--element-water: #276b9f;
		--element-wind:  #4bc7e3;
		--element-earth: #2d7645;
		--element-light: #d4b830;
		--element-dark:  #c07ad8;
	}
</style>