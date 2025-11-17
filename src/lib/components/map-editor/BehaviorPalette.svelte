<script lang="ts">
    import { onMount } from 'svelte';
    import { selectedBehaviorType, activeBrush } from '../../stores/mapEditorStore';
    import oulierIslandMetadata from '../../assets/data/maps/oulier_island_metadata.json';

    let behaviorTypes = {};
    let behaviorColors: { [key: string]: string } = {};

    onMount(() => {
        behaviorTypes = oulierIslandMetadata.behaviorTypes;
        for (const id in behaviorTypes) {
            behaviorColors[id] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        }
    });

    function selectBehaviorType(behaviorTypeId: string) {
        if ($selectedBehaviorType === behaviorTypeId && $activeBrush === 'behavior') {
            selectedBehaviorType.set(null);
            activeBrush.set(null);
        } else {
            selectedBehaviorType.set(behaviorTypeId);
            activeBrush.set('behavior');
        }
    }
</script>

<div class="behavior-palette">
    <h2>Behavior Palette</h2>
    <div class="behaviors">
        {#each Object.keys(behaviorTypes) as id (id)}
            <div
                class="behavior"
                class:active={$selectedBehaviorType === id && $activeBrush === 'behavior'}
                on:click={() => selectBehaviorType(id)}
                style="background-color: {behaviorColors[id]};"
            >
                {id}
            </div>
        {/each}
    </div>
</div>

<style>
    .behavior-palette {
        margin-top: 1em;
    }

    .behaviors {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .behavior {
        padding: 0.5em;
        border: 1px solid #ccc;
        cursor: pointer;
    }

    .behavior.active {
        border: 2px solid blue;
    }
</style>
