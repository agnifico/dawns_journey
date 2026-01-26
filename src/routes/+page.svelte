<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store'; // Import get
	import { goto } from '$app/navigation';
	import { playerStore } from '$lib/stores/playerStore';
	import { mapStore } from '$lib/stores/mapStore';
	import * as SaveLoadService from '$lib/services/SaveLoadService';
	import ImageSlideshow from '$lib/components/ImageSlideshow.svelte';
	import { loadMapData } from '$lib/services/MapLoaderService'; // Import the new service

	const groupImages = [
		{ src: '/images/characters/group/g1.png', alt: 'Akari and Nyx' },
		{ src: '/images/characters/group/g2.png', alt: 'Akari and Nyx' },
		// { src: '/images/characters/group/akari,nyx.png', alt: 'Akari and Nyx' },
		// {
		// 	src: '/images/characters/group/claudia,guinevere,cygwin.png',
		// 	alt: 'Claudia, Guinevere, and Cygwin'
		// },
		{ src: '/images/characters/group/main.png', alt: 'Main character' },
		// { src: '/images/characters/group/sylvie,hela,akari-2.png', alt: 'Sylvie, Hela, and Akari' },
		{ src: '/images/characters/group/sylvie,hela,akari-3.png', alt: 'Sylvie, Hela, and Akari' },
		// { src: '/images/characters/group/sylvie,hela,akari.png', alt: 'Sylvie, Hela, and Akari' },
		// {
		// 	src: '/images/characters/group/veres,hanabi,marjane-2.png',
		// 	alt: 'Veres, Hanabi, and Marjane'
		// },
		{ src: '/images/characters/group/veres,hanabi,marjane.png', alt: 'Veres, Hanabi, and Marjane' }
	];
	const slideshowImages = [...groupImages];

	let availableMaps: { id: string; name: string }[] = [];
	let selectedMapId: string = '';

	onMount(() => {
		const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
		availableMaps = Object.keys(mapModules).map((path) => {
			const fileName = path.split('/').pop()?.replace('.json', '') || '';
			return { id: fileName, name: fileName.replace(/_/g, ' ') };
		});
		if (availableMaps.length > 0) {
			selectedMapId = availableMaps[0].id;
		}
		// Load initial map data
		loadMapData(get(mapStore).currentMapId); // Load the map data
	});

	function startNewGame() {
		if (selectedMapId) {
			playerStore.update((p) => ({ ...p, isInitialized: false }));
			mapStore.update((s) => ({ ...s, currentMapId: selectedMapId }));
			goto('/map');
		}
	}

	function continueGame() {
		goto('/map');
	}
</script>

<div class="new-player-view">
	<ImageSlideshow images={slideshowImages} />
	<main class="overlay">
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
					<button on:click={() => goto('/settings')}>Settings</button>
					<button on:click={SaveLoadService.clearSave} class="danger">Delete Save</button>
				</div>
			</div>
		{:else}
			<div class="new-game-setup">
				<!-- <div class="map-selection">
                    <p>Select a map to start:</p>
                    <div class="radio-group">
                        {#each availableMaps as map (map.id)}
                            <label class="radio-label" class:selected={selectedMapId === map.id}>
                                <input type="radio" name="map-select" value={map.id} bind:group={selectedMapId} />
                                {map.name.replace(/\b\w/g, (l) => l.toUpperCase())}
                            </label>
                        {/each}
                    </div>
                </div> -->
				<div class="main-menu">
					<button class="button-large" on:click={startNewGame} disabled={!selectedMapId}
						>New Game</button
					>
					<div class="sub-buttons">
						<button on:click={SaveLoadService.loadGame}>Load Game</button>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.new-player-view {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.overlay {
		position: absolute;
        inset: 0;
		/* height: 100%; */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
	}
    
	main {
        font-family: monospace;
		max-width: 600px;
        height: 50%;
		position: relative;
		margin: auto;
		text-align: center;
		/* padding-top: 50px; */
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 30px;
        box-shadow: rgba(0, 0, 0, 0.5) 10px 10px;
	}
	.hero {
		margin-bottom: 2rem;
	}
	.hero h1 {
		font-family: 'Silkscreen';
		font-weight: 400;
		color: var(--color-orange);
		margin-bottom: 0;
	}
	.hero h2 {
		margin-bottom: 0;
		font-size: 1em;
	}
	.main-menu,
	.new-game-setup {
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
		margin-bottom: 0.5rem;
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
