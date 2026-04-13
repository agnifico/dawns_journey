<script lang="ts">
	import { statDefinitions } from '$lib/data/statDefinitions';
	import type { StatDefinition } from '$lib/data/statDefinitions';

	export let statId: string;
	export let value: number | string;
	export let baseValue: number | undefined = undefined;
	export let view: 'short' | 'full' | 'mini' = 'short';

	// hpCost reuses the hp icon but has its own label
	$: iconId = statId === 'hpCost' ? 'hp' : statId;

	$: statDef =
		statId === 'hpCost'
			? ({
					id: 'hpCost',
					name: 'HP Cost',
					abbr: 'HP Cost',
					description: 'HP lost when fighting this enemy.',
					color: '#c86060'
				} satisfies StatDefinition)
			: (statDefinitions[statId] ??
				({
					id: statId,
					name: statId,
					abbr: statId.substring(0, 3).toUpperCase(),
					description: 'No description available.',
					color: '#c8a96e'
				} satisfies StatDefinition));

	$: isPercent = statId === 'critChance' || statId === 'critDamage';

	$: displayValue = isPercent ? `${(Number(value) * 100).toFixed(0)}%` : String(value);

	$: bonus = (() => {
		if (baseValue === undefined || typeof value !== 'number') return undefined;
		const diff = value - baseValue;
		if (diff === 0) return undefined;
		return isPercent ? Math.round(diff * 100) : Math.round(diff);
	})();
</script>

<div
	class="stat-line"
	class:view-full={view === 'full'}
	class:view-mini={view === 'mini'}
	title={statDef.description}
>
	{#key statId}
		<img src={`/game_icons/${iconId}.png`} alt={statDef.name} class="stat-icon" />
	{/key}
	<span class="stat-name" style="color: {statDef.color}">
		{view === 'full' ? statDef.name : statDef.abbr}
	</span>
	<span class="stat-value">
		{#if bonus !== undefined}
			<span class="bonus" class:buff={bonus > 0} class:debuff={bonus < 0}>
				({bonus > 0 ? '+' : ''}{bonus}{isPercent ? '%' : ''})
			</span>
		{/if}
		{displayValue}
	</span>
</div>

<style>
	/* ── Base (short view) ── */
	.stat-line {
		display: flex;
		align-items: center;
		gap: 0;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		padding: 4px 8px;
		border-radius: 4px;
		background-color: #252018;
		border: 1px solid rgba(200, 169, 110, 0.08);
	}

	.stat-icon {
		width: 24px;
		height: 24px;
		margin-right: 7px;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.stat-name {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stat-value {
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-end;
		font-size: 0.9rem;
		color: var(--text-primary, #e4d8be);
		margin-left: 8px;
	}

	.bonus {
		font-size: 0.6rem;
		font-weight: 400;
	}

	.bonus.buff {
		color: #50c870;
	}
	.bonus.debuff {
		color: #e05050;
	}

	/* ── Full view — long stat name ── */
	.view-full .stat-icon {
		width: 28px;
		height: 28px;
	}

	/* ── Mini view ── */
	.view-mini {
		justify-content: center;
		padding: 3px 5px;
		background-color: rgba(78, 78, 78, 0.42);
		border-color: transparent;
		gap: 0;
	}

	.view-mini .stat-icon {
		width: 16px;
		height: 16px;
		margin-right: 5px;
	}

	.view-mini .stat-name {
		margin-right: 6px;
		font-size: 0.85rem;
	}

	.view-mini .stat-value {
		font-size: 0.85rem;
	}
</style>
