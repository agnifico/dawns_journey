<script lang="ts">
	// MapObject.svelte
	// Renders a single parent entity (npc, resource, or event) at its full tile footprint.
	// Never receives multi_tile_part objects — those are filtered out upstream in MapDisplay.

	import { npcStore } from '$lib/stores/npcStore';
	import { locationEventDefinitions as locationEvents } from '$lib/data/locationEvents';
	import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import NpcSprite from './NpcSprite.svelte';

	export let mapObject: any;
	export let FINAL_TILE_SIZE: number;

	type ResolvedEntity = {
		imageUrl: string;
		name: string;
		isNpc: boolean;
		npcData?: any;
	};

	function resolveEntity(obj: any): ResolvedEntity | null {
		switch (obj.type) {
			case 'npc': {
				const npc = $npcStore.globalNpcs[obj.npcId];
				if (!npc) return null;
				return { imageUrl: npc.spriteGif ?? npc.profileImage, name: npc.name, isNpc: true, npcData: npc };
			}
			case 'resource': {
				const resource = resourceNodeDefinitions[obj.resourceId];
				if (!resource) return null;
				return { imageUrl: resource.image, name: resource.name, isNpc: false };
			}
			case 'event': {
				const event = locationEvents[obj.eventId];
				if (!event) return null;
				return { imageUrl: event.image, name: event.name, isNpc: false };
			}
			default:
				return null;
		}
	}

	$: entity = resolveEntity(mapObject);

	$: footprintW = (mapObject.width  ?? 1) * FINAL_TILE_SIZE;
	$: footprintH = (mapObject.height ?? 1) * FINAL_TILE_SIZE;
	$: posLeft    = mapObject.x * FINAL_TILE_SIZE;
	$: posTop     = mapObject.y * FINAL_TILE_SIZE;
</script>

{#if entity}
	<div
		class="map-entity"
		style="
			left:   {posLeft}px;
			top:    {posTop}px;
			width:  {footprintW}px;
			height: {footprintH}px;
		"
		title={entity.name}
	>
		{#if entity.isNpc && entity.npcData}
			<NpcSprite npc={entity.npcData} {footprintW} {footprintH} />
		{:else}
			<!-- <img
				src={entity.imageUrl}
				alt={entity.name}
				class="entity-img"
				style="width: {footprintW}px; height: {footprintH}px;"
			/> -->
		{/if}
	</div>
{/if}

<style>
	.map-entity {
		position: absolute;
		z-index: 10;
		pointer-events: auto;
		overflow: visible;
	}

	.entity-img {
		display: block;
		image-rendering: pixelated;
		object-fit: cover;
	}
</style>