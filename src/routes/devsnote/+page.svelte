<script lang="ts">
	const inspirations = [
		{ system: 'Skilling (Woodcutting, Cooking, Mining)', source: 'RuneScape', original: false },
		{ system: 'Collecting Enemies · Type System', source: 'Pokémon', original: false },
		{ system: 'Combat System', source: 'Pokémon · FallenSword', original: false },
		{ system: 'Map Structure', source: 'FallenSword', original: false },
		{ system: 'Weapon Design Archetypes', source: "Assassin's Creed: Odyssey", original: false },
		{ system: 'Farming System', source: 'Stardew Valley', original: false },
		{ system: 'Affinity / Heart Ranks', source: 'Stardew Valley · Pokémon', original: false },
		{ system: 'Character Art Direction', source: 'Genshin Impact · Wuthering Waves', original: false },
		{ system: 'Relics', source: 'Genshin Artifacts · WuWa Echoes (liberalised)', original: false },
		{ system: 'Precision · Evasion · Speed', source: 'Original', original: true },
		{ system: 'World Resonance', source: 'Original', original: true },
		{ system: 'Time Point System (Cooking)', source: 'Original', original: true }
	];

	const timeline = [
		{ label: 'Origin', desc: "A birthday project. A friend's birthday needed a shareable web thing — a map, a server, a small experience." },
		{ label: 'First build', desc: 'A 2D tile map. A café. Three interactable items. Four AI-generated characters. No combat, no stats.' },
		{ label: 'Swordtember', desc: "Discovered a pixel-art sword collection by a single artist across four years of 'Swordtember'. Became the game's visual spine." },
		{ label: 'Systems era', desc: 'Elements, relics, weapon mastery, enemies, farming, NPC dialogue. Gemini era — big architecture wins, unstable context.' },
		{ label: 'Claude era', desc: 'One and a half months of concentrated work. Combat rebuilt. World Resonance replaces weapon mastery. NPC system complete. Arena live.' },
		{ label: 'Now', desc: 'Map 1 content — NPCs, quests, story. Help docs. Approaching demo-ready.' }
	];

	// Collapsible design-decisions section
	let decisionsOpen = false;

	const decisions = [
		{
			title: 'Build around what you have',
			body: 'Every major system in this game grew from available assets. Swords became central because I found beautiful pixel swords. Relic sets emerged when new icon packs arrived. The one-tile entity system was a constraint that became a feature — simple, scalable, grid-honest. The rule: make everything you have count before reaching for more.'
		},
		{
			title: 'One progression stat, not five',
			body: 'World Resonance is a single number. I was obsessed with keeping combat ungated by build constraints — if you have two elements of a kind that cover two enemy types, you\'re locked out of the third. World Resonance removes that entirely. Quest, explore, grow. That\'s the loop. No grind required.'
		},
		{
			title: 'Five information channels, never more',
			body: 'Every message in the game has exactly one home: dialogue for story, notifications for outcomes, toasts for system state, the message log as an audit trail, achievements as celebrations. Nothing appears in two places. This was a deliberate architectural decision — the messier the system, the more cognitive load it puts on the player for no reason.'
		},
		{
			title: 'Anti-grind at every level',
			body: 'You can complete this game in a week at twenty minutes a day and feel like you earned every step. Enemies don\'t need to be killed fifty times. Passive World Resonance accrues even when you\'re not playing. First-kill bonuses reward discovery, not repetition. I wanted the game to respect your time.'
		},
		{
			title: 'Serverless by principle',
			body: 'No server. No database. No accounts. No personal data collected anywhere. The game runs entirely in the browser and saves to localStorage. This isn\'t laziness — it\'s a statement. A game that depends on nothing but a browser can survive anything. It will still run in twenty years if the files exist.'
		},
		{
			title: 'AI-writable by design',
			body: 'The NPC system, quest system, location events, enemy tables — all are driven by JSON data files with documented schemas. A new map, a new character, a new region, can all be added without touching the engine. I built it to grow by having it structured enough for both humans and AI tools to contribute content.'
		},
		{
			title: 'The map is a chessboard',
			body: 'I chose the simplest possible map representation: a flat 2D grid, one tile per entity, two surface types (land and water). No complex obstacle meshes, no pathfinding. Fast to build, fast to extend, honest about what it is. The tradeoff was visual density — fixed by clustering entities into readable groups over time.'
		},
		{
			title: 'Warm enough for anyone',
			body: 'The design target is someone\'s parent — not dumbed down, but considerate. ADHD-friendly. No seven simultaneous progression bars. No competing notification channels. Clear visual hierarchy. Every system has one entry point and one explanation. The game should never punish a player for having a life.'
		}
	];
