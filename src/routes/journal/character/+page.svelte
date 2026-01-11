<script lang="ts">
    import { npcStore } from '$lib/stores/npcStore';
    import ElementTag from '$lib/components/ui/ElementTag.svelte';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';

    let npcList = [];

    onMount(async () => {
        // The store is initialized on the main map page. If we navigate here directly,
        // we need to ensure the NPC data is loaded.
        if (Object.keys(get(npcStore).globalNpcs).length === 0) {
            await npcStore.initializeGlobalNpcs();
        }
    });

    // Convert the globalNpcs map to an array for easier looping
    $: {
        npcList = Object.values($npcStore.globalNpcs);
    }

    /**
     * Gets the preferred card image, using a '0.png' if available,
     * otherwise falling back to the main NPC image.
     */
    function getCardImage(npc) {
        const zeroImage = npc.galleryImages?.find(img => img.endsWith('0.png'));
        return zeroImage || npc.image;
    }

</script>

<div class="journal-header">
    <h1>Character Gallery</h1>
</div>

<div class="card-gallery">
    {#each npcList as npc (npc.id)}
        <a href="/journal/character/{npc.id}" class="character-card" style="background-image: url({getCardImage(npc)})">
            <div class="card-footer">
                <div class="element-tags">
                    {#each npc.types || [] as element}
                        <ElementTag {element} />
                    {/each}
                </div>
            </div>
        </a>
    {/each}
</div>

<style>
    .journal-header {
        text-align: center;
        margin: 2rem 0;
        color: white;
        font-family: 'Silkscreen', sans-serif;
    }
    .card-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
    }
    .character-card {
        aspect-ratio: 3 / 4;
        border-radius: 15px;
        border: 3px solid #666;
        background-size: cover;
        background-position: center;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5);
        text-decoration: none;
    }
    .character-card:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 16px rgba(0,0,0,0.7);
        border-color: white;
    }
    .card-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.5rem;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    }
    .element-tags {
        display: flex;
        justify-content: flex-end;
        gap: 0.25rem;
    }
</style>