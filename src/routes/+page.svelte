<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store'; // Import get
	import { goto } from '$app/navigation';
	import { playerStore } from '$lib/stores/playerStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { npcStore } from '$lib/stores/npcStore';
	import * as SaveLoadService from '$lib/services/SaveLoadService';
	import ImageSlideshow from '$lib/components/ImageSlideshow.svelte';
	import { loadMapData } from '$lib/services/MapLoaderService'; // Import the new service
	import { profiles } from '$lib/data/profiles';
	import { applyProfile } from '$lib/services/ProfileService';
	import player from '$lib/data/player';
	import NpcViewer from '$lib/components/NpcViewer.svelte';

	const groupImages = [
		{ src: '/images/characters/group/g0.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g1.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g2.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g3.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g4.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g5.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g6.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g7.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g8.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g9.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g10.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g11.png', alt: 'Main Characters' },
		{ src: '/images/characters/group/g12.png', alt: 'Main Characters' },
		// { src: '/images/characters/group/main.png', alt: 'Main character' },
		// { src: '/images/characters/group/sylvie,hela,akari-3.png', alt: 'Sylvie, Hela, and Akari' },
		// { src: '/images/characters/group/veres,hanabi,marjane.png', alt: 'Veres, hanabi, and Marjane' }
	];
	const slideshowImages = [...groupImages];

	let availableMaps: { id: string; name: string }[] = [];
	let selectedMapId: string = '';
	let selectedProfileId: string = 'fresh';

	onMount(() => {
		const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
		availableMaps = Object.keys(mapModules).map((path) => {
			const fileName = path.split('/').pop()?.replace('.json', '') || '';
			return { id: fileName, name: fileName.replace(/_/g, ' ') };
		});
		if (availableMaps.find((map) => map.id === 'dragon_island')) {
			selectedMapId = 'dragon_island';
		} else if (availableMaps.length > 0) {
			selectedMapId = availableMaps[0].id;
		}
		// Load initial map data
		loadMapData(get(mapStore).currentMapId); // Load the map data
	});

	async function startNewGame() {
		if (selectedMapId && selectedProfileId) {
			applyProfile(selectedProfileId);
			mapStore.update((s) => ({ ...s, currentMapId: selectedMapId }));
			await npcStore.initializeGlobalNpcs();
			playerStore.update((p) => ({ ...p, isInitialized: true }));
			goto('/map');
		}
	}

	function continueGame() {
		goto('/map');
	}
</script>

