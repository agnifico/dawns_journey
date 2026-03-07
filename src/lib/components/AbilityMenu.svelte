<script lang="ts">
	import { combatStore } from '$lib/stores/combatStore';
	import { executePlayerAbility } from '$lib/services/CombatService';
	import AbilityTag from './ui/AbilityTag.svelte';
	import type { Ability } from '$lib/types';

	$: abilities = $combatStore.player?.abilities ?? [];
	$: activeElement = $combatStore.player?.activeElement;
	$: isPlayerTurn = $combatStore.turnPhase === 'player_selecting';

	// Group by abilityType
	const TAB_ORDER = ['Physical Damage', 'Elemental Damage', 'Special'] as const;
	type TabKey = (typeof TAB_ORDER)[number];

	const TAB_LABELS: Record<TabKey, string> = {
		'Physical Damage': '⚔ Physical',
		'Elemental Damage': '✦ Elemental',
		Special: '★ Special'
	};

	let activeTab: TabKey = 'Physical Damage';

	$: grouped = TAB_ORDER.reduce(
		(acc, type) => {
			acc[type] = (abilities as Ability[]).filter(
				(a): a is Ability & { abilityType: TabKey } => a.abilityType === type
			);
			return acc;
		},
		{} as Record<TabKey, Ability[]>
	);

	// Count per tab for the badge
	$: counts = TAB_ORDER.reduce(
		(acc, type) => {
			acc[type] = grouped[type]?.length ?? 0;
			return acc;
		},
		{} as Record<TabKey, number>
	);

	// Touch swipe support
	let touchStartX = 0;
	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}
	function onTouchEnd(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - touchStartX;
		if (Math.abs(dx) < 40) return;
		const idx = TAB_ORDER.indexOf(activeTab);
		if (dx < 0 && idx < TAB_ORDER.length - 1) activeTab = TAB_ORDER[idx + 1];
		if (dx > 0 && idx > 0) activeTab = TAB_ORDER[idx - 1];
	}
</script>

<div class="ability-menu">
	<!-- Tab bar -->
	<div class="tab-bar" role="tablist">
		{#each TAB_ORDER as tab}
			<button
				class="tab-btn"
				class:active={activeTab === tab}
				role="tab"
				aria-selected={activeTab === tab}
				disabled={counts[tab] === 0}
				on:click={() => (activeTab = tab)}
			>
				{TAB_LABELS[tab]}
				{#if counts[tab] > 0}
					<span class="tab-count">{counts[tab]}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Ability grid — swipeable -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="ability-grid" on:touchstart={onTouchStart} on:touchend={onTouchEnd}>
		{#each grouped[activeTab] ?? [] as ability (ability.id)}
			<AbilityTag
				{ability}
				{activeElement}
				interactive
				disabled={!isPlayerTurn}
				onClick={() => executePlayerAbility(ability.id)}
			/>
		{/each}
		{#if (grouped[activeTab]?.length ?? 0) === 0}
			<p class="empty-tab">No {activeTab} abilities</p>
		{/if}
	</div>
</div>

<style>
	.ability-menu {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		gap: 0.4rem;
	}

	/* ── Tab bar ── */
	.tab-bar {
		display: flex;
		gap: 0.35rem;
	}

	.tab-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.35rem 0.5rem;
		background-color: #262626;
		color: #666;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 10px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		transition: 0.1s all ease-in;
		white-space: nowrap;
	}

	.tab-btn:hover:not(:disabled):not(.active) {
		background-color: #2e2e2e;
		color: #999;
		transform: translateY(1px);
		box-shadow: #00000056 0 -3px 0 -2px inset;
	}

	.tab-btn.active {
		background-color: #435e52;
		color: #e9d9ca;
		box-shadow: #00000056 0 -3px 0 0px inset;
	}

	.tab-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.tab-count {
		background-color: #00000040;
		color: #aaa;
		font-size: 0.52rem;
		padding: 1px 4px;
		border-radius: 4px;
		min-width: 1rem;
		text-align: center;
	}
	.tab-btn.active .tab-count {
		color: #e9d9ca;
		background-color: #00000056;
	}

	/* ── Grid ── */
	.ability-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		grid-template-rows: repeat(auto-fit, 1fr);
		max-height: 150px;
		gap: 0.35rem;
		overflow-y: scroll;
		touch-action: pan-y;
		padding-bottom: 1rem;
	}

	.empty-tab {
		grid-row: 1 / -1;
		text-align: center;
		color: #444;
		font-size: 0.7rem;
		font-family: var(--font-family-pixel);
		margin: 0.5rem 0;
		padding: 0.5rem;
	}

	@media (max-width: 600px) {
		.ability-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.tab-btn {
			font-size: 0.52rem;
			padding: 0.3rem 0.35rem;
		}
	}
</style>
