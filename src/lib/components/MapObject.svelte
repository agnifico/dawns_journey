<script lang="ts">
	import { npcStore } from '$lib/stores/npcStore';
	import { locationEventDefinitions as locationEvents } from '$lib/data/locationEvents';
	import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';

	export let mapObject: any;
	export let FINAL_TILE_SIZE: number;
	export let allObjects: any[];

	let imageUrl = '';
	let objectName = '';
	let width = 1;
	let height = 1;
	let objectPosition = '0 0';

	$: {
		if (mapObject.type === 'multi_tile_part') {
			const parent = allObjects.find((o) => o.id === mapObject.parentId);
			if (parent) {
				switch (parent.entityType) {
					case 'npc':
						const npc = $npcStore.globalNpcs[parent.npcId];
						if (npc) {
							imageUrl = npc.profileImage;
							objectName = npc.name;
						}
						break;
					case 'resource':
						const resource = resourceNodeDefinitions[parent.resourceId];
						if (resource) {
							imageUrl = resource.image;
							objectName = resource.name;
						}
						break;
					case 'event':
						const eventData = locationEvents[parent.eventId];
						if (eventData) {
							imageUrl = eventData.image;
							objectName = eventData.name;
						}
						break;
				}
				width = parent.width;
				height = parent.height;
				const xOffset = mapObject.x - parent.x;
				const yOffset = mapObject.y - parent.y;

				// This is tricky. The image is scaled to the parent size,
				// and we need to find the top-left corner of the tile
				// within the scaled image.
				const imgWidth = width * FINAL_TILE_SIZE;
				const imgHeight = height * FINAL_TILE_SIZE;

				const left = -(xOffset * FINAL_TILE_SIZE);
				const top = -(yOffset * FINAL_TILE_SIZE);

				objectPosition = `${left}px ${top}px`;
			}
		} else if (mapObject.type === 'multi_tile_entity') {
			const parent = mapObject;
			switch (parent.entityType) {
				case 'npc':
					const npc = $npcStore.globalNpcs[parent.npcId];
					if (npc) {
						imageUrl = npc.profileImage;
						objectName = npc.name;
					}
					break;
				case 'resource':
					const resource = resourceNodeDefinitions[parent.resourceId];
					if (resource) {
						imageUrl = resource.image;
						objectName = resource.name;
					}
					break;
				case 'event':
					const eventData = locationEvents[parent.eventId];
					if (eventData) {
						imageUrl = eventData.image;
						objectName = eventData.name;
					}
					break;
			}
			width = parent.width;
			height = parent.height;
			objectPosition = '0px 0px';
		} else {
			width = mapObject.width || 1;
			height = mapObject.height || 1;
			switch (mapObject.type) {
				case 'npc':
					const npc = $npcStore.globalNpcs[mapObject.npcId];
					if (npc) {
						imageUrl = npc.profileImage;
						objectName = npc.name;
					}
					break;
				case 'resource':
					const resource = resourceNodeDefinitions[mapObject.resourceId];
					if (resource) {
						imageUrl = resource.image;
						objectName = resource.name;
					}
					break;
				case 'event':
					const eventData = locationEvents[mapObject.eventId];
					if (eventData) {
						imageUrl = eventData.image;
						objectName = eventData.name;
					}
					break;
			}
		}
	}
</script>

<div
	class="map-object"
	style="top: {mapObject.y * FINAL_TILE_SIZE}px; left: {mapObject.x *
		FINAL_TILE_SIZE}px; width: {FINAL_TILE_SIZE}px; height: {FINAL_TILE_SIZE}px;"
	title={objectName}
>
	{#if imageUrl}
		<img
			src={imageUrl}
			alt={objectName}
			style="object-position: {objectPosition}; width: {width *
				FINAL_TILE_SIZE}px; height: {height * FINAL_TILE_SIZE}px;"
		/>
	{/if}
</div>

<style>
	.map-object {
		position: absolute;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	img {
		position: absolute;
		max-width: none;
		max-height: none;
		object-fit: none;
		image-rendering: auto;
		border-radius: 6px;
		box-sizing: border-box;
		border: 3px solid white;
		opacity: 0;
	}

	.map-object:hover {
		img {
			opacity: 1;
		}
	}
</style>
