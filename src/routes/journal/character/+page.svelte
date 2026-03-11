<script lang="ts">
	import { npcStore } from '$lib/stores/npcStore';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let npcList: any[] = [];
	let hoveredId: string | null = null;

	onMount(async () => {
		if (Object.keys(get(npcStore).globalNpcs).length === 0) {
			await npcStore.initializeGlobalNpcs();
		}
	});

	$: npcList = Object.values($npcStore.globalNpcs);

	// Use the first gallery image if available, fallback to main image
	function getCardImage(npc: any): string {
		return npc.image ?? npc.galleryImages?.[0];
	}

	// Rank progress helper
	function getSwordProgress(npc: any): { current: number; max: number } {
		return { current: npc.swordRank ?? 0, max: npc.swordRanks?.length ?? 0 };
	}
	function getHeartProgress(npc: any): { current: number; max: number } {
		return { current: npc.heartRank ?? 0, max: npc.heartRanks?.length ?? 0 };
	}
</script>

<div class="gallery-page">
	<div class="page-header">
		<a href="/journal" class="back-link">← Journal</a>
		<div class="header-center">
			<p class="page-eyebrow">Dawn's Journey</p>
			<h1 class="page-title">Characters</h1>
			<p class="page-sub">The remarkable inhabitants of Ashenfall.</p>
			<div class="header-rule"></div>
		</div>
		<div class="header-spacer"></div>
	</div>

	{#if npcList.length === 0}
		<div class="empty">
			<span class="empty-icon">👤</span>
			<p>No characters discovered yet.<br />Explore Ashenfall to meet its inhabitants.</p>
		</div>
	{:else}
		<div class="card-grid">
			{#each npcList as npc (npc.id)}
				{@const sword = getSwordProgress(npc)}
				{@const heart = getHeartProgress(npc)}
				<button
					class="char-card"
					class:active={hoveredId === npc.id}
					on:click={() => goto(`/journal/character/${npc.id}`)}
					on:mouseenter={() => (hoveredId = npc.id)}
					on:mouseleave={() => (hoveredId = null)}
					aria-label="View {npc.name}"
				>
					<!-- Full-bleed portrait -->
					<div class="card-portrait" style="background-image: url({getCardImage(npc)})">
						<!-- Element tags top-right -->
						<div class="card-elements">
							{#each npc.types ?? [] as el}
								<ElementTag element={el} size="mini" />
							{/each}
						</div>

						<!-- Combatant badge -->
						{#if npc.isCombatant}
							<div class="combatant-badge">⚔</div>
						{/if}
					</div>

					<!-- Card footer -->
					<div class="card-footer">
						<div class="card-name">{npc.name}</div>

						<!-- Rank bars -->
						<div class="rank-row">
							{#if sword.max > 0}
								<div class="rank-track" title="Sword Rank {sword.current}/{sword.max}">
									<span class="rank-icon">⚔</span>
									<div class="rank-pips">
										{#each Array(sword.max) as _, i}
											<div class="pip" class:pip-filled={i < sword.current}></div>
										{/each}
									</div>
								</div>
							{/if}
							{#if heart.max > 0}
								<div class="rank-track" title="Heart Rank {heart.current}/{heart.max}">
									<span class="rank-icon heart">♥</span>
									<div class="rank-pips">
										{#each Array(heart.max) as _, i}
											<div class="pip pip-heart" class:pip-filled={i < heart.current}></div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	* { box-sizing: border-box; }

	.gallery-page {
		min-height: 100vh;
		width: 100%;
		background-color: #100c08;
		padding: 0 0 5rem;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		color: #c8a878;
	}

	/* ── Header ── */
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.5rem 2rem 2rem;
		gap: 1rem;
	}

	.back-link {
		color: #7a5a20;
		text-decoration: none;
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding-top: 0.3rem;
		transition: color 0.15s;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.back-link:hover { color: #c9973a; }

	.header-center {
		text-align: center;
		flex: 1;
	}

	.header-spacer {
		flex-shrink: 0;
		width: 80px; /* mirrors back-link width for centering */
	}

	.page-eyebrow {
		font-size: 0.52rem;
		letter-spacing: 5px;
		color: #5a3a18;
		text-transform: uppercase;
		margin: 0 0 0.3rem;
	}

	.page-title {
		font-size: 2.2rem;
		color: #e8b96a;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
		text-shadow: 0 0 30px rgba(201, 151, 58, 0.2);
	}

	.page-sub {
		font-size: 0.65rem;
		color: #5a3a18;
		font-style: italic;
		margin: 0 0 0.8rem;
	}

	.header-rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Empty ── */
	.empty {
		text-align: center;
		padding: 4rem 1rem;
		color: #3d2810;
	}
	.empty-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
		opacity: 0.2;
	}
	.empty p { font-size: 0.7rem; font-style: italic; line-height: 1.7; }

	/* ── Grid ── */
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1.2rem;
		padding: 0 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* ── Card ── */
	.char-card {
		background: #1a1208;
		border: 2px solid #3d2810;
		box-shadow:
			#00000056 0 -5px 0 0px inset,
			0 4px 20px rgba(0,0,0,0.5);
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		display: flex;
		flex-direction: column;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		text-align: left;
	}

	.char-card:hover,
	.char-card.active {
		transform: translateY(-5px);
		border-color: #7a5020;
		box-shadow:
			#00000056 0 -5px 0 0px inset,
			0 16px 40px rgba(0,0,0,0.7),
			0 0 0 1px rgba(201,151,58,0.25);
	}

	.char-card:active {
		transform: translateY(-2px);
	}

	/* ── Portrait ── */
	.card-portrait {
		position: relative;
		aspect-ratio: 3 / 4;
		background-size: cover;
		background-position: center top;
		image-rendering: auto;
		flex-shrink: 0;
	}

	/* Subtle bottom fade into footer */
	.card-portrait::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 30%;
		background: linear-gradient(to top, #1a1208, transparent);
		pointer-events: none;
	}

	.card-elements {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 3px;
		align-items: flex-end;
	}

	.combatant-badge {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		background: rgba(10, 6, 2, 0.85);
		border: 1px solid #5c3d1e;
		border-radius: 4px;
		color: #c9973a;
		font-size: 0.65rem;
		padding: 2px 5px;
		line-height: 1;
	}

	/* ── Footer ── */
	.card-footer {
		padding: 0.6rem 0.75rem 0.75rem;
		background: #1a1208;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.card-name {
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #e8d4a8;
		line-height: 1.2;
	}

	/* ── Rank bars ── */
	.rank-row {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.rank-track {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.rank-icon {
		font-size: 0.5rem;
		color: #c9973a;
		width: 10px;
		flex-shrink: 0;
	}
	.rank-icon.heart { color: #c05070; }

	.rank-pips {
		display: flex;
		gap: 2px;
		flex-wrap: wrap;
	}

	.pip {
		width: 8px;
		height: 8px;
		border-radius: 2px;
		background: #2a1808;
		border: 1px solid #3d2810;
		box-shadow: #00000056 0 -1px 0 0px inset;
		transition: background 0.15s;
	}

	.pip.pip-filled {
		background: #c9973a;
		border-color: #e8b96a;
	}

	.pip.pip-heart.pip-filled {
		background: #c05070;
		border-color: #e07090;
	}

	@media (max-width: 500px) {
		.card-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
			gap: 0.75rem;
			padding: 0 1rem;
		}
		.page-title { font-size: 1.6rem; }
		.header-spacer { display: none; }
	}
</style>