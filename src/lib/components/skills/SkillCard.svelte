<script lang="ts">
	// SkillCard.svelte
	// One skill: level + XP, the next level's reward, and everything the skill
	// unlocks grouped by level. Locked entries are dimmed with their level.

	import skillsData from '$lib/data/skills.json';
	import { skillUnlocks, type SkillUnlock } from '$lib/data/skillUnlocks';
	import { getXpForLevel } from '$lib/services/SkillService';
	import { getItemById } from '$lib/services/InventoryService';
	import { playerStore } from '$lib/stores/playerStore';

	export let skill: { id: string; name: string; level: number; experience: number };

	const KIND_LABEL = { gather: 'Gather', craft: 'Craft', grow: 'Grow', catch: 'Catch' } as const;

	$: data = (skillsData as Record<string, any>)[skill.id];
	$: xpNeeded = getXpForLevel(skill.id, skill.level);
	$: xpPct = xpNeeded > 0 ? Math.min(100, (skill.experience / xpNeeded) * 100) : 100;
	$: nextRewards = (data?.levels?.[skill.level + 1]?.rewards ?? []) as { itemId: string; amount: number }[];

	$: groups = (() => {
		const byLevel = new Map<number, SkillUnlock[]>();
		for (const u of skillUnlocks[skill.id] ?? []) {
			if (!byLevel.has(u.level)) byLevel.set(u.level, []);
			byLevel.get(u.level)!.push(u);
		}
		return [...byLevel.entries()].sort((a, b) => a[0] - b[0]);
	})();
	$: unlockedCount = (skillUnlocks[skill.id] ?? []).filter((u) => u.level <= skill.level).length;
	// Collectibles (fish) stay a mystery until caught
	$: log = $playerStore.fishLog ?? {};
	$: collected = (skillUnlocks[skill.id] ?? []).filter((u) => u.collectId && log[u.collectId]).length;
	$: collectible = (skillUnlocks[skill.id] ?? []).filter((u) => u.collectId).length;
	$: totalCount = (skillUnlocks[skill.id] ?? []).length;
</script>