</script>

<div class="dev-note">
	<!-- ── Header ── -->
	<div class="note-header">
		<p class="eyebrow">From the Developer</p>
		<h2 class="note-title">Why I Built This</h2>
		<div class="rule"></div>
	</div>

	<!-- ── Section 1: The Why ── -->
	<div class="note-body">
		<p>
			A hundred dollars for a character. Another fifty for her signature weapon, because without it
			she's practically useless. Paid skins. Battle passes. Premium subscriptions locking away
			seventy percent of a game you thought you'd already bought. I got tired of being angry about
			it and started asking a different question: <em>what am I actually handing down?</em>
		</p>

		<p>
			My father gave me his love of geography and history. A Boney M cassette I still know by
			heart. My mother gave me politics, music, the arts — her collection of stamps and coins,
			handled carefully, like small records of the world. I don't know if I'll have children of my
			own, but even as the cool uncle, I want to have something to pass on. Something that teaches.
			Something that lasts.
		</p>

		<p>
			I looked at the games that shaped me. <strong>RuneScape's</strong> open maps and text-based
			grit. <strong>Pokémon</strong>, Yellow to Diamond. Eighty-plus hours inside
			<strong>AC: Odyssey</strong> — twice, because I was a little in love with Aspasia and I don't
			regret it. <strong>Genshin's</strong> theorycrafting and elemental depth. Games taught me to
			read systems, to adapt, to find routes through problems I didn't expect. Gaming built a part
			of me I still can't fully put into words — a personality that knows how to win.
		</p>

		<blockquote>
			But I couldn't name a single game I trust to survive another decade. Every studio that shaped
			me has since made peace with the extraction model. It all ends up on someone's servers
			somewhere, and then it ends.
		</blockquote>

		<p>
			So: a love letter to everything good I've played. And a quiet, sincere <em>fuck you</em> to
			everyone who ruined it.
		</p>
	</div>

	<div class="divider"><span class="diamond"></span></div>

	<!-- ── Section 2: The Brief ── -->
	<div class="section-label-row">
		<span class="section-tag">The Brief</span>
	</div>

	<div class="note-body">
		<p>
			The brief I gave myself was simple. A game that depends on <strong>nothing but a browser</strong>.
			No server. No telemetry. No database, no accounts, no personal data collected anywhere.
			Fully unlockable. Fully completable. A game with a start and an end — because there's genuine
			peace in that, and we've forgotten what it feels like.
		</p>

		<p>
			I wanted it <strong>anti-grind</strong> at every level. Combat progression doesn't ask you to
			defeat five hundred identical enemies to move forward. World Resonance grows passively and
			through meaningful moments. You can complete this in a week at twenty minutes a day and feel
			like you earned every step.
		</p>

		<p>
			I wanted the UI <strong>warm enough that my mum could play it</strong>. Not dumbed down —
			considerate. Designed for the ADHD, the impatient, the neurodivergent, the people who've been
			burned by systems that punish them for having lives. One information channel per message type.
			No competing notifications. No seven currencies and five progression lines running simultaneously.
		</p>

		<p>
			I wanted <strong>characters who are kind</strong>. Complicated, yes — politically sharp,
			carrying real histories — but fundamentally warm. Even through cold facades. A world
			provocative enough to make you think about real things: power, order, the cost of conviction,
			the cost of silence. A world I could eventually repurpose to teach with. The whole
			architecture is AI-writable by design — a few JSON files can add a new map, a new story, a
			new region.
		</p>
	</div>

	<div class="divider"><span class="diamond"></span></div>

	<!-- ── Section 3: How It Was Built ── -->
	<div class="section-label-row">
		<span class="section-tag">How It Got Here</span>
	</div>

	<div class="note-body">
		<p>
			It started as a birthday project — literally. A friend's birthday, and I wanted a
			shareable web thing: a map, something you could click around in, a small shared space.
			I drew a pixel-art café, cut it into tiles, put it in. Three interactable items. Four
			AI-generated characters. No combat, no stats. That was the whole game.
		</p>

		<p>
			Then I found <strong>Swordtember</strong> — a single artist who spent four years making a
			pixel-art sword every day in September. Hundreds of blades. I downloaded the lot of them
			and thought: <em>these are too good not to collect.</em> That was the moment the game got its
			spine. Weapons became the thing you work toward. Everything else was built around that impulse.
		</p>

		<p>
			Elements, relics, farming, enemies, NPC dialogue, factions — most of the systems
			architecture was built in a long Gemini era. Big wins, unstable context. Gemini could
			architect beautifully and then catastrophically rewrite three files at once. I started
			version-controlling by copying entire folders manually. Learned fast.
		</p>

		<p>
			The last month and a half has been the Claude era — and it's been night-and-day. Combat was
			rebuilt from scratch. The weapon mastery system was replaced with World Resonance. The NPC
			system got gifting, heart ranks, sword ranks, battle aftermaths, faction-gated variants.
			The Arena went live. A proper five-channel notification architecture was designed and documented.
			The Journal, the Help system, the Dev's Note — those are being written now.
		</p>
	</div>

	<!-- Timeline -->
	<div class="timeline">
		{#each timeline as entry, i}
			<div class="tl-row">
				<div class="tl-left">
					<span class="tl-dot" class:last={i === timeline.length - 1}></span>
					{#if i < timeline.length - 1}
						<div class="tl-line"></div>
					{/if}
				</div>
				<div class="tl-content">
					<span class="tl-label">{entry.label}</span>
					<p class="tl-desc">{entry.desc}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="divider"><span class="diamond"></span></div>

	<!-- ── Section 4: Design Decisions (collapsible) ── -->
	<div class="section-label-row">
		<span class="section-tag">Design Decisions</span>
		<button class="toggle-btn" on:click={() => (decisionsOpen = !decisionsOpen)}>
			{decisionsOpen ? 'Collapse' : 'Expand'}
			<span class="toggle-arrow" class:open={decisionsOpen}>›</span>
		</button>
	</div>

	{#if decisionsOpen}
		<div class="decisions-grid">
			{#each decisions as d}
				<div class="decision-card">
					<p class="d-title">{d.title}</p>
					<p class="d-body">{d.body}</p>
				</div>
			{/each}
		</div>
	{:else}
		<p class="decisions-teaser">
			Eight documented decisions covering progression philosophy, architecture, information design,
			and build methodology.
		</p>
	{/if}

	<div class="divider"><span class="diamond"></span></div>

	<!-- ── Section 5: Closing ── -->
	<div class="note-body">
		<p>
			This game is six months of my life. Design iterations thrown out at midnight. Code sessions
			that ran until dawn. Built through heartbreaks and unemployment and the particular discipline
			of making something because you need it to exist, not because anyone asked you to.
		</p>

		<p><em>This is my heart and soul, in pixel and code form. I hope it finds a home on your screen.</em></p>
	</div>

	<div class="divider"><span class="diamond"></span></div>

	<!-- ── Inspirations table ── -->
	<div class="inspirations">
		<p class="insp-title">Acknowledgements &amp; Inspirations</p>
		{#each inspirations as row}
			<div class="insp-row">
				<span class="insp-system">{row.system}</span>
				<span class="insp-source" class:original={row.original}>{row.source}</span>
			</div>
		{/each}
	</div>

	<!-- ── Signature ── -->
	<div class="signature">
		<p class="sig-name">Dawn's Journey</p>
		<p class="sig-date">Ashenfall, March 2026</p>
	</div>
</div>

<style>
	.dev-note {
		max-width: 720px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.note-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}

	.note-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 1rem;
	}

	.rule {
		width: 100px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Section label row ── */
	.section-label-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0 0 1.2rem;
	}

	.section-tag {
		font-size: 0.5rem;
		letter-spacing: 4px;
		text-transform: uppercase;
		color: #7a5a20;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* ── Body text ── */
	.note-body {
		color: #c8a878;
		font-size: 0.95rem;
		line-height: 1.8;
		margin-bottom: 0.5rem;
	}

	.note-body p {
		margin-bottom: 1.3em;
	}

	.note-body em {
		color: #e8d4a8;
		font-style: italic;
	}

	.note-body strong {
		color: #e8b96a;
		font-size: 0.85em;
	}

	/* ── Blockquote ── */
	blockquote {
		border-left: 3px solid #7a5a20;
		padding: 0.8rem 0 0.8rem 1.5rem;
		margin: 1.5rem 0;
		color: #e8d4a8;
		font-style: italic;
		font-size: 0.95rem;
		line-height: 1.7;
	}

	/* ── Section divider ── */
	.divider {
		display: flex;
		align-items: center;
		margin: 2rem 0;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(92, 61, 30, 0.4);
	}

	.diamond {
		display: inline-block;
		width: 7px;
		height: 7px;
		background: #7a5a20;
		transform: rotate(45deg);
		margin: 0 12px;
		flex-shrink: 0;
	}

	/* ── Timeline ── */
	.timeline {
		margin: 1.5rem 0 0.5rem;
		padding-left: 0.25rem;
	}

	.tl-row {
		display: flex;
		gap: 14px;
		position: relative;
	}

	.tl-left {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		width: 14px;
	}

	.tl-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #7a5a20;
		flex-shrink: 0;
		margin-top: 4px;
	}

	.tl-dot.last {
		background: #c9973a;
		box-shadow: 0 0 0 2px rgba(201, 151, 58, 0.2);
	}

	.tl-line {
		flex: 1;
		width: 1px;
		background: rgba(92, 61, 30, 0.35);
		margin: 4px 0;
		min-height: 20px;
	}

	.tl-content {
		padding-bottom: 1.2rem;
		flex: 1;
	}

	.tl-label {
		font-size: 0.55rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #c9973a;
		display: block;
		margin-bottom: 0.25rem;
	}

	.tl-desc {
		font-size: 0.78rem;
		color: #7a5a38;
		line-height: 1.55;
		font-style: italic;
		margin: 0;
	}

	/* ── Design decisions ── */
	.toggle-btn {
		background: none;
		border: 1px solid rgba(92, 61, 30, 0.4);
		border-radius: 4px;
		color: #5a3a18;
		font-family: inherit;
		font-size: 0.5rem;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		padding: 3px 8px 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
		transition: border-color 0.12s, color 0.12s;
	}

	.toggle-btn:hover {
		border-color: #7a5a20;
		color: #c8a878;
	}

	.toggle-arrow {
		display: inline-block;
		transition: transform 0.15s;
		font-style: normal;
	}

	.toggle-arrow.open {
		transform: rotate(90deg);
	}

	.decisions-teaser {
		font-size: 0.75rem;
		color: #3d2810;
		font-style: italic;
		margin: 0 0 0.5rem;
		line-height: 1.5;
	}

	.decisions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: 0.5rem;
	}

	.decision-card {
		background: rgba(26, 20, 12, 0.5);
		border: 1px solid #3d2810;
		border-radius: 6px;
		padding: 0.9rem 1rem;
	}

	.d-title {
		font-size: 0.58rem;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		color: #c9973a;
		margin: 0 0 0.5rem;
		line-height: 1.35;
	}

	.d-body {
		font-size: 0.73rem;
		color: #7a5a38;
		line-height: 1.6;
		font-style: italic;
		margin: 0;
	}

	@media (max-width: 560px) {
		.decisions-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ── Inspirations table ── */
	.inspirations {
		background: rgba(26, 20, 12, 0.6);
		border: 1px solid #3d2810;
		border-radius: 6px;
		padding: 1.2rem 1.4rem;
	}

	.insp-title {
		font-size: 0.55rem;
		letter-spacing: 3px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 1rem;
	}

	.insp-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
		padding: 0.5rem 0;
		font-size: 0.78rem;
	}

	.insp-row:last-child {
		border-bottom: none;
	}

	.insp-system {
		color: #7a5a38;
		padding-right: 1rem;
	}

	.insp-source {
		color: #c8a878;
		font-style: italic;
	}

	.insp-source.original {
		color: #c9973a;
		font-style: normal;
		font-weight: 600;
	}

	/* ── Signature ── */
	.signature {
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(92, 61, 30, 0.35);
		text-align: right;
	}

	.sig-name {
		font-size: 0.6rem;
		letter-spacing: 3px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.25rem;
	}

	.sig-date {
		font-size: 0.75rem;
		color: #5a3a18;
		font-style: italic;
	}
</style>