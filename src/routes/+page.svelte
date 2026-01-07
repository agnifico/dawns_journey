<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { playerStore } from '$lib/stores/playerStore';
    import { mapStore } from '$lib/stores/mapStore';
    import * as SaveLoadService from '$lib/services/SaveLoadService';

    let availableMaps: { id: string, name: string }[] = [];
    let selectedMapId: string = '';

    onMount(() => {
        const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
        availableMaps = Object.keys(mapModules).map(path => {
            const fileName = path.split('/').pop()?.replace('.json', '') || '';
            return { id: fileName, name: fileName.replace(/_/g, ' ') };
        });
        if (availableMaps.length > 0) {
            selectedMapId = availableMaps[0].id;
        }
    });

    function startNewGame() {
        if (selectedMapId) {
            playerStore.update(p => ({ ...p, isInitialized: false }));
            mapStore.update(s => ({ ...s, currentMapId: selectedMapId }));
            goto('/map');
        }
    }

    function continueGame() {
        goto('/map');
    }
</script>

<main>
    <div class="hero">
        <h1>Dawn's Journey</h1>
        <h2>A serverless, no database browser based game.</h2>
    </div>

    {#if $playerStore.isInitialized}
        <div class="main-menu">
            <button class="button-large" on:click={continueGame}>Continue Game</button>
            <div class="sub-buttons">
                <button on:click={SaveLoadService.saveGame}>Save Game</button>
                <button on:click={() => goto('/journal')}>Journal</button>
                <button on:click={() => goto('/map-editor')}>Map Editor</button>
                <button on:click={() => goto('/settings')}>Settings</button>
                <button on:click={SaveLoadService.clearSave} class="danger">Delete Save</button>
            </div>
        </div>
    {:else}
        <div class="new-game-setup">
            <div class="map-selection">
                <p>Select a map to start:</p>
                <div class="radio-group">
                    {#each availableMaps as map (map.id)}
                        <label class="radio-label" class:selected={selectedMapId === map.id}>
                            <input type="radio" name="map-select" value={map.id} bind:group={selectedMapId} />
                            {map.name.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                    {/each}
                </div>
            </div>
            <div class="main-menu">
                <button class="button-large" on:click={startNewGame} disabled={!selectedMapId}>New Game</button>
                <div class="sub-buttons">
                    <button on:click={SaveLoadService.loadGame}>Load Game</button>
                </div>
            </div>
        </div>
    {/if}
</main>

<style>
    main {
        font-family: monospace;
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
        padding-top: 50px;
    }
    .hero {
        margin-bottom: 2rem;
    }
    .hero h1 {
        font-family: "Silkscreen";
        font-weight: 400;
        color: var(--color-orange);
        margin-bottom: 0;
    }
    .hero h2 {
        margin-bottom: 0;
        font-size: 1em;
    }
    .main-menu, .new-game-setup {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }
    .button-large {
        padding: 1rem 2rem;
        font-size: 1.5rem;
        font-family: 'Silkscreen';
        background-color: #4caf50;
        color: white;
        border: 2px solid #388e3c;
        border-radius: 5px;
        cursor: pointer;
    }
    .sub-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    .sub-buttons button {
        font-family: 'Silkscreen';
        background-color: #555;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
    }
    .sub-buttons button.danger {
        background-color: #c53030;
    }
    .map-selection p {
        font-size: 1.2em;
        margin-bottom: .5rem;
    }
    .radio-group {
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .radio-label {
        padding: 10px 15px;
        border-radius: 5px;
        background-color: #333;
        color: #fff;
        cursor: pointer;
    }
    .radio-label.selected {
        background-color: #4caf50;
    }
    .radio-label input[type='radio'] {
        display: none;
    }
</style>
