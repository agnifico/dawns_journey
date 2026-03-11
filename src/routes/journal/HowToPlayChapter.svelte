<script lang="ts">
	import { goto } from '$app/navigation';

	let searchQuery = '';

	type TopicCard = {
		icon: string;
		name: string;
		desc: string;
		href: string;
		keywords: string;
		sub?: boolean;
		soon?: boolean;
	};

	type Section = {
		id: string;
		title: string;
		topics: TopicCard[];
	};

	const sections: Section[] = [
		{
			id: 'movement',
			title: 'Movement & World',
			topics: [
				{ icon: '🧭', name: 'Walking', desc: 'How to move, step events, and what triggers on each tile.', href: '/help/walking', keywords: 'walking movement dpad keyboard controls steps' },
				{ icon: '🗺️', name: 'Exploration & Areas', desc: 'Regions, landscapes, and how to unlock new parts of the island.', href: '/help/exploration', keywords: 'exploration areas regions landscapes zones unlock' },
				{ icon: '✦', name: 'World Resonance', desc: 'Your primary progression stat — how it grows and what it unlocks.', href: '/help/world-resonance', keywords: 'world resonance mastery level stat progression' },
				{ icon: '📦', name: 'Random Items', desc: 'Items you find while walking — what they are and where to find them.', href: '/help/items', keywords: 'random items loot drops pickup tile' }
			]
		},
		{
			id: 'enemies',
			title: 'Enemies',
			topics: [
				{ icon: '⚔️', name: 'Enemy Encounters', desc: 'How fights work, what determines victory, and what you lose on escape.', href: '/help/encounters', keywords: 'enemy encounters combat fight mystical beast' },
				{ icon: '💀', name: 'Legendary Enemies', desc: 'Rare, powerful creatures with exclusive drops. Worth the risk.', href: '/help/legendary-enemies', keywords: 'legendary enemies rare elite boss' },
				{ icon: '💎', name: 'Drops', desc: 'How loot tables work and what enemies can give you.', href: '/help/drops', keywords: 'drops loot enemy rewards items after battle' }
			]
		},
		{
			id: 'combat',
			title: 'Combat',
			topics: [
				{ icon: '🔥', name: 'Elemental Effectiveness', desc: 'The seven elements and how they interact in battle.', href: '/help/combat/elements', keywords: 'elemental effectiveness fire water earth wind light dark type weakness' },
				{ icon: '🗡️', name: 'Weapon Stats', desc: 'What each weapon stat does and how they affect combat.', href: '/help/combat/weapon-stats', keywords: 'weapon stats attack damage precision speed evasion' },
				{ icon: '💠', name: 'Elemental Infusion', desc: 'Infusing weapons with elemental power for bonuses.', href: '/help/combat/infusion', keywords: 'elemental infusion weapon element damage type' },
				{ icon: '⚡', name: 'Abilities', desc: 'Types of abilities, how they activate, and character exclusives.', href: '/help/combat/abilities', keywords: 'abilities skills active passive types combat' },
				{ icon: '🏟️', name: 'Arena', desc: 'How the Arena works, how to enter, and how to win.', href: '/help/arena', keywords: 'arena pvp duel challenge combat ranked' },
				{ icon: '📖', name: 'Combat Meta & Guides', desc: 'Builds, strategies, and optimal setups.', href: '#', keywords: 'combat meta guide strategy build', soon: true }
			]
		},
		{
			id: 'characters',
			title: 'Characters',
			topics: [
				{ icon: '👤', name: 'Main Characters', desc: "Who you'll meet, their elements, and why they matter.", href: '/help/characters/main', keywords: 'main characters npc companions hela sylvie veres' },
				{ icon: '💬', name: 'Talking & Quests', desc: 'How conversations work and how they connect to quests.', href: '/help/characters/talking', keywords: 'talk quests dialogue sword rank npc conversation', sub: true },
				{ icon: '🎁', name: 'Gifting & Heart Rank', desc: 'Building relationships through gifts and what it unlocks.', href: '/help/characters/gifting', keywords: 'gifting heart rank affinity npc relationship items give', sub: true },
				{ icon: '⚔️', name: 'Character Combat', desc: 'Challenging characters to duels and building Sword Rank.', href: '/help/characters/combat', keywords: 'character combat challenge sword rank duel npc fight', sub: true }
			]
		},
		{
			id: 'world',
			title: 'World & Story',
			topics: [
				{ icon: '⚜️', name: 'Factions & Reputation', desc: 'The two powers of Ashenfall, how reputation works, and your choice.', href: '/help/factions', keywords: 'factions reputation solis saints shadowhand score rank politics' },
				{ icon: '🏪', name: 'Shop: Café & Grocery', desc: 'What you can buy, sell, and what each shop stocks.', href: '/help/shop', keywords: 'shop cafe grocery buy sell items currency argentum' }
			]
		},
		{
			id: 'skilling',
			title: 'Skilling',
			topics: [
				{ icon: '🌱', name: 'Farming', desc: 'Seeds, watering, growth types, environments, and ideal seasons.', href: '/help/skilling/farming', keywords: 'farming seeds crops grow harvest homestead farm watering growth seasons' },
				{ icon: '🪓', name: 'Woodcutting', desc: "Gathering wood from the island's forests.", href: '/help/skilling/woodcutting', keywords: 'woodcutting wood lumber trees skill chop' },
				{ icon: '⛏️', name: 'Mining', desc: 'Extracting ore, stone, and gems from the mountain regions.', href: '/help/skilling/mining', keywords: 'mining ore stone gems resources rock mineral' },
				{ icon: '⚗️', name: 'Alchemy', desc: 'Brewing potions and elixirs from gathered ingredients.', href: '/help/skilling/alchemy', keywords: 'alchemy potions craft brew ingredients chemistry' },
				{ icon: '🍳', name: 'Cooking', desc: 'Preparing food for buffs, healing, and stat boosts.', href: '/help/skilling/cooking', keywords: 'cooking food recipes ingredients craft eat buff heal' },
				{ icon: '🔨', name: 'Smithing', desc: 'Forging weapons and equipment from raw materials.', href: '/help/skilling/smithing', keywords: 'smithing forge weapons craft metal equipment' }
			]
		},
		{
			id: 'ui',
			title: 'UI & Settings',
			topics: [
				{ icon: '🖥️', name: 'UI & Game Settings', desc: 'The HUD, notification channels, panel toggles, and display options.', href: '/help/ui', keywords: 'ui interface settings hud layout panels notifications toggles controls' }
			]
		}
	];

	// Filter: topic matches if query is empty OR matches name/desc/keywords
	function topicMatches(topic: TopicCard, q: string): boolean {
		if (!q) return true;
		const lower = q.toLowerCase();
		return (
			topic.name.toLowerCase().includes(lower) ||
			topic.desc.toLowerCase().includes(lower) ||
			topic.keywords.toLowerCase().includes(lower)
		);
	}

	$: filteredSections = sections
		.map((s) => ({ ...s, topics: s.topics.filter((t) => topicMatches(t, searchQuery)) }))
		.filter((s) => s.topics.length > 0);

	$: noResults = searchQuery.trim().length > 0 && filteredSections.length === 0;

	function handleCardClick(topic: TopicCard) {
		if (topic.soon) return;
		goto(topic.href);
	}