<main class="new-player-view" class:initialized={$playerStore.isInitialized}>
	<!-- <ImageSlideshow images={slideshowImages} /> -->
	<div class="overlay">
		<div class="grid-container">
			<div class="grid-box div1">
				<h1>Dawn's <br />Adventure</h1>
				<p>A serverless, no database browser based game.</p>
			</div>
			<div class="grid-box div2">
				<h3>Select Profile</h3>
				<div class="profile-selector">
					{#each profiles as profile (profile.id)}
						<label class="radio-label" class:selected={selectedProfileId === profile.id}>
							<img class="avatar" src={profile.avatar} alt="" />
							<input
								type="radio"
								name="profile-select"
								value={profile.id}
								bind:group={selectedProfileId}
							/>
							<p>{profile.name}</p>
						</label>
					{/each}
				</div>
			</div>

			<div class="grid-box div5">
				<ImageSlideshow images={slideshowImages} />
			</div>
			<div class="grid-box div4">
				<h3>Game Actions</h3>
				<div class="game-actions">
					{#if $playerStore.isInitialized}
						<button on:click={() => goto('/arena')}>Arena</button>
						<button on:click={() => goto('/crafting')}>Crafting</button>
						<button on:click={() => goto('/homestead/farming')}>Farming</button>
						<button on:click={() => goto('/journal')}>Journal</button>
						<button on:click={() => goto('/shop')}>Shop</button>
						<br>
						<button on:click={SaveLoadService.saveGame} class="save">Save Game</button>
						<button on:click={SaveLoadService.loadGame}>Load Game</button>
						<button on:click={SaveLoadService.clearSave} class="danger">Delete Save</button>
						<button on:click={() => goto('/settings')}>Settings</button>
						<button on:click={() => goto('/secret')}>Vault</button>
						{:else}
						<button on:click={SaveLoadService.loadGame}>Load Game</button>
						<button on:click={() => goto('/secret')}>Vault</button>
						{/if}
				</div>
			</div>
			<div class="grid-box div6">
				{#if $playerStore.isInitialized}
					<button class="start-game-button" on:click={continueGame}>Continue Game</button>
				{:else}
					<button class="start-game-button" on:click={startNewGame} disabled={!selectedMapId}
						>New Game</button
					>
				{/if}
			</div>
			<div class="grid-box div7">
				<NpcViewer />
			</div>
			<div class="grid-box div8"></div>
		</div>

		<!-- <div class="start-game-button-container">
			
		</div> -->
	</div>
</main>

<style>
	/* :root {
		--color-surface-1: #2a2a2a;
		--color-surface-2: #3a3a3a;
		--color-accent: #4caf50;
		--color-secondary: #555;
		--color-orange: #ff9800;
		--color-text: #eee;
		--color-text-muted: #ccc;
		--text-white: #fff;
	} */

	.new-player-view {
		position: relative;
		width: 100%;
		height: 100%;
		margin: auto;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-text);
		overflow: hidden; /* Hide overflow for the cut-in effect */
		background-color: #141414;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
		width: 100%;
		height: 100%;
	}

	.grid-container {
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 1rem;
		width: 90%;
		height: 90%;
		position: relative;
		z-index: 0;
		/* border: 1px solid white; */
	}

	.grid-box {
		background-color: var(--color-surface-2);
		border-radius: 18px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		padding: 1.5rem;
		font-family: var(--font-family-pixel);
		color: var(--color-text);
		box-sizing: border-box;
		width: 100%;
		height: 100%;
	}

	.grid-box h1 {
		font-family: 'Lexend', monospace;
		text-transform: uppercase;
		font-weight: 600;
		color: #e9d9ca;
		margin: 0;
		padding: 0;
		margin-bottom: 2rem;
		font-size: 4rem;
		text-align: left;
		line-height: 3.5rem;
	}

	.grid-box p {
		font-size: 1em;
		/* color: var(--color-text-muted); */
	}

	.grid-box h3 {
		font-family: var(--font-family-pixel);
		/* color: var(--color-accent); */
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2em;
	}

	.profile-selector {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}

	.radio-label {
		border-radius: 5px;
		background-color: #333;
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		flex-direction: column;
		transition: 0.2s ease-in all;
		padding: 0.5rem;
		img {
			filter: saturate(0);
			height: 100px;
			width: 100px;
		}
		&:hover {
			img {
				filter: saturate(0) brightness(1.1);
			}
		}
	}
	.radio-label.selected {
		background-color: hsla(0, 0%, 100%, 0.5);
		img {
			filter: saturate(1);
		}
		p {
			color: #222;
		}
	}
	.radio-label input[type='radio'] {
		display: none;
	}
	.avatar {
		position: relative;
		max-width: 120px;
		max-height: 120px;
		margin-bottom: 8px;
		image-rendering: auto;
	}

	.game-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: .5rem;
	}

	.game-actions button {
		font-family: var(--font-family-pixel);
		background-color: var(--color-secondary);
		color: var(--text-white);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		box-shadow: #00000056 0 -3px 0 3px inset;
		transition: 150ms all ease-in-out;
	}

	.game-actions button:hover {
		transform: translateY(1px);
		box-shadow: #00000056 0 -2px 0 2px inset;
	}

	.game-actions button.danger:hover {
		background-color: #c53030;
	}
	.game-actions button.save {
		background-color: #435e52;
		grid-column: span 2 / span 1;
	}


	.start-game-button {
		font-family: var(--font-family-pixel);
		background-color: transparent;
		color: var(--text-white);
		border: none;
		width: 100%;
		height: 100%;
		padding: 1.5rem 3rem;
		font-size: 1.8em;
		cursor: pointer;
		box-shadow:
			#00000056 0 5px 15px rgba(0, 0, 0, 0.5),
			inset 0 -5px 10px rgba(0, 0, 0, 0.3);
		transition: all 0.2s ease-in-out;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.div1 {
		grid-column: span 2 / span 2;
		grid-row: span 2 / span 2;
		background-color: #435e52;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.div2 {
		grid-column: span 2 / span 2;
		grid-row: span 2 / span 2;
		grid-column-start: 3;
		background-color: #cd804d;
		color: #222;
	}

	.div4 {
		grid-row: span 3 / span 3;
		grid-column-start: 5;
		background-color: #e9d9ca;
		color: #cd804d;
	}

	.div5 {
		grid-column: span 2 / span 2;
		grid-row: span 3 / span 3;
		grid-row-start: 3;
		background-color: #cd804d;
		padding: 0.5rem;
		padding-bottom: 1rem;
		overflow: hidden;
	}

	.div6 {
		padding: 0;
		position: relative;
		grid-column: span 2 / span 2;
		grid-column-start: 3;
		grid-row-start: 3;
		background-color: #435e52;
		&:hover {
			background-color: #34453d;
			transform: translateY(2px);
			box-shadow:
				#00000056 0 8px 20px rgba(0, 0, 0, 0.6),
				inset 0 -7px 12px rgba(0, 0, 0, 0.4);
		}
	}

	.div7 {
		grid-column: span 2 / span 2;
		grid-row: span 2 / span 2;
		grid-column-start: 3;
		grid-row-start: 4;
		background-color: #2e2e2e;
		/* background-color: #e9d9ca; */
	}

	.div8 {
		grid-row: span 2 / span 2;
		grid-column-start: 5;
		grid-row-start: 4;
		background-color: #cd804d;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.grid-container {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(4, 1fr);
			height: 100%;
			width: 100%;
			overflow-y: scroll;
			scroll-snap-type: y mandatory;
			gap: 0; /* Remove gap for scroll-snapped panels */
		}

		.grid-box {
			height: 100vh; /* Each panel takes full viewport height */
			scroll-snap-align: start;
			border-radius: 0; /* No border-radius for full-height panels */
			border: none;
			box-shadow: none;
			padding-top: 100px; /* Adjust for fixed header if any */
			padding-bottom: 100px; /* Adjust for fixed footer if any */
		}

		.start-game-button-container {
			position: fixed;
			bottom: 20px;
			top: auto;
			left: 50%;
			transform: translateX(-50%);
			width: 80%;
			max-width: 300px;
			height: auto;
		}

		.start-game-button {
			width: 100%;
			height: auto;
			border-radius: 10px; /* Make it a rounded rectangle on mobile */
			clip-path: none;
			padding: 1rem 2rem;
			font-size: 1.5em;
		}

		/* Column-reversed for continuing players on mobile */
		.new-player-view.initialized .grid-container {
			flex-direction: column-reverse;
		}
	}
</style>
