<script lang="ts">
	import GameDesignChapter from './GameDesignChapter.svelte';
	import HowToPlayChapter from './HowToPlayChapter.svelte';
	import AchievementsChapter from './AchievementsChapter.svelte';
	import CharactersChapter from './CharactersChapter.svelte';
	import GlossaryChapter from './GlossaryChapter.svelte';

	type Chapter = 'dev_notes' | 'how_to_play' | 'characters' | 'glossary';
	let activeChapter: Chapter = 'dev_notes';

	const chapters: { id: Chapter; title: string; icon: string }[] = [
		{ id: 'dev_notes', title: "Developer's Note", icon: '✍' },
		{ id: 'how_to_play', title: 'Game Basics', icon: '📖' },
		{ id: 'characters', title: 'Characters', icon: '👤' },
		{ id: 'glossary', title: 'Glossary', icon: '⌘' }
	];
</script>

<div class="journal-wrap">
	<!-- Top nav bar -->
	<nav class="top-nav">
		<a href="/" class="back-link">← Return to Game</a>
	</nav>

	<div class="journal-layout">
		<!-- Header + tabs -->
		<header class="journal-header">
			<p class="journal-eyebrow">Dawn's Journey</p>
			<h1 class="journal-title">Journal</h1>
			<div class="tab-row">
				{#each chapters as ch}
					<button
						class="tab-btn"
						class:active={activeChapter === ch.id}
						on:click={() => (activeChapter = ch.id)}
					>
						<span class="tab-icon">{ch.icon}</span>
						{ch.title}
					</button>
				{/each}
			</div>
		</header>

		<!-- Chapter content -->
		<main class="chapter-area">
			{#if activeChapter === 'dev_notes'}
				<GameDesignChapter />
			{:else if activeChapter === 'how_to_play'}
				<HowToPlayChapter />
			{:else if activeChapter === 'characters'}
				<CharactersChapter />
			{:else if activeChapter === 'glossary'}
				<GlossaryChapter />
			{/if}
		</main>
	</div>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	.journal-wrap {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #1a1410;
		color: #c8a878;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
	}

	/* ── Top nav ── */
	.top-nav {
		background-color: #2a1a10;
		border-bottom: 2px solid #5c3d1e;
		box-shadow: #00000056 0 -4px 0 0px inset;
		padding: 0.5rem 1.5rem;
		flex-shrink: 0;
	}

	.back-link {
		color: #cd804d;
		text-decoration: none;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: color 0.15s;
	}
	.back-link:hover {
		color: #e8b96a;
	}

	/* ── Layout ── */
	.journal-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		padding: 0 1.5rem 4rem;
	}

	/* ── Header ── */
	.journal-header {
		text-align: center;
		padding: 2.5rem 0 0;
		margin-bottom: 0;
	}

	.journal-eyebrow {
		font-size: 0.6rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.journal-title {
		font-size: 2.8rem;
		color: #e8b96a;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 0 0 2rem;
		text-shadow: 0 0 24px rgba(201, 151, 58, 0.25);
	}

	/* ── Tabs ── */
	.tab-row {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		flex-wrap: wrap;
		padding-bottom: 0;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		background-color: #2e2010;
		color: #8a6840;
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -3px 0 0px inset;
		padding: 0.55rem 1.2rem 0.7rem;
		border-radius: 8px 8px 0 0;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.tab-btn:hover:not(.active) {
		background-color: #3a2818;
		color: #c8a878;
		border-color: #5c3d1e;
	}

	.tab-btn.active {
		background-color: #3d2010;
		color: #e8b96a;
		border-color: #7a5020;
		border-bottom-color: #3d2010;
		box-shadow: #00000056 0 -3px 0 -2px inset;
	}

	.tab-icon {
		font-size: 0.85rem;
	}

	/* ── Chapter area ── */
	.chapter-area {
		background-color: #1f160c;
		border: 2px solid #5c3d1e;
		border-top: 2px solid #7a5020;
		border-radius: 0 0 12px 12px;
		box-shadow:
			#00000056 0 -6px 0 0px inset,
			0 8px 32px rgba(0, 0, 0, 0.5);
		padding: 2.5rem 2rem;
		min-height: 400px;
	}

	@media (max-width: 600px) {
		.journal-title {
			font-size: 2rem;
		}
		.tab-btn {
			font-size: 0.58rem;
			padding: 0.5rem 0.8rem 0.65rem;
		}
		.chapter-area {
			padding: 1.5rem 1rem;
		}
	}
</style>