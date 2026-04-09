<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import CharactersChapter from './CharactersChapter.svelte';
	import EnemiesChapter from './EnemiesChapter.svelte';
	import ItemsChapter from './ItemsChapter.svelte';
	import AchievementsChapter from './AchievementsChapter.svelte';

	type Tab = 'characters' | 'enemies' | 'items';

	// Read tab from URL hash, fall back to 'characters'
	function getTabFromHash(): Tab {
		if (typeof window === 'undefined') return 'characters';
		const h = window.location.hash.replace('#', '') as Tab;
		return ['characters', 'enemies', 'items'].includes(h) ? h : 'characters';
	}

	let activeTab: Tab = getTabFromHash();

	function setTab(tab: Tab) {
		activeTab = tab;
		if (typeof window !== 'undefined') {
			window.location.hash = tab;
		}
	}

	const tabs: { id: Tab; label: string; icon: string }[] = [
		{ id: 'characters', label: 'Characters', icon: '👤' },
		{ id: 'enemies',    label: 'Enemies',    icon: '💀' },
		{ id: 'items',      label: 'Items',       icon: '📦' }
	];
</script>

<div class="journal-page">
	<!-- Header -->
	<div class="journal-header">
		<p class="eyebrow">Dawn's Journey</p>
		<h1 class="journal-title">Journal</h1>
		<p class="journal-sub">A record of Ashenfall — its people, creatures, and relics.</p>
		<div class="rule"></div>
	</div>

	<!-- Tab bar -->
	<div class="tab-bar" role="tablist">
		{#each tabs as tab}
			<button
				class="tab-btn"
				class:active={activeTab === tab.id}
				role="tab"
				aria-selected={activeTab === tab.id}
				on:click={() => setTab(tab.id)}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>

	<!-- Chapter content -->
	<div class="chapter-body">
		{#if activeTab === 'characters'}
			<CharactersChapter />
		{:else if activeTab === 'enemies'}
			<EnemiesChapter />
		{:else if activeTab === 'items'}
			<AchievementsChapter />
		{/if}
	</div>
</div>

<style>
	.journal-page {
		max-width: 960px;
		margin: 0 auto;
		background-color: rgb(26, 26, 26);
	}

	/* ── Header ── */
	.journal-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-top: 1rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		letter-spacing: 5px;
		color: #9b752d;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.journal-title {
		font-size: 2rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.journal-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Tab bar ── */
	.tab-bar {
		display: flex;
		gap: 6px;
		margin: 1.75rem 0 1.5rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.3);
		padding-bottom: 0;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px; /* sit on top of tab-bar border */
		padding: 0.5rem 0.85rem 0.55rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.58rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #3d2810;
		transition:
			color 0.12s,
			border-color 0.12s;
	}

	.tab-btn:hover {
		color: #c8a878;
	}

	.tab-btn.active {
		color: #e8b96a;
		border-bottom-color: #c9973a;
	}

	.tab-icon {
		font-size: 0.85rem;
		line-height: 1;
	}

	/* ── Chapter body ── */
	.chapter-body {
		padding-top: 0.5rem;
	}

	@media (max-width: 500px) {
		.tab-label {
			display: none;
		}
		.tab-btn {
			padding: 0.5rem 0.7rem;
		}
		.tab-icon {
			font-size: 1.1rem;
		}
	}
</style>