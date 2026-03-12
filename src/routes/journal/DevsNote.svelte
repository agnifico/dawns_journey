

<div class="dev-note">
	<div class="note-header">
		<p class="eyebrow">From the Developer</p>
		<h2 class="note-title">Why I Built This</h2>
		<div class="rule"></div>
	</div>

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

		<div class="divider"><span class="diamond"></span></div>

		<p>
			The brief I gave myself was simple. A game that depends on <strong>nothing but a browser</strong
			>. No server. No telemetry. No database, no accounts, no personal data collected anywhere.
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
			No competing notifications. No seven currencies and five progression lines running
			simultaneously.
		</p>

		<p>
			I wanted <strong>characters who are kind</strong>. Complicated, yes — politically sharp,
			carrying real histories — but fundamentally warm. Even through cold facades. A world
			provocative enough to make you think about real things: power, order, the cost of conviction,
			the cost of silence. A world I could eventually repurpose to teach with. The whole
			architecture is AI-writable by design — a few JSON files can add a new map, a new story, a
			new region.
		</p>

		<p>
			This game is six months of my life. Design iterations thrown out at midnight. Code sessions
			that ran until dawn. Built through heartbreaks and unemployment and the particular discipline
			of making something because you need it to exist, not because anyone asked you to.
		</p>

		<p><em>This is my heart and soul, in pixel and code form. I hope it finds a home on your screen.</em></p>

		<div class="divider"><span class="diamond"></span></div>

		<div class="inspirations">
			<p class="insp-title">Acknowledgements &amp; Inspirations</p>
			{#each inspirations as row}
				<div class="insp-row">
					<span class="insp-system">{row.system}</span>
					<span class="insp-source" class:original={row.original}>{row.source}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="signature">
		<p class="sig-name">Dawn's Journey</p>
		<p class="sig-date">Ashenfall, March 2026</p>
	</div>
</div>


<script lang="ts">
	const inspirations = [
		{ system: 'Skilling (Woodcutting, Cooking, Mining)', source: 'RuneScape', original: false },
		{ system: 'Collecting Enemies · Type System', source: 'Pokémon', original: false },
		{ system: 'Combat System', source: 'Pokémon · FallenSword', original: false },
		{ system: 'Map Structure', source: 'FallenSword', original: false },
		{ system: 'Weapon Design Archetypes', source: 'Assassin\'s Creed: Odyssey', original: false },
		{ system: 'Farming System', source: 'Stardew Valley', original: false },
		{ system: 'Affinity / Heart Ranks', source: 'Stardew Valley · Pokémon', original: false },
		{ system: 'Character Art Direction', source: 'Genshin Impact · Wuthering Waves', original: false },
		{ system: 'Relics', source: 'Genshin Artifacts · WuWa Echoes (liberalised)', original: false },
		{ system: 'Precision · Evasion · Speed', source: 'Original', original: true },
		{ system: 'World Resonance', source: 'Original', original: true },
		{ system: 'Time Point System (Cooking)', source: 'Original', original: true }
	];
</script>

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

	/* ── Body text ── */
	.note-body {
		color: #c8a878;
		font-size: 0.95rem;
		line-height: 1.8;
	}

	/* Using pixel font throughout for consistency with the game */
	.note-body p {
		margin-bottom: 1.3em;
	}

	.note-body em {
		color: #e8d4a8;
		font-style: italic;
	}

	.note-body strong {
		/* font-weight: normal; */
		/* font-family: "Silkscreen"; */
		color: #e8b96a;
		font-size: .75rem;
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