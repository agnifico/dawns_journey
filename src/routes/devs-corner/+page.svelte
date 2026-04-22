<script lang="ts">
	let activeTab: 'story' | 'glance' | 'systems' | 'philosophy' = 'story';

	/* ─────────────── AT A GLANCE ─────────────── */

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
		{ name: 'SvelteKit', role: 'Frontend framework', note: 'All UI, routing, stores, services, components' },
		{ name: 'TypeScript', role: 'Language', note: 'Zero JavaScript in the source — 100% TS' },
		{ name: 'Tiled', role: 'Map editor', note: 'Map design, region placement, NPC/event/enemy positioning' },
		{ name: 'Claude (Anthropic)', role: 'AI coding assistant', note: 'Architecture, systems, debugging, quest logic. Thinking partner.' },
		{ name: 'Tensor Art', role: 'AI image generation', note: 'All NPC artworks — CFG tuning, LORAs, upscaling & all that jazz' },
		{ name: 'Affinity Designer', role: 'Design tool', note: 'Game logo, auxiliary UI and branding work' },
		{ name: 'Veo 3 / WAN Model', role: 'AI video', note: 'AI generated videos for characters - game highlight reel.' },
		{ name: 'Canva', role: 'Video Editing', note: "...what can I say, that's all I needed to blend the above videos." },
		{ name: 'localStorage', role: 'Save system', note: 'No server, no accounts. Browser-native, survives indefinitely. Until you clear cache.' }
	];

	const inspirations = [
		{ system: 'Skilling (Woodcutting, Cooking, Mining)', source: 'RuneScape', original: false },
		{ system: 'Collecting Enemies · Type System', source: 'Pokémon', original: false },
		{ system: 'Combat System', source: 'Pokémon · FallenSword', original: false },
		{ system: 'Map Structure', source: 'FallenSword', original: false },
		{ system: 'Weapon Design Archetypes', source: "Assassin's Creed: Odyssey", original: false },
		{ system: 'Farming System', source: 'Stardew Valley', original: false },
		{ system: 'Affinity / Heart Ranks', source: 'Stardew Valley · Pokémon', original: false },
		{ system: 'Character Art Direction', source: 'Genshin Impact · Wuthering Waves', original: false },
		{ system: 'Relics', source: 'Original', original: true },
		{ system: 'Precision · Evasion · Speed', source: 'Original', original: true },
		{ system: 'World Resonance', source: 'Original', original: true },
		{ system: 'Time Point System (Cooking)', source: 'Original', original: true }
	];

	const timeline = [
		{ label: 'Origin', desc: "Started out as a small virtual experience of a cafe, for a friend's birthday. One small 5x5 map." },
		{ label: 'First build', desc: 'A 2D tile map. Four characters - just an avatar each. No combat, no stats.' },
		{ label: 'AI Tools: Code + Art', desc: 'Discovered the vast resources on the internet for pixel art projects. Used Claude for Code, and tensor art for image generation, eventually.' },
		{ label: 'Systems era', desc: 'Rather than a few pieces of code holding the game together, I decided to make this as complete as possible, which would require a strong core architecture.' },
		{ label: 'The Minigames and Side Quests', desc: 'Farming, Arena, Crafting, quest branching, Cafe, Grocery.' },
		{ label: 'Now', desc: 'Map is complete. Half the quests are complete (Sylvie, Cygwin, Claudia, Guinevere). Arena Combat works just like I wanted - challenging.' }
	];

	/* ─────────────── PRESS KIT ─────────────── */

	const pressKit = {
		pitch: "A serverless browser RPG. No account, no download, no telemetry. It just runs.",
		longPitch: "Dawn's Journey is a solo-built browser RPG in SvelteKit — world exploration, turn-based arena combat, farming, quests, and a full cast of NPCs. No server, no database. Saves to localStorage. If the files exist, the game runs.",
		studio: "June's Forge — solo developer",
		platform: "Browser (desktop). Free. No accounts.",
		url: "https://dawns-journey.vercel.app",
		contact: "agnihotra.bhattacharya@gmail.com",
		social: "junesforge.com · @jxnesforge"
	};

	/* ─────────────── SYSTEMS ─────────────── */

	const systems = [
		{
			id: 'player', title: 'Player & Progression', tag: 'Core',
			what: 'XP, levelling, stats, equipment slots, combat history, position on the map. Player equips 2 weapons and 4 relics. Stats are the sum of all equipped gear plus set bonuses plus active buffs.',
			why: "Stats from gear only — no flat level bonuses yet. This keeps the floor low and the ceiling controlled by what you find and equip, not how long you've played.",
			note: 'Bread has its own hotkey on the HUD. 500 HP and full Aura. Bread is love.',
			screenshots: ['/screenshots/player1.png', '/screenshots/skilltree.png']
		},
		{
			id: 'combat', title: 'Combat System', tag: 'Arena',
			what: "Turn-based combat with a full stat sheet. Speed determines turn order. Abilities have elemental types. Player's available elements are set by equipped weapons — up to two. Evasion, Precision, and Critical systems add variance without removing agency.",
			why: 'Pokémon-influenced but with real build depth. The goal was a system diverse enough for Arena endgame while remaining readable on first contact. Passive gear effects — immunities, flat damage bonuses — layer on top without cluttering the core loop.',
			note: "Probably the part of the game I'm most proud of. Every NPC in the Arena has unique abilities. Sylvie will poison you to death on turn one if you're not careful.",
			screenshots: ['/screenshots/arena1.png', '/screenshots/arena2.png', '/screenshots/arena3.png', '/screenshots/combat1.png']
		},
		{
			id: 'worldresonance', title: 'World Resonance', tag: 'Progression',
			what: "A single progression number that grows through quests, discovery, and time in the game. Common enemies are defeated by comparing the player's WR against the enemy's — no combat required.",
			why: "Anti-grind by design. The old weapon mastery system locked players into elemental builds and punished anything that didn't cover every type. WR removes that entirely. Explore, complete quests, grow. No build prison, no grind wall.",
			note: 'Passive WR accrual even when not playing. First-kill bonuses reward discovery, not repetition.',
			screenshots: ['/screenshots/wr0.png', '/screenshots/wr1.png', '/screenshots/wr2.png']
		},
		{
			id: 'quests', title: 'Quest System', tag: 'Story',
			what: 'Per-NPC quest chains with multiple stages, each with its own requirement type: dialogue, give_item, kill, fight_npc, finish_location_event, watch_scene, and composable OR/AND operators. Conditional success dialogue branches based on world tags. NPCs move to new map positions when quests advance.',
			why: 'Started with give_item and kill. Ended up with a layered system where the same quest stage can branch into completely different story beats based on what the player did earlier. The whole system is JSON-driven — new quests and characters can be added without touching engine code.',
			note: "Scenes support multi-speaker dialogue with conditional lines, player choices that set tags, and continuation branches.",
			screenshots: ['/screenshots/dialogue1.png', '/screenshots/gift1.png', '/screenshots/factions1.png']
		},
		{
			id: 'npcs', title: 'NPCs & Characters', tag: 'Story',
			what: 'Each NPC has sword ranks (quest progression), heart ranks (gifting/affinity), map positions that change with story progress, battle aftermaths with conditional dialogue, faction membership, and a gallery of artworks.',
			why: "Characters should feel like they exist in the world, not just on a static tile. NPCs move as their story advances. Their dialogue branches based on what you've done. The gifting system gives you something to do between quests that actually builds the relationship.",
			note: 'All character designs — names, personalities, outfits, story arcs — are original.',
			screenshots: ['/screenshots/npc1.png', '/screenshots/npc2.png', '/screenshots/gift1.png']
		},
		{
			id: 'farming', title: 'Farming System', tag: 'Homestead',
			what: 'Three environments (Open Field, Greenhouse, Forest Floor), each unlockable via the tech tree. Crops have stage-based or lifetime watering requirements, ideal seasons for bonus yields, and grow even when offline via timestamp-based growth simulation.',
			why: "A deliberate pace-break from combat. Offline growth means your farm rewards time away from the game, not just time in it. Season bonuses are light education — each crop's ideal season maps to real-world agricultural cycles.",
			note: 'Auto-irrigation unlocks via tech tree and satisfies watering on plant. Harvest All batches the whole farm in a single store update.',
			screenshots: ['/screenshots/farming1.png', '/screenshots/farming2.png', '/screenshots/env1.png', '/screenshots/env2.png', '/screenshots/env3.png', '/screenshots/codex.png', '/screenshots/compost.png']
		},
		{
			id: 'time', title: 'Time System', tag: 'World',
			what: 'Two parallel clocks. Real-world time governs farming growth. In-game time advances one unit per step — 50 units per half-day (Dawnrise or Duskfall), 7 revoluts per season, four seasons per year.',
			why: "A custom time system that works for the game's pace rather than forcing the game to fit a real-world clock. Walking-based time means the world responds to how you play, not how long you've sat at the keyboard.",
			note: 'Future plan: 12 in-world months mirroring the Gregorian calendar, so NPCs can have actual birthdays.',
			screenshots: ["/screenshots/night1.png", "/screenshots/day1.png"]
		},
		{
			id: 'equipment', title: 'Equipment & Items', tag: 'Systems',
			what: 'Weapons (swords, staves, bows, fans, spears, warhammers, axes, whips) and Relics (anything non-weapon). Items are instanced — each pickup is a unique object with its own instanceId. Sets give bonus stats when 2/3/4 matching pieces are equipped. Consumables give instant HP/Aura or timed combat buffs.',
			why: 'Instanced items were the hardest architectural decision and the right one. It enables unique drops, item identity, and a proper equip/unequip system. Relics replace a traditional artifact slot system — simpler for a small game, flexible enough for future expansion.',
			note: 'The trigger to switch from Gemini to Claude. Instanced item architecture was the breaking point.',
			screenshots: ['/screenshots/inventory1.png', '/screenshots/inventory2.png', '/screenshots/equipment1.png']
		},
		{
			id: 'crafting', title: 'Crafting & Economy', tag: 'Systems',
			what: "Alchemy, Smithing, Cooking, and Miscellaneous. A + B + ... = Item C. Cooking costs Time Points — one earned per real minute of play. The Café sells items when you're out of ingredients or time. The Grocery section handles miscellaneous items.",
			why: "Economy balance. The goal is to keep items circulating — players should always have a use for materials they've overfarmed, and a path to items they can't find through story alone.",
			note: '',
			screenshots: ['/screenshots/currencies.png', '/screenshots/craft1.png', '/screenshots/craft2.png']
		},
		{
			id: 'map', title: 'Map & World', tag: 'World',
			what: 'A flat 2D grid. One tile per entity. Two surface types: land and water. Regions defined in data and placed in Tiled. Location events, NPCs, enemies, and resources placed as map objects. NPC positions resolve dynamically from player tags and time of day.',
			why: 'Simplest possible representation that scales. No pathfinding, no obstacle mesh. Fast to build, fast to extend, honest about what it is. The grid constraint became a design feature — dense, readable, navigable at speed.',
			note: 'Maps authored in Tiled and processed through a custom Node.js conversion script.',
			screenshots: ['/screenshots/map1.png', '/screenshots/world_night.png', '/screenshots/world2.png']
		}
	];

	/* ─────────────── PHILOSOPHY ─────────────── */

	const decisions = [
		{ title: 'Build around what you have', body: 'Every major system in this game grew from available assets. Swords became central because I found beautiful pixel swords. Relic sets emerged when new icon packs arrived. The one-tile entity system was a constraint that became a feature — simple, scalable, grid-honest. The rule: make everything you have count before reaching for more.' },
		{ title: 'One progression stat, not five', body: "World Resonance is a single number. I was obsessed with keeping combat ungated by build constraints — if you have two elements of a kind that cover two enemy types, you're locked out of the third. World Resonance removes that entirely. Quest, explore, grow. That's the loop. No grind required." },
		{ title: 'Five information channels, never more', body: 'Every message in the game has exactly one home: dialogue for story, notifications for outcomes, toasts for system state, the message log as an audit trail, achievements as celebrations. Nothing appears in two places. This was a deliberate architectural decision — the messier the system, the more cognitive load it puts on the player for no reason.' },
		{ title: 'Anti-grind at every level', body: "You can complete this game in a week at twenty minutes a day and feel like you earned every step. Enemies don't need to be killed fifty times. Passive World Resonance accrues even when you're not playing. First-kill bonuses reward discovery, not repetition. I wanted the game to respect your time." },
		{ title: 'Serverless by principle', body: "No server. No database. No accounts. No personal data collected anywhere. The game runs entirely in the browser and saves to localStorage. This isn't laziness — it's a statement. A game that depends on nothing but a browser can survive anything. It will still run in twenty years if the files exist." },
		{ title: 'AI-writable by design', body: 'The NPC system, quest system, location events, enemy tables — all are driven by JSON data files with documented schemas. A new map, a new character, a new region, can all be added without touching the engine. I built it to grow by having it structured enough for both humans and AI tools to contribute content.' },
		{ title: 'The map is a chessboard', body: 'I chose the simplest possible map representation: a flat 2D grid, one tile per entity, two surface types (land and water). No complex obstacle meshes, no pathfinding. Fast to build, fast to extend, honest about what it is. The tradeoff was visual density — fixed by clustering entities into readable groups over time.' },
		{ title: 'Warm enough for anyone', body: "The design target is someone's parent — not dumbed down, but considerate. ADHD-friendly. No seven simultaneous progression bars. No competing notification channels. Clear visual hierarchy. Every system has one entry point and one explanation. The game should never punish a player for having a life." }
	];

	/* "What I'd Do Differently" as structured items for the philosophy tab */
	const regrets = [
		{ title: 'Wild encounters should be small rooms, not stat checks', body: "I'd redesign how you interact with wild enemies. The anti-grind stance is right and I'd keep it — no farming the same slime for forty minutes. But the current system collapses an encounter into a single stat check, which means the encounter itself carries no weight. I'd want something in the middle: still fast, still respectful of the player's time, but with at least one decision in it. A dodge, a riposte, a choice that costs something." },
		{ title: 'Hire real artists', body: "The game was made with what I had, and AI image generation was a big part of that. It let me build a cast and a world at a speed I couldn't have otherwise. But it set a ceiling. I wanted a cast that was actually diverse — women of different body types, different skin tones, scars, ages, cultural specificity in their outfits. AI image generation is thin on all of those axes. It pulls toward a narrow silhouette and resists detail that doesn't fit its training distribution. With budget, I'd bring on a character artist to redesign the cast with the diversity baked in from the start, a pixel artist to redraw items and weapons uniformly, and someone to do the enemy designs as proper pieces of worldbuilding rather than reskinned archetypes." },
		{ title: 'Start with World Resonance, not weapon mastery', body: "The element-locked combat system I built first was a prison for both the player and for me. Every new weapon had to think about which elements the encounter pool already needed covered. Every new enemy had to think about which builds it was closing off. I spent months designing around a constraint I'd invented, and the game immediately got better the week I removed it. Constraints from the medium are generative. Constraints from your own earlier choices are usually just tax." },
		{ title: 'Version-control from day one', body: "Copying folders manually worked. It was also embarrassing in retrospect and cost me a weekend I could have spent on the Arena. Git from the first commit." },
		{ title: 'Be more patient with the AI coding handoff', body: "There's a real skill to when to let an LLM run and when to stop it. I learned it the expensive way. The first thirty times Gemini created a folder I didn't ask for, I just accepted it. By the hundredth, I'd learned to read the first token of a response and kill the session if it was going sideways. That reflex is worth developing deliberately, not by attrition." },
		{ title: 'Write the case study alongside the build', body: "Not at the end, after the fact — alongside the build, so that the design decisions get documented while they're still live in my head. Half of what's in this article is reconstruction. The half I wrote while the decision was fresh is sharper." }
	];

	/* ─────────────── CAROUSEL STATE ─────────────── */

	let carouselIndex: Record<string, number> = {};
	function prevSlide(id: string, len: number) {
		carouselIndex[id] = ((carouselIndex[id] ?? 0) - 1 + len) % len;
		carouselIndex = { ...carouselIndex };
	}
	function nextSlide(id: string, len: number) {
		carouselIndex[id] = ((carouselIndex[id] ?? 0) + 1) % len;
		carouselIndex = { ...carouselIndex };
	}
