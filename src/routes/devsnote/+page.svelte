<script lang="ts">
	let activeTab: 'glance' | 'systems' | 'philosophy' = 'glance';

	const stats = [
		{ value: '~190', label: 'Source Files' },
		{ value: '89', label: 'Svelte Components' },
		{ value: '25', label: 'Stores' },
		{ value: '31', label: 'Services' },
		{ value: '16', label: 'Pages / Routes' },
		{ value: '200+', label: 'Items' },
		{ value: '50+', label: 'Combat Abilities' },
		{ value: '14', label: 'NPCs with Quest Data' }
	];

	const tools = [
		{
			name: 'SvelteKit',
			role: 'Frontend framework',
			note: 'All UI, routing, stores, services, components'
		},
		{ name: 'TypeScript', role: 'Language', note: 'Zero JavaScript in the source — 100% TS' },
		{
			name: 'Tiled',
			role: 'Map editor',
			note: 'Map design, region placement, NPC/event/enemy positioning'
		},
		{
			name: 'Claude (Anthropic)',
			role: 'AI coding assistant',
			note: 'Architecture, systems, debugging, quest logic. Thinking partner.'
		},
		{
			name: 'Tensor Art',
			role: 'AI image generation',
			note: 'All NPC artworks — CFG tuning, LORAs, upscaling & all that jazz'
		},
		{
			name: 'Affinity Designer',
			role: 'Design tool',
			note: 'Game logo, auxiliary UI and branding work'
		},
		{
			name: 'Veo 3 / WAN Model',
			role: 'AI video',
			note: 'AI generated videos for characters - game highlight reel.'
		},
		{
			name: 'Canva',
			role: 'Video Editing',
			note: "...what can I say, that's all I needed to blend the above videos."
		},
		{
			name: 'localStorage',
			role: 'Save system',
			note: 'No server, no accounts. Browser-native, survives indefinitely. Until you clear cache.'
		}
	];

	const inspirations = [
		{ system: 'Skilling (Woodcutting, Cooking, Mining)', source: 'RuneScape', original: false },
		{ system: 'Collecting Enemies · Type System', source: 'Pokémon', original: false },
		{ system: 'Combat System', source: 'Pokémon · FallenSword', original: false },
		{ system: 'Map Structure', source: 'FallenSword', original: false },
		{ system: 'Weapon Design Archetypes', source: "Assassin's Creed: Odyssey", original: false },
		{ system: 'Farming System', source: 'Stardew Valley', original: false },
		{ system: 'Affinity / Heart Ranks', source: 'Stardew Valley · Pokémon', original: false },
		{
			system: 'Character Art Direction',
			source: 'Genshin Impact · Wuthering Waves',
			original: false
		},
		{ system: 'Relics', source: 'Original', original: true },
		{ system: 'Precision · Evasion · Speed', source: 'Original', original: true },
		{ system: 'World Resonance', source: 'Original', original: true },
		{ system: 'Time Point System (Cooking)', source: 'Original', original: true }
	];

	const timeline = [
		{
			label: 'Origin',
			desc: "Started out as a small virtual experience of a cafe, for a friend's birthday. One small 5x5 map."
		},
		{
			label: 'First build',
			desc: 'A 2D tile map. Four characters - just an avatar each. No combat, no stats.'
		},
		{
			label: 'AI Tools: Code + Art',
			desc: 'Discovered the vast resources on the internet for pixel art projects. Used Claude for Code, and tensor art for image generation, eventually.'
		},
		{
			label: 'Systems era',
			desc: 'Rather than a few pieces of code holding the game together, I decided to make this as complete as possible, which would require a strong core architecture.'
		},
		{
			label: 'The Minigames and Side Quests',
			desc: 'Farming, Arena, Crafting, quest branching, Cafe, Grocery.'
		},
		{
			label: 'Now',
			desc: 'Map is complete. Half the quests are complete (Sylvie, Cygwin, Claudia, Guinevere). Arena Combat works just like I wanted - challenging.'
		}
	];

	const systems = [
		{
			id: 'player',
			title: 'Player & Progression',
			tag: 'Core',
			what: 'XP, levelling, stats, equipment slots, combat history, position on the map. Player equips 2 weapons and 4 relics. Stats are the sum of all equipped gear plus set bonuses plus active buffs.',
			why: "Stats from gear only — no flat level bonuses yet. This keeps the floor low and the ceiling controlled by what you find and equip, not how long you've played.",
			note: 'Bread has its own hotkey on the HUD. 500 HP and full Aura. Bread is love.',
			screenshot: null
		},
		{
			id: 'combat',
			title: 'Combat System',
			tag: 'Arena',
			what: "Turn-based combat with a full stat sheet. Speed determines turn order. Abilities have elemental types. Player's available elements are set by equipped weapons — up to two. Evasion, Precision, and Critical systems add variance without removing agency.",
			why: 'Pokémon-influenced but with real build depth. The goal was a system diverse enough for Arena endgame while remaining readable on first contact. Passive gear effects — immunities, flat damage bonuses — layer on top without cluttering the core loop.',
			note: "Probably the part of the game I'm most proud of. Every NPC in the Arena has unique abilities. Sylvie will poison you to death on turn one if you're not careful.",
			screenshot: null
		},
		{
			id: 'worldresonance',
			title: 'World Resonance',
			tag: 'Progression',
			what: "A single progression number that grows through quests, discovery, and time in the game. Common enemies are defeated by comparing the player's WR against the enemy's — no combat required.",
			why: "Anti-grind by design. The old weapon mastery system locked players into elemental builds and punished anything that didn't cover every type. WR removes that entirely. Explore, complete quests, grow. No build prison, no grind wall.",
			note: 'Passive WR accrual even when not playing. First-kill bonuses reward discovery, not repetition.',
			screenshot: null
		},
		{
			id: 'quests',
			title: 'Quest System',
			tag: 'Story',
			what: 'Per-NPC quest chains with multiple stages, each with its own requirement type: dialogue, give_item, kill, fight_npc, finish_location_event, watch_scene, and composable OR/AND operators. Conditional success dialogue branches based on world tags. NPCs move to new map positions when quests advance.',
			why: 'Started with give_item and kill. Ended up with a layered system where the same quest stage can branch into completely different story beats based on what the player did earlier. The whole system is JSON-driven — new quests and characters can be added without touching engine code.',
			note: "Scenes support multi-speaker dialogue with conditional lines, player choices that set tags, and continuation branches. The waterfall group scene has optional lines that only appear if you've met Veres.",
			screenshot: null
		},
		{
			id: 'npcs',
			title: 'NPCs & Characters',
			tag: 'Story',
			what: 'Each NPC has sword ranks (quest progression), heart ranks (gifting/affinity), map positions that change with story progress, battle aftermaths with conditional dialogue, faction membership, and a gallery of artworks.',
			why: "Characters should feel like they exist in the world, not just on a static tile. NPCs move as their story advances. Their dialogue branches based on what you've done. The gifting system gives you something to do between quests that actually builds the relationship.",
			note: 'All character designs — names, personalities, outfits, story arcs — are original. NPC art generated via Tensor Art with careful CFG and LORA tuning.',
			screenshot: null
		},
		{
			id: 'farming',
			title: 'Farming System',
			tag: 'Homestead',
			what: 'Three environments (Open Field, Greenhouse, Forest Floor), each unlockable via the tech tree. Crops have stage-based or lifetime watering requirements, ideal seasons for bonus yields, and grow even when offline via timestamp-based growth simulation.',
			why: "A deliberate pace-break from combat. Offline growth means your farm rewards time away from the game, not just time in it. Season bonuses are light education — each crop's ideal season maps to real-world agricultural cycles.",
			note: 'Auto-irrigation unlocks via tech tree and satisfies watering on plant. Harvest All batches the whole farm in a single store update.',
			screenshot: null
		},
		{
			id: 'time',
			title: 'Time System',
			tag: 'World',
			what: 'Two parallel clocks. Real-world time governs farming growth. In-game time advances one unit per step — 50 units per half-day (Dawnrise or Duskfall), 7 revoluts per season, four seasons per year.',
			why: "A custom time system that works for the game's pace rather than forcing the game to fit a real-world clock. Walking-based time means the world responds to how you play, not how long you've sat at the keyboard.",
			note: 'Future plan: 12 in-world months mirroring the Gregorian calendar, so NPCs can have actual birthdays.',
			screenshot: null
		},
		{
			id: 'equipment',
			title: 'Equipment & Items',
			tag: 'Systems',
			what: 'Weapons (swords, staves, bows, fans, spears, warhammers, axes, whips) and Relics (anything non-weapon). Items are instanced — each pickup is a unique object with its own instanceId. Sets give bonus stats when 2/3/4 matching pieces are equipped. Consumables give instant HP/Aura or timed combat buffs.',
			why: 'Instanced items were the hardest architectural decision and the right one. It enables unique drops, item identity, and a proper equip/unequip system. Relics replace a traditional artifact slot system — simpler for a small game, flexible enough for future expansion.',
			note: 'The trigger to switch from Gemini to Claude. Instanced item architecture was the breaking point.',
			screenshot: null
		},
		{
			id: 'crafting',
			title: 'Crafting & Economy',
			tag: 'Systems',
			what: "Alchemy, Smithing, Cooking, and Miscellaneous. A + B + ... = Item C. Cooking costs Time Points — one earned per real minute of play. The Café sells items when you're out of ingredients or time. The Grocery section handles miscellaneous items.",
			why: "Economy balance. The goal is to keep items circulating — players should always have a use for materials they've overfarmed, and a path to items they can't find through story alone. Time Points are a soft anti-rush mechanic; cooking requires you to have spent time in the world.",
			screenshot: null
		},
		{
			id: 'map',
			title: 'Map & World',
			tag: 'World',
			what: 'A flat 2D grid. One tile per entity. Two surface types: land and water. Regions defined in data and placed in Tiled. Location events, NPCs, enemies, and resources placed as map objects. NPC positions resolve dynamically from player tags and time of day.',
			why: 'Simplest possible representation that scales. No pathfinding, no obstacle mesh. Fast to build, fast to extend, honest about what it is. The grid constraint became a design feature — dense, readable, navigable at speed.',
			note: 'Maps authored in Tiled and processed through a custom Node.js conversion script.',
			screenshot: null
		}
	];

	const decisions = [
		{
			title: 'Build around what you have',
			body: 'Every major system in this game grew from available assets. Swords became central because I found beautiful pixel swords. Relic sets emerged when new icon packs arrived. The one-tile entity system was a constraint that became a feature — simple, scalable, grid-honest. The rule: make everything you have count before reaching for more.'
		},
		{
			title: 'One progression stat, not five',
			body: "World Resonance is a single number. I was obsessed with keeping combat ungated by build constraints — if you have two elements of a kind that cover two enemy types, you're locked out of the third. World Resonance removes that entirely. Quest, explore, grow. That's the loop. No grind required."
		},
		{
			title: 'Five information channels, never more',
			body: 'Every message in the game has exactly one home: dialogue for story, notifications for outcomes, toasts for system state, the message log as an audit trail, achievements as celebrations. Nothing appears in two places. This was a deliberate architectural decision — the messier the system, the more cognitive load it puts on the player for no reason.'
		},
		{
			title: 'Anti-grind at every level',
			body: "You can complete this game in a week at twenty minutes a day and feel like you earned every step. Enemies don't need to be killed fifty times. Passive World Resonance accrues even when you're not playing. First-kill bonuses reward discovery, not repetition. I wanted the game to respect your time."
		},
		{
			title: 'Serverless by principle',
			body: "No server. No database. No accounts. No personal data collected anywhere. The game runs entirely in the browser and saves to localStorage. This isn't laziness — it's a statement. A game that depends on nothing but a browser can survive anything. It will still run in twenty years if the files exist."
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
			body: "The design target is someone's parent — not dumbed down, but considerate. ADHD-friendly. No seven simultaneous progression bars. No competing notification channels. Clear visual hierarchy. Every system has one entry point and one explanation. The game should never punish a player for having a life."
		}
	];
