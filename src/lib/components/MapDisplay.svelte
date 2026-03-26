<script lang="ts">
	import type { MapData, Player } from '$lib/types';
	import { phase } from '$lib/stores/timeStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { derived } from 'svelte/store';
	import { landscapeDefinitions } from '$lib/data/landscapeDefinitions';
	import { rainLevel, rainEnabled } from '$lib/stores/weatherStore';
	import PlayerIcon from './ui/PlayerIcon.svelte';
	import MapObject from './MapObject.svelte';
	import HighlightLayer from './HighlightLayer.svelte';
	import RainOverlay from '$lib/components/ui/RainOverlay.svelte';

	export let mapData: MapData;
	export let player: Player;

	// ── Highlight toggle ────────────────────────────────────────────────────────
	// Exported so MapHUD can bind to it and render a toggle button.
	// The H key is handled in _page.svelte and calls toggleHighlight().
	export let showHighlights = false;
	export function toggleHighlight() {
		showHighlights = !showHighlights;
	}

	// ── Scale ───────────────────────────────────────────────────────────────────
	const TILE_SIZE = 16;
	$: RENDER_SCALE    = $settingsStore.renderScale;
	$: FINAL_TILE_SIZE = TILE_SIZE * RENDER_SCALE;

	let windowWidth: number;
	let windowHeight: number;

	$: mapTranslateX = -(player.position.x * FINAL_TILE_SIZE) + windowWidth  / 2 - FINAL_TILE_SIZE / 2;
	$: mapTranslateY = -(player.position.y * FINAL_TILE_SIZE) + windowHeight / 2 - FINAL_TILE_SIZE / 2;

	// ── Entity filtering ────────────────────────────────────────────────────────
	// Only render parent objects. multi_tile_part entries exist for game logic only.
	const PARENT_TYPES = new Set(['npc', 'resource', 'event']);
	$: parentObjects = mapData.objects.filter((o) => PARENT_TYPES.has(o.type));

	// ── Landscape / rain ────────────────────────────────────────────────────────
	const currentLandscapeDefinition = derived(mapStore, ($mapStore) => {
		const md = $mapStore.maps[$mapStore.currentMapId];
		const { playerX, playerY } = $mapStore;
		if (!md) return null;

		let currentLandscapeId: string | undefined;
		for (const landscape of md.landscapes) {
			if (
				playerX >= landscape.x &&
				playerX <  landscape.x + landscape.width &&
				playerY >= landscape.y &&
				playerY <  landscape.y + landscape.height
			) {
				currentLandscapeId = landscape.landscape;
				break;
			}
		}
		return landscapeDefinitions[currentLandscapeId ?? md.defaultLandscape];
	});

	$: {
		if ($rainEnabled) {
			rainLevel.set($currentLandscapeDefinition?.rainLevel ?? 0);
		} else {
			rainLevel.set(0);
		}
	}
</script>

<div
	class="map-window"
	bind:clientWidth={windowWidth}
	bind:clientHeight={windowHeight}
>
	<div
		class="map-world"
		style="
			width:     {mapData.width  * FINAL_TILE_SIZE}px;
			height:    {mapData.height * FINAL_TILE_SIZE}px;
			transform: translate({mapTranslateX}px, {mapTranslateY}px);
		"
	>
		<!-- Layer 1: map image -->
		<div class="map-background" style="background-image: url({mapData.image});"></div>

		<!-- Layer 2: highlight overlay (toggleable, below entities) -->
		<HighlightLayer
			objects={parentObjects}
			{FINAL_TILE_SIZE}
			visible={showHighlights}
		/>

		<!-- Layer 3: entity sprites (NPCs, resources, events) -->
		<!-- {#each parentObjects as mapObject (`${mapObject.type}-${mapObject.npcId ?? mapObject.resourceId ?? mapObject.eventId ?? ''}-${mapObject.x}-${mapObject.y}`)}
			<MapObject {mapObject} {FINAL_TILE_SIZE} />
		{/each} -->

		<!-- Layer 4: player -->
		<PlayerIcon {player} {FINAL_TILE_SIZE} />

		<!-- Layer 5: day/night -->
		<div class="day-night-overlay" class:night={$phase === 'Duskfall'}></div>
	</div>

	<!-- Layer 6: weather (fixed to window, not world) -->
	<RainOverlay rainLevel={$rainLevel} />
</div>

<style>
	.map-window {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		background-image: url('/topography.svg');
	}

	.map-world {
		position: relative;
		transition: transform 0.1s linear;
	}

	.map-background {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-repeat: no-repeat;
		image-rendering: pixelated;
	}

	.day-night-overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0);
		transition: background-color 1s ease;
		pointer-events: none;
		z-index: 20;
	}

	.day-night-overlay.night {
		background-color: rgba(0, 0, 50, 0.3);
	}
</style>