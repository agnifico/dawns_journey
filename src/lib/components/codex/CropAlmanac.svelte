<script lang="ts">
    import { cropDefinitions } from '$lib/data/cropDefinitions';
    import CodexBrowser from './CodexBrowser.svelte';
    import CropDetail from './CropDetail.svelte';

    // Transform the crop data into the format expected by CodexBrowser
    const formattedCrops = Object.values(cropDefinitions).map(crop => ({
        id: crop.id,
        name: crop.name,
        image: crop.growthStages[crop.growthStages.length - 1].imagePath,
        // Pass the full crop object through for the detail component
        ...crop 
    }));
</script>

<CodexBrowser items={formattedCrops} detailComponent={CropDetail} />

