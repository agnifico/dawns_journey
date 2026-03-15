<script lang="ts">
	import type { ActiveSetBonus } from '$lib/stores/playerStore';
	import { statDefinitions } from '$lib/data/statDefinitions';
	import Stat from '../Stat.svelte';

	export let activeBonus: ActiveSetBonus;

	function getStatName(statId: string): string {
		return statDefinitions[statId]?.name ?? statId;
	}

	function formatValue(value: number): string {
		if (Math.abs(value) < 1 && value !== 0) {
			return `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`;
		}
		return `${value > 0 ? '+' : ''}${value}`;
	}
</script>

<div class="set-bonus">
	<div class="sb-icon">✦</div>
	<div class="sb-body">
		<div class="row">
			<span class="sb-name">
				{activeBonus.setName}
				<span class="sb-pieces">({activeBonus.equippedPieces}/{activeBonus.totalPieces})</span>
			</span>
			<span class="sb-eyebrow">Set Bonus</span>
		</div>
		<div class="sb-stats">
			{#each activeBonus.bonus.stats as stat}
				<span class="sb-stat">
					<!-- {getStatName(stat.name)}
					<span class="sb-stat-val">{formatValue(stat.value)}</span> -->
					<Stat value={stat.value} statId={stat.name} view="mini" />
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.set-bonus {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 11px 13px 17px;
		border-radius: 8px;
		background: rgba(200, 168, 110, 0.3);
		/* border: 1px solid rgba(200, 169, 110, 0.28); */
		box-shadow: #00000056 0 -6px 0 3px inset;
		background: rgba(68, 68, 68, 0.12);
        border: 1px solid rgba(62, 111, 209, 0.4);
	}
	.row {
		display: flex;
		justify-content: space-between;
	}

	.sb-icon {
		width: 42px;
		height: 42px;
		min-width: 42px;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(200, 169, 110, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: var(--tan, #c8a96e);
	}

	.sb-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
	}

	.sb-eyebrow {
		font-family: var(--font-family-pixel);
		font-family: 'Ubuntu Mono';
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.45);
		text-align: right;
	}

	.sb-name {
		font-family: 'Pixelify Sans';
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--tan, #c8a96e);
		line-height: .75;
	}

	.sb-pieces {
		font-weight: 400;
		font-size: 0.85rem;
		color: rgba(200, 169, 110, 0.45);
	}

	.sb-stats {
		margin-top: 5px;
		display: flex;
		/* flex-direction: column; */
		gap: 8px;
	}

	.sb-stat {
		font-family: var(--font-family-pixel);
		font-size: 0.78rem;
		color: var(--text-muted);
		line-height: 1.5;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.sb-stat::before {
		/* content: '▶'; */
		font-size: 0.5rem;
		color: rgba(200, 169, 110, 0.35);
		flex-shrink: 0;
	}

	.sb-stat-val {
		color: var(--tan, #c8a96e);
		font-weight: 600;
	}
</style>
