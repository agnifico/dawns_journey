<script lang="ts">
    import { cropDefinitions } from '$lib/data/cropDefinitions';
    import { getItemById } from '$lib/services/InventoryService';
    import CodexBrowser from './CodexBrowser.svelte';
    import CropDetail from './CropDetail.svelte';

    // Transform the crop data into the format expected by CodexBrowser
    const formattedCrops = Object.values(cropDefinitions).map(crop => {
        const yieldItem = getItemById(crop.yields);
        return {
            id: crop.id,
            name: crop.name,
            image: yieldItem?.image || '', // Use yield's image, with a fallback
            // Pass the full crop object through for the detail component
            ...crop 
        }
    });
</script>

<CodexBrowser items={formattedCrops} detailComponent={CropDetail} />

