<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { allAchievements } from '$lib/data/achievements';

	$: unlockedAchievements = $playerStore.achievements;

	// Split into unlocked vs locked for ordering
	$: sortedAchievements = [...allAchievements].sort((a, b) => {
		const aUnlocked = !!unlockedAchievements[a.id]?.unlocked;
		const bUnlocked = !!unlockedAchievements[b.id]?.unlocked;
		if (aUnlocked && !bUnlocked) return -1;
		if (!aUnlocked && bUnlocked) return 1;
		return 0;
	});
</script>

<div class="achievements-wrap">
	<div class="ach-header">
		<p class="ach-eyebrow">Dawn's Journey</p>
		<h2 class="ach-title">Achievements</h2>
		<div class="rule"></div>
	</div>

	<div class="ach-list">
		{#each sortedAchievements as ach}
			{@const isUnlocked = !!unlockedAchievements[ach.id]?.unlocked}
			{@const currentTier = unlockedAchievements[ach.id]?.currentTier || 0}
			{@const totalTiers = ach.tiers ? Object.keys(ach.tiers).length : 0}

			<div class="ach-item" class:unlocked={isUnlocked}>
				<div class="ach-icon">
					{#if isUnlocked}
						<span class="icon-check">✦</span>
					{:else}
						<span class="icon-lock">○</span>
					{/if}
				</div>

				<div class="ach-body">
					<div class="ach-name">
						{isUnlocked || !ach.isSecret ? ach.name : '???'}
					</div>
					<div class="ach-desc">
						{isUnlocked || !ach.isSecret ? ach.description : 'Keep playing to discover this.'}
					</div>

					{#if ach.tiers}
						<div class="tier-row">
							{#each Object.entries(ach.tiers) as [tier, tierData]}
								{@const tierNum = parseInt(tier)}
								{@const tierUnlocked = tierNum <= currentTier}
								<div class="tier-pip" class:pip-done={tierUnlocked} title="Tier {tier}: {tierData.threshold}">
									{tier}
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="ach-status">
					{#if ach.tiers}
						<span class="status-text" class:status-done={currentTier > 0}>
							{currentTier}/{totalTiers}
						</span>
					{:else}
						<span class="status-text" class:status-done={isUnlocked}>
							{isUnlocked ? 'Unlocked' : 'Locked'}
						</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.achievements-wrap {
		max-width: 760px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.ach-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.ach-eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.ach-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── List ── */
	.ach-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* ── Item ── */
	.ach-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		opacity: 0.5;
		transition: opacity 0.15s;
	}

	.ach-item.unlocked {
		opacity: 1;
		border-color: #5c3d1e;
	}

	/* ── Icon ── */
	.ach-icon {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 1px;
	}

	.icon-check {
		color: #c9973a;
		font-size: 0.9rem;
	}

	.icon-lock {
		color: #3d2810;
		font-size: 0.9rem;
	}

	/* ── Body ── */
	.ach-body {
		flex: 1;
		min-width: 0;
	}

	.ach-name {
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		color: #e8d4a8;
		text-transform: uppercase;
		margin-bottom: 3px;
	}

	.ach-desc {
		font-size: 0.68rem;
		color: #5a3a18;
		font-style: italic;
		line-height: 1.45;
		margin-bottom: 0.4rem;
	}

	.ach-item.unlocked .ach-desc {
		color: #7a5a38;
	}

	/* ── Tier pips ── */
	.tier-row {
		display: flex;
		gap: 4px;
		margin-top: 4px;
	}

	.tier-pip {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		background: #120c04;
		color: #3d2810;
		font-size: 0.52rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tier-pip.pip-done {
		background: #3d2810;
		border-color: #7a5020;
		color: #c9973a;
	}

	/* ── Status badge ── */
	.ach-status {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.status-text {
		font-size: 0.55rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: #3d2810;
	}

	.status-text.status-done {
		color: #c9973a;
	}
</style>