</script>

<main>
	<div class="case-study">

		<!-- ─────────── HEADER ─────────── -->
		<div class="header">
			<p class="eyebrow">A Case Study</p>
			<h1 class="page-title">Dawn's Journey</h1>
			<p class="page-sub">A solo-built browser RPG. The story, the numbers, the systems, and the thinking behind them.</p>
			<div class="rule"></div>
		</div>

		<!-- ─────────── TABS ─────────── -->
		<div class="tabs">
			<button class="tab" class:active={activeTab === 'story'} on:click={() => (activeTab = 'story')}>
				The Story
			</button>
			<button class="tab" class:active={activeTab === 'glance'} on:click={() => (activeTab = 'glance')}>
				At a Glance
			</button>
			<button class="tab" class:active={activeTab === 'systems'} on:click={() => (activeTab = 'systems')}>
				Systems
			</button>
			<button class="tab" class:active={activeTab === 'philosophy'} on:click={() => (activeTab = 'philosophy')}>
				Philosophy
			</button>
		</div>

		<!-- ══════════ TAB 1: THE STORY ══════════ -->
		{#if activeTab === 'story'}
			<div class="tab-content story">

				<!-- Hero image: Nuvatra map overview -->
				<figure class="story-figure hero">
					<!-- DROP IMAGE HERE: Nuvatra.png (full map overview) -->
					<img class="map-img" src="/screenshots/nuvatra.png" alt="The Nuvatra map — full overview of the Dawn's Journey world" />
					<figcaption>Nuvatra. About 6900 hand-placed tiles.</figcaption>
				</figure>

				<!-- ── I ── -->
				<div class="chapter">
					<p class="chapter-label">I</p>
					<h2 class="chapter-title">What Happens When You Do Everything Right</h2>
				</div>
				<p>I am a computer science engineer. Manipal Institute of Technology — CS and communication engineering. Good grades. Competitive batch. The kind of school cohort where everyone around you is excellent at something, so you stay sharp just to keep up. I came out of that knowing a fair spread of things: general knowledge, debates, graphic design, the basics of coding. The kind of person who picks things up because he's surrounded by people who already have.</p>
				<p>I got placed at Juniper Networks in Bangalore. Stayed five years. Did my job well. And then, like a lot of people in tech over the last few years, I got laid off.</p>
				<p>Tech layoffs have a particular cruelty to them that takes time to understand. It was not just me — it was batchmates, seniors, juniors, friends. The whole cohort getting swept. You know intellectually that it was a cost decision, that it wasn't personal, that you didn't do anything wrong. Knowing that doesn't make it land any softer. When you've done everything right — good grades, good college, good placement, five good years — and it still happens, there's a specific kind of disorientation that follows. The rulebook you were playing by stops making sense.</p>
				<p>My first instinct was: I don't want to touch tech again.</p>
				<p>So I didn't. Not for a while. I went somewhere else instead.</p>

				<!-- ── II ── -->
				<div class="chapter">
					<p class="chapter-label">II</p>
					<h2 class="chapter-title">Why Does Art Work</h2>
				</div>
				<p>I started asking a question I'd never really sat with before: <em>why does art work?</em> Not appreciating it — I'd always done that. I mean actually interrogating it. What is happening when something is beautiful? What is the mechanism?</p>
				<p>I started watching music videos differently. Not for the music — for the dancers in the background. Their body language. Whether you could tell from the way they moved if the set director had made them feel safe or just used. I started noticing when it was a good environment off-camera and when it wasn't, just from how people carried themselves in the frame. I started asking why certain people become iconic — what the exact combination of qualities is, and how much of it is the person versus how much is the frame the culture put around them.</p>
				<p>I'm a dude who likes women. Not complicated. But my sense of what makes someone attractive has always been more about how they carry themselves than how they look. Talent. Presence. Something intrinsic. And as I went deeper into this art rabbit hole, I kept running into the same frustration: the range of women being represented in games, in media, in generated images — it's thin. Technically diverse on some axes, completely absent on others. Fat women. Disabled women. Women who don't fit the narrow band that gets greenlit. I kept trying to generate characters outside that band with AI tools and hitting a wall. Every tool would pull toward the same silhouette.</p>
				<p>That frustrated me enough to want to do something about it. That feeling — combined with the fact that I'd just watched Genshin Impact take roughly six lakhs from me over the years for characters I loved and couldn't keep — crystallised into a single thought:</p>
				<blockquote>If I want something made right, I'm going to have to make it myself.</blockquote>
				<p>There was one more thing I needed to pick up first. The one area of computer science I'd never touched: web development.</p>

				<!-- ── III ── -->
				<div class="chapter">
					<p class="chapter-label">III</p>
					<h2 class="chapter-title">Svelte, and a Café I'd Been To Once</h2>
				</div>
				<p>I started learning web dev roughly a year before this game existed. I'd worked across enough of technology to know how to learn fast, but frontend was genuinely new territory. I didn't know how a DOM worked. I didn't fully understand services and stores. I was starting from the actual beginning.</p>
				<p>What cracked it open for me was Svelte. The component system — this idea that you could take a piece of your creativity and wrap it in code, give it a shape, pass data into it, and get something visual back — that clicked in a way other frameworks hadn't. I could not explain it at gunpoint in technically precise terms, but I understood it intuitively. I built my own website. Threw some components in. Played around. Looked back at it six months later and found it medieval by my own standards, which I think is the correct metric for whether you're actually learning.</p>
				<p>Then a friend's birthday came up, and I wanted to make something for them. Not a card. Something you could sit with for a few minutes and smile at. I drew a pixel-art version of a café we'd both been to. Cut it into tiles. Made it a 2D top-down map — the kind you see on Pinterest, those tiny isometric cafés people make. Three interactable objects: a sandwich, a hot coffee, a birthday cake. One message each. That was the whole thing. It was an interactable birthday card, not a game.</p>
				<p>But I'd built something. Something that ran in a browser, that someone could walk around in. And I had a Svelte project open, and time, and a head full of things I wanted to make.</p>

				<!-- Optional flashback image: old NEW GAME splash -->
				<figure class="story-figure small">
					<!-- DROP IMAGE HERE: old NEW GAME splash screen (historical) -->
					<img src="/screenshots/old-splash.png" alt="An early version of the Dawn's Journey splash screen" />
					<figcaption>An early build's title screen. Around version 10.</figcaption>
				</figure>

				<!-- ── IV ── -->
				<div class="chapter">
					<p class="chapter-label">IV</p>
					<h2 class="chapter-title">Swordtember and the Spine of the Thing</h2>
				</div>
				<p>The map got bigger. Four AI-generated characters — Hela, Marjane, Veres, Guinevere — appeared first, because I wanted to populate the world with women I found interesting. Items appeared. A type system appeared. Things were being added not from a design document but from whatever I found that was good and available. That became the rule: make everything you have count before reaching for more.</p>
				<p>The thing that gave the game its spine was a discovery. A pixel artist had spent four consecutive Septembers drawing swords — one per day, every September, for years. Hundreds of blades. Different weights, different elements, different personalities. The collection is extraordinary. I downloaded all of it and thought: <em>these are too good not to collect.</em> Weapons became the thing you work toward. The whole inventory system, the element framework, the combat logic — it all grew outward from that one collection and that one feeling.</p>
				<p>Other asset packs followed. Relic sets emerged when new icon collections arrived. Farming appeared when a good tileset turned up. The enemy roster was shaped by which creature sprites looked right for which terrain. I wasn't designing a game from a spec. I was designing one from the materials at hand, which forced me to be creative within constraints rather than theoretical about unlimited possibilities. Constraints, it turns out, are where the actual decisions get made.</p>
				<p>The map itself is a flat 2D grid — one tile per entity, two surface types, land and water. No complex pathfinding, no obstacle meshes. When I first built it that way it was a limitation. By the time I understood what I was building, it was a feature. Simple. Fast. Honest about what it is. Easy to extend.</p>

				<!-- Triptych: map evolution -->
				<figure class="story-figure triptych">
					<div class="triptych-grid">
						<div class="triptych-cell">
							<!-- DROP IMAGE HERE: Image 5 — earliest version map -->
							<img src="/screenshots/map-v1.png" alt="The earliest map, version 1" />
							<span class="triptych-label">v1 · August</span>
						</div>
						<div class="triptych-cell">
							<!-- DROP IMAGE HERE: Image 7 — mid-era map -->
							<img src="/screenshots/map-v2.png" alt="A mid-era version of the map UI" />
							<span class="triptych-label">mid-era</span>
						</div>
						<div class="triptych-cell">
							<!-- DROP IMAGE HERE: Image 4 — current map view -->
							<img src="/screenshots/map-v3.png" alt="The current map view" />
							<span class="triptych-label">current</span>
						</div>
					</div>
					<figcaption>The same screen, three generations apart.</figcaption>
				</figure>

				<!-- ── V ── -->
				<div class="chapter">
					<p class="chapter-label">V</p>
					<h2 class="chapter-title">The Hard Part</h2>
				</div>
				<p>Most of the systems architecture — combat, farming, encounters, NPC dialogue, factions — was built across a long stretch with Gemini as my coding co-pilot. I want to be precise about this because it's easy to oversimplify. Gemini could do some things very well. Architecture, data structures, laying out a clean service pattern — when the task was contained, it delivered.</p>
				<p>The problem was context. Gemini did not understand that two components needed to look the same. It did not understand that a file already existed. It would create new folders unprompted, segment things that should stay together, make changes across three files at once and break the thing that had been working fine yesterday. When I pushed back, called out the specific problem, it would fix one thing and quietly break another. I started version-controlling by copying entire folders manually — not even Git, just duplicating directories before anything got touched. The instinct was right.</p>
				<p>The deeper frustration was that it would not think like a game developer. I was building an RPG. I had told it I was building an RPG. It had access to everything ever written about RPG data structures, RPG progression systems, RPG UI patterns. And it kept treating every question like it was the first question — like it had no model of what I was making or where I was going. I had to tell it my blind spots. I wanted it to tell me mine.</p>
				<p>That period forced me to get better, faster. When your tool can't see what you can see, you have to see more clearly. I got significantly sharper on architecture during that stretch — out of necessity, not choice. I'm not sure I would have built the discipline for the later work without it.</p>
				<p>But it slowed development down considerably. Big days of progress followed by days of quietly reverting everything. The game got built anyway, just slower and harder than it needed to be.</p>

				<!-- ── VI ── -->
				<div class="chapter">
					<p class="chapter-label">VI</p>
					<h2 class="chapter-title">Three Moments</h2>
				</div>
				<p>There were three moments when the game stopped feeling like a project and started feeling like something real.</p>
				<p>The first was exploration gates. When the map had different regions and you needed the right stats to unlock them — when movement through the world became a function of progression — it stopped being a demo and started having stakes. You were somewhere specific. There were places you couldn't go yet.</p>
				<p>The second was the quest system. Location events that only unlocked when a character sent you there. A character asking you to go somewhere, the world responding when you did. That loop — talk, go, return, consequence — is the basic unit of an RPG. When it worked for the first time, the thing had a pulse.</p>
				<p>The third was the Arena. That came much later and felt like a completely different game had been added to the one I already had. Turn-based combat with a full stat sheet, ability loadouts, elemental infusion, speed-based turn order. Standing in a room with Sylvie and watching her actually fight back. That was when I understood what I'd built.</p>

				<!-- ── VII — Two Languages ── -->
				<div class="chapter">
					<p class="chapter-label">VII</p>
					<h2 class="chapter-title">Two Languages</h2>
				</div>
				<p>Somewhere in the middle of all this, the game needed a visual system. Not a theme — a system. A set of rules that every new screen could be built against, so that a farming UI and a quest journal and a shop interface would all feel like they belonged to the same thing without me having to think about it each time.</p>
				<p>What emerged wasn't one language. It was two, each doing a specific job.</p>
				<p>The overworld and its systems — map, inventory, farming, shop, message log, journal — speak in a warmer register. Cream and brown frames. Chunky, tactile buttons that feel like a plastic handheld console. Pixel fonts for headers. Orange for actions you take, blue for actions the world takes. Rounded rectangles and a tiled outer frame. This is the space where you live — where you farm, cook, check your notes, read what someone said to you yesterday. It should feel like something you can sit with.</p>
				<p>The Arena speaks differently. Dark, glossy, cinematic. A red wordmark. Monochrome portraits of every combatant. Stat bars in saturated colour against matte black. Refined typography, no pixel fonts here. This is the space where stakes get settled — and the UI tells you that the second you walk in. Entering the Arena from the overworld should feel like the camera has changed lenses, not like you've opened a different screen in the same app.</p>
				<p>Both registers share some ground rules. A minimum font size of 0.75rem — a hard floor I'd set for myself after catching myself making text too small because it looked better in the mockup. Action-colour consistency, so orange always means commit. The same icon vocabulary. The same inset button shadow grammar — a ledge at the bottom that compresses on press — just tuned differently for cream vs black surfaces.</p>
				<p>One more rule both registers share: information in a fast-moving game has to be digestible without being overwhelming. The message log is split into seven channels — System, World, NPC, Help, Combat, Player, and All — because when something happens, the player shouldn't have to scan a feed of mixed signals to find it. Combat messages go to Combat. System events go to System. Nothing appears in two places. You look where you expect to look and the thing is there.</p>
				<p>A design system that pretends to be a style guide. Which is probably the honest thing most design systems are.</p>

				<!-- Farming register image -->
				<figure class="story-figure">
					<!-- DROP IMAGE HERE: Farming UI — warm register example -->
					<img src="/screenshots/farming1.png" alt="The farming UI — the warm cream register" />
					<figcaption>An older version of the inventory page.</figcaption>
				</figure>

				<!-- ── VIII — The Arena ── -->
				<div class="chapter">
					<p class="chapter-label">VIII</p>
					<h2 class="chapter-title">The Arena</h2>
				</div>

				<!-- Arena before shot -->
				<figure class="story-figure small">
					<!-- DROP IMAGE HERE: old Arena combat — pre-redesign -->
					<img src="/screenshots/arena-old.png" alt="An early version of the Arena combat UI" />
					<figcaption>The Arena, early. Functional but raw.</figcaption>
				</figure>

				<p>The Arena came late and changed the game.</p>
				<p>Before it, combat happened on the overworld. You ran into an enemy on the map, your World Resonance number was compared to theirs, you won or you escaped. Clean, fast, anti-grind. That system still exists and still does what it needs to do.</p>
				<p>But some fights needed more. When you sit down across from Sylvie or Hela or any of the main cast, something should shift. The camera should change lenses. So I built a full turn-based combat system for those moments — stat sheets with HP, Aura, physical and elemental attack and defence, speed, crit rate, crit damage, evasion, precision. Ability loadouts with cooldowns and elemental infusion. Passive traits that shape a character's identity beyond their stats. Speed-based turn order. Wagered outcomes that don't touch your main save.</p>
				<p>The Arena is where the game's fighting-game DNA shows up, where the Pokémon influence shows up, where the years of playing Genshin and FallenSword and quietly noting what worked and what didn't finally gets spent. Every character in the main cast has been designed as a kit — a set of abilities and passives that reward a specific kind of playstyle. Hela punishes low-HP enemies and refuses to be stunned. Sylvie plays a completely different game. Standing in a room with either of them and watching them fight back the way their kit implies — that was when I understood what I'd built.</p>
				<p>The dialogue system supports this too, quietly. Scenes can branch on conditions — items you carry, heart ranks you've earned, quests you've resolved. Characters notice things. Nothing about this is technically novel, but it gives the cast the illusion of memory. Sylvie remembers the gift you brought her last week. Claudia notices you have Veres's sword in your pack. The world, in its small ways, keeps track.</p>

				<!-- Arena after shot -->
				<figure class="story-figure">
					<!-- DROP IMAGE HERE: current Arena combat — full UI -->
					<img src="/screenshots/arena-new.png" alt="The current Arena combat UI" />
					<figcaption>The Arena, current.</figcaption>
				</figure>

				<!-- ── IX — The Last Month and a Half ── -->
				<div class="chapter">
					<p class="chapter-label">IX</p>
					<h2 class="chapter-title">The Last Month and a Half</h2>
				</div>
				<p>The last month and a half has been a different kind of work. The old weapon mastery system — which required specific elemental builds to defeat specific enemies and quietly punished any build that didn't cover every type — got replaced with World Resonance. One number. Grows through quests, through time, through discovery. No grind required. No build prison. You play the game and you get stronger. That's it.</p>
				<p>The NPC system got rebuilt properly. Gifting, heart ranks, sword ranks, battle aftermaths, faction-gated dialogue variants. Every character in the game now has a documented arc — what they want, what they're hiding, how they change as you build trust with them. The five-channel notification architecture — one home for every type of message, nothing appearing in two places — got designed and written up as a proper internal spec. The Journal, the Help system, this article — those are being written now.</p>
				<p>I want to be straight about what isn't finished. The architecture is done. Systems work, the code ships, the loop is closed. But some of the item stats are still test values. Some of the quest endings are still first drafts. A handful of NPCs have partial arcs that trail off where I ran out of a week. There is an Exhibition Mode — a developer shortcut that hands you every item in the game — because not every item is reachable through normal play yet. I know exactly which seams are showing. They are cosmetic, and they are next.</p>
				<p>The reason I'm shipping it anyway is that cosmetic polish is a different kind of work than architecture. The hard part — the part I was actually worried about — is behind me. The rest is the kind of problem that gets solved by sitting with it, not by redesigning it.</p>

				<!-- ── X — What I Actually Want ── -->
				<div class="chapter">
					<p class="chapter-label">X</p>
					<h2 class="chapter-title">What I Actually Want From This</h2>
				</div>
				<p>I've spent roughly six lakhs on Genshin over the years. I want to be clear that I don't regret the individual moments — the characters, the story, the theorycrafting. That game taught me things about systems design that ended up in this one. But it will disappear. Every game I loved will disappear, because they all live on someone's servers, and servers get switched off. I couldn't name a single one I trust to exist in ten years.</p>
				<p>Dawn's Journey runs in a browser. No server, no accounts, no telemetry. The save is localStorage. If the files exist, the game runs. That's the brief I gave myself, and I didn't compromise it.</p>
				<p>The anti-extraction-model thing isn't just about money, though it's also about money. It's about a left-leaning frustration with what gets done to good things when the incentives are misaligned. It's about building something I can actually give to someone — hand it over, walk away, and trust that it still works.</p>
				<p>There's also the educational angle, which I keep coming back to. The whole architecture is AI-writable by design — structured JSON schemas, documented systems, clean separation between engine and content. A new character, a new map, a new region can all be added without touching the engine. I can see a version of this that teaches. I'm keeping that door open.</p>
				<p>But first: the demo. The game that exists right now.</p>

				<div class="divider"><span class="diamond"></span></div>
				<p>This is six months of work. Done during unemployment, during the specific discipline of making something because you need it to exist. The first web app I ever built that became something real. Started as an interactable birthday card for a friend. Ended up with a world, a story, a cast, a combat system, a farming system, a faction war, and a developer who is significantly better at this than when he started.</p>
				<p class="closing"><em>I hope it finds a home on your screen.</em></p>
				<div class="divider"><span class="diamond"></span></div>

				<div class="signature">
					<p class="sig-name">Dawn's Journey</p>
					<p class="sig-date">Ashenfall, April 2026</p>
				</div>
			</div>


		<!-- ══════════ TAB 2: AT A GLANCE ══════════ -->
		{:else if activeTab === 'glance'}
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
					<p>Zero JavaScript in the source — the entire codebase is TypeScript and Svelte. No external game engine. Every system — combat, quests, farming, inventory, saves — written from scratch.</p>
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
								{#if i < timeline.length - 1}<div class="tl-line"></div>{/if}
							</div>
							<div class="tl-content">
								<span class="tl-label">{entry.label}</span>
								<p class="tl-desc">{entry.desc}</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<!-- ─── PRESS KIT ─── -->
				<div class="section-label">Press Kit</div>
				<div class="press-kit">
					<div class="press-row">
						<span class="press-label">Pitch</span>
						<span class="press-value">{pressKit.pitch}</span>
					</div>
					<div class="press-row">
						<span class="press-label">Long</span>
						<span class="press-value">{pressKit.longPitch}</span>
					</div>
					<div class="press-row">
						<span class="press-label">Studio</span>
						<span class="press-value">{pressKit.studio}</span>
					</div>
					<div class="press-row">
						<span class="press-label">Platform</span>
						<span class="press-value">{pressKit.platform}</span>
					</div>
					<div class="press-row">
						<span class="press-label">Play</span>
						<span class="press-value"><a href={pressKit.url} target="_blank" rel="noopener">{pressKit.url}</a></span>
					</div>
					<div class="press-row">
						<span class="press-label">Contact</span>
						<span class="press-value"><a href="mailto:{pressKit.contact}">{pressKit.contact}</a></span>
					</div>
					<div class="press-row">
						<span class="press-label">Social</span>
						<span class="press-value">{pressKit.social}</span>
					</div>
				</div>
			</div>

		<!-- ══════════ TAB 3: SYSTEMS ══════════ -->
		{:else if activeTab === 'systems'}
			<div class="tab-content">
				<div class="note-body">
					<p>Each system below was designed with a specific goal. The "why" is usually more interesting than the "what".</p>
				</div>
				<div class="systems-grid">
					{#each systems as sys}
						<div class="sys-card">
							<div class="sys-header">
								<span class="sys-tag">{sys.tag}</span>
								<h3 class="sys-title">{sys.title}</h3>
							</div>

							{#if sys.screenshots && sys.screenshots.length > 0}
								<div class="carousel">
									<img
										src={sys.screenshots[carouselIndex[sys.id] ?? 0]}
										alt="{sys.title} screenshot"
										class="carousel-img"
									/>
									{#if sys.screenshots.length > 1}
										<button class="carousel-btn prev" on:click={() => prevSlide(sys.id, sys.screenshots.length)}>‹</button>
										<button class="carousel-btn next" on:click={() => nextSlide(sys.id, sys.screenshots.length)}>›</button>
										<div class="carousel-dots">
											{#each sys.screenshots as _, i}
												<span class="dot" class:active={i === (carouselIndex[sys.id] ?? 0)}></span>
											{/each}
										</div>
									{/if}
								</div>
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

		<!-- ══════════ TAB 4: PHILOSOPHY ══════════ -->
		{:else}
			<div class="tab-content">
				<div class="note-body">
					<p>A hundred dollars for a character. Another fifty for her signature weapon, because without it she's practically useless. Paid skins. Battle passes. Premium subscriptions locking away seventy percent of a game you thought you'd already bought. I got tired of being angry about it and started asking a different question: <em>what am I actually handing down?</em></p>
					<p>My father gave me his love of geography and history. A Boney M cassette I still know by heart. My mother gave me politics, music, the arts. I don't know if I'll have children of my own, but even as the cool uncle, I want to have something to pass on. Something that teaches. Something that lasts.</p>
				</div>

				<blockquote>But I couldn't name a single game I trust to survive another decade. Every studio that shaped me has since made peace with the extraction model. It all ends up on someone's servers somewhere, and then it ends.</blockquote>

				<div class="note-body">
					<p>So: a love letter to everything good I've played. And a quiet, sincere <em>fuck you</em> to everyone who ruined it.</p>
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="section-label">The Brief I Gave Myself</div>
				<div class="note-body">
					<p>A game that depends on <strong>nothing but a browser</strong>. No server. No telemetry. No database, no accounts, no personal data collected anywhere. Fully unlockable. Fully completable. A game with a start and an end.</p>
					<p><strong>Anti-grind at every level.</strong> You can complete this in a week at twenty minutes a day and feel like you earned every step.</p>
					<p><strong>Warm enough that my mum could play it.</strong> Not dumbed down — considerate. Designed for the ADHD, the impatient, the people who've been burned by systems that punish them for having lives.</p>
					<p><strong>Characters who are kind.</strong> Complicated, politically sharp, carrying real histories — but fundamentally warm. A world provocative enough to make you think about real things: power, order, the cost of conviction, the cost of silence.</p>
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

				<div class="section-label">What I'd Do Differently</div>
				<div class="note-body">
					<p>A few things I'd change if I were starting over. Writing them down here so they exist outside my head, and so that when I do the next one, they're caught earlier.</p>
				</div>
				<div class="decisions-grid">
					{#each regrets as r}
						<div class="decision-card regret">
							<p class="d-title">{r.title}</p>
							<p class="d-body">{r.body}</p>
						</div>
					{/each}
				</div>

				<div class="divider"><span class="diamond"></span></div>

				<div class="note-body">
					<p>This game is six months of my life. Design iterations thrown out at midnight. Code sessions that ran until dawn. Built through heartbreaks and unemployment and the particular discipline of making something because you need it to exist, not because anyone asked you to.</p>
					<p><em>This is my heart and soul, in pixel and code form. I hope it finds a home on your screen.</em></p>
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
	/* ═══════════════════════════════════════════════
	   SELF-CONTAINED STYLES
	   No :root variables. No external layout assumptions.
	   Fonts degrade gracefully if host site doesn't have them.
	   ═══════════════════════════════════════════════ */

	main {
		background: linear-gradient(170deg, rgb(13, 13, 13), rgb(20, 20, 20) 66%);
		min-height: 100%;
		max-width: 100%;
		padding: 4rem 1rem 6rem;
		color: #c8a878;
	}

	.case-study {
		max-width: max(70%, 430px);
		margin: 0 auto;
	}

	.map-img {
		height: 400px;
		overflow: hidden;
		object-fit: cover;
	}

	/* ── Header ── */
	.header { text-align: center; margin-bottom: 2rem; }
	.eyebrow {
		font-size: 0.55rem; letter-spacing: 5px;
		color: #7a5a20; text-transform: uppercase;
		margin: 0 0 0.6rem;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.page-title {
		font-size: 2rem; color: #e8b96a;
		letter-spacing: -0.3px;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}
	.page-sub {
		font-size: 0.85rem; color: #7a5a38;
		font-style: italic;
		max-width: 560px; margin: 0 auto 1rem;
		line-height: 1.5;
		font-family: 'Pixelify Sans', ui-serif, Georgia, serif;
	}
	.rule {
		width: 100px; height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Tabs ── */
	.tabs {
		display: flex; gap: 6px; margin-bottom: 2rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.25);
		padding-bottom: 0;
		flex-wrap: wrap;
	}
	.tab {
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		font-size: 1rem; letter-spacing: -0.5px;
		text-transform: uppercase;
		color: #f2cc8f;
		background: none; border: none;
		border-bottom: 2px solid transparent;
		padding: 0.5rem 1rem 0.6rem;
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s;
		margin-bottom: -1px;
	}
	.tab:hover { color: #486c52; }
	.tab.active { color: #558663; border-bottom-color: #558663; }
	.tab-content { min-height: 400px; }

	/* ── Section label (shared across tabs) ── */
	.section-label {
		font-size: 1.4rem;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		letter-spacing: -0.5px;
		text-transform: uppercase;
		color: #5c402a;
		margin: 0 auto 1rem;
	}

	/* ═══════════════════════════════════════════════
	   STORY TAB
	   ═══════════════════════════════════════════════ */

	.story {
		font-family: 'Pixelify Sans', ui-serif, Georgia, serif;
		color: #c8a878;
		font-size: 1.15rem;
		line-height: 1.6;
	}
	.story p {
		margin: 0 0 1.4em;
	}
	.story em {
		color: #e8d4a8;
		font-style: italic;
	}
	.chapter {
		margin: 3rem 0 1.2rem;
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}
	.chapter-label {
		font-size: 0.6rem;
		letter-spacing: 4px;
		color: #dd8a2a;
		text-transform: uppercase;
		flex-shrink: 0;
		margin: 0;
		padding-top: 3px;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.chapter-title {
		font-size: 1.2rem;
		color: #c9973a;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin: 0;
		line-height: 1.3;
		border-bottom: 1px solid rgba(92, 61, 30, 0.25);
		padding-bottom: 0.5rem;
		flex: 1;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		font-weight: 500;
	}
	.closing {
		text-align: center;
		font-size: 1rem;
		color: #e8d4a8;
		margin-top: 0.5rem;
	}

	/* ── Figures (story images) ── */
	.story-figure {
		margin: 2.5rem 0;
	}
	.story-figure img {
		width: 100%;
		display: block;
		border: 1px solid rgba(122, 90, 32, 0.35);
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.3);
	}
	.story-figure figcaption {
		font-size: 0.75rem;
		color: #7a5a38;
		font-style: italic;
		text-align: center;
		margin-top: 0.75rem;
		letter-spacing: 0.3px;
		font-family: 'Pixelify Sans', ui-serif, Georgia, serif;
	}
	.story-figure.hero {
		margin-bottom: 3rem;
	}
	.story-figure.small {
		max-width: 75%;
		margin-left: auto;
		margin-right: auto;
	}
	.story-figure.triptych .triptych-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 8px;
	}
	.story-figure.triptych .triptych-cell {
		position: relative;
		border: 1px solid rgba(122, 90, 32, 0.35);
		border-radius: 4px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.3);
		aspect-ratio: 4 / 3;
	}
	.story-figure.triptych .triptych-cell img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border: none;
		border-radius: 0;
		display: block;
	}
	.story-figure.triptych .triptych-label {
		position: absolute;
		bottom: 6px; left: 8px;
		font-size: 0.55rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #e8b96a;
		background: rgba(0, 0, 0, 0.6);
		padding: 3px 6px;
		border-radius: 3px;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}

	blockquote {
		border-left: 3px solid #7a5a20;
		padding: 0.75rem 0 0.75rem 1.5rem;
		margin: 0.5rem 0 1.5rem;
		color: #e8d4a8;
		font-style: italic;
		font-size: 0.95rem;
		line-height: 1.7;
	}

	/* ═══════════════════════════════════════════════
	   AT A GLANCE TAB
	   ═══════════════════════════════════════════════ */

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
		display: flex; flex-direction: column;
		gap: 4px;
	}
	.stat-value {
		font-size: 2rem;
		color: #cc951e;
		line-height: 1;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.stat-label {
		font-family: 'DePixel', 'Pixelify Sans', monospace;
		font-size: 0.9rem;
		letter-spacing: -0.3px;
		text-transform: uppercase;
		color: #f2cc8f;
	}

	.tools-list {
		display: flex; flex-direction: column; gap: 0;
		border: 1px solid #7e501e;
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		background: rgba(26, 20, 12, 0.5);
	}
	.tool-row {
		display: grid;
		grid-template-columns: 1fr 2fr 3fr;
		gap: 12px;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
		font-size: 0.95rem;
		align-items: baseline;
		font-family: 'Ubuntu Mono', 'Roboto Mono', ui-monospace, monospace;
	}
	.tool-row:last-child { border-bottom: none; }
	.tool-name { color: #b18e41; }
	.tool-role { color: #987d51; font-style: italic; }
	.tool-note { color: #8e8c7f; }

	.inspirations {
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
		font-size: 0.95rem;
		font-family: 'Ubuntu Mono', 'Roboto Mono', ui-monospace, monospace;
	}
	.insp-row:last-child { border-bottom: none; }
	.insp-system { color: #b18e41; padding-right: 1rem; }
	.insp-source { color: #987d51; font-style: italic; }
	.insp-source.original { color: #486c52; font-style: normal; font-weight: 600; }

	.timeline { margin: 0 0 0.5rem; padding-left: 0.25rem; }
	.tl-row { display: flex; gap: 14px; position: relative; }
	.tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 14px; }
	.tl-dot { width: 8px; height: 8px; border-radius: 50%; background: #7a5a20; flex-shrink: 0; margin-top: 4px; }
	.tl-dot.last { background: #c9973a; box-shadow: 0 0 0 2px rgba(201, 151, 58, 0.2); }
	.tl-line { flex: 1; width: 1px; background: rgba(92, 61, 30, 0.35); margin: 4px 0; min-height: 20px; }
	.tl-content { padding-bottom: 1.2rem; flex: 1; }
	.tl-label {
		font-size: 0.75rem; letter-spacing: 3px;
		text-transform: uppercase; color: #c9973a;
		display: block; margin-bottom: 0.25rem;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.tl-desc {
		font-size: 0.95rem; color: #7a5a38;
		line-height: 1.55; font-style: italic;
		margin: 0;
		font-family: 'Pixelify Sans', ui-serif, Georgia, serif;
	}

	/* ── Press Kit ── */
	.press-kit {
		border: 1px solid #7e501e;
		border-radius: 6px;
		padding: 0.5rem 1.2rem;
		background: rgba(26, 20, 12, 0.5);
	}
	.press-row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 14px;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
		padding: 0.65rem 0;
		font-size: 0.9rem;
		align-items: baseline;
		font-family: 'Ubuntu Mono', 'Roboto Mono', ui-monospace, monospace;
	}
	.press-row:last-child { border-bottom: none; }
	.press-label {
		color: #7a5a38;
		font-size: 0.65rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.press-value { color: #b18e41; line-height: 1.5; }
	.press-value a { color: #c9973a; text-decoration: none; border-bottom: 1px dotted #7a5a20; }
	.press-value a:hover { color: #e8b96a; border-bottom-color: #e8b96a; }

	/* ═══════════════════════════════════════════════
	   SYSTEMS TAB
	   ═══════════════════════════════════════════════ */

	.systems-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.sys-card {
		background: rgba(26, 20, 12, 0.5);
		border: 1px solid #3d2810;
		border-radius: 6px;
		overflow: hidden;
		display: flex; flex-direction: column;
	}
	.sys-header {
		padding: 0.8rem 1rem 0.6rem;
		border-bottom: 1px solid rgba(92, 61, 30, 0.3);
		display: flex; flex-direction: row-reverse;
		align-items: baseline;
		justify-content: space-between;
		height: fit-content;
	}
	.sys-tag {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: #c49a4c;
		flex-shrink: 0;
		border: 1px solid #5d3e1a;
		padding: 4px 6px;
		border-radius: 3px;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		letter-spacing: 1px;
	}
	.sys-title {
		font-size: 1.1rem; letter-spacing: 0em;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		text-transform: uppercase;
		color: #c9973a;
		font-weight: 400;
		margin: 0;
	}

	.carousel {
		position: relative; width: 100%;
		aspect-ratio: 16/9; overflow: hidden;
		background: rgba(0,0,0,0.3);
	}
	.carousel-img {
		width: 100%; height: 100%;
		object-fit: contain;
		display: block;
	}
	.carousel-btn {
		position: absolute; top: 50%; transform: translateY(-50%);
		background: rgba(26, 20, 12, 0.75);
		border: 1px solid #5d3e1a;
		color: #c49a4c;
		font-size: 1.2rem; line-height: 1;
		width: 28px; height: 28px;
		border-radius: 4px;
		display: flex; align-items: center; justify-content: center;
		cursor: pointer;
		transition: background 0.12s;
		padding: 0;
	}
	.carousel-btn:hover { background: rgba(93, 62, 26, 0.9); color: #e8b96a; }
	.carousel-btn.prev { left: 6px; }
	.carousel-btn.next { right: 6px; }
	.carousel-dots {
		position: absolute; bottom: 6px;
		left: 50%; transform: translateX(-50%);
		display: flex; gap: 5px;
	}
	.dot {
		width: 5px; height: 5px; border-radius: 50%;
		background: rgba(196, 154, 76, 0.35);
		transition: background 0.15s;
	}
	.dot.active { background: #c49a4c; }

	.sys-screenshot-placeholder {
		width: 100%; aspect-ratio: 16/9;
		background: rgba(0,0,0,0.3);
		display: flex; align-items: center; justify-content: center;
		border-bottom: 1px solid rgba(92, 61, 30, 0.2);
	}
	.sys-screenshot-placeholder span {
		font-size: 0.5rem; letter-spacing: 3px;
		text-transform: uppercase;
		color: #3d2810;
	}

	.sys-body { padding: 0.8rem 1rem; flex: 1; }
	.sys-section-label {
		font-size: 0.75rem;
		letter-spacing: -0.3px;
		text-transform: uppercase;
		color: #7c5124;
		margin: 0 0 0.35rem;
		font-family: 'Roboto Mono', 'Ubuntu Mono', ui-monospace, monospace;
	}
	.sys-section-label:not(:first-child) { margin-top: 0.75rem; }
	.sys-text {
		font-size: 0.95rem; color: #987d51;
		line-height: 1.5; margin: 0;
		font-family: 'Ubuntu Mono', 'Roboto Mono', ui-monospace, monospace;
	}
	.sys-note {
		font-size: 0.85rem; color: #7f7467;
		font-style: italic;
		margin: 0.6rem 0 0;
		line-height: 1.5;
		font-family: 'Ubuntu Mono', 'Roboto Mono', ui-monospace, monospace;
	}

	/* ═══════════════════════════════════════════════
	   PHILOSOPHY TAB
	   ═══════════════════════════════════════════════ */

	.note-body {
		color: #8e8c7f;
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 0.5rem;
		font-family: 'Roboto Mono', 'Ubuntu Mono', ui-monospace, monospace;
		letter-spacing: -0.3px;
	}
	.note-body p { margin-bottom: 1.3em; }
	.note-body em { color: #e8d4a8; font-style: italic; }
	.note-body strong { color: #e8b96a; font-size: 0.9em; }

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
	.decision-card.regret {
		border-color: rgba(136, 74, 30, 0.5);
		background: rgba(36, 22, 12, 0.5);
	}
	.d-title {
		font-size: 0.95rem;
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
		letter-spacing: -0.3px;
		text-transform: uppercase;
		color: #c9973a;
		margin: 0 0 0.5rem;
		line-height: 1.35;
	}
	.decision-card.regret .d-title {
		color: #b86f38;
	}
	.d-body {
		font-size: 0.9rem;
		color: #7a5a38;
		line-height: 1.6;
		font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
		letter-spacing: -0.2px;
		margin: 0;
	}

	/* ═══════════════════════════════════════════════
	   SHARED
	   ═══════════════════════════════════════════════ */

	.divider {
		display: flex; align-items: center;
		margin: 2rem 0;
	}
	.divider::before, .divider::after {
		content: '';
		flex: 1; height: 1px;
		background: rgba(92, 61, 30, 0.4);
	}
	.diamond {
		display: inline-block;
		width: 7px; height: 7px;
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
		font-family: 'Lexend', ui-sans-serif, system-ui, sans-serif;
	}
	.sig-date {
		font-size: 0.75rem;
		color: #5a3a18;
		font-style: italic;
		font-family: 'Pixelify Sans', ui-serif, Georgia, serif;
	}

	/* ═══════════════════════════════════════════════
	   RESPONSIVE
	   ═══════════════════════════════════════════════ */

	@media (max-width: 900px) {
		.stat-grid { grid-template-columns: repeat(2, 1fr); }
		.systems-grid { grid-template-columns: 1fr; }
		.decisions-grid { grid-template-columns: 1fr; }
	}

	@media (max-width: 600px) {
		main { padding: 2.5rem 0.75rem 4rem; }
		.page-title { font-size: 1.5rem; }
		.tabs { gap: 0; }
		.tab { font-size: 0.8rem; padding: 0.5rem 0.75rem; }
		.chapter { flex-direction: column; gap: 0.35rem; align-items: flex-start; }
		.chapter-title { width: 100%; font-size: 1.05rem; }
		.story { font-size: 1.05rem; }
		.story-figure.small { max-width: 100%; }
		.story-figure.triptych .triptych-grid { grid-template-columns: 1fr; }
		.tool-row { grid-template-columns: 1fr; gap: 2px; }
		.tool-role, .tool-note { font-size: 0.85rem; }
		.press-row { grid-template-columns: 1fr; gap: 3px; }
	}
</style>