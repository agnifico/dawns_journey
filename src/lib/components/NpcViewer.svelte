<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { npcStore, getNpcData } from '$lib/stores/npcStore';
	import type { NPC } from '$lib/types';
	import ElementTag from './ui/ElementTag.svelte';

	let npcIds: string[] = [];
	let currentIndex = 0;
	let currentNpc: NPC | null = null;
	let prevNpc: NPC | null = null;
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
		prevNpc = currentNpc;

		if (dir === 'right') {
			currentIndex = (currentIndex + 1) % npcIds.length;
		} else {
			currentIndex = (currentIndex - 1 + npcIds.length) % npcIds.length;
		}

		currentNpc = await getNpcData(npcIds[currentIndex]);

		// Let CSS animation play
		setTimeout(() => {
			transitioning = false;
			prevNpc = null;
		}, 320);
	}
</script>

<div class="viewer">
	{#if currentNpc}
		<!-- Index pill -->
		<!-- <div class="index-pill">
			{currentIndex + 1} / {npcIds.length}
		</div> -->

		<!-- Portrait side -->
		<div
			class="portrait-side"
			class:slide-in={transitioning}
			class:from-right={direction === 'right'}
			class:from-left={direction === 'left'}
		>
			<div class="portrait-frame">
				<img src={currentNpc.profileImage} alt={currentNpc.name} />
				<div class="portrait-gloss"></div>
			</div>
		</div>

		<!-- Info side -->
		<div
			class="info-side"
			class:slide-in={transitioning}
			class:from-right={direction === 'right'}
			class:from-left={direction === 'left'}
		>
			<div class="name-block">
				<h2 class="name">{currentNpc.name}</h2>
				<p class="label">Characters you'll meet</p>
				<div class="name-underline"></div>
			</div>

			<p class="description">
				{currentNpc.description || ''}
				<!-- {currentNpc.swordRanks[0]?.description || currentNpc.description || ''} -->
			</p>

			<div class="rank-row">
				<div class="rank-chip">
					<img src="/game_icons/sword_rank.png" alt="sword" />
					<span>Rank {currentNpc.swordRank}</span>
				</div>
				<div class="rank-chip">
					<img src="/game_icons/heart_rank.png" alt="heart" />
					<span>Rank {currentNpc.heartRank}</span>
				</div>
				<!-- <div class="element-row">
					{#each currentNpc.types as element}
						<ElementTag {element} size="mini" />
					{/each}
				</div> -->
			</div>
		</div>

		<!-- Navigation -->
		<div class="nav-row">
			<button class="nav-btn" on:click={() => navigate('left')} disabled={transitioning}>
				◀
			</button>
			<div class="pip-row">
				{#each npcIds as _, i}
					<div class="pip" class:active={i === currentIndex}></div>
				{/each}
			</div>
			<button class="nav-btn" on:click={() => navigate('right')} disabled={transitioning}>
				▶
			</button>
		</div>
	{:else}
		<div class="loading">Loading...</div>
	{/if}
</div>

<style>
	.viewer {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr auto;
		gap: 0.75rem 1rem;
		height: 100%;
		width: 100%;
		/* padding: 0.75rem; */
		box-sizing: border-box;
		overflow: hidden;
		/* border: 1px solid white; */
	}

	/* ---- Index pill ---- */
	.index-pill {
		position: absolute;
		top: 0.5rem;
		right: 0.75rem;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: var(--color-secondary, #888);
		background: rgba(0, 0, 0, 0.2);
		padding: 3px 6px;
		border-radius: 99px;
		letter-spacing: 0.05rem;
		z-index: 2;
		display: flex;
	}

	/* ---- Portrait ---- */
	.portrait-side {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		grid-row: 1;
		grid-column: 1;
	}

	.portrait-frame {
		position: relative;
		width: 140px;
		height: 140px;
		border-radius: 10px;
		overflow: hidden;
		border: 3px solid var(--color-secondary, #8b6f5e);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.08),
			0 4px 20px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		flex-shrink: 0;
		border-radius: 20px;
		margin-bottom: .5rem;
	}

	.portrait-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: auto;
		display: block;
	}

	/* Subtle gloss overlay */
	.portrait-gloss {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 50%);
		pointer-events: none;
	}

	.element-row {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		justify-content: center;
	}

	/* ---- Info ---- */
	.info-side {
		grid-row: 1;
		grid-column: 2;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		margin-bottom: .5rem;
	}

	.name-block {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.15em;
		color: var(--color-primary, #a98467);
		margin: 0;
		opacity: 0.8;
	}

	.name {
		font-family: var(--font-family-pixel, 'Silkscreen');
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-accent, #fff);
		color: #e9d9ca;
		margin: 0;
		padding: 0;
		/* line-height: 1.5rem; */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
	}

	.name-underline {
		height: 2px;
		width: 100%;
		background: linear-gradient(to right, var(--color-primary, #a98467), transparent);
		margin-top: 0.5rem;
		border-radius: 1px;
	}

	.description {
		font-family: monospace;
		font-size: 0.72rem;
		color: var(--color-primary);
		/* line-height: 1.5; */
		margin: 0;
		padding: 0;
		/* clamp to 3 lines */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		/* text-align: left; */
	}

	.rank-row {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
	}

	.rank-chip {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 2px 6px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: #ccc;
	}

	.rank-chip img {
		width: 12px;
		height: 12px;
		image-rendering: pixelated;
	}

	/* ---- Nav row ---- */
	.nav-row {
		position: relative;
		bottom: 0.5rem;
		grid-column: 1 / -1;
		grid-row: 2;
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		/* border: 1px solid black; */
	}

	.nav-btn {
		background-color: var(--surface-1);
		border: 3px solid var(--color-secondary, #8b6f5e);
		color: white;
		font-size: 0.9rem;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow:
			inset 0 20px 20px -10px rgba(255, 255, 255, 0.08),
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			0 3px 0 var(--surface-2),
			0 3px 6px rgba(0, 0, 0, 0.3);
		transition: 120ms all ease-in-out;
		-webkit-tap-highlight-color: transparent;
	}

	.nav-btn:active:not(:disabled) {
		transform: translateY(3px);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.1),
			0 0 0 var(--surface-2);
	}

	.nav-btn:disabled {
		opacity: 0.4;
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
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #8a6449;
		transition:
			background 0.2s,
			transform 0.2s;
	}

	.pip.active {
		background: transparent;
		border: 1px solid black;
		transform: scale(1.4);
	}

	/* ---- Slide transition ---- */
	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(18px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-18px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.slide-in.from-right {
		animation: slideInRight 0.3s ease forwards;
	}

	.slide-in.from-left {
		animation: slideInLeft 0.3s ease forwards;
	}

	/* ---- Loading ---- */
	.loading {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		color: #666;
	}
</style>
