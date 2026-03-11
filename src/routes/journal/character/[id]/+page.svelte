<script lang="ts">
	import { page } from '$app/stores';
	import { npcStore } from '$lib/stores/npcStore';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Stat from '$lib/components/Stat.svelte';
	import { statDefinitions } from '$lib/data/statDefinitions';

	let npc: any = null;
	let activeImageIndex = 0;
	let activeTab: 'gallery' | 'stats' | 'quests' = 'gallery';

	onMount(async () => {
		if (Object.keys(get(npcStore).globalNpcs).length === 0) {
			await npcStore.initializeGlobalNpcs();
		}
	});

	$: {
		const id = $page.params.id;
		npc = id ? ($npcStore.globalNpcs[id] ?? null) : null;
		activeImageIndex = 0;
	}

	// All displayable images: gallery first (cinematic shots), then profile
	$: allImages = npc
		? [...(npc.galleryImages ?? []), ...(npc.profileImage ? [npc.profileImage] : [])]
		: [];

	$: currentImage = allImages[activeImageIndex] ?? npc?.image ?? '';

	function prevImage() {
		if (activeImageIndex > 0) activeImageIndex--;
	}
	function nextImage() {
		if (activeImageIndex < allImages.length - 1) activeImageIndex++;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') prevImage();
		if (e.key === 'ArrowRight') nextImage();
	}

	function formatStat(key: string, val: number): string {
		if (key === 'critChance') return `${(val * 100).toFixed(0)}%`;
		if (key === 'critDamage') return `${val.toFixed(1)}x`;
		return String(val);
	}

	$: displayStats = npc?.baseStats
		? Object.entries(statDefinitions)
				.filter(([k]) => npc.baseStats[k] !== undefined && npc.baseStats[k] !== 0)
				.map(([k, meta]) => ({ key: k, ...meta, value: npc.baseStats[k] }))
		: [];

	// Quest helpers
	$: swordQuests = npc?.swordRanks ?? [];
	$: heartRanks = npc?.heartRanks ?? [];

	function questStatus(quest: any, npc: any): 'done' | 'active' | 'locked' {
		const idx = swordQuests.indexOf(quest);
		if (idx < (npc?.swordRank ?? 0)) return 'done';
		if (idx === (npc?.swordRank ?? 0)) return 'active';
		return 'locked';
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if npc}
	<div class="char-page">
		<!-- ── Back bar ── -->
		<div class="top-bar">
			<button class="back-btn" on:click={() => goto('/journal/character')}>← All Characters</button>
			<div class="top-elements">
				{#each npc.types ?? [] as el}
					<ElementTag element={el} />
				{/each}
			</div>
		</div>

		<!-- ══════════════════ HERO SECTION ══════════════════ -->
		<div class="hero">
			<!-- Left: image viewer -->
			<div class="image-panel">
				<div class="main-image-wrap">
					<img
						class="main-image"
						src={currentImage}
						alt="{npc.name} - Image {activeImageIndex + 1}"
					/>

					<!-- Nav arrows -->
					{#if allImages.length > 1}
						<button
							class="img-nav img-nav-left"
							on:click={prevImage}
							disabled={activeImageIndex === 0}
							aria-label="Previous image">◀</button
						>
						<button
							class="img-nav img-nav-right"
							on:click={nextImage}
							disabled={activeImageIndex === allImages.length - 1}
							aria-label="Next image">▶</button
						>

						<!-- Counter -->
						<div class="img-counter">{activeImageIndex + 1} / {allImages.length}</div>
					{/if}
				</div>

				<!-- Thumbnail strip -->
				<!-- {#if allImages.length > 1}
					<div class="thumb-strip">
						{#each allImages as img, i}
							<button
								class="thumb"
								class:thumb-active={i === activeImageIndex}
								on:click={() => (activeImageIndex = i)}
								aria-label="View image {i + 1}"
								style="background-image: url({img})"
							></button>
						{/each}
					</div>
				{/if} -->
			</div>

			<!-- Right: character info -->
			<div class="info-panel">
				<!-- Name & title -->
				<div class="char-identity">
					<p class="char-eyebrow">
						{#if npc.isCombatant}<span class="combatant-label"
								>{npc.types?.join(' · ') ?? 'Unknown'}</span
							>{/if}
					</p>
					<h1 class="char-name">{npc.name}</h1>
					<p class="char-desc">{npc.description}</p>
				</div>

				<!-- Rank status -->
				<div class="rank-section">
					<div class="rank-block">
						<div class="rank-label">
							<span class="rank-icon">⚔</span> Sword Rank
						</div>
						<div class="rank-value">{npc.swordRank ?? 0} / {npc.swordRanks?.length ?? 0}</div>
						<div class="rank-bar-track">
							<div
								class="rank-bar-fill sword-fill"
								style="width: {npc.swordRanks?.length
									? ((npc.swordRank ?? 0) / npc.swordRanks.length) * 100
									: 0}%"
							></div>
						</div>
					</div>

					<div class="rank-block">
						<div class="rank-label">
							<span class="rank-icon heart-icon">♥</span> Heart Rank
						</div>
						<div class="rank-value">{npc.heartRank ?? 0} / {npc.heartRanks?.length ?? 0}</div>
						<div class="rank-bar-track">
							<div
								class="rank-bar-fill heart-fill"
								style="width: {npc.heartRanks?.length
									? ((npc.heartRank ?? 0) / npc.heartRanks.length) * 100
									: 0}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Abilities -->
				{#if npc.abilityCycle?.length > 0}
					<div class="ability-section">
						<div class="section-label">Ability Cycle</div>
						<div class="ability-list">
							{#each npc.abilityCycle as ab, i}
								<div class="ability-pill">
									<span class="ability-num">{i + 1}</span>
									<span class="ability-name">{ab.replace(/_/g, ' ')}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Quick gifting options from heart rank 0 -->
				{#if heartRanks[0]?.giftingOptions?.length > 0}
					<div class="gift-section">
						<div class="section-label">Liked Gifts</div>
						<div class="gift-list">
							{#each heartRanks[0].giftingOptions as gift}
								<div class="gift-item">
									<span class="gift-name">{gift.itemId.replace(/_/g, ' ')}</span>
									<span class="gift-qty">×{gift.quantity}</span>
									<span class="gift-val">+{gift.value} affinity</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- ══════════════════ TABS ══════════════════ -->
		<div class="tabs-section">
			<div class="tab-row">
				<button
					class="tab-btn"
					class:tab-active={activeTab === 'gallery'}
					on:click={() => (activeTab = 'gallery')}
				>
					🖼 Gallery
				</button>
				{#if displayStats.length > 0}
					<button
						class="tab-btn"
						class:tab-active={activeTab === 'stats'}
						on:click={() => (activeTab = 'stats')}
					>
						📊 Base Stats
					</button>
				{/if}
				{#if swordQuests.length > 0}
					<button
						class="tab-btn"
						class:tab-active={activeTab === 'quests'}
						on:click={() => (activeTab = 'quests')}
					>
						📜 Quests ({swordQuests.length})
					</button>
				{/if}
			</div>

			<div class="tab-content">
				<!-- ── GALLERY TAB ── -->
				{#if activeTab === 'gallery'}
					<div class="full-gallery">
						{#each allImages as img, i}
							<button
								class="gallery-item"
								class:gallery-active={i === activeImageIndex}
								on:click={() => {
									activeImageIndex = i;
									window.scrollTo({ top: 0, behavior: 'smooth' });
								}}
								aria-label="View image {i + 1}"
							>
								<img src={img} alt="{npc.name} - Image {i + 1}" loading="lazy" />
							</button>
						{/each}
					</div>
				{/if}

				<!-- ── STATS TAB ── -->
				{#if activeTab === 'stats'}
					<div class="stats-grid">
						{#each displayStats as stat}
							{#if stat.id !== 'maxHp' && stat.id !== 'maxAuraShield'}
								<!-- <div class="stat-item"> -->
								<!-- <div class="stat-label">{stat.label}</div>
                                    <div class="stat-value" style="color: {stat.color}">
                                        {formatStat(stat.key, stat.value)}
                                    </div> -->
								<Stat statId={stat.id} value={stat.value} view="full" />
								<!-- </div> -->
							{/if}
						{/each}
					</div>
				{/if}

				<!-- ── QUESTS TAB ── -->
				{#if activeTab === 'quests'}
					<div class="quest-list">
						{#each swordQuests as quest, i}
							{@const status = questStatus(quest, npc)}
							<div
								class="quest-card"
								class:quest-done={status === 'done'}
								class:quest-locked={status === 'locked'}
							>
								<div class="quest-header">
									<div class="quest-num-wrap">
										<span class="quest-status-icon">
											{#if status === 'done'}✦{:else if status === 'active'}▶{:else}○{/if}
										</span>
									</div>
									<div class="quest-meta">
										<div class="quest-title">{quest.title}</div>
										<div class="quest-desc">{quest.description}</div>
									</div>
									<div class="quest-rank-badge">Rank {i + 1}</div>
								</div>

								{#if status !== 'locked'}
									<div class="quest-stages">
										{#each quest.stages ?? [] as stage, si}
											<div class="stage-item">
												<span class="stage-num">{si + 1}</span>
												<span class="stage-obj">{stage.objective}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- ── Not found ── -->
	<div class="not-found">
		<button class="back-btn" on:click={() => goto('/journal/character')}>← All Characters</button>
		<div class="nf-body">
			<p class="nf-title">Character not found</p>
			<p class="nf-sub">This character doesn't exist, or hasn't been discovered yet.</p>
		</div>
	</div>
{/if}

<style>
	* {
		box-sizing: border-box;
	}

	.char-page {
        min-height: 100vh;
		background-color: #100c08;
        width: 100%;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		color: #c8a878;
		padding-bottom: 5rem;
	}

	/* ── Top bar ── */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		background: #1a1208;
		border-bottom: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
	}

	.back-btn {
		background: none;
		border: none;
		color: #7a5a20;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0;
		transition: color 0.15s;
	}
	.back-btn:hover {
		color: #c9973a;
	}

	.top-elements {
		display: flex;
		gap: 0.3rem;
	}

	/* ══ HERO ══ */
	.hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		align-items: start;
	}

	/* ── Image panel ── */
	.image-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		position: sticky;
		top: 1rem;
	}

	.main-image-wrap {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		border: 2px solid #3d2810;
		box-shadow:
			#00000056 0 -6px 0 0px inset,
			0 8px 40px rgba(0, 0, 0, 0.7);
		background: #0e0a06;
		aspect-ratio: 3 / 4;
	}

	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		display: block;
		image-rendering: auto;
		transition: opacity 0.2s;
	}

	/* Nav arrows */
	.img-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(10, 6, 2, 0.8);
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		color: #c9973a;
		font-size: 0.8rem;
		width: 2rem;
		height: 2.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.12s,
			border-color 0.12s;
		z-index: 2;
	}
	.img-nav:hover:not(:disabled) {
		background: rgba(20, 12, 4, 0.95);
		border-color: #7a5020;
	}
	.img-nav:disabled {
		opacity: 0.25;
		cursor: default;
	}
	.img-nav-left {
		left: 0.5rem;
	}
	.img-nav-right {
		right: 0.5rem;
	}

	.img-counter {
		position: absolute;
		bottom: 0.5rem;
		right: 0.6rem;
		background: rgba(10, 6, 2, 0.8);
		border: 1px solid #3d2810;
		border-radius: 4px;
		color: #7a5a20;
		font-size: 0.5rem;
		letter-spacing: 1px;
		padding: 2px 6px;
	}

	/* Thumbnail strip */
	.thumb-strip {
		width: 50%;
		display: flex;
		flex-grow: 0;
		gap: 6px;
		overflow-x: auto;
		padding-bottom: 2px;
		scrollbar-width: thin;
		scrollbar-color: #3d2810 transparent;
	}

	.thumb {
		flex-shrink: 0;
		width: 48px;
		height: 60px;
		border-radius: 6px;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		background-size: cover;
		background-position: center top;
		cursor: pointer;
		transition:
			border-color 0.12s,
			transform 0.1s;
		padding: 0;
	}
	.thumb:hover {
		border-color: #7a5020;
		transform: translateY(-2px);
	}
	.thumb.thumb-active {
		border-color: #c9973a;
		box-shadow: 0 0 8px rgba(201, 151, 58, 0.4);
	}

	/* ── Info panel ── */
	.info-panel {
		padding: 0 0 0 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Identity */
	.char-identity {
	}

	.char-eyebrow {
		font-size: 0.52rem;
		letter-spacing: 4px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.combatant-label {
		color: #c9973a;
	}

	.char-name {
		font-size: 2rem;
		color: #e8b96a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.75rem;
		line-height: 1.1;
		text-shadow: 0 0 20px rgba(201, 151, 58, 0.15);
	}

	.char-desc {
		font-size: 0.72rem;
		color: #7a5a38;
		font-style: italic;
		line-height: 1.65;
		margin: 0;
	}

	/* Rank section */
	.rank-section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		padding: 0.85rem 1rem;
	}

	.rank-block {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		gap: 0 0.5rem;
		align-items: center;
	}

	.rank-label {
		font-size: 0.55rem;
		letter-spacing: 2px;
		color: #7a5a20;
		text-transform: uppercase;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.rank-icon {
		color: #c9973a;
	}
	.heart-icon {
		color: #c05070;
	}

	.rank-value {
		font-size: 0.55rem;
		color: #c8a878;
		letter-spacing: 1px;
	}

	.rank-bar-track {
		grid-column: 1 / -1;
		height: 6px;
		background: #100c08;
		border: 1px solid #2a1808;
		border-radius: 3px;
		overflow: hidden;
		margin-top: 3px;
	}

	.rank-bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.sword-fill {
		background: linear-gradient(90deg, #7a5020, #c9973a);
		box-shadow: 0 0 6px rgba(201, 151, 58, 0.4);
	}

	.heart-fill {
		background: linear-gradient(90deg, #7a2040, #c05070);
		box-shadow: 0 0 6px rgba(192, 80, 112, 0.4);
	}

	/* Ability section */
	.section-label {
		font-size: 0.52rem;
		letter-spacing: 3px;
		color: #7a5a20;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	.ability-section,
	.gift-section {
	}

	.ability-list {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.ability-pill {
		display: flex;
		align-items: center;
		gap: 5px;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.3rem 0.6rem 0.4rem;
	}

	.ability-num {
		font-size: 0.5rem;
		color: #5a3a18;
		width: 12px;
		text-align: center;
	}

	.ability-name {
		font-size: 0.6rem;
		color: #c8a878;
		text-transform: capitalize;
		letter-spacing: 0.04em;
	}

	/* Gift section */
	.gift-list {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.gift-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.35rem 0.6rem 0.45rem;
		font-size: 0.62rem;
	}

	.gift-name {
		color: #e8d4a8;
		text-transform: capitalize;
		flex: 1;
	}

	.gift-qty {
		color: #7a5a38;
		font-size: 0.55rem;
	}

	.gift-val {
		color: #c05070;
		font-size: 0.5rem;
		letter-spacing: 0.5px;
	}

	/* ══ TABS ══ */
	.tabs-section {
		max-width: 1100px;
		margin: 1rem auto 0;
		padding: 0 1.5rem;
	}

	.tab-row {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 0;
	}

	.tab-btn {
		font-family: inherit;
		font-size: 0.6rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px 8px 0 0;
		color: #5a3a18;
		padding: 0.5rem 1rem 0.65rem;
		cursor: pointer;
		transition:
			color 0.12s,
			background 0.12s,
			border-color 0.12s;
	}

	.tab-btn:hover:not(.tab-active) {
		color: #c8a878;
		border-color: #3d2810;
	}

	.tab-btn.tab-active {
		background: #221508;
		border-color: #5c3d1e;
		border-bottom-color: #221508;
		color: #e8b96a;
		box-shadow: #00000056 0 -3px 0 -2px inset;
	}

	.tab-content {
		background: #221508;
		border: 2px solid #5c3d1e;
		border-radius: 0 8px 8px 8px;
		box-shadow:
			#00000056 0 -6px 0 0px inset,
			0 8px 24px rgba(0, 0, 0, 0.4);
		padding: 1.5rem;
		min-height: 200px;
	}

	/* ── Gallery tab ── */
	.full-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.6rem;
	}

	.gallery-item {
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		transition:
			border-color 0.15s,
			transform 0.1s;
		aspect-ratio: 3 / 4;
	}

	.gallery-item:hover {
		border-color: #7a5020;
		transform: translateY(-2px);
	}
	.gallery-item.gallery-active {
		border-color: #c9973a;
		box-shadow: 0 0 12px rgba(201, 151, 58, 0.3);
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		display: block;
		image-rendering: auto;
	}

	/* ── Stats tab ── */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.5rem;
	}

	.stat-item {
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.stat-label {
		font-size: 0.5rem;
		letter-spacing: 2px;
		color: #5a3a18;
		text-transform: uppercase;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
	}

	/* ── Quests tab ── */
	.quest-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.quest-card {
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.quest-card.quest-done {
		border-color: #3d2810;
		opacity: 0.75;
	}

	.quest-card.quest-locked {
		opacity: 0.35;
	}

	.quest-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 0.9rem;
	}

	.quest-num-wrap {
		flex-shrink: 0;
		width: 20px;
		display: flex;
		justify-content: center;
		padding-top: 1px;
	}

	.quest-status-icon {
		font-size: 0.7rem;
	}

	.quest-card.quest-done .quest-status-icon {
		color: #c9973a;
	}
	.quest-card:not(.quest-done):not(.quest-locked) .quest-status-icon {
		color: #e8b96a;
	}
	.quest-card.quest-locked .quest-status-icon {
		color: #3d2810;
	}

	.quest-meta {
		flex: 1;
		min-width: 0;
	}

	.quest-title {
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		color: #e8d4a8;
		text-transform: uppercase;
		margin-bottom: 3px;
		line-height: 1.3;
	}

	.quest-card.quest-locked .quest-title {
		color: #3d2810;
	}

	.quest-desc {
		font-size: 0.62rem;
		color: #5a3a18;
		font-style: italic;
		line-height: 1.45;
	}

	.quest-rank-badge {
		flex-shrink: 0;
		font-size: 0.5rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: #5a3a18;
		background: #100c08;
		border: 1px solid #2a1808;
		border-radius: 4px;
		padding: 2px 6px;
	}

	.quest-card:not(.quest-done):not(.quest-locked) .quest-rank-badge {
		color: #c9973a;
		border-color: #5c3d1e;
	}

	.quest-stages {
		border-top: 1px solid #1a1208;
		padding: 0.5rem 0.9rem 0.65rem 2.75rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: rgba(10, 6, 2, 0.3);
	}

	.stage-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.6rem;
	}

	.stage-num {
		color: #5a3a18;
		flex-shrink: 0;
		width: 12px;
	}

	.stage-obj {
		color: #7a5a38;
		font-style: italic;
		line-height: 1.4;
	}

	/* ── Not found ── */
	.not-found {
		min-height: 100vh;
		background: #100c08;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.nf-body {
		text-align: center;
	}

	.nf-title {
		font-size: 1.2rem;
		color: #e8b96a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.nf-sub {
		font-size: 0.7rem;
		color: #5a3a18;
		font-style: italic;
	}

	/* ── Responsive ── */
	@media (max-width: 700px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.image-panel {
			position: static;
		}

		.info-panel {
			padding: 0;
		}

		.char-name {
			font-size: 1.5rem;
		}

		.full-gallery {
			grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
