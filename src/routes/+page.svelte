<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
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
	import NpcViewer from '$lib/components/NpcViewer.svelte';
	import { hideNavbar } from '$lib/stores/uiStore';
	import { modalStore } from '$lib/stores/modalStore';

	// Kept for future use
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
		{ src: '/images/characters/group/g13.png', alt: 'Main Characters' }
	];

	let availableMaps: { id: string; name: string }[] = [];
	let selectedMapId = '';
	let selectedProfileId = 'fresh';

	onMount(() => {
		// hideNavbar.set(true);
		const mapModules = import.meta.glob('$lib/data/maps/final/*.json');
		availableMaps = Object.keys(mapModules).map((path) => {
			const fileName = path.split('/').pop()?.replace('.json', '') || '';
			return { id: fileName, name: fileName.replace(/_/g, ' ') };
		});
		if (availableMaps.find((m) => m.id === 'dragon_island')) {
			selectedMapId = 'dragon_island';
		} else if (availableMaps.length > 0) {
			selectedMapId = availableMaps[0].id;
		}
		loadMapData(get(mapStore).currentMapId);
	});

	// onDestroy(() => hideNavbar.set(false));
	async function startNewGame() {
		if (selectedMapId && selectedProfileId) {
			applyProfile('fresh');
			mapStore.update((s) => ({ ...s, currentMapId: selectedMapId }));
			goto('/map');
		}
	}

	async function exhibitionModeStart() {
		if (selectedMapId) {
			applyProfile('exhibition');
			mapStore.update((s) => ({ ...s, currentMapId: selectedMapId }));
			goto('/map');
		}
	}

	function continueGame() {
		goto('/map');
	}

	function handleSave() {
		modalStore.confirmSave(() => SaveLoadService.saveGame());
	}
	function handleLoad() {
		modalStore.confirmLoad(() => SaveLoadService.loadGame());
	}
	function handleClearSave() {
		modalStore.confirmClearSave(() => SaveLoadService.clearSave());
	}
</script>

