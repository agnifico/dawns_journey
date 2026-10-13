<script lang="ts">
	// Skills & Factions — the player's pursuits outside of gear: every skill
	// with what it unlocks by level (side by side, so nothing has to be opened
	// one at a time), and faction standings.
	import { playerStore } from '$lib/stores/playerStore';
	import { factions as factionData } from '$lib/data/factions';
	import SkillCard from '$lib/components/skills/SkillCard.svelte';
	import FactionCard from '$lib/components/skills/FactionCard.svelte';

	// Gathering on the top row, making on the bottom; anything else after
	const ORDER = ['woodcutting', 'mining', 'farming', 'fishing', 'smithing', 'cooking', 'alchemy'];
	$: skills = [...($playerStore.skills ?? [])].sort((a, b) => {
		const ia = ORDER.indexOf(a.id);
		const ib = ORDER.indexOf(b.id);
		return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
	});

	// Same colour order as FactionDisplay
	const FACTION_COLORS = ['rgb(228, 77, 69)', 'rgb(100, 181, 62)', 'rgb(228, 154, 69)', 'rgb(62, 163, 181)', 'rgb(150, 93, 220)'];
	$: factions = Object.values(factionData).map((f, i) => ({
		faction: f,
		score: $playerStore.factions?.[f.id]?.score ?? 0,
		rank: $playerStore.factions?.[f.id]?.rank ?? 0,
		color: FACTION_COLORS[i % FACTION_COLORS.length]
	}));
</script>

<main>
	<div class="layout">
		<section class="skills">
			{#each skills as skill (skill.id)}
				<SkillCard {skill} />
			{/each}
		</section>

		<aside class="factions">
			<h2 class="column-title">Factions</h2>
			{#each factions as f (f.faction.id)}
				<FactionCard faction={f.faction} score={f.score} rank={f.rank} color={f.color} />
			{/each}
		</aside>
	</div>
</main>

<style>
	main {
		height: 100%;
		background: #1a1610;
		overflow: hidden;
	}
	.layout {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1rem;
		padding: 1rem;
		box-sizing: border-box;
	}
	.skills {
		min-height: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: minmax(0, 1fr);
		gap: 0.75rem;
	}
	.factions {
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.column-title {
		margin: 0 0 2px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.5);
	}

	/* Narrower: two skill columns, page scrolls */
	@media (max-width: 1200px) {
		main { overflow-y: auto; }
		.layout { height: auto; grid-template-columns: 1fr 280px; }
		.skills { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 340px; }
	}
	@media (max-width: 800px) {
		.layout { grid-template-columns: 1fr; }
		.skills { grid-template-columns: 1fr; }
	}
</style>
