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
	import RainOverlay from '$lib/components/ui/RainOverlay.svelte';

	export let mapData: MapData;
	export let player: Player;

	const TILE_SIZE = 16;
	$: RENDER_SCALE = $settingsStore.renderScale;
	$: FINAL_TILE_SIZE = TILE_SIZE * RENDER_SCALE;

	let windowWidth: number;
	let windowHeight: number;

	$: mapTranslateX = -(player.position.x * FINAL_TILE_SIZE) + windowWidth / 2 - FINAL_TILE_SIZE / 2;
	$: mapTranslateY =
		-(player.position.y * FINAL_TILE_SIZE) + windowHeight / 2 - FINAL_TILE_SIZE / 2;

	const currentLandscapeDefinition = derived(mapStore, ($mapStore) => {
		const mapData = $mapStore.maps[$mapStore.currentMapId];
		const { playerX, playerY } = $mapStore;
		if (!mapData) return null;

		let currentLandscapeId: string | undefined;

		for (const landscape of mapData.landscapes) {
			if (
				playerX >= landscape.x &&
				playerX < landscape.x + landscape.width &&
				playerY >= landscape.y &&
				playerY < landscape.y + landscape.height
			) {
				currentLandscapeId = landscape.landscape;
				break;
			}
		}

		const landscapeId = currentLandscapeId || mapData.defaultLandscape;
		return landscapeDefinitions[landscapeId];
	});

	$: {
		if ($rainEnabled) {
			if ($currentLandscapeDefinition) {
				rainLevel.set($currentLandscapeDefinition.rainLevel || 0);
			}
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
            width: {mapData.width * FINAL_TILE_SIZE}px; 
            height: {mapData.height * FINAL_TILE_SIZE}px;
            transform: translate({mapTranslateX}px, {mapTranslateY}px);
        "
	>
		<div class="map-background" style="background-image: url({mapData.image});"></div>

		<!-- {#each mapData.objects as mapObject (mapObject.type === 'multi_tile_part' ? mapObject.type + mapObject.parentId + mapObject.x + mapObject.y : mapObject.type + (mapObject.npcId || mapObject.resourceId || mapObject.eventId) + mapObject.x + mapObject.y)}
			{#if mapObject.type !== 'multi_tile_entity'}
				<MapObject {mapObject} {FINAL_TILE_SIZE} allObjects={mapData.objects} />
			{/if}
		{/each} -->

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
		/* clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); */
		background-image: url('/topography.svg');
		/* background-size: contain; */
		/* background-blend-mode: multiply; */
	}
	
	.map-world {
		position: relative;
		transition: transform 0.1s linear;
		/* transition: top 0.1s linear, left 0.1s linear; */
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
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0);
		transition: background-color 1s ease;
		pointer-events: none;
		z-index: 3;
	}

	.day-night-overlay.night {
		background-color: rgba(0, 0, 50, 0.3);
	}
</style>