<main class="home" class:initialized={$playerStore.isInitialized}>
	<!-- ================================================================
	     DESKTOP LAYOUT
	     ================================================================ -->
	<div class="desktop-only desktop-root">
		<div class="topo-backdrop" aria-hidden="true">
			<img src="/topography.svg" alt="" class="topo-tile" />
			<img src="/topography.svg" alt="" class="topo-tile" />
		</div>
		<div class="topo-scrim" aria-hidden="true" />

		<div class="d-layout">
			<!-- LEFT -->
			<div class="d-left">
				<img class="d-logo" src="/dawns_journey_logo_v1.svg" alt="Dawn's Journey" />

				<div class="d-tagline-block">
					<p class="d-tagline-main">VERSION ALPHA - Out; but only for internal testing. <br> Release date: 29th April.</p>
					<p class="d-tagline-main">A serverless, no database browser based game.</p>
					<p class="d-tagline-sub">
						Fully unlockable. Fully completable. A game with a start and an end — because there's
						genuine peace in that, and we've forgotten what it feels like.
					</p>
				</div>

				<div class="d-cta-stack">
					{#if $playerStore.isInitialized}
						<button class="d-btn primary" on:click={continueGame}>▶ Continue Game</button>
						<div class="d-game-actions">
							<button on:click={() => goto('/arena')}>Arena</button>
							<button on:click={() => goto('/homestead/workshop')}>Workshop</button>
							<button on:click={() => goto('/homestead/farming')}>Farming</button>
							<button on:click={() => goto('/journal')}>Journal</button>
							<button on:click={() => goto('/shop')}>Shop</button>
							<button on:click={() => goto('/inventory')}>Inventory</button>
							<button on:click={() => goto('/settings')}>Settings</button>
						</div>
						<div class="d-save-row">
							<button class="d-save save" on:click={SaveLoadService.saveGame}>Save</button>
							<button class="d-save" on:click={SaveLoadService.loadGame}>Load</button>
							<button class="d-save danger" on:click={SaveLoadService.clearSave}>Delete</button>
						</div>
					{:else}
						<button class="d-btn primary" on:click={startNewGame} disabled={!selectedMapId}>
							▶ New Game
						</button>
						<button
							class="d-btn secondary"
							on:click={exhibitionModeStart}
							disabled={!selectedMapId}
						>
							Exhibition Mode
						</button>
						<p class="d-exh-note">Start with everything unlocked to freely explore the game.</p>
					{/if}
				</div>

				<div class="d-studio">
					<img class="d-studio-logo" src="/Logo_Main.svg" alt="jxnesforge studio" />
					<a href="https://www.junesforge.com/" target="_blank" class="d-studio-link">
						jxnesforge studio
					</a>
					<div class="spacer"></div>
					<!-- <a href="/devs-corner" class="d-studio-link">/ why i built this</a> -->
					<a href="/devs-corner" class="d-studio-link">// my journey + case study</a>
				</div>
			</div>

			<!-- CENTRE -->
			<div class="d-centre">
				<div class="d-video-frame">
					<video autoplay muted loop playsinline controls class="d-video">
						<source src="/videos/video_v1.mp4" type="video/mp4" />
					</video>
					<span class="corner tl" aria-hidden="true" />
					<span class="corner tr" aria-hidden="true" />
					<span class="corner bl" aria-hidden="true" />
					<span class="corner br" aria-hidden="true" />
				</div>
			</div>

			<!-- RIGHT -->
			<div class="d-right">
				<div class="d-npc-card">
					<NpcViewer />
				</div>
			</div>
		</div>
	</div>

	<!-- ================================================================
	     MOBILE LAYOUT
	     ================================================================ -->
	<div class="mobile-only mobile-root">
		<!-- SECTION 1: Hero — video background, logo, tagline, CTAs -->
		<section class="m-section m-hero">
			<div class="m-hero-bg">
				<video autoplay muted loop playsinline class="m-hero-video">
					<source src="/videos/video_v1.mp4" type="video/mp4" />
				</video>
			</div>
			<div class="m-hero-scrim" />

			<div class="m-hero-inner">
				<img class="m-logo" src="/dawns_journey_logo_v1.svg" alt="Dawn's Journey" />

				<!-- <div class="m-tagline-block">
					<p class="m-tagline-main">A serverless, no database browser based game.</p>
					<p class="m-tagline-sub">
						Fully unlockable. Fully completable. A game with a start and an end — because there's
						genuine peace in that, and we've forgotten what it feels like.
					</p>
				</div> -->

				<!-- CTAs -->
				<div class="m-cta-block">
					{#if $playerStore.isInitialized}
						<button class="m-cta-primary" on:click={continueGame}>▶ Continue Game</button>
						<button class="m-cta-secondary" on:click={SaveLoadService.loadGame}>Load Save</button>
					{:else}
						<div class="m-new-game-block">
							<!-- <span class="m-eyebrow">Starting Mode</span> -->
							<!-- <div class="m-profile-row">
								{#each profiles as profile (profile.id)}
									<label class="m-radio-label" class:selected={selectedProfileId === profile.id}>
										<span>{profile.name}</span>
										<input
											type="radio"
											name="m-profile-select"
											value={profile.id}
											bind:group={selectedProfileId}
										/>
									</label>
								{/each}
							</div> -->
							<!-- <p class="m-profile-desc">
								{profiles.find((p) => p.id === selectedProfileId).description}
							</p> -->
							<button class="m-cta-primary" on:click={startNewGame} disabled={!selectedMapId}>
								▶ New Game
							</button>
							<button
								class="m-cta-secondary"
								on:click={exhibitionModeStart}
								disabled={!selectedMapId}
							>
								Exhibition Mode
							</button>
						</div>
					{/if}
				</div>

				<div class="m-studio">
					<img src="/Logo_Main.svg" alt="jxnesforge" class="m-studio-logo" />
					<a href="https://www.junesforge.com/" target="_blank" class="m-studio-link"
						>jxnesforge studio</a
					>
				</div>
			</div>

			<div class="m-scroll-hint">↓</div>
		</section>

		<!-- SECTION 2: NPC showcase — full bleed, no wrapper box -->
		<section class="m-section m-characters">
			<!-- Top fade so it blends from the hero section -->
			<div class="m-characters-scrim-top" />
			<div class="m-npc-viewer">
				<NpcViewer />
			</div>
		</section>

		<!-- SECTION 3: Game actions (only when initialized) -->
		{#if $playerStore.isInitialized}
			<section class="m-section m-actions">
				<p class="m-eyebrow">Game Actions</p>
				<div class="m-actions-grid">
					<button class="m-action-btn" on:click={() => goto('/map')}>🗺 Map</button>
					<button class="m-action-btn" on:click={() => goto('/arena')}>⚔ Arena</button>
					<button class="m-action-btn" on:click={() => goto('/homestead/workshop')}
						>🔨 Workshop</button
					>
					<button class="m-action-btn" on:click={() => goto('/homestead/farming')}
						>🌱 Farming</button
					>
					<button class="m-action-btn" on:click={() => goto('/journal')}>📖 Journal</button>
					<button class="m-action-btn" on:click={() => goto('/shop')}>🏪 Shop</button>
					<button class="m-action-btn" on:click={() => goto('/settings')}>⚙ Settings</button>
				</div>
				<div class="m-save-row">
					<button class="m-save-btn save" on:click={handleSave}>💾 Save</button>
					<button class="m-save-btn" on:click={handleLoad}>📂 Load</button>
					<button class="m-save-btn danger" on:click={handleClearSave}>🗑 Delete</button>
				</div>
			</section>
		{/if}
	</div>
</main>

<style>
	/* ================================================================
	   SHARED
	   ================================================================ */
	.home {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		/* background: #0e0e0e; */
		overflow: hidden;
	}

	/* Corner accents — shared between desktop video and mobile video */
	.corner {
		position: absolute;
		width: 14px;
		height: 14px;
		border-color: rgba(200, 169, 110, 0.55);
		border-style: solid;
		pointer-events: none;
		z-index: 2;
	}
	.corner.tl {
		top: 6px;
		left: 6px;
		border-width: 2px 0 0 2px;
		border-radius: 2px 0 0 0;
	}
	.corner.tr {
		top: 6px;
		right: 6px;
		border-width: 2px 2px 0 0;
		border-radius: 0 2px 0 0;
	}
	.corner.bl {
		bottom: 6px;
		left: 6px;
		border-width: 0 0 2px 2px;
		border-radius: 0 0 0 2px;
	}
	.corner.br {
		bottom: 6px;
		right: 6px;
		border-width: 0 2px 2px 0;
		border-radius: 0 0 2px 0;
	}

	/* ================================================================
	   DESKTOP
	   ================================================================ */
	.desktop-only {
		display: flex;
	}
	.mobile-only {
		display: none;
	}

	@media (max-width: 768px) {
		.desktop-only {
			display: none;
		}
		.mobile-only {
			display: flex;
		}
	}

	.desktop-root {
		position: relative;
		width: 100%;
		height: 100%;
		flex-direction: column;
		overflow: hidden;
	}

	.topo-backdrop {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: row;
		animation: topoScroll 90s linear infinite;
		pointer-events: none;
		z-index: 0;
		width: 200%;
		height: 100%;
	}

	.topo-tile {
		width: 50%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		opacity: 0.055;
		filter: invert(1) sepia(0.3) hue-rotate(60deg);
		flex-shrink: 0;
	}

	@keyframes topoScroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	.topo-scrim {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			radial-gradient(ellipse 60% 80% at 50% 50%, transparent 0%, rgba(14, 14, 14, 0.5) 100%),
			linear-gradient(
				to right,
				rgba(14, 14, 14, 0.88) 0%,
				rgba(14, 14, 14, 0.3) 25%,
				rgba(14, 14, 14, 0.1) 50%,
				rgba(14, 14, 14, 0.3) 75%,
				rgba(14, 14, 14, 0.88) 100%
			),
			linear-gradient(
				to bottom,
				rgba(14, 14, 14, 0.7) 0%,
				transparent 12%,
				transparent 88%,
				rgba(14, 14, 14, 0.7) 100%
			);
		pointer-events: none;
	}

	.d-layout {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 1fr minmax(0, 320px) 1fr;
		gap: 0;
		align-items: center;
		padding: 2rem 2.5rem;
		box-sizing: border-box;
		max-width: 1400px;
		margin: 0 auto;
	}

	.d-left {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-right: 2.5rem;
		height: 100%;
		justify-content: center;
	}

	.d-logo {
		width: 100%;
		height: auto;
		margin-top: 50px;
	}

	.d-tagline-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.d-tagline-main {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.85rem;
		color: #c8b89a;
		margin: 0;
		line-height: 1.5;
	}

	.d-tagline-sub {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #6a5a44;
		margin: 0;
		line-height: 1.7;
	}

	.d-cta-stack {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.d-btn {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.9rem;
		letter-spacing: 0.06em;
		border-radius: 8px;
		cursor: pointer;
		padding: 0.75rem 1.25rem 1rem;
		border: 2px solid transparent;
		box-shadow: rgba(0, 0, 0, 0.5) 0 -4px 0 0 inset;
		transition: 0.12s all ease-in;
		width: 100%;
	}
	.d-btn:hover:not(:disabled) {
		padding-bottom: 0.75rem;
		box-shadow: rgba(0, 0, 0, 0.5) 0 -1px 0 0 inset;
	}
	.d-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: none;
		padding-bottom: 0.75rem;
	}
	.d-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.d-btn.primary {
		background: #435e52;
		color: #e9d9ca;
		border-color: rgba(0, 0, 0, 0.35);
	}
	.d-btn.primary:hover:not(:disabled) {
		background: #4e6e60;
	}
	.d-btn.secondary {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.55);
		border-color: rgba(255, 255, 255, 0.09);
		box-shadow: rgba(0, 0, 0, 0.4) 0 -3px 0 0 inset;
		font-size: 0.8rem;
	}
	.d-btn.secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.8);
	}

	.d-exh-note {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #3a3a2a;
		margin: 0;
		line-height: 1.6;
	}

	.d-game-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
	}
	.d-game-actions button {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 6px;
		padding: 0.5rem 0.75rem 0.7rem;
		cursor: pointer;
		box-shadow: rgba(0, 0, 0, 0.4) 0 -2px 0 0 inset;
		transition: 0.1s all ease-in;
		text-align: left;
	}
	.d-game-actions button:hover {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
		padding-bottom: 0.5rem;
		box-shadow: none;
	}
	.d-game-actions button:active {
		transform: translateY(1px);
	}

	.d-save-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 5px;
	}
	.d-save {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 6px;
		padding: 0.45rem 0.5rem 0.65rem;
		cursor: pointer;
		box-shadow: rgba(0, 0, 0, 0.4) 0 -2px 0 0 inset;
		transition: 0.1s all ease-in;
	}
	.d-save.save {
		background: rgba(67, 94, 82, 0.35);
		color: #8acc8a;
		border-color: rgba(67, 94, 82, 0.35);
	}
	.d-save.danger {
		color: #c07070;
	}
	.d-save:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
	}
	.d-save.save:hover {
		background: rgba(67, 94, 82, 0.55);
	}
	.d-save.danger:hover {
		background: rgba(160, 50, 50, 0.3);
		color: #f09090;
	}
	.d-save:active {
		transform: translateY(1px);
		box-shadow: none;
	}

	.d-studio {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: auto;
		padding-top: 0.5rem;
	}
	.d-studio-logo {
		width: 28px;
		height: 28px;
		opacity: 0.5;
	}
	.d-studio-logo:hover {
		opacity: 1;
		cursor: pointer;
	}
	.d-studio-link {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #3a3a2a;
		text-decoration: none;
		transition: color 0.15s;
	}
	.d-studio-link:hover {
		color: #8a7a5a;
	}
	.spacer {
		flex-grow: 1;
	}

	.d-centre {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 1.5rem 0.5rem;
		box-sizing: border-box;
	}

	.d-video-frame {
		position: relative;
		width: 100%;
		max-width: 300px;
		border-radius: 16px;
		overflow: hidden;
		border: 2px solid rgba(200, 169, 110, 0.2);
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.6),
			0 0 40px rgba(200, 169, 110, 0.06),
			0 24px 60px rgba(0, 0, 0, 0.7),
			rgba(0, 0, 0, 0.5) 0 -6px 0 0 inset;
	}

	.d-video {
		display: block;
		width: 100%;
		height: auto;
		max-height: calc(100vh - 6rem);
		object-fit: contain;
		background: #000;
	}

	.d-right {
		display: flex;
		flex-direction: column;
		padding-left: 2.5rem;
		height: 100%;
		justify-content: center;
	}

	.d-npc-card {
		width: 100%;
		height: calc(100vh - 4rem);
		max-height: 620px;
		min-height: 360px;
		overflow: hidden;
	}

	/* ================================================================
	   MOBILE
	   ================================================================ */
	.mobile-root {
		position: relative;
		width: 100%;
		height: 100%;
		flex-direction: column;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* Topo backdrop — fixed so it covers all sections as user scrolls */
	.m-topo-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: row;
		animation: topoScroll 90s linear infinite;
		pointer-events: none;
		z-index: 0;
		width: 200%;
		height: 100%;
	}

	.m-topo-tile {
		width: 50%;
		height: 100%;
		object-fit: cover;
		opacity: 0.04;
		filter: invert(1) sepia(0.3) hue-rotate(60deg);
		flex-shrink: 0;
	}

	/* ── Section base ── */
	.m-section {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}

	/* ── HERO ── */
	.m-hero {
		min-height: 100svh;
		padding: 0;
	}

	.m-hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	.m-hero-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.m-hero-scrim {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.15) 0%,
			rgba(0, 0, 0, 0.2) 40%,
			rgba(14, 14, 14, 0.88) 72%,
			rgba(14, 14, 14, 0.98) 100%
		);
		pointer-events: none;
	}

	.m-hero-inner {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem 1.5rem 4rem;
		/* Push studio link to bottom */
		min-height: 100svh;
		box-sizing: border-box;
	}

	.m-logo {
		width: min(280px, 80%);
		height: auto;
		margin-top: 1rem;
	}

	.m-tagline-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: center;
	}

	.m-tagline-main {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.85rem;
		color: #c8b89a;
		margin: 0;
		line-height: 1.5;
	}

	.m-tagline-sub {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #5a4a34;
		margin: 0;
		line-height: 1.7;
	}

	/* Video — centred portrait card, natural ratio */
	.m-video-frame {
		position: relative;
		width: min(260px, 70vw);
		border-radius: 14px;
		overflow: hidden;
		border: 2px solid rgba(200, 169, 110, 0.2);
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(200, 169, 110, 0.06),
			0 16px 40px rgba(0, 0, 0, 0.7),
			rgba(0, 0, 0, 0.5) 0 -5px 0 0 inset;
		flex-shrink: 0;
	}

	.m-video {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
		background: #000;
	}

	/* CTAs */
	.m-cta-block {
		margin-top: auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		/* border: 1px solid white; */
	}

	.m-new-game-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.m-eyebrow {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #cd804d;
		margin: 0;
	}

	.m-profile-row {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 4px;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}
	.m-profile-row::-webkit-scrollbar {
		display: none;
	}
	.m-profile-desc {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #7a6a54;
		margin: 0;
		line-height: 1.5;
	}

	.m-radio-label {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 8px 12px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.18s ease;
	}
	.m-radio-label span {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
	}
	.m-radio-label input {
		display: none;
	}
	.m-radio-label.selected {
		background: rgba(205, 128, 77, 0.2);
		border-color: #cd804d;
	}
	.m-radio-label.selected span {
		color: #cd804d;
	}

	.m-cta-primary {
		font-family: var(--font-family-pixel, monospace);
		font-size: 1rem;
		background: #435e52;
		color: #e9d9ca;
		border: none;
		border-radius: 10px;
		padding: 1rem 1.5rem;
		cursor: pointer;
		width: 100%;
		box-shadow:
			rgba(0, 0, 0, 0.35) 0 -4px 0 3px inset,
			0 4px 20px rgba(0, 0, 0, 0.4);
		transition: 150ms all ease-in-out;
		letter-spacing: 0.05em;
	}
	.m-cta-primary:active {
		transform: translateY(3px);
		box-shadow: rgba(0, 0, 0, 0.35) 0 -1px 0 2px inset;
	}
	.m-cta-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.m-cta-secondary {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.85rem;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		cursor: pointer;
		width: 100%;
		box-shadow: rgba(0, 0, 0, 0.35) 0 -3px 0 0 inset;
		transition: 150ms all ease-in-out;
	}
	.m-cta-secondary:active {
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(2px);
	}
	.m-cta-secondary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Studio footer */
	.m-studio {
		display: flex;
		align-items: center;
		gap: 8px;
		/* margin-top: auto; */
	}
	.m-studio-logo {
		width: 22px;
		height: 22px;
		opacity: 0.35;
	}
	.m-studio-link {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #3a3020;
		text-decoration: none;
	}

	.m-scroll-hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.2);
		animation: bounce 2s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(6px);
		}
	}

	/* ── CHARACTERS ── */
	.m-characters {
		/* Tall enough for the NpcViewer bleed art to shine */
		min-height: 80svh;
		overflow: hidden;
	}

	/* Soft top fade so the section transition from hero feels seamless */
	.m-characters-scrim-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(to bottom, #0e0e0e, transparent);
		z-index: 2;
		pointer-events: none;
	}

	/* No box, no border — NpcViewer fills this entirely */
	.m-npc-viewer {
		width: 100%;
		height: 100%;
		min-height: 80svh;
	}

	/* ── ACTIONS ── */
	.m-actions {
		min-height: 100svh;
		padding: 3rem 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		justify-content: center;
		background: rgba(14, 14, 14, 0.85);
	}

	.m-actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}

	.m-action-btn {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.85rem;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		padding: 1rem 0.75rem;
		cursor: pointer;
		box-shadow: rgba(0, 0, 0, 0.5) 0 -3px 0 3px inset;
		transition: 150ms all ease-in-out;
		text-align: left;
		min-height: 52px;
	}
	.m-action-btn:active {
		transform: translateY(2px);
		box-shadow: rgba(0, 0, 0, 0.5) 0 -1px 0 2px inset;
	}

	.m-save-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 0.6rem;
	}

	.m-save-btn {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 8px;
		padding: 0.75rem 0.5rem;
		cursor: pointer;
		box-shadow: rgba(0, 0, 0, 0.4) 0 -2px 0 2px inset;
		transition: 150ms all ease-in-out;
	}
	.m-save-btn.save {
		background: rgba(67, 94, 82, 0.35);
		color: #8acc8a;
		border-color: rgba(67, 94, 82, 0.3);
	}
	.m-save-btn.danger {
		color: #c07070;
	}
	.m-save-btn.danger:active {
		background: rgba(160, 50, 50, 0.3);
	}
	.m-save-btn:active {
		transform: translateY(2px);
	}
</style>
