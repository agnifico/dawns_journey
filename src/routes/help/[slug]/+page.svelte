<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// ── Article data ──────────────────────────────────────────────────────────
	// Each article is keyed by its slug. Add new articles here.
	// You can later move this to a separate data file and import it.

	type InfoBox = { type: 'tip' | 'note' | 'warning'; content: string };
	type TableRow = { cells: string[] };

	type ArticleSection = {
		heading?: string;
		body?: string; // HTML string — use sparingly, prefer structured content
		infoBox?: InfoBox;
		table?: { headers: string[]; rows: TableRow[] };
	};

	type Article = {
		slug: string;
		section: string; // Section label (e.g. "Movement & World")
		title: string;
		lead: string;
		content: ArticleSection[];
		related: { icon: string; name: string; href: string }[];
	};

	const articles: Record<string, Article> = {
		walking: {
			slug: 'walking',
			section: 'Movement & World',
			title: 'Walking',
			lead: 'How movement works, what happens on each tile, and what to expect when you step into the unknown.',
			content: [
				{
					heading: 'Controls',
					body: 'Movement is tile-based — every input moves you exactly one step. On <strong>desktop</strong>, use <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or the arrow keys. On <strong>mobile</strong>, use the D-Pad in the bottom-right corner of the map.',
					infoBox: { type: 'tip', content: 'You can hold a direction key to move continuously. The game processes each step individually, so encounters will still interrupt movement as normal.' }
				},
				{
					heading: 'What Happens on Each Step',
					body: 'Every tile you step onto has a chance of triggering one of several outcomes. The Event Screen updates on each step.',
					table: {
						headers: ['Outcome', 'What It Means'],
						rows: [
							{ cells: ['Nothing', 'The tile is empty. The Event Screen shows the landscape art for this region. Sometimes it\'s just nice to look.'] },
							{ cells: ['Enemy Encounter', 'A Mystical Beast is on this tile. Combat resolves automatically — see Enemy Encounters for how it works.'] },
							{ cells: ['Item Found', 'You\'ve picked up a random item. It goes directly into your inventory. The type depends on the region.'] },
							{ cells: ['Character', 'A character is on this tile. Their card appears in the Event Screen with options to Talk, Challenge, or Gift.'] },
							{ cells: ['Location Event', 'A scripted event tied to this tile. A dialogue sequence plays, with possible choices, rewards, or consequences.'] },
							{ cells: ['Resource Node', 'A gathering spot — wood, ore, plants. You can harvest directly from the Event Screen.'] }
						]
					}
				},
				{
					heading: 'The Event Screen',
					body: 'The floating Event Screen panel updates on every step. You can drag it anywhere within the map canvas if it\'s covering something you want to see. It resets to its default position when the event type changes.',
					infoBox: { type: 'note', content: 'On an empty tile, the Event Screen shows the landscape art for your current region. This is atmospheric, not just placeholder — each region has its own look.' }
				}
			],
			related: [
				{ icon: '🗺️', name: 'Exploration & Areas', href: '/help/exploration' },
				{ icon: '⚔️', name: 'Enemy Encounters', href: '/help/encounters' },
				{ icon: '📦', name: 'Random Items', href: '/help/items' },
				{ icon: '✦', name: 'World Resonance', href: '/help/world-resonance' }
			]
		},

		// ── ADD MORE ARTICLES BELOW ──
		// Copy the structure above. Each article maps its slug to its content.
		// The help index in HowToPlayChapter.svelte uses `/help/{slug}` hrefs —
		// make sure the slugs match.

		'world-resonance': {
			slug: 'world-resonance',
			section: 'Movement & World',
			title: 'World Resonance',
			lead: 'The stat that measures your connection to Ashenfall — and the primary way combat difficulty scales.',
			content: [
				{
					heading: 'What It Is',
					body: 'World Resonance is a player-level stat that represents how attuned you\'ve become to the island\'s energy. Unlike traditional level-grinding, it grows through three distinct sources and is never tied to how many enemies you\'ve killed.'
				},
				{
					heading: 'How It Grows',
					table: {
						headers: ['Source', 'Amount', 'Notes'],
						rows: [
							{ cells: ['Passive accumulation', '+15 per in-game day', 'Claimed automatically on load. Roughly 96 real-world minutes per point.'] },
							{ cells: ['Quest rewards', 'Varies', 'Awarded via add_world_resonance effects in quest data.'] },
							{ cells: ['First-kill bonus', '+5 per enemy type', 'One-time reward for defeating each unique enemy for the first time.'] }
						]
					},
					infoBox: { type: 'tip', content: 'Passive accumulation happens even when you\'re not playing. Log in after a break and you\'ll find your World Resonance has grown.' }
				},
				{
					heading: 'Using It in Combat',
					body: 'Each enemy in the game has a <strong>Resonance Requirement</strong> listed in the Event Screen. The check is simple: if your World Resonance meets or exceeds the requirement, you win the encounter automatically. Fail it, and you escape — you lose a small amount of HP, and the enemy disappears.',
					infoBox: { type: 'note', content: 'World Resonance is a single number. There\'s no elemental split — your combined Resonance applies to every fight.' }
				}
			],
			related: [
				{ icon: '⚔️', name: 'Enemy Encounters', href: '/help/encounters' },
				{ icon: '🧭', name: 'Walking', href: '/help/walking' },
				{ icon: '💀', name: 'Legendary Enemies', href: '/help/legendary-enemies' }
			]
		}
	};

	// ── Route resolution ──────────────────────────────────────────────────────
	$: slug = $page.params.slug;
	$: article = articles[slug] ?? null;

	// Info box label map
	const infoLabels = { tip: 'Tip', note: 'Note', warning: 'Warning' };
