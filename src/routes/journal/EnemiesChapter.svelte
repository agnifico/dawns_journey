<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { allEnemies } from '$lib/data/enemies';
	import { regionDefinitions } from '$lib/data/regionDefinitions';
	import Stat from '$lib/components/Stat.svelte';
	import WRBadge from '$lib/components/WRBadge.svelte';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';

	$: killCounts = $playerStore?.killCounts ?? {};
	$: playerWR = $playerStore?.worldResonance ?? 0;

	// Pre-build a map: enemyId → region names where it appears
	const enemyRegions: Record<string, string[]> = {};
	for (const region of Object.values(regionDefinitions)) {
		for (const e of region.enemies ?? []) {
			if (!enemyRegions[e.id]) enemyRegions[e.id] = [];
			const regionName = region.name === 'hidden area' ? '???' : region.name;
			if (!enemyRegions[e.id].includes(regionName)) {
				enemyRegions[e.id].push(regionName);
			}
		}
	}

	// Sort: non-legendary first by resonanceRequirement, legendaries last
	$: sortedEnemies = [...allEnemies].sort((a, b) => {
		if (!!a.isLegendary !== !!b.isLegendary) return a.isLegendary ? 1 : -1;
		return a.resonanceRequirement - b.resonanceRequirement;
	});

	function killCount(id: string): number {
		return killCounts[id] ?? 0;
	}

	let expandedId: string | null = null;
	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<div class="bestiary-wrap">
	<div class="bestiary-header">
		<p class="eyebrow">Dawn's Journey</p>
		<h2 class="title">Bestiary</h2>
		<p class="subtitle">The creatures of Ashenfall — catalogued as you encounter them.</p>
		<div class="rule" />
	</div>

	<div class="enemy-list">
		{#each sortedEnemies as enemy (enemy.id)}
			{@const kills = killCount(enemy.id)}
			{@const discovered = kills >= 1}
			{@const isOpen = expandedId === enemy.id}

			<div
				class="enemy-row"
				class:legendary={!!enemy.isLegendary}
				class:expanded={isOpen}
			>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="enemy-summary" on:click={() => toggle(enemy.id)}>

					<!-- Portrait -->
					<div class="portrait-wrap">
						<img
							src={enemy.thumbnailImage ?? enemy.image}
							alt={discovered ? enemy.name : '???'}
							class="portrait"
							class:greyscale={!discovered}
						/>
						{#if enemy.isLegendary}
							<span class="legendary-crown" class:mystery={!discovered} title="Legendary">★</span>
						{/if}
					</div>

					<!-- Identity -->
					<div class="enemy-identity">
						<span class="enemy-name" class:unknown={!discovered}>
							{discovered ? enemy.name : '???'}
						</span>
						<div class="type-row">
							{#each enemy.types ?? [] as type}
								{#if discovered}
									<ElementTag element={type} size="inline" />
								{:else}
									<span class="type-placeholder" />
								{/if}
							{/each}
						</div>
					</div>

					<!-- Kill badge -->
					<div class="kill-badge" class:zero={kills === 0}>
						<span class="kill-icon">⚔</span>
						<span class="kill-num">{kills}</span>
					</div>

					<span class="chevron" class:open={isOpen}>›</span>
				</div>

				<!-- Detail panel — always openable; discovery gates name + description only -->
				{#if isOpen}
					<div class="enemy-detail">
						<div class="detail-layout">
							<img
								src={enemy.image}
								alt={discovered ? enemy.name : '???'}
								class="detail-art"
								class:legendary-art={!!enemy.isLegendary}
								class:greyscale={!discovered}
							/>

							<div class="detail-aside">
								{#if discovered}
									<p class="enemy-desc">{enemy.description}</p>
								{:else}
									<p class="enemy-desc unknown-text">Defeat this enemy to reveal its secrets.</p>
								{/if}

								<!-- WR + HP Cost always visible -->
								<div class="badges-row">
									<WRBadge required={enemy.resonanceRequirement} playerValue={playerWR} />
									<Stat statId="hpCost" value={enemy.hpCost} />
								</div>

								<!-- Legendary discovered: show key combat stats -->
								{#if enemy.isLegendary && discovered && enemy.baseStats}
									<div class="stat-grid">
										<Stat statId="hp" value={enemy.baseStats.maxHp} />
										<Stat statId="physicalAttack" value={enemy.baseStats.physicalAttack} />
										<Stat statId="elementalAttack" value={enemy.baseStats.elementalAttack} />
										<Stat statId="speed" value={enemy.baseStats.speed} />
									</div>
								{/if}

								<!-- Found in — always visible -->
								<div class="found-in">
									<span class="found-label">Found in</span>
									<div class="region-tags">
										{#each (enemyRegions[enemy.id] ?? ['???']) as region}
											<span class="region-tag" class:mystery-region={region === '???'}>{region}</span>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.bestiary-wrap {
		max-width: 860px;
		margin: 0 auto;
		padding-bottom: 3rem;
	}

	/* ── Header ── */
	.bestiary-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #9e6d38;
		font-style: italic;
		font-size: 1rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── List ── */
	.enemy-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* ── Row ── */
	.enemy-row {
		border: 1px solid rgba(200, 169, 110, 0.12);
		border-radius: 8px;
		background: rgba(20, 16, 8, 0.6);
		overflow: hidden;
		transition: border-color 0.2s;
	}

	.enemy-row:hover {
		border-color: rgba(200, 169, 110, 0.28);
	}

	.enemy-row.expanded {
		border-color: rgba(200, 169, 110, 0.35);
	}

	.enemy-row.legendary {
		border-color: rgba(255, 200, 80, 0.18);
		background: rgba(30, 20, 5, 0.7);
	}

	.enemy-row.legendary:hover,
	.enemy-row.legendary.expanded {
		border-color: rgba(255, 200, 80, 0.45);
	}

	/* ── Summary bar ── */
	.enemy-summary {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		cursor: pointer;
		user-select: none;
	}

	/* ── Portrait ── */
	.portrait-wrap {
		position: relative;
		flex-shrink: 0;
		width: 52px;
		height: 52px;
	}

	.portrait {
		width: 52px;
		height: 52px;
		object-fit: contain;
		image-rendering: pixelated;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.3);
	}

	.portrait.greyscale {
		filter: grayscale(100%) brightness(0.55);
	}

	.legendary-crown {
		position: absolute;
		top: -6px;
		right: -6px;
		font-size: 0.7rem;
		color: #f0c040;
		text-shadow: 0 0 6px #f0c04088;
		line-height: 1;
	}

	.legendary-crown.mystery {
		color: #554422;
		text-shadow: none;
	}

	/* ── Identity ── */
	.enemy-identity {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.enemy-name {
		font-family: var(--font-family-pixel);
		font-size: 0.85rem;
		color: #e4d8be;
		letter-spacing: 0.05em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.enemy-name.unknown {
		color: #4a3a22;
		letter-spacing: 0.15em;
	}

	.type-row {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
	}

	.type-placeholder {
		display: inline-block;
		width: 54px;
		height: 20px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	/* ── Kill badge ── */
	.kill-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(200, 169, 110, 0.1);
		border: 1px solid rgba(200, 169, 110, 0.2);
		border-radius: 5px;
		padding: 3px 8px;
		flex-shrink: 0;
	}

	.kill-badge.zero {
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(255, 255, 255, 0.07);
	}

	.kill-icon {
		font-size: 0.65rem;
		color: #7a5a20;
	}

	.kill-badge.zero .kill-icon {
		color: #3a2e1a;
	}

	.kill-num {
		font-family: var(--font-family-pixel);
		font-size: 0.8rem;
		color: #c8a96e;
		min-width: 16px;
		text-align: right;
	}

	.kill-badge.zero .kill-num {
		color: #3a2e1a;
	}

	/* ── Chevron ── */
	.chevron {
		font-size: 1.4rem;
		color: #5a4020;
		transition: transform 0.2s;
		line-height: 1;
		flex-shrink: 0;
	}

	.chevron.open {
		transform: rotate(90deg);
		color: #c8a96e;
	}

	/* ── Detail panel ── */
	.enemy-detail {
		border-top: 1px solid rgba(200, 169, 110, 0.12);
		padding: 16px;
		animation: slideDown 0.18s ease;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.detail-layout {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}

	.detail-art {
		width: 100px;
		height: 100px;
		object-fit: contain;
		image-rendering: pixelated;
		flex-shrink: 0;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.35);
		padding: 4px;
		overflow: hidden;
	}

	.detail-art.greyscale {
		filter: grayscale(100%) brightness(0.55);
	}

	.detail-art.legendary-art {
		width: 120px;
		height: 120px;
		background: rgba(0, 0, 0, 0.5);
		padding: 6px;
		border: 1px solid rgba(255, 200, 80, 0.15);
	}

	.detail-aside {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.enemy-desc {
		font-size: 0.82rem;
		color: #9e7d4a;
		font-style: italic;
		margin: 0;
		line-height: 1.55;
	}

	.unknown-text {
		color: #4a3822;
	}

	.badges-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 4px;
	}

	/* ── Found in ── */
	.found-in {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
	}

	.found-label {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: #5a4020;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.region-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.region-tag {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		color: #9e7d4a;
		background: rgba(200, 169, 110, 0.08);
		border: 1px solid rgba(200, 169, 110, 0.18);
		border-radius: 4px;
		padding: 2px 7px;
		white-space: nowrap;
	}

	.mystery-region {
		color: #4a3822;
		background: rgba(100, 70, 20, 0.08);
		border-color: rgba(100, 70, 20, 0.2);
		letter-spacing: 0.12em;
	}

	/* ── Responsive ── */
	@media (max-width: 520px) {
		.detail-layout {
			flex-direction: column;
		}

		.detail-art {
			width: 80px;
			height: 80px;
		}

		.stat-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>