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
		padding-inline: 1rem;
		border-radius: 12px;
		border: 6px solid var(--color-border);
		box-shadow: var(--color-border) 4px 4px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.faction {
		/* margin-bottom: 1rem; */
		display: flex;
		gap: 0.5rem;
		background-color: rgb(18, 18, 18);
		padding: 0.5rem;
		border-radius: 6px;
		&:nth-of-type(3) {
			border: 1px solid rgb(228, 154, 69, .3);
			color: rgb(228, 154, 69);
		}
		&:nth-of-type(1) {
			border: 1px solid rgb(228, 77, 69, .3);
			color: rgb(228, 77, 69);
		}
		&:nth-of-type(2) {
			border: 1px solid rgb(100, 181, 62, .3);
			color: rgb(100, 181, 62);
		}
		&:nth-of-type(4) {
			border: 1px solid rgb(62, 163, 181, .3);
			color: rgb(62, 163, 181);
		}
		&:nth-of-type(5) {
			border: 1px solid rgb(150, 93, 220, .3);
			color: rgb(150, 93, 220);
		}
	}
	.faction-name {
		font-family: var(--font-family-pixel);
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
		width: 32px;
		height: 100%;
		aspect-ratio: 1;
	}
	.faction-stats {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		color: rgba(255, 255, 255, 0.596);
		gap: 0.5rem;
		align-items: center;
	}
</style>
