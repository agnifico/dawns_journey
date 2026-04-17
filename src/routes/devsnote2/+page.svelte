<script lang="ts">
</script>

<main>
	<div class="journey-wrap">
		<div class="journey-header">
			<p class="eyebrow">From the Developer</p>
			<h1 class="journey-title">The Journey</h1>
			<p class="journey-sub">How a birthday gift became a game. The full story.</p>
			<div class="rule"></div>
		</div>

		<div class="body">
			<!-- ── I. The Layoff ── -->
			<div class="chapter">
				<p class="chapter-label">I</p>
				<h2 class="chapter-title">What Happens When You Do Everything Right</h2>
			</div>

			<p>
				I am a computer science engineer. Manipal Institute of Technology — CS and communication
				engineering. Good grades. Competitive batch. The kind of school cohort where everyone around
				you is excellent at something, so you stay sharp just to keep up. I came out of that knowing
				a fair spread of things: general knowledge, debates, graphic design, the basics of coding.
				The kind of person who picks things up because he's surrounded by people who already have.
			</p>

			<p>
				I got placed at Juniper Networks in Bangalore. Stayed five years. Did my job well. And then,
				like a lot of people in tech over the last few years, I got laid off.
			</p>

			<p>
				Tech layoffs have a particular cruelty to them that takes time to understand. It was not
				just me — it was batchmates, seniors, juniors, friends. The whole cohort getting swept. You
				know intellectually that it was a cost decision, that it wasn't personal, that you didn't do
				anything wrong. Knowing that doesn't make it land any softer. When you've done everything
				right — good grades, good college, good placement, five good years — and it still happens,
				there's a specific kind of disorientation that follows. The rulebook you were playing by
				stops making sense.
			</p>

			<p>My first instinct was: I don't want to touch tech again.</p>

			<p>So I didn't. Not for a while. I went somewhere else instead.</p>

			<!-- ── II. The Rabbit Hole ── -->
			<div class="chapter">
				<p class="chapter-label">II</p>
				<h2 class="chapter-title">Why Does Art Work</h2>
			</div>

			<p>
				I started asking a question I'd never really sat with before: <em>why does art work?</em>
				Not appreciating it — I'd always done that. I mean actually interrogating it. What is happening
				when something is beautiful? What is the mechanism?
			</p>

			<p>
				I started watching music videos differently. Not for the music — for the dancers in the
				background. Their body language. Whether you could tell from the way they moved if the set
				director had made them feel safe or just used. I started noticing when it was a good
				environment off-camera and when it wasn't, just from how people carried themselves in the
				frame. I started asking why certain people become iconic — what the exact combination of
				qualities is, and how much of it is the person versus how much is the frame the culture put
				around them.
			</p>

			<p>
				I'm a dude who likes women. Not complicated. But my sense of what makes someone attractive
				has always been more about how they carry themselves than how they look. Talent. Presence.
				Something intrinsic. And as I went deeper into this art rabbit hole, I kept running into the
				same frustration: the range of women being represented in games, in media, in generated
				images — it's thin. Technically diverse on some axes, completely absent on others. Fat
				women. Disabled women. Women who don't fit the narrow band that gets greenlit. I kept trying
				to generate characters outside that band with AI tools and hitting a wall. Every tool would
				pull toward the same silhouette.
			</p>

			<p>
				That frustrated me enough to want to do something about it. That feeling — combined with the
				fact that I'd just watched Genshin Impact take roughly six lakhs from me over the years for
				characters I loved and couldn't keep — crystallised into a single thought:
			</p>

			<blockquote>If I want something made right, I'm going to have to make it myself.</blockquote>

			<p>
				There was one more thing I needed to pick up first. The one area of computer science I'd
				never touched: web development.
			</p>

			<!-- ── III. Learning to Build ── -->
			<div class="chapter">
				<p class="chapter-label">III</p>
				<h2 class="chapter-title">Svelte, and a Café I'd Been To Once</h2>
			</div>

			<p>
				I started learning web dev roughly a year before this game existed. I'd worked across enough
				of technology to know how to learn fast, but frontend was genuinely new territory. I didn't
				know how a DOM worked. I didn't fully understand services and stores. I was starting from
				the actual beginning.
			</p>

			<p>
				What cracked it open for me was Svelte. The component system — this idea that you could take
				a piece of your creativity and wrap it in code, give it a shape, pass data into it, and get
				something visual back — that clicked in a way other frameworks hadn't. I could not explain
				it at gunpoint in technically precise terms, but I understood it intuitively. I built my own
				website. Threw some components in. Played around. Looked back at it six months later and
				found it medieval by my own standards, which I think is the correct metric for whether
				you're actually learning.
			</p>

			<p>
				Then a friend's birthday came up, and I wanted to make something for them. Not a card.
				Something you could sit with for a few minutes and smile at. I drew a pixel-art version of a
				café we'd both been to. Cut it into tiles. Made it a 2D top-down map — the kind you see on
				Pinterest, those tiny isometric cafés people make. Three interactable objects: a sandwich, a
				hot coffee, a birthday cake. One message each. That was the whole thing. It was an
				interactable birthday card, not a game.
			</p>

			<p>
				But I'd built something. Something that ran in a browser, that someone could walk around in.
				And I had a Svelte project open, and time, and a head full of things I wanted to make.
			</p>

			<!-- ── IV. The Game Grows ── -->
			<div class="chapter">
				<p class="chapter-label">IV</p>
				<h2 class="chapter-title">Swordtember and the Spine of the Thing</h2>
			</div>

			<p>
				The map got bigger. Four AI-generated characters — Hela, Marjane, Veres, Guinevere —
				appeared first, because I wanted to populate the world with women I found interesting. Items
				appeared. A type system appeared. Things were being added not from a design document but
				from whatever I found that was good and available. That became the rule: make everything you
				have count before reaching for more.
			</p>

			<p>
				The thing that gave the game its spine was a discovery. A pixel artist had spent four
				consecutive Septembers drawing swords — one per day, every September, for years. Hundreds of
				blades. Different weights, different elements, different personalities. The collection is
				extraordinary. I downloaded all of it and thought: <em
					>these are too good not to collect.</em
				>
				Weapons became the thing you work toward. The whole inventory system, the element framework,
				the combat logic — it all grew outward from that one collection and that one feeling.
			</p>

			<p>
				Other asset packs followed. Relic sets emerged when new icon collections arrived. Farming
				appeared when a good tileset turned up. The enemy roster was shaped by which creature
				sprites looked right for which terrain. I wasn't designing a game from a spec. I was
				designing one from the materials at hand, which forced me to be creative within constraints
				rather than theoretical about unlimited possibilities. Constraints, it turns out, are where
				the actual decisions get made.
			</p>

			<p>
				The map itself is a flat 2D grid — one tile per entity, two surface types, land and water.
				No complex pathfinding, no obstacle meshes. When I first built it that way it was a
				limitation. By the time I understood what I was building, it was a feature. Simple. Fast.
				Honest about what it is. Easy to extend.
			</p>

			<!-- ── V. The Gemini Era ── -->
			<div class="chapter">
				<p class="chapter-label">V</p>
				<h2 class="chapter-title">The Hard Part</h2>
			</div>

			<p>
				Most of the systems architecture — combat, farming, encounters, NPC dialogue, factions — was
				built across a long stretch with Gemini as my coding co-pilot. I want to be precise about
				this because it's easy to oversimplify. Gemini could do some things very well. Architecture,
				data structures, laying out a clean service pattern — when the task was contained, it
				delivered.
			</p>

			<p>
				The problem was context. Gemini did not understand that two components needed to look the
				same. It did not understand that a file already existed. It would create new folders
				unprompted, segment things that should stay together, make changes across three files at
				once and break the thing that had been working fine yesterday. When I pushed back, called
				out the specific problem, it would fix one thing and quietly break another. I started
				version-controlling by copying entire folders manually — not even Git, just duplicating
				directories before anything got touched. The instinct was right.
			</p>

			<p>
				The deeper frustration was that it would not think like a game developer. I was building an
				RPG. I had told it I was building an RPG. It had access to everything ever written about RPG
				data structures, RPG progression systems, RPG UI patterns. And it kept treating every
				question like it was the first question — like it had no model of what I was making or where
				I was going. I had to tell it my blind spots. I wanted it to tell me mine.
			</p>

			<p>
				That period forced me to get better, faster. When your tool can't see what you can see, you
				have to see more clearly. I got significantly sharper on architecture during that stretch —
				out of necessity, not choice. I'm not sure I would have built the discipline for the later
				work without it.
			</p>

			<p>
				But it slowed development down considerably. Big days of progress followed by days of
				quietly reverting everything. The game got built anyway, just slower and harder than it
				needed to be.
			</p>

			<!-- ── VI. When It Became Real ── -->
			<div class="chapter">
				<p class="chapter-label">VI</p>
				<h2 class="chapter-title">Three Moments</h2>
			</div>

			<p>
				There were three moments when the game stopped feeling like a project and started feeling
				like something real.
			</p>

			<p>
				The first was exploration gates. When the map had different regions and you needed the right
				stats to unlock them — when movement through the world became a function of progression — it
				stopped being a demo and started having stakes. You were somewhere specific. There were
				places you couldn't go yet.
			</p>

			<p>
				The second was the quest system. Location events that only unlocked when a character sent
				you there. A character asking you to go somewhere, the world responding when you did. That
				loop — talk, go, return, consequence — is the basic unit of an RPG. When it worked for the
				first time, the thing had a pulse.
			</p>

			<p>
				The third was the Arena. That came much later and felt like a completely different game had
				been added to the one I already had. Turn-based combat with a full stat sheet, ability
				loadouts, elemental infusion, speed-based turn order. Standing in a room with Sylvie and
				watching her actually fight back. That was when I understood what I'd built.
			</p>

			<!-- ── VII. The Claude Era ── -->
			<div class="chapter">
				<p class="chapter-label">VII</p>
				<h2 class="chapter-title">The Last Month and a Half</h2>
			</div>

			<p>
				The last month and a half has been a different kind of work. The old weapon mastery system —
				which required specific elemental builds to defeat specific enemies and quietly punished any
				build that didn't cover every type — got replaced with World Resonance. One number. Grows
				through quests, through time, through discovery. No grind required. No build prison. You
				play the game and you get stronger. That's it.
			</p>

			<p>
				The NPC system got rebuilt properly. Gifting, heart ranks, sword ranks, battle aftermaths,
				faction-gated dialogue variants. Every character in the game now has a documented arc — what
				they want, what they're hiding, how they change as you build trust with them. The
				five-channel notification architecture — one home for every type of message, nothing
				appearing in two places — got designed and written up as a proper internal spec. The
				Journal, the Help system, this article — those are being written now.
			</p>

			<p>
				The game is close. Mostly cosmetic work left — some stats to tune, some NSFW content to
				layer properly, some quests to polish. No more architecture changes. The foundation is what
				it is, and it's solid.
			</p>

			<!-- ── VIII. What It's For ── -->
			<div class="chapter">
				<p class="chapter-label">VIII</p>
				<h2 class="chapter-title">What I Actually Want From This</h2>
			</div>

			<p>
				I've spent roughly six lakhs on Genshin over the years. I want to be clear that I don't
				regret the individual moments — the characters, the story, the theorycrafting. That game
				taught me things about systems design that ended up in this one. But it will disappear.
				Every game I loved will disappear, because they all live on someone's servers, and servers
				get switched off. I couldn't name a single one I trust to exist in ten years.
			</p>

			<p>
				Dawn's Journey runs in a browser. No server, no accounts, no telemetry. The save is
				localStorage. If the files exist, the game runs. That's the brief I gave myself, and I
				didn't compromise it.
			</p>

			<p>
				The anti-extraction-model thing isn't just about money, though it's also about money. It's
				about a left-leaning frustration with what gets done to good things when the incentives are
				misaligned. It's about building something I can actually give to someone — hand it over,
				walk away, and trust that it still works.
			</p>

			<p>
				There's also the educational angle, which I keep coming back to. The whole architecture is
				AI-writable by design — structured JSON schemas, documented systems, clean separation
				between engine and content. A new character, a new map, a new region can all be added
				without touching the engine. I can see a version of this that teaches. I'm keeping that door
				open.
			</p>

			<p>But first: the demo. The game that exists right now.</p>

			<div class="divider"><span class="diamond"></span></div>

			<p>
				This is six months of work. Done during unemployment, during the specific discipline of
				making something because you need it to exist. The first web app I ever built that became
				something real. Started as an interactable birthday card for a friend. Ended up with a
				world, a story, a cast, a combat system, a farming system, a faction war, and a developer
				who is significantly better at this than when he started.
			</p>

			<p class="closing">
				<em>I hope it finds a home on your screen.</em>
			</p>

			<div class="divider"><span class="diamond"></span></div>

			<div class="signature">
				<p class="sig-name">Dawn's Journey</p>
				<p class="sig-date">Ashenfall, April 2026</p>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		position: relative;
		background: linear-gradient(0deg, rgb(13, 13, 13), rgb(31, 31, 31) 66%);
		min-height: 100%;
		width: 100%;
		flex: 1;
		padding-top: 2rem;
	}
	.journey-wrap {
		max-width: max(768px, 70%);
		margin: 0 auto;
		padding-inline: 1rem;
	}
	.journey-header {
		text-align: center;
		margin-bottom: 3rem;
	}
	.eyebrow {
		font-size: 0.75rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}
	.journey-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}
	.journey-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 1rem;
	}
	.rule {
		width: 100px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}
	.body {
		color: #c8a878;
		font-size: 1.2rem;
		line-height: 1.5;
		font-family: "Pixelify Sans";
	}
	.body p {
		margin: 0 0 1.4em;
	}
	.body em {
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
		font-size: 0.5rem;
		letter-spacing: 4px;
		color: #3d2810;
		text-transform: uppercase;
		flex-shrink: 0;
		margin: 0;
		padding-top: 3px;
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
	.divider {
		display: flex;
		align-items: center;
		margin: 2.5rem 0;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(92, 61, 30, 0.35);
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
	.closing {
		text-align: center;
		font-size: 1rem;
		color: #e8d4a8;
		margin-top: 0.5rem;
	}
	.signature {
		margin-top: 2rem;
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
