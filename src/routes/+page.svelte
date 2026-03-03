<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { playerStore } from '$lib/stores/playerStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { npcStore } from '$lib/stores/npcStore';
	import * as SaveLoadService from '$lib/services/SaveLoadService';
	import ImageSlideshow from '$lib/components/ImageSlideshow.svelte';
	import { loadMapData } from '$lib/services/MapLoaderService';
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
		{ src: '/images/characters/group/g13.png', alt: 'Main Characters' },
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
		loadMapData(get(mapStore).currentMapId);
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

	<!-- ============================================================
	     DESKTOP LAYOUT (unchanged)
	     ============================================================ -->
	<div class="overlay desktop-only">
		<div class="grid-container">
			<div class="grid-box div1">
				<h1>Dawn's <br />Adventure</h1>
				<p>A serverless, no database browser based game.</p>
			</div>
			<div class="grid-box div2">
				<h3>Starting Profile</h3>
				<div class="profile-selector">
					{#each profiles as profile (profile.id)}
						<label class="radio-label" class:selected={selectedProfileId === profile.id}>
							<img class="avatar" src={profile.avatar} alt="" />
							<input type="radio" name="profile-select" value={profile.id} bind:group={selectedProfileId} />
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
						<button on:click={() => goto('/homestead/workshop')}>Workshop</button>
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
					{/if}
				</div>
			</div>
			<div class="grid-box div6">
				{#if $playerStore.isInitialized}
					<button class="start-game-button" on:click={continueGame}>Continue Game</button>
				{:else}
					<button class="start-game-button" on:click={startNewGame} disabled={!selectedMapId}>New Game</button>
				{/if}
			</div>
			<div class="grid-box div7">
				<NpcViewer />
			</div>
			<div class="grid-box div8"></div>
		</div>
	</div>

	<!-- ============================================================
	     MOBILE LAYOUT
	     ============================================================ -->
	<div class="mobile-only mobile-root">

		<!-- SECTION 1: Hero — full bleed slideshow + title + primary CTA -->
		<section class="m-section m-hero">
			<!-- Slideshow bleeds as background -->
			<div class="m-hero-bg">
				<ImageSlideshow images={slideshowImages} />
			</div>
			<!-- Gradient scrim so text is readable -->
			<div class="m-hero-scrim"></div>

			<div class="m-hero-content">
				<div class="m-title-block">
					<h1>Dawn's<br />Adventure</h1>
					<p>A serverless browser RPG.</p>
				</div>

				{#if $playerStore.isInitialized}
					<button class="m-cta-primary" on:click={continueGame}>
						▶ Continue Game
					</button>
					<button class="m-cta-secondary" on:click={SaveLoadService.loadGame}>
						Load Save
					</button>
				{:else}
					<div class="m-new-game-block">
						<!-- Profile selector: horizontal scroll row -->
						<p class="m-section-label">Choose your profile</p>
						<div class="m-profile-row">
							{#each profiles as profile (profile.id)}
								<label class="m-radio-label" class:selected={selectedProfileId === profile.id}>
									<img src={profile.avatar} alt={profile.name} />
									<span>{profile.name}</span>
									<input type="radio" name="m-profile-select" value={profile.id} bind:group={selectedProfileId} />
								</label>
							{/each}
						</div>
						<p class="m-profile-desc">
							{profiles.find((p) => p.id === selectedProfileId).description}
						</p>
						<button class="m-cta-primary" on:click={startNewGame} disabled={!selectedMapId}>
							▶ New Game
						</button>
					</div>
				{/if}
			</div>

			<!-- Scroll hint -->
			<div class="m-scroll-hint">↓</div>
		</section>

		<!-- SECTION 2: Game Actions -->
		{#if $playerStore.isInitialized}
			<section class="m-section m-actions">
				<p class="m-section-label">Game Actions</p>
				<div class="m-actions-grid">
					<button class="m-action-btn" on:click={() => goto('/map')}>🗺 Map</button>
					<button class="m-action-btn" on:click={() => goto('/arena')}>⚔ Arena</button>
					<button class="m-action-btn" on:click={() => goto('/homestead/workshop')}>🔨 Workshop</button>
					<button class="m-action-btn" on:click={() => goto('/homestead/farming')}>🌱 Farming</button>
					<button class="m-action-btn" on:click={() => goto('/journal')}>📖 Journal</button>
					<button class="m-action-btn" on:click={() => goto('/shop')}>🏪 Shop</button>
					<button class="m-action-btn" on:click={() => goto('/settings')}>⚙ Settings</button>
					<button class="m-action-btn" on:click={() => goto('/secret')}>🔒 Vault</button>
				</div>
				<div class="m-save-row">
					<button class="m-save-btn save" on:click={SaveLoadService.saveGame}>💾 Save Game</button>
					<button class="m-save-btn" on:click={SaveLoadService.loadGame}>📂 Load</button>
					<button class="m-save-btn danger" on:click={SaveLoadService.clearSave}>🗑 Delete</button>
				</div>
			</section>
		{/if}

		<!-- SECTION 3: Characters -->
		<section class="m-section m-characters">
			<p class="m-section-label">Characters</p>
			<div class="m-npc-wrapper">
				<NpcViewer />
			</div>
		</section>

	</div>
</main>

<style>
	/* ============================================================
	   SHARED
	   ============================================================ */
	.new-player-view {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-text);
		overflow: hidden;
		background-color: #141414;
	}

	/* ============================================================
	   DESKTOP (unchanged)
	   ============================================================ */
	.mobile-only  { display: none; }
	.desktop-only { display: flex; width: 100%; height: 100%; }

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
		z-index: 0;
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

	.grid-box p { font-size: 1em; }

	.grid-box h3 {
		font-family: var(--font-family-pixel);
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.2em;
	}

	.profile-selector {
		display: flex;
		/* flex-direction: column; */
		flex-wrap: wrap;
		gap: 10px;
	}

	.radio-label {
		border-radius: 5px;
		background-color: #333;
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		/* flex-direction: column; */
		transition: 0.2s ease-in all;
		padding: 0.5rem;
		width: fit-content;
	}
	.radio-label img { filter: saturate(0); height: 50px; width: 50px; }
	.radio-label:hover img { filter: saturate(0) brightness(1.1); }
	.radio-label.selected { background-color: hsla(0, 0%, 100%, 0.5); }
	.radio-label.selected img { filter: saturate(1); }
	.radio-label.selected p { color: #222; }
	.radio-label input[type='radio'] { display: none; }

	.avatar { position: relative; max-width: 120px; max-height: 120px; margin-right:.5rem; image-rendering: auto; }

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
	.game-actions button:hover { transform: translateY(1px); box-shadow: #00000056 0 -2px 0 2px inset; }
	.game-actions button.danger:hover { background-color: #c53030; }
	.game-actions button.save {
		background-color: #435e52;
		grid-column: span 2 / span 1;
	}

	.start-game-button {
		font-family: var(--font-family-pixel);
		background-color: transparent;
		color: var(--text-white);
		border: none;
		width: 100%; height: 100%;
		padding: 1.5rem 3rem;
		font-size: 1.8em;
		cursor: pointer;
		box-shadow: #00000056 0 5px 15px rgba(0,0,0,0.5), inset 0 -5px 10px rgba(0,0,0,0.3);
		transition: all 0.2s ease-in-out;
		display: flex; align-items: center; justify-content: center;
		text-align: center;
		text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
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
		/* overflow: scroll; */
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
	}
	.div6:hover {
		background-color: #34453d;
		transform: translateY(2px);
		box-shadow: #00000056 0 8px 20px rgba(0,0,0,0.6), inset 0 -7px 12px rgba(0,0,0,0.4);
	}
	.div7 {
		grid-column: span 2 / span 2;
		grid-row: span 2 / span 2;
		grid-column-start: 3;
		grid-row-start: 4;
		background-color: #2e2e2e;
	}
	.div8 {
		grid-row: span 2 / span 2;
		grid-column-start: 5;
		grid-row-start: 4;
		background-color: #cd804d;
	}

	/* ============================================================
	   MOBILE
	   ============================================================ */
	@media (max-width: 768px) {
		.desktop-only { display: none !important; }
		.mobile-only  { display: flex; }

		.new-player-view {
			overflow-y: auto;
			align-items: stretch;
			justify-content: flex-start;
		}

		/* ---- Root ---- */
		.mobile-root {
			flex-direction: column;
			width: 100%;
			min-height: 100%;
			overflow-y: auto;
			scroll-snap-type: y mandatory;
			-webkit-overflow-scrolling: touch;
		}

		/* ---- Sections ---- */
		.m-section {
			scroll-snap-align: start;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 100%;
		}

		/* ---- HERO ---- */
		.m-hero {
			position: relative;
			min-height: 100svh;
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			overflow: hidden;
		}

		/* Slideshow fills entire hero */
		.m-hero-bg {
			position: absolute;
			inset: 0;
			z-index: 0;
		}

		/* Strip slideshow of any internal padding/border for full bleed */
		.m-hero-bg :global(*) {
			width: 100% !important;
			height: 100% !important;
			border-radius: 0 !important;
			border: none !important;
			object-fit: cover !important;
		}

		/* Gradient scrim — heavy at bottom where text sits */
		.m-hero-scrim {
			position: absolute;
			inset: 0;
			z-index: 1;
			background: linear-gradient(
				to bottom,
				rgba(0,0,0,0.1) 0%,
				rgba(0,0,0,0.2) 40%,
				rgba(20,20,20,0.85) 70%,
				rgba(20,20,20,0.97) 100%
			);
		}

		.m-hero-content {
			position: relative;
			z-index: 2;
			padding: 2rem 1.5rem 5rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.m-title-block h1 {
			font-family: 'Lexend', monospace;
			font-size: 3.2rem;
			font-weight: 700;
			text-transform: uppercase;
			line-height: 1;
			color: #e9d9ca;
			margin: 0 0 0.25rem;
			text-shadow: 0 2px 20px rgba(0,0,0,0.8);
		}

		.m-title-block p {
			font-family: var(--font-family-pixel);
			font-size: 0.7rem;
			color: rgba(255,255,255,0.5);
			margin: 0;
			letter-spacing: 0.05em;
		}

		/* Profile selector — horizontal scroll */
		.m-new-game-block {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}

		.m-section-label {
			font-family: var(--font-family-pixel);
			font-size: 0.6rem;
			letter-spacing: 0.15em;
			text-transform: uppercase;
			color: #cd804d;
			margin: 0;
		}

		.m-profile-row {
			display: flex;
			gap: 10px;
			overflow-x: auto;
			padding-bottom: 4px;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
		}
		.m-profile-desc{
			font-family: var(--font-family-pixel);
			font-size: 0.75rem;
		}
		.m-profile-row::-webkit-scrollbar { display: none; }

		.m-radio-label {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 5px;
			padding: 8px;
			border-radius: 10px;
			background: rgba(255,255,255,0.07);
			border: 2px solid transparent;
			cursor: pointer;
			transition: all 0.18s ease;
		}
		.m-radio-label img {
			width: 72px;
			height: 72px;
			object-fit: cover;
			border-radius: 6px;
			filter: saturate(0) brightness(0.8);
		}
		.m-radio-label span {
			font-family: var(--font-family-pixel);
			font-size: 0.6rem;
			color: rgba(255,255,255,0.5);
		}
		.m-radio-label input { display: none; }
		.m-radio-label.selected {
			background: rgba(205, 128, 77, 0.25);
			border-color: #cd804d;
		}
		.m-radio-label.selected img {
			filter: saturate(1) brightness(1);
		}
		.m-radio-label.selected span {
			color: #cd804d;
		}

		/* CTAs */
		.m-cta-primary {
			font-family: var(--font-family-pixel);
			font-size: 1rem;
			background-color: #435e52;
			color: #e9d9ca;
			border: none;
			border-radius: 10px;
			padding: 1rem 1.5rem;
			cursor: pointer;
			width: 100%;
			box-shadow: #00000056 0 -4px 0 3px inset, 0 4px 20px rgba(0,0,0,0.4);
			transition: 150ms all ease-in-out;
			letter-spacing: 0.05em;
		}
		.m-cta-primary:active { transform: translateY(3px); box-shadow: #00000056 0 -1px 0 2px inset; }
		.m-cta-primary:disabled { opacity: 0.4; cursor: not-allowed; }

		.m-cta-secondary {
			font-family: var(--font-family-pixel);
			font-size: 0.75rem;
			background: rgba(255,255,255,0.07);
			color: rgba(255,255,255,0.6);
			border: 1px solid rgba(255,255,255,0.12);
			border-radius: 8px;
			padding: 0.6rem 1rem;
			cursor: pointer;
			width: 100%;
			transition: 150ms all ease-in-out;
		}
		.m-cta-secondary:active { background: rgba(255,255,255,0.12); }

		/* Scroll hint */
		.m-scroll-hint {
			position: absolute;
			bottom: 1.5rem;
			left: 50%;
			transform: translateX(-50%);
			z-index: 2;
			font-size: 1.2rem;
			color: rgba(255,255,255,0.3);
			animation: bounce 2s ease-in-out infinite;
		}

		@keyframes bounce {
			0%, 100% { transform: translateX(-50%) translateY(0); }
			50%       { transform: translateX(-50%) translateY(6px); }
		}

		/* ---- ACTIONS ---- */
		.m-actions {
			min-height: 100svh;
			background-color: #1a1a1a;
			padding: 3rem 1.5rem 2rem;
			display: flex;
			flex-direction: column;
			gap: 1.25rem;
			justify-content: center;
		}

		.m-actions-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.6rem;
		}

		.m-action-btn {
			font-family: var(--font-family-pixel);
			font-size: 0.75rem;
			background-color: var(--color-secondary, #3a3a3a);
			color: var(--text-white, #fff);
			border: none;
			border-radius: 10px;
			padding: 1rem 0.75rem;
			cursor: pointer;
			box-shadow: #00000056 0 -3px 0 3px inset;
			transition: 150ms all ease-in-out;
			text-align: left;
			min-height: 52px;
		}
		.m-action-btn:active { transform: translateY(2px); box-shadow: #00000056 0 -1px 0 2px inset; }

		.m-save-row {
			display: grid;
			grid-template-columns: 2fr 1fr 1fr;
			gap: 0.6rem;
		}

		.m-save-btn {
			font-family: var(--font-family-pixel);
			font-size: 0.65rem;
			background-color: var(--color-secondary, #3a3a3a);
			color: var(--text-white, #fff);
			border: none;
			border-radius: 8px;
			padding: 0.75rem 0.5rem;
			cursor: pointer;
			box-shadow: #00000056 0 -2px 0 2px inset;
			transition: 150ms all ease-in-out;
		}
		.m-save-btn.save { background-color: #435e52; }
		.m-save-btn.danger:active { background-color: #c53030; }
		.m-save-btn:active { transform: translateY(2px); }

		/* ---- CHARACTERS ---- */
		.m-characters {
			min-height: 40svh;
			background-color: #141414;
			padding: 2rem 1.5rem 3rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.m-npc-wrapper {
			flex: 1;
			min-height: 160px;
			background-color: #2e2e2e;
			border-radius: 14px;
			border: 3px solid #00000056;
			box-shadow: #00000056 0 -4px 0 0 inset;
			overflow: hidden;
		}
	}
</style>