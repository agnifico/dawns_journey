<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { factions as factionData } from '$lib/data/factions';
	import StatBar from './ui/StatBar.svelte';

	$: factions = Object.values(factionData).map((faction) => {
		const playerData = $playerStore.factions[faction.id] || { score: 0, rank: 0 };
		return {
			...faction,
			...playerData
		};
	});
</script>

<div class="faction-display">
	<!-- <p>Factions</p> -->
	{#each factions as faction}
		<div class="faction">
			<img src={faction.icon} alt={faction.name} />
			<div class="details">
				<div class="faction-name">{faction.name}</div>
				<div class="faction-stats">
					<span>Rank: {faction.rank}</span>
					<StatBar
						current={faction.score}
						max={faction.ranks[faction.rank]?.scoreThreshold || 5}
						color="gold"
					/>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.faction-display {
		/* background-color: var(--surface-1); */
		padding: 1rem;
		border-radius: 12px;
		border: 6px solid var(--color-border);
		box-shadow: var(--color-border) 4px 4px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
	}
	.faction {
		/* margin-bottom: 1rem; */
		display: flex;
        gap: .5rem;
        background-color: rgba(0, 0, 0, 0.7);
        padding: .5rem;
        border-radius: 6px;
	}
	.faction-name {
		font-family: var(--font-family-pixel);
        color: var(--color-accent);
        /* font-weight: 600; */
	}
    .details {
        font-family: var(--font-family-pixel);
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        flex-grow: 1;
    }
	img {
		/* width: 32px; */
		height: 100%;
        aspect-ratio: 1;
	}
	.faction-stats {
        width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5rem;
        align-items: center;
	}
</style>
