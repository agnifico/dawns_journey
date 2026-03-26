<script lang="ts">
	// HighlightLayer.svelte
	// Renders coloured tile-footprint overlays for every interactive entity on the map.
	// Only parent objects are passed in — multi_tile_part objects are excluded upstream.
	// Visibility is controlled by the `visible` prop (toggled from MapDisplay).

	export let objects: any[];
	export let FINAL_TILE_SIZE: number;
	export let visible: boolean;

	// Colour config per entity type — tweak to taste
	const HIGHLIGHT_COLOURS: Record<string, { fill: string; border: string; label: string }> = {
		npc:      { fill: 'rgba(99, 202, 255, 0.18)',  border: 'rgba(99, 202, 255, 0.7)',  label: 'NPC'      },
		resource: { fill: 'rgba(104, 211, 145, 0.18)', border: 'rgba(104, 211, 145, 0.7)', label: 'Resource' },
		event:    { fill: 'rgba(255, 196, 87, 0.18)',  border: 'rgba(255, 196, 87, 0.7)',  label: 'Event'    },
	};

	// Only entities we know how to highlight
	$: highlightable = objects.filter((o) => o.type in HIGHLIGHT_COLOURS);
</script>

{#if visible}
	<div class="highlight-layer" aria-hidden="true">
		{#each highlightable as obj (obj.id ?? `${obj.type}-${obj.x}-${obj.y}`)}
			{@const colour = HIGHLIGHT_COLOURS[obj.type]}
			{@const w = (obj.width ?? 1) * FINAL_TILE_SIZE}
			{@const h = (obj.height ?? 1) * FINAL_TILE_SIZE}
			<div
				class="highlight-cell"
				style="
					left:   {obj.x * FINAL_TILE_SIZE}px;
					top:    {obj.y * FINAL_TILE_SIZE}px;
					width:  {w}px;
					height: {h}px;
					background: {colour.fill};
					box-shadow: inset 0 0 0 2px {colour.border};
				"
			>
				<span class="highlight-label" style="color: {colour.border};">
					{colour.label}
				</span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.highlight-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 8; /* above map, below player (z-index 20) */
	}

	.highlight-cell {
		position: absolute;
		border-radius: 4px;
		/* Pulse animation to draw the eye */
		animation: highlight-pulse 2s ease-in-out infinite;
	}

	.highlight-label {
		position: absolute;
		bottom: 3px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 8px;
		font-family: monospace;
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		white-space: nowrap;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		pointer-events: none;
	}

	@keyframes highlight-pulse {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0.55; }
	}
</style>