</script>

<div class="guide-wrap">
	<!-- Page header -->
	<div class="guide-header">
		<p class="guide-eyebrow">Dawn's Journey</p>
		<h2 class="guide-title">Game Basics</h2>
		<p class="guide-sub">Everything you need to know about Ashenfall.</p>
		<div class="rule"></div>

		<div class="search-wrap">
			<span class="search-icon">⌕</span>
			<input
				class="search-input"
				type="text"
				placeholder="Search topics…"
				autocomplete="off"
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="search-clear" on:click={() => (searchQuery = '')}>✕</button>
			{/if}
		</div>
	</div>

	<!-- Topic sections -->
	{#each filteredSections as section (section.id)}
		<div class="section">
			<div class="section-head">
				<span class="section-label">{section.title}</span>
				<div class="section-line"></div>
			</div>
			<div class="topic-grid">
				{#each section.topics as topic}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="topic-card"
						class:sub={topic.sub}
						class:soon={topic.soon}
						on:click={() => handleCardClick(topic)}
						role={topic.soon ? 'presentation' : 'link'}
						tabindex={topic.soon ? -1 : 0}
						on:keydown={(e) => e.key === 'Enter' && handleCardClick(topic)}
					>
						<span class="topic-icon">{topic.icon}</span>
						<div class="topic-content">
							<div class="topic-name">{topic.name}</div>
							<div class="topic-desc">{topic.desc}</div>
						</div>
						{#if topic.soon}
							<span class="badge-soon">Soon</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if noResults}
		<div class="no-results">No topics match "{searchQuery}".</div>
	{/if}
</div>

<style>
	.guide-wrap {
		max-width: 880px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.guide-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.guide-eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.guide-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.guide-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto 1.5rem;
	}

	/* ── Search ── */
	.search-wrap {
		position: relative;
		max-width: 380px;
		margin: 0 auto;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: #5a3a18;
		font-size: 1rem;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		background: #1a1208;
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.5rem 2rem 0.5rem 2rem;
		color: #e8d4a8;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		font-size: 0.65rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus {
		border-color: #7a5020;
	}

	.search-input::placeholder {
		color: #3d2810;
	}

	.search-clear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #5a3a18;
		cursor: pointer;
		font-size: 0.65rem;
		padding: 2px;
	}
	.search-clear:hover {
		color: #c8a878;
	}

	/* ── Sections ── */
	.section {
		margin-bottom: 2rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 0.75rem;
	}

	.section-label {
		font-size: 0.55rem;
		letter-spacing: 4px;
		color: #7a5a20;
		text-transform: uppercase;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: rgba(92, 61, 30, 0.35);
	}

	/* ── Topic grid ── */
	.topic-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 8px;
	}

	/* ── Topic card ── */
	.topic-card {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		background: #1a1208;
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 8px;
		padding: 0.75rem 0.9rem;
		cursor: pointer;
		transition:
			background 0.12s,
			border-color 0.12s,
			transform 0.08s;
	}

	.topic-card:hover:not(.soon) {
		background: #221608;
		border-color: #7a5020;
		transform: translateY(-1px);
	}

	.topic-card:active:not(.soon) {
		transform: translateY(1px);
		box-shadow: #00000056 0 -1px 0 0px inset;
	}

	.topic-card.sub {
		margin-left: 1.2rem;
		background: rgba(16, 10, 4, 0.6);
	}

	.topic-card.soon {
		opacity: 0.4;
		cursor: default;
	}

	.topic-icon {
		font-size: 1rem;
		flex-shrink: 0;
		margin-top: 1px;
		width: 22px;
		text-align: center;
	}

	.topic-content {
		flex: 1;
		min-width: 0;
	}

	.topic-name {
		font-size: 0.62rem;
		letter-spacing: 0.06em;
		color: #e8d4a8;
		text-transform: uppercase;
		margin-bottom: 2px;
		line-height: 1.3;
	}

	.topic-desc {
		font-size: 0.65rem;
		color: #5a3a18;
		line-height: 1.45;
		font-style: italic;
	}

	.badge-soon {
		font-size: 0.5rem;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: 3px;
		background: rgba(92, 61, 30, 0.25);
		color: #5a3a18;
		border: 1px solid rgba(92, 61, 30, 0.3);
		flex-shrink: 0;
		margin-top: 2px;
	}

	/* ── No results ── */
	.no-results {
		text-align: center;
		padding: 2.5rem;
		color: #3d2810;
		font-style: italic;
		font-size: 0.75rem;
	}

	@media (max-width: 500px) {
		.topic-grid {
			grid-template-columns: 1fr;
		}
		.topic-card.sub {
			margin-left: 0.6rem;
		}
	}
</style>