</script>

<main>
	<div class="devcorner">
		<div class="header">
			<p class="eyebrow">From the Developer</p>
			<h1 class="page-title">Dev's Corner</h1>
			<div class="rule"></div>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button
				class="tab"
				class:active={activeTab === 'glance'}
				on:click={() => (activeTab = 'glance')}
			>
				At a Glance
			</button>
			<button
				class="tab"
				class:active={activeTab === 'systems'}
				on:click={() => (activeTab = 'systems')}
			>
				Systems
			</button>
			<button
				class="tab"
				class:active={activeTab === 'philosophy'}
				on:click={() => (activeTab = 'philosophy')}
			>
				Design & Philosophy
			</button>
		</div>

		<!-- ── TAB 1: AT A GLANCE ── -->
		{#if activeTab === 'glance'}
			<div class="tab-content">
				<div class="section-label">The Numbers</div>
				<div class="stat-grid">
					{#each stats as s}
						<div class="stat-card">
							<span class="stat-value">{s.value}</span>
							<span class="stat-label">{s.label}</span>
						</div>
					{/each}
				</div>

				<div class="note-body" style="margin-top:0.5rem">
					<p>
						Zero JavaScript in the source — the entire codebase is TypeScript and Svelte. No
						external game engine. Every system — combat, quests, farming, inventory, saves — written
						from scratch.
					</p>
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">Tools Used</div>
				<div class="tools-list">
					{#each tools as t}
						<div class="tool-row">
							<span class="tool-name">{t.name}</span>
							<span class="tool-role">{t.role}</span>
							<span class="tool-note">{t.note}</span>
						</div>
					{/each}
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">Inspirations & Acknowledgements</div>
				<div class="inspirations">
					{#each inspirations as row}
						<div class="insp-row">
							<span class="insp-system">{row.system}</span>
							<span class="insp-source" class:original={row.original}>{row.source}</span>
						</div>
					{/each}
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">Timeline</div>
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
			</div>

			<!-- ── TAB 2: SYSTEMS ── -->
		{:else if activeTab === 'systems'}
			<div class="tab-content">
				<div class="note-body">
					<p>
						Each system below was designed with a specific goal. The "why" is usually more
						interesting than the "what".
					</p>
				</div>
				<div class="systems-grid">
					{#each systems as sys}
						<div class="sys-card">
							<div class="sys-header">
								<span class="sys-tag">{sys.tag}</span>
								<h3 class="sys-title">{sys.title}</h3>
							</div>
							<!-- Screenshot slot -->
							{#if sys.screenshot}
								<img src={sys.screenshot} alt="{sys.title} screenshot" class="sys-screenshot" />
							{:else}
								<div class="sys-screenshot-placeholder">
									<span>screenshot</span>
								</div>
							{/if}
							<div class="sys-body">
								<p class="sys-section-label">What it is</p>
								<p class="sys-text">{sys.what}</p>
								<p class="sys-section-label">Why this way</p>
								<p class="sys-text">{sys.why}</p>
								{#if sys.note}
									<p class="sys-note">↳ {sys.note}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- ── TAB 3: PHILOSOPHY ── -->
		{:else}
			<div class="tab-content">
				<div class="note-body">
					<p>
						A hundred dollars for a character. Another fifty for her signature weapon, because
						without it she's practically useless. Paid skins. Battle passes. Premium subscriptions
						locking away seventy percent of a game you thought you'd already bought. I got tired of
						being angry about it and started asking a different question: <em
							>what am I actually handing down?</em
						>
					</p>
					<p>
						My father gave me his love of geography and history. A Boney M cassette I still know by
						heart. My mother gave me politics, music, the arts. I don't know if I'll have children
						of my own, but even as the cool uncle, I want to have something to pass on. Something
						that teaches. Something that lasts.
					</p>
				</div>

				<blockquote>
					But I couldn't name a single game I trust to survive another decade. Every studio that
					shaped me has since made peace with the extraction model. It all ends up on someone's
					servers somewhere, and then it ends.
				</blockquote>

				<div class="note-body">
					<p>
						So: a love letter to everything good I've played. And a quiet, sincere <em>fuck you</em>
						to everyone who ruined it.
					</p>
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">The Brief I Gave Myself</div>
				<div class="note-body">
					<p>
						A game that depends on <strong>nothing but a browser</strong>. No server. No telemetry.
						No database, no accounts, no personal data collected anywhere. Fully unlockable. Fully
						completable. A game with a start and an end.
					</p>
					<p>
						<strong>Anti-grind at every level.</strong> You can complete this in a week at twenty minutes
						a day and feel like you earned every step.
					</p>
					<p>
						<strong>Warm enough that my mum could play it.</strong> Not dumbed down — considerate. Designed
						for the ADHD, the impatient, the people who've been burned by systems that punish them for
						having lives.
					</p>
					<p>
						<strong>Characters who are kind.</strong> Complicated, politically sharp, carrying real histories
						— but fundamentally warm. A world provocative enough to make you think about real things:
						power, order, the cost of conviction, the cost of silence.
					</p>
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">Eight Design Decisions</div>
				<div class="decisions-grid">
					{#each decisions as d}
						<div class="decision-card">
							<p class="d-title">{d.title}</p>
							<p class="d-body">{d.body}</p>
						</div>
					{/each}
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="note-body">
					<p>
						This game is six months of my life. Design iterations thrown out at midnight. Code
						sessions that ran until dawn. Built through heartbreaks and unemployment and the
						particular discipline of making something because you need it to exist, not because
						anyone asked you to.
					</p>
					<p>
						<em
							>This is my heart and soul, in pixel and code form. I hope it finds a home on your
							screen.</em
						>
					</p>
				</div>

				<div class="signature">
					<p class="sig-name">Dawn's Journey</p>
					<p class="sig-date">Ashenfall, April 2026</p>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		background-color: rgb(31, 31, 31);
	}
	.devcorner {
		max-width: max(70%, 430px);
		margin: 0 auto;
		padding-top: 4rem;
	}

	/* ── Header ── */
	.header {
		text-align: center;
		margin-bottom: 2rem;
	}
	.eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}
	.page-title {
		font-size: 2rem;
		color: #e8b96a;
		letter-spacing: -0.3px;
		font-family: "Lexend";
		text-transform: uppercase;
		margin: 0 0 1rem;
	}
	.rule {
		width: 100px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Tabs ── */
	.tabs {
		display: flex;
		gap: 6px;
		margin-bottom: 2rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.25);
		padding-bottom: 0;
	}
	.tab {
		font-family: inherit;
		font-size: 1rem;
		letter-spacing: -0.5px;
		font-family: 'Lexend';
		text-transform: uppercase;
		color: #f2cc8f;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		padding: 0.5rem 1rem 0.6rem;
		cursor: pointer;
		transition:
			color 0.12s,
			border-color 0.12s;
		margin-bottom: -1px;
	}
	.tab:hover {
		color: #486c52;
	}
	.tab.active {
		color: #558663;
		border-bottom-color: #558663;
	}
	.tab-content {
		min-height: 400px;
	}

	/* ── Section label ── */
	.section-label {
		font-size: 1.6rem;
		font-family: 'Lexend';
		letter-spacing: -0.5px;
		text-transform: uppercase;
		color: #5c402a;
		margin: 0 auto 1rem;
	}

	/* ── Stat grid ── */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		margin-bottom: 1.5rem;
	}
	.stat-card {
		background: rgba(26, 20, 12, 0.5);
		border: 1px solid #7e501e;
		border-radius: 6px;
		padding: 0.9rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.stat-value {
		font-size: 2rem;
		color: #cc951e;
		/* letter-spacing: 0.05em; */
		line-height: 1;
		font-family: 'Lexend';
	}
	.stat-label {
		font-family: 'DePixel';
		font-size: 1rem;
		letter-spacing: -0.5px;
		text-transform: uppercase;
		color: #f2cc8f;
	}

	/* ── Tools list ── */
	.tools-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid #7e501e;
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		margin-inline: auto;
		/* width: fit-content; */
		background: rgba(26, 20, 12, 0.5);
	}
	.tool-row {
		display: grid;
		grid-template-columns: 1fr 2fr 3fr;
		gap: 12px;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
		font-size: 1rem;
		align-items: baseline;
	}
	.tool-row:last-child {
		border-bottom: none;
	}
	.tool-name {
		color: #b18e41;
		/* text-align: right; */
	}
	.tool-role {
		color: #987d51;
		font-style: italic;
	}
	.tool-note {
		color: #8e8c7f;
		font-size: 1rem;
	}

	/* ── Inspirations ── */
	.inspirations {
		/* background: rgba(69, 30, 30, 0.6); */
		border: 1px solid #7e501e;
		border-radius: 6px;
		padding: 1.2rem 1.4rem;
		margin-bottom: 0.5rem;
		background: rgba(26, 20, 12, 0.5);
	}
	.insp-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
		padding: 0.5rem 0;
		font-size: 1rem;
	}
	.insp-row:last-child {
		border-bottom: none;
	}
	.insp-system {
		color: #b18e41;
		padding-right: 1rem;
	}
	.insp-source {
		color: #987d51;
		font-style: italic;
	}
	.insp-source.original {
		color: #486c52;
		font-style: normal;
		font-weight: 600;
	}

	/* ── Timeline ── */
	.timeline {
		margin: 0 0 0.5rem;
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
		font-size: 0.75rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #c9973a;
		display: block;
		margin-bottom: 0.25rem;
	}
	.tl-desc {
		font-size: 1rem;
		color: #7a5a38;
		line-height: 1.55;
		font-style: italic;
		margin: 0;
	}

	/* ── Systems grid ── */
	.systems-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.sys-card {
		background: rgba(26, 12, 12, 0.5);
		background: rgba(26, 20, 12, 0.5);
		border: 1px solid #3d2810;
		border-radius: 6px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.sys-header {
		padding: 0.8rem 1rem 0.6rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.3);
		display: flex;
		flex-direction: row-reverse;
		align-items: baseline;
		/* gap: 10px; */
		justify-content: space-between;
		height: fit-content;
	}
	.sys-tag {
		font-size: 0.75rem;
		/* letter-spacing: 3px; */
		text-transform: uppercase;
		color: #c49a4c;
		flex-shrink: 0;
		border: 1px solid #5d3e1a;
		padding: 4px 6px;
		border-radius: 3px;
		/* background-color: #11494c; */
	}
	.sys-title {
		font-size: 1.2rem;
		letter-spacing: 0em;
		font-family: 'Lexend';
		text-transform: uppercase;
		color: #c9973a;
		font-weight: 400;
	}
	.sys-screenshot {
		width: 100%;
		aspect-ratio: 16/9;
		object-fit: cover;
		display: block;
	}
	.sys-screenshot-placeholder {
		width: 100%;
		aspect-ratio: 16/9;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
	}
	.sys-screenshot-placeholder span {
		font-size: 0.5rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #3d2810;
	}
	.sys-body {
		padding: 0.8rem 1rem;
		flex: 1;
	}
	.sys-section-label {
		font-size: 1rem;
		letter-spacing: -0.5px;
		text-transform: uppercase;
		color: #7c5124;
		margin: 0 0 0.35rem;
		font-family: 'Lexend';
	}
	.sys-section-label:not(:first-child) {
		margin-top: 0.75rem;
	}
	.sys-text {
		font-size: 1rem;
		color: #987d51;
		line-height: 1.6;
		margin: 0;
		font-family: 'Inter';
	}
	.sys-note {
		font-size: 1rem;
		color: #7f7467;
		font-style: italic;
		margin: 0.6rem 0 0;
		line-height: 1.5;
		/* font-family: "DePixel"; */
		/* letter-spacing: -.3px; */
	}

	/* ── Philosophy tab ── */
	.note-body {
		color: #8e8c7f;
		font-size: 1.1rem;
		line-height: 1.5;
		margin-bottom: 0.5rem;
		font-family: "Inter";
		letter-spacing: -.3px;
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
	blockquote {
		border-left: 3px solid #7a5a20;
		padding: 0.8rem 0 0.8rem 1.5rem;
		margin: 1.5rem 0;
		color: #e8d4a8;
		font-style: italic;
		font-size: 0.95rem;
		line-height: 1.7;
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

	/* ── Shared ── */
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

	@media (max-width: 600px) {
		.stat-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.systems-grid {
			grid-template-columns: 1fr;
		}
		.decisions-grid {
			grid-template-columns: 1fr;
		}
		.tool-row {
			grid-template-columns: 1fr;
			gap: 2px;
		}
		.tool-note {
			display: none;
		}
	}
</style>
