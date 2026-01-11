<script lang="ts">
    import { page } from '$app/stores';
    import { npcStore } from '$lib/stores/npcStore';
    import { goto } from '$app/navigation';

    let npc = null;
    let currentImageIndex = 0;

    $: {
        const npcId = $page.params.id;
        if (npcId) {
            npc = $npcStore.globalNpcs[npcId];
        }
    }

    function changeImage(direction: number) {
        if (!npc || !npc.galleryImages) return;
        const newIndex = currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < npc.galleryImages.length) {
            currentImageIndex = newIndex;
        }
    }
</script>

<div class="character-journal">
    {#if npc}
        <div class="header">
            <button class="back-button" on:click={() => goto('/journal/character')}>&lt; Back to Gallery</button>
            <h1>{npc.name}</h1>
        </div>
        
        <div class="slideshow-container">
            {#if npc.galleryImages && npc.galleryImages.length > 0}
                <img src={npc.galleryImages[currentImageIndex]} alt="{npc.name} - Image {currentImageIndex + 1}" class="main-image" />
                
                <div class="slideshow-controls">
                    <button on:click={() => changeImage(-1)} disabled={currentImageIndex === 0}>Previous</button>
                    <span>{currentImageIndex + 1} / {npc.galleryImages.length}</span>
                    <button on:click={() => changeImage(1)} disabled={currentImageIndex === npc.galleryImages.length - 1}>Next</button>
                </div>
            {:else}
                <p>No images available for this character.</p>
            {/if}
        </div>

        <div class="character-details">
            <!-- TODO: Add more character details here later, like description, stats, etc. -->
        </div>

    {:else}
        <p>Loading character...</p>
    {/if}
</div>

<style>
    .character-journal {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
        color: white;
        font-family: 'Silkscreen', sans-serif;
    }
    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    .back-button {
        background: #444;
        color: white;
        border: 1px solid #666;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
    h1 {
        margin: 0;
    }
    .slideshow-container {
        text-align: center;
        margin-bottom: 2rem;
    }
    .main-image {
        max-width: 100%;
        max-height: 60vh;
        border: 3px solid white;
        margin-bottom: 1rem;
    }
    .slideshow-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
    .slideshow-controls button {
        background: #555;
        color: white;
        border: 1px solid #777;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
    .slideshow-controls button:disabled {
        background: #333;
        cursor: not-allowed;
    }
</style>