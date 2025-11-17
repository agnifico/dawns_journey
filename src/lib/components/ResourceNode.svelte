<script lang="ts">
    import type { MapEntity } from "../types";
    import { resourceNodeDefinitions } from "../data/resourceNodeDefinitions";

    export let object: MapEntity;
    export let base: string;

    const nodeData = resourceNodeDefinitions[object.typeId];

</script>

<div class="resource-node" style="left: 0; top: 0; z-index: 1;">
    <img src="{base}/{nodeData.image}" alt={nodeData.name} />
</div>

<style>
    .resource-node {
        position: absolute;
        width: 32px;
        height: 32px;
    }
    img {
        width: 100%;
        height: 100%;
    }
</style>
