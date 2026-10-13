<script lang="ts">
	// CollisionLayer.svelte
	// Dev overlay for the terrain grid: each tile category in its own colour,
	// step-on entity tiles (which ignore collision) outlined in white.
	// Click or drag to paint with `brush`; clicking a tile that already has the
	// brush's category clears the drag back to open ground instead.
	// Drawn as a 1-pixel-per-tile canvas scaled up, so it stays cheap on big maps.

	import { collisionStore, getCellChar, setCell, TILE_KINDS } from '$lib/stores/collisionStore';

	export let mapId: string;
	export let width: number;
	export let height: number;
	export let objects: any[];
	export let FINAL_TILE_SIZE: number;
	export let brush = '#';

	let canvas: HTMLCanvasElement;
	let painting: string | null = null;

	const STEP_ON = new Set(['resource', 'event', 'teleport']);

	$: rows = $collisionStore[mapId] ?? [];
	$: if (canvas) draw(rows, objects);

	function draw(rows: string[], objects: any[]) {
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, width, height);
		for (let y = 0; y < height; y++) {
			const row = rows[y] ?? '';
			for (let x = 0; x < width; x++) {
				const kind = TILE_KINDS[row[x]];
				if (!kind || row[x] === '.') continue;
				ctx.fillStyle = kind.color;
				ctx.fillRect(x, y, 1, 1);
			}
		}
		ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		for (const o of objects) {
			if (STEP_ON.has(o.type)) ctx.fillRect(o.x, o.y, o.width ?? 1, o.height ?? 1);
		}
	}

	function cellAt(e: PointerEvent) {
		return {
			x: Math.floor(e.offsetX / FINAL_TILE_SIZE),
			y: Math.floor(e.offsetY / FINAL_TILE_SIZE)
		};
	}

	function onDown(e: PointerEvent) {
		const { x, y } = cellAt(e);
		painting = getCellChar(mapId, x, y) === brush ? '.' : brush;
		setCell(mapId, x, y, painting, width, height);
		canvas.setPointerCapture(e.pointerId);
	}

	function onMove(e: PointerEvent) {
		if (painting === null) return;
		const { x, y } = cellAt(e);
		if (x < 0 || y < 0 || x >= width || y >= height) return;
		setCell(mapId, x, y, painting, width, height);
	}

	function onUp() {
		painting = null;
	}
</script>

<canvas
	bind:this={canvas}
	class="collision-layer"
	{width}
	{height}
	on:pointerdown={onDown}
	on:pointermove={onMove}
	on:pointerup={onUp}
	on:pointercancel={onUp}
></canvas>

<style>
	.collision-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		z-index: 1001; /* above the night overlay so it's editable */
		cursor: crosshair;
	}
</style>