<article class="skill-card">
	<header class="card-head">
		<img class="skill-icon" src={data?.icon ?? `/game_icons/${skill.id}.png`} alt="" />
		<div class="head-main">
			<div class="title-row">
				<h2 class="skill-name">{skill.name}</h2>
				<span class="skill-level">Lv. {skill.level}</span>
			</div>
			<div class="xp-bar" title="{skill.experience} / {xpNeeded} XP">
				<div class="xp-fill" style="width: {xpPct}%"></div>
				<span class="xp-text">{skill.experience} / {xpNeeded} XP</span>
			</div>
		</div>
	</header>

	<div class="next-row">
		{#if nextRewards.length > 0}
			<span class="next-label">Lv. {skill.level + 1} reward</span>
			{#each nextRewards as r}
				<span class="reward-chip" title={getItemById(r.itemId)?.name ?? r.itemId}>
					<img src={getItemById(r.itemId)?.image} alt="" />{r.amount}×
				</span>
			{/each}
		{/if}
		{#if collectible > 0}
			<span class="unlock-count">{collected}/{collectible} caught</span>
		{:else if totalCount > 0}
			<span class="unlock-count">{unlockedCount}/{totalCount} unlocked</span>
		{/if}
	</div>

	<div class="unlocks">
		{#each groups as [level, entries]}
			<div class="level-group" class:locked={level > skill.level}>
				<div class="level-label">
					<span>Lv. {level}</span>
					{#if level > skill.level}<span class="lock">🔒</span>{/if}
				</div>
				<div class="entries">
					{#each entries as u (u.kind + u.id)}
						{@const unknown = !!u.collectId && !log[u.collectId]}
						<div
							class="entry kind-{u.kind}"
							class:unknown
							title={unknown ? `Not caught yet · ${u.yields}` : `${KIND_LABEL[u.kind]}: ${u.name}`}
						>
							<img class="entry-img" src={u.image} alt="" />
							<div class="entry-text">
								<span class="entry-name">{unknown ? '???' : u.name}</span>
								<span class="entry-meta">
									{#if u.kind === 'catch'}
										{u.yields}{#if !unknown && log[u.collectId!]?.best} · best {log[u.collectId!].best} cm{/if}
									{:else}
										{KIND_LABEL[u.kind]}{#if u.yields} · {u.yields}{/if} · {u.xp(skill.level)} XP
									{/if}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<p class="empty">Nothing tracked for this skill yet.</p>
		{/each}
	</div>
</article>

<style>
	.skill-card {
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: rgba(18, 14, 8, 0.6);
		border: 1px solid rgba(200, 169, 110, 0.15);
		border-radius: 10px;
		overflow: hidden;
	}

	/* ── Header ── */
	.card-head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px 6px;
		background: rgb(53, 37, 17);
	}
	.skill-icon {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
		background-color: #2d2d2d;
		padding: 4px 4px 7px;
		border-radius: 6px;
		box-shadow: #00000056 0 -3px 0 0 inset;
		border: 3px solid #56493d;
		flex-shrink: 0;
	}
	.head-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.title-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}
	.skill-name {
		margin: 0;
		font-family: var(--font-family-pixel);
		font-size: 1.05rem;
		font-weight: 400;
		color: var(--orange, #d8a85a);
	}
	.skill-level {
		font-family: var(--font-family-pixel);
		font-size: 0.95rem;
		color: #e4d8be;
	}
	.xp-bar {
		position: relative;
		height: 14px;
		background-color: var(--surface-2);
		border: 1px solid black;
		border-radius: 3px;
	}
	.xp-fill {
		height: 100%;
		background-color: var(--color-primary);
		border-radius: 2px;
	}
	.xp-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: 1px 1px 0 black;
	}

	.next-row {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px 6px;
		background: rgba(53, 37, 17, 0.55);
		border-bottom: 1px solid rgba(200, 169, 110, 0.12);
		min-height: 22px;
	}
	.next-label,
	.unlock-count {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.5);
	}
	.unlock-count {
		margin-left: auto;
	}
	.reward-chip {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-family: var(--font-family-pixel);
		font-size: 0.7rem;
		color: #e4d8be;
	}
	.reward-chip img {
		width: 18px;
		height: 18px;
		image-rendering: pixelated;
	}

	/* ── Unlocks ── */
	.unlocks {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 8px 10px 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.level-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.level-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		color: rgba(200, 169, 110, 0.6);
	}
	.lock {
		font-size: 0.55rem;
	}
	.entries {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 4px;
	}
	.entry {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 4px 6px;
		border-radius: 5px;
		background: #252018;
		border: 1px solid rgba(200, 169, 110, 0.08);
		border-left: 3px solid transparent;
		min-width: 0;
	}
	.entry.kind-gather { border-left-color: rgba(104, 211, 145, 0.55); }
	.entry.kind-craft { border-left-color: rgba(255, 196, 87, 0.55); }
	.entry.kind-grow { border-left-color: rgba(99, 202, 255, 0.55); }
	.entry.kind-catch { border-left-color: rgba(98, 182, 255, 0.55); }
	.entry.unknown .entry-img { filter: brightness(0) opacity(0.55); }
	.entry.unknown .entry-name { color: rgba(228, 216, 190, 0.45); }
	.entry-img {
		width: 28px;
		height: 28px;
		object-fit: contain;
		image-rendering: pixelated;
		flex-shrink: 0;
	}
	.entry-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.entry-name {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		color: #e4d8be;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.entry-meta {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: rgba(200, 169, 110, 0.55);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.level-group.locked .entry {
		opacity: 0.45;
		filter: grayscale(0.6);
	}
	.level-group.locked .level-label {
		color: rgba(200, 169, 110, 0.35);
	}
	.empty {
		margin: auto;
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		color: var(--text-muted);
	}
</style>