</script>

<div class="help-wrap">
	<!-- Breadcrumb -->
	<div class="breadcrumb">
		<button class="bc-link" on:click={() => goto('/journal')}>Journal</button>
		<span class="bc-sep">›</span>
		<button class="bc-link" on:click={() => goto('/journal')}>Game Basics</button>
		<span class="bc-sep">›</span>
		<span class="bc-current">{article?.title ?? slug}</span>
	</div>

	{#if article}
		<!-- Article header -->
		<div class="art-header">
			<p class="art-section">{article.section}</p>
			<h1 class="art-title">{article.title}</h1>
			<p class="art-lead">{article.lead}</p>
			<div class="rule"></div>
		</div>

		<!-- Article content -->
		<div class="art-body">
			{#each article.content as block}
				{#if block.heading}
					<h2 class="block-heading">{block.heading}</h2>
				{/if}

				{#if block.body}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p class="block-text">{@html block.body}</p>
				{/if}

				{#if block.infoBox}
					<div class="info-box box-{block.infoBox.type}">
						<div class="box-label">{infoLabels[block.infoBox.type]}</div>
						<div class="box-content">{block.infoBox.content}</div>
					</div>
				{/if}

				{#if block.table}
					<div class="table-wrap">
						<table class="art-table">
							<thead>
								<tr>
									{#each block.table.headers as h}
										<th>{h}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each block.table.rows as row}
									<tr>
										{#each row.cells as cell, i}
											<td class:td-key={i === 0}>{@html cell}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Related topics -->
		{#if article.related.length > 0}
			<div class="related">
				<p class="related-label">Related Topics</p>
				<div class="related-links">
					{#each article.related as rel}
						<button class="rel-link" on:click={() => goto(rel.href)}>
							<span>{rel.icon}</span>
							{rel.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

	{:else}
		<!-- 404 state -->
		<div class="not-found">
			<p class="nf-title">Article not found</p>
			<p class="nf-sub">This topic hasn't been written yet, or the link is incorrect.</p>
			<button class="nf-back" on:click={() => goto('/journal')}>← Back to Journal</button>
		</div>
	{/if}
</div>

<style>
	.help-wrap {
		max-width: 680px;
		margin: 0 auto;
		padding: 0;
		color: #c8a878;
	}

	/* ── Breadcrumb ── */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.55rem;
		letter-spacing: 2px;
		text-transform: uppercase;
	}

	.bc-link {
		background: none;
		border: none;
		color: #5a3a18;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		padding: 0;
		transition: color 0.12s;
	}
	.bc-link:hover {
		color: #c9973a;
	}

	.bc-sep {
		color: #3d2810;
	}

	.bc-current {
		color: #7a5a20;
	}

	/* ── Article header ── */
	.art-header {
		margin-bottom: 1.8rem;
	}

	.art-section {
		font-size: 0.55rem;
		letter-spacing: 4px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.art-title {
		font-size: 1.8rem;
		color: #e8b96a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
		line-height: 1.15;
	}

	.art-lead {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.8rem;
		line-height: 1.55;
		margin: 0 0 1rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
	}

	/* ── Body ── */
	.art-body {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.block-heading {
		font-size: 0.6rem;
		letter-spacing: 3px;
		color: #c9973a;
		text-transform: uppercase;
		margin: 1.5rem 0 0.6rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.3);
	}

	.block-text {
		font-size: 0.82rem;
		line-height: 1.75;
		color: #c8a878;
		margin: 0 0 0.8rem;
	}

	:global(.block-text strong) {
		color: #e8d4a8;
	}

	:global(.block-text kbd) {
		display: inline-block;
		background: rgba(92, 61, 30, 0.35);
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 4px;
		padding: 1px 6px 2px;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		font-size: 0.7em;
		color: #e8b96a;
		vertical-align: middle;
		margin: 0 2px;
	}

	/* ── Info boxes ── */
	.info-box {
		border-radius: 6px;
		padding: 0.7rem 0.9rem;
		margin: 0.8rem 0;
		font-size: 0.78rem;
		line-height: 1.6;
	}

	.box-label {
		font-size: 0.5rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		margin-bottom: 4px;
		font-weight: 600;
	}

	.box-content {
		color: #c8a878;
	}

	.box-tip {
		background: rgba(42, 72, 42, 0.2);
		border-left: 3px solid #4a8c4a;
	}
	.box-tip .box-label { color: #7edb7e; }

	.box-note {
		background: rgba(80, 55, 15, 0.25);
		border-left: 3px solid #c08020;
	}
	.box-note .box-label { color: #c9973a; }

	.box-warning {
		background: rgba(80, 28, 28, 0.25);
		border-left: 3px solid #c04040;
	}
	.box-warning .box-label { color: #e05252; }

	/* ── Tables ── */
	.table-wrap {
		overflow-x: auto;
		margin: 0.8rem 0;
	}

	.art-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}

	.art-table th {
		font-size: 0.5rem;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		color: #7a5a20;
		text-align: left;
		padding: 0.5rem 0.75rem;
		background: rgba(26, 18, 8, 0.8);
		border-bottom: 2px solid #3d2810;
	}

	.art-table td {
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.15);
		color: #c8a878;
		vertical-align: top;
		line-height: 1.5;
	}

	.art-table tr:last-child td {
		border-bottom: none;
	}

	.art-table tr:hover td {
		background: rgba(42, 26, 8, 0.3);
	}

	.art-table td.td-key {
		color: #e8b96a;
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	/* ── Related ── */
	.related {
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(92, 61, 30, 0.3);
	}

	.related-label {
		font-size: 0.5rem;
		letter-spacing: 3px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}

	.related-links {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.rel-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #1a1208;
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.4rem 0.75rem 0.5rem;
		color: #c8a878;
		font-family: inherit;
		font-size: 0.62rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			border-color 0.12s,
			color 0.12s;
	}

	.rel-link:hover {
		border-color: #7a5020;
		color: #e8d4a8;
	}

	/* ── 404 ── */
	.not-found {
		text-align: center;
		padding: 3rem 1rem;
	}

	.nf-title {
		font-size: 1rem;
		color: #e8b96a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.nf-sub {
		color: #5a3a18;
		font-size: 0.75rem;
		font-style: italic;
		margin: 0 0 1.5rem;
	}

	.nf-back {
		background: #1a1208;
		border: 2px solid #5c3d1e;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 6px;
		color: #c9973a;
		font-family: inherit;
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.5rem 1.2rem 0.65rem;
		cursor: pointer;
		transition: border-color 0.12s;
	}

	.nf-back:hover {
		border-color: #7a5020;
	}
</style>