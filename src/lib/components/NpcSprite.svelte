<script lang="ts">
	// NpcSprite.svelte
	// Renders a 64×64px LPC-format GIF sprite scaled to fill the entity footprint.
	// Centered within the footprint. Shows a nameplate on hover.

	export let npc: any;
	export let footprintW: number;
	export let footprintH: number;

	// LPC sprites are always 64×64px source
	const SOURCE_SIZE = 64;

	// Scale so the sprite fills the footprint (covers the larger dimension)
	$: scale = Math.max(footprintW, footprintH) / SOURCE_SIZE;
	$: displaySize = SOURCE_SIZE * scale;

	// Center within footprint
	$: offsetX = (footprintW - displaySize) / 2;
	$: offsetY = (footprintH - displaySize) / 2;

	let hovered = false;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="npc-sprite-root"
	style="width: {footprintW}px; height: {footprintH}px;"
	on:mouseenter={() => (hovered = true)}
	on:mouseleave={() => (hovered = false)}
>
	{#if npc.spriteGif}
		<img
			src={npc.spriteGif}
			alt={npc.name}
			class="npc-gif"
			style="
				width:  {displaySize}px;
				height: {displaySize}px;
				left:   {offsetX}px;
				top:    {offsetY}px;
			"
		/>
	{:else if npc.profileImage}
		<!-- Fallback: profile image stretched to footprint until a GIF is ready -->
		<img
			src={npc.profileImage}
			alt={npc.name}
			class="npc-fallback"
			style="width: {footprintW}px; height: {footprintH}px;"
		/>
	{/if}

	{#if hovered}
		<div class="nameplate">{npc.name}</div>
	{/if}
</div>

<style>
	.npc-sprite-root {
		position: relative;
		/* overflow: hidden; */
		cursor: pointer;
	}

	.npc-gif {
		position: absolute;
		image-rendering: pixelated;
		pointer-events: none;
	}

	.npc-fallback {
		display: block;
		image-rendering: pixelated;
		object-fit: cover;
	}

	.nameplate {
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.78);
		color: #fff;
		font-size: 1rem;
		font-family: monospace;
		white-space: nowrap;
		padding: 4px 8px;
		border-radius: 4px;
		pointer-events: none;
		z-index: 100;
		text-transform: uppercase;
		font-weight: 600;
		letter-spacing: -0.5px;
	}
</style>