<script lang="ts">
	import type { ActiveSetBonus } from '$lib/stores/playerStore';
	import { statDefinitions } from '$lib/data/statDefinitions';

	export let activeBonus: ActiveSetBonus;

	function getStatName(statId: string): string {
		return statDefinitions[statId]?.name || statId;
	}
</script>

<div class="set-bonus">
	<img src="/game_icons/coherence.png" alt="Set Bonus" title={activeBonus.setName} />
	<div class="details">
		<span class="set-name"
			>{activeBonus.setName} ({activeBonus.equippedPieces}/{activeBonus.totalPieces})</span
		>
		<span class="bonus-stats">
			<!-- Bonus: -->
			<ul>
				{#each activeBonus.bonus.stats as stat, i}
					<li>{getStatName(stat.name)} + {stat.value}</li>
				{/each}
			</ul>
			<!-- {#each activeBonus.bonus.stats as stat, i}
				{getStatName(stat.name)} +{stat.value}{i < activeBonus.bonus.stats.length - 1 ? ', ' : ''}
			{/each} -->
		</span>
	</div>
</div>

<style>
	.set-bonus {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: var(--surface-3);
		color: var(--text-accent);
		color: var(--text-header);
		padding: 0.5rem;
		border-radius: 12px;
		/* border: 3px solid #00000056; */
		font-family: var(--font-family-pixel);
		font-size: .9rem;
	}
	.set-bonus img {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
	}
	.details {
		display: flex;
		flex-direction: column;
		font-size: 0.8em;
	}
	.set-name {
		font-weight: bold;
	}
	.bonus-stats {
		font-size: 0.75rem;
		color: var(--color-accent);
        
        ul {
            margin: 0;
            padding: 0;
            padding-left: 1rem;
            padding-top: .5rem;
            list-style-type: '▶  ';
        }
	}
</style>
