<script lang="ts">
	import type { MapData, Player } from '$lib/types';
	import { phase } from '$lib/stores/timeStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { derived } from 'svelte/store';
	import { landscapeDefinitions } from '$lib/data/landscapeDefinitions';
	import { rainLevel, rainEnabled } from '$lib/stores/weatherStore';
	import { resolveNpcPosition } from '$lib/services/MapService';
	import PlayerIcon from './ui/PlayerIcon.svelte';
	import MapObject from './MapObject.svelte';
	import HighlightLayer from './HighlightLayer.svelte';
	import RainOverlay from '$lib/components/ui/RainOverlay.svelte';

	export let mapData: MapData;
	export let player: Player;

	// ── Highlight toggle ────────────────────────────────────────────────────────
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

	// ── Resolve parent objects with NPC position overrides applied ───────────────
	// Non-NPC objects pass through unchanged.
	// NPC objects are resolved against mapPositions if defined:
	//   - resolved position found → use overridden x/y
	//   - resolved position null  → NPC absent on this map/phase, omit entirely
	//   - no mapPositions defined → use static map coords (backward-compatible)

	const PARENT_TYPES = new Set(['npc', 'resource', 'event', 'teleport']);

	$: resolvedObjects = (() => {
		const mapId = $mapStore.currentMapId;
		const tags  = player.worldTags ?? [];
		const currentPhase = $phase as 'Dawnrise' | 'Duskfall';

		return mapData.objects
			.filter(o => PARENT_TYPES.has(o.type))
			.flatMap(obj => {
				if (obj.type !== 'npc') return [obj];

				const npc = $npcStore.globalNpcs[obj.npcId];
				if (!npc?.mapPositions) return [obj]; // no table → static coords

				const pos = resolveNpcPosition(npc, mapId, tags, currentPhase);
				if (!pos) return []; // absent on this map right now

				return [{ ...obj, x: pos.x, y: pos.y }];
			});
	})();

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
		<div class="map-background" style="background-image: url({mapData.image});"></div>

		<HighlightLayer
			objects={resolvedObjects}
			{FINAL_TILE_SIZE}
			visible={showHighlights}
		/>

		{#each resolvedObjects as mapObject (`${mapObject.type}-${mapObject.npcId ?? mapObject.resourceId ?? mapObject.eventId ?? ''}-${mapObject.x}-${mapObject.y}`)}
			<MapObject {mapObject} {FINAL_TILE_SIZE} />
		{/each}

		<PlayerIcon {player} {FINAL_TILE_SIZE} />

		<div class="day-night-overlay" class:night={$phase === 'Duskfall'}></div>
	</div>

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