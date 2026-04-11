<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { npcStore, getNpcData } from '$lib/stores/npcStore';
	import type { NPC } from '$lib/types';
	import ElementTag from './ui/ElementTag.svelte';

	let npcIds: string[] = [];
	let currentIndex = 0;
	let currentNpc: NPC | null = null;
	let transitioning = false;
	let direction: 'left' | 'right' = 'right';

	onMount(async () => {
		await npcStore.initializeGlobalNpcs();
		const npcs = get(npcStore).globalNpcs;
		npcIds = Object.keys(npcs);
		if (npcIds.length > 0) {
			currentNpc = await getNpcData(npcIds[0]);
		}
	});

	async function navigate(dir: 'left' | 'right') {
		if (transitioning) return;
		direction = dir;
		transitioning = true;

		if (dir === 'right') {
			currentIndex = (currentIndex + 1) % npcIds.length;
		} else {
			currentIndex = (currentIndex - 1 + npcIds.length) % npcIds.length;
		}

		currentNpc = await getNpcData(npcIds[currentIndex]);

		setTimeout(() => {
			transitioning = false;
		}, 340);
	}
</script>

<div class="viewer">
	{#if currentNpc}
		<!-- Full-bleed character art — bleeds upward, clipped on right side -->
		<div
			class="art-layer"
			class:slide-in={transitioning}
			class:from-right={direction === 'right'}
			class:from-left={direction === 'left'}
		>
			<img src={currentNpc.profileImage} alt={currentNpc.name} class="art-img" />
			<!-- Fade gradient: transparent at top, solid at bottom-right -->
			<div class="art-fade" />
		</div>

		<!-- Content layer: sits on top of the art -->
		<div
			class="content-layer"
			class:slide-in={transitioning}
			class:from-right={direction === 'right'}
			class:from-left={direction === 'left'}
		>
			<!-- Eyebrow -->
			<p class="eyebrow">Characters you'll meet</p>

			<!-- Name — large, bleeding over art -->
			<h2 class="npc-name">{currentNpc.name}</h2>
			<div class="name-rule" />

			<!-- Description -->
			<p class="npc-desc">{currentNpc.description || ''}</p>

			<!-- Rank chips -->
			<div class="rank-row">
				<div class="rank-chip">
					<img src="/game_icons/sword_rank.png" alt="sword" />
					<span>Rank {currentNpc.swordRank}</span>
				</div>
				<div class="rank-chip">
					<img src="/game_icons/heart_rank.png" alt="heart" />
					<span>Rank {currentNpc.heartRank}</span>
				</div>
			</div>
		</div>

		<!-- Navigation — pinned to bottom -->
		<div class="nav-row">
			<button class="nav-btn" on:click={() => navigate('left')} disabled={transitioning}>◀</button>
			<div class="pip-row">
				{#each npcIds as _, i}
					<div class="pip" class:active={i === currentIndex} />
				{/each}
			</div>
			<button class="nav-btn" on:click={() => navigate('right')} disabled={transitioning}>▶</button
			>
		</div>
	{:else}
		<div class="loading">Loading...</div>
	{/if}
</div>

<style>
	/* ── Root: stack everything via position ── */
	.viewer {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 360px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: transparent;
	}

	/* ── Art layer: fills the top ~70% of the card ── */
	.art-layer {
		position: absolute;
		/* Extend slightly above the card so the top of the art bleeds upward */
		top: -10%;
		/* Right-aligned: art sits on the right side, text on the left */
		right: -5%;
		width: 75%;
		height: 85%;
		z-index: 1;
		pointer-events: none;
		background-color: transparent;
	}

	.art-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		image-rendering: auto;
		display: block;
		/* Diagonal clip: full on the right, feathers to nothing on the left */
		clip-path: polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%);
	}

	/* Gradient that melts the art into the background at the bottom + left */
	.art-fade {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(14, 14, 14, 1) 0%,
			rgba(14, 14, 14, 0.5) 25%,
			transparent 55%
		);
		pointer-events: none;
	}

	/* ── Content layer: text sits on top, left-aligned ── */
	.content-layer {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1rem 0.5rem;
		/* Push content toward the bottom so it overlaps the art's lower half */
		margin-top: auto;
		/* But also give some top space so the art shows above */
		padding-top: 52%;
	}

	.eyebrow {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(169, 132, 103, 0.7);
		margin: 0;
	}

	.npc-name {
		font-family: var(--font-family-pixel, monospace);
		font-size: 1.6rem;
		font-weight: 400;
		color: #f0e8d8;
		margin: 0;
		line-height: 1.1;
		letter-spacing: 0.04em;
		/* Text shadow to ensure readability against the art */
		text-shadow:
			0 2px 20px rgba(0, 0, 0, 0.9),
			0 0 40px rgba(0, 0, 0, 0.7);
	}

	.name-rule {
		width: 48px;
		height: 2px;
		background: linear-gradient(to right, #a98467, transparent);
		border-radius: 1px;
		margin-top: 0.1rem;
	}

	.npc-desc {
		font-family: monospace;
		font-size: 0.8rem;
		color: rgba(169, 132, 103, 0.85);
		margin: 0;
		line-height: 1.55;
		/* Clamp to 3 lines */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
	}

	.rank-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.rank-chip {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		padding: 3px 8px;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #aaa;
		backdrop-filter: blur(4px);
	}

	.rank-chip img {
		width: 14px;
		height: 14px;
		image-rendering: pixelated;
	}

	/* ── Navigation: pinned to bottom ── */
	.nav-row {
		position: relative;
		z-index: 3;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem 0.75rem;
		background: linear-gradient(to top, rgba(14, 14, 14, 0.9) 0%, transparent 100%);
		margin-top: auto;
	}

	.nav-btn {
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(139, 111, 94, 0.4);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
		width: 30px;
		height: 30px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.4);
		transition: 120ms all ease-in-out;
		backdrop-filter: blur(4px);
		-webkit-tap-highlight-color: transparent;
	}
	.nav-btn:hover:not(:disabled) {
		border-color: rgba(169, 132, 103, 0.7);
		color: #fff;
	}
	.nav-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: none;
	}
	.nav-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.pip-row {
		display: flex;
		gap: 5px;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.pip {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgba(138, 100, 73, 0.5);
		transition:
			background 0.2s,
			transform 0.2s;
	}
	.pip.active {
		background: #a98467;
		transform: scale(1.5);
	}

	/* ── Slide transitions ── */
	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(22px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-22px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.slide-in.from-right {
		animation: slideInRight 0.32s ease forwards;
	}
	.slide-in.from-left {
		animation: slideInLeft 0.32s ease forwards;
	}

	/* ── Loading ── */
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #555;
	}
</style>
