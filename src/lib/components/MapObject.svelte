<script lang="ts">
    import { npcStore } from '$lib/stores/npcStore';
    import { locationEventDefinitions as locationEvents } from '$lib/data/locationEvents';
    import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';

    export let mapObject: any;
    export let FINAL_TILE_SIZE: number;

    let imageUrl = '';
    let objectName = '';

    $: {
        const top = mapObject.y * FINAL_TILE_SIZE;
        const left = mapObject.x * FINAL_TILE_SIZE;
        
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
</script>

<div 
    class="map-object"
    style="top: {mapObject.y * FINAL_TILE_SIZE}px; left: {mapObject.x * FINAL_TILE_SIZE}px; width: {FINAL_TILE_SIZE}px; height: {FINAL_TILE_SIZE}px;"
    title={objectName}
>
    {#if imageUrl}
        <img src={imageUrl} alt={objectName} />
    {/if}
</div>

<style>
    .map-object {
        position: absolute;
        z-index: 1;
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
    }
</style>