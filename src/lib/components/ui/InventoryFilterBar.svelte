<script lang="ts">
	import {
		inventoryFilterStore,
		toggleTagFilter,
		setElementFilter,
		setStatSort,
		clearStatSort,
		clearTagFilter
	} from '$lib/stores/inventoryFilterStore';
	import { createEventDispatcher } from 'svelte';

	export let isWeaponTab: boolean;

	const dispatch = createEventDispatcher();

	const elements = ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark', 'Normal'];
	const weaponTags = ['sword', 'fan', 'heavy', 'ranged', 'staff', 'polearm'];
	const commonStats = [
		{ id: 'physicalAttack' }, { id: 'elementalAttack' },
		{ id: 'physicalDefence' }, { id: 'elementalDefence' },
		{ id: 'critChance' }, { id: 'critDamage' },
		{ id: 'maxHp' }, { id: 'maxAuraShield' },
		{ id: 'precision' }, { id: 'evasion' }, { id: 'speed' }
	];

	$: ({ elementFilter, tagFilters, statSort } = $inventoryFilterStore);
	$: selectedElement = elementFilter;
	$: activeTags = tagFilters;
	$: selectedStat = statSort?.statId || null;
	$: sortDirection = statSort?.direction || 'desc';

	function handleElementChange(element: string | null) {
		setElementFilter(element === selectedElement ? null : element);
		dispatch('filterChange');
	}

	function handleTagToggle(tag: string) {
		toggleTagFilter(tag);
		dispatch('filterChange');
	}

	function handleStatSortChange(statId: string) {
		if (selectedStat === statId) {
			sortDirection === 'desc' ? setStatSort(statId as any, 'asc') : clearStatSort();
		} else {
			setStatSort(statId as any, 'desc');
		}
		dispatch('filterChange');
	}
</script>

<div class="filter-bar">
	<!-- Element filters (weapons only) -->
	{#if isWeaponTab}
		<div class="filter-group">
			{#each elements as element}
				<button
					class="icon-btn"
					class:active={selectedElement === element}
					title={element}
					on:click={() => handleElementChange(element)}
				>
					<img src="/images/{element.toLowerCase()}.png" alt={element} />
				</button>
			{/each}
			<button class="icon-btn clear-btn" title="Clear element" on:click={() => handleElementChange(null)}>
				<img src="/game_icons/cancel.png" alt="Clear" />
			</button>
		</div>

		<div class="sep"></div>

		<!-- Weapon type tags -->
		<div class="filter-group">
			{#each weaponTags as tag}
				<button
					class="tag-btn"
					class:active={activeTags.includes(tag)}
					on:click={() => handleTagToggle(tag)}
				>
					{tag.toUpperCase()}
				</button>
			{/each}
			<button class="icon-btn clear-btn" title="Clear type" on:click={() => clearTagFilter()}>
				<img src="/game_icons/cancel.png" alt="Clear" />
			</button>
		</div>

		<div class="sep"></div>
	{/if}

	<!-- Stat sort -->
	<div class="filter-group">
		{#each commonStats as stat}
			<button
				class="icon-btn"
				class:active={selectedStat === stat.id}
				title={stat.id}
				on:click={() => handleStatSortChange(stat.id)}
			>
				<img src="./game_icons/{stat.id}.png" alt={stat.id} />
				{#if selectedStat === stat.id}
					<span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
				{/if}
			</button>
		{/each}
		<button class="icon-btn clear-btn" title="Clear sort" on:click={() => clearStatSort()}>
			<img src="/game_icons/cancel.png" alt="Clear" />
		</button>
	</div>
</div>

<style>
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
		padding: 4px 6px;
		background-color: rgba(0, 0, 0, 0.25);
		image-rendering: pixelated;
		border-inline: 3px solid rgba(0, 0, 0, 0.3);
	}

	.filter-group {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
	}

	.sep {
		width: 1px;
		height: 20px;
		background: rgba(200, 169, 110, 0.2);
		margin: 0 4px;
		flex-shrink: 0;
	}

	.icon-btn {
		position: relative;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 3px;
		padding: 3px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 28px;
		width: 28px;
		transition: background 0.1s, border-color 0.1s;
	}

	.icon-btn img {
		width: 20px;
		height: 20px;
		image-rendering: pixelated;
	}

	.icon-btn:hover {
		background: rgba(200, 169, 110, 0.1);
		border-color: rgba(200, 169, 110, 0.25);
	}

	.icon-btn.active {
		background: rgba(190, 140, 104, 0.25);
		border-color: rgba(190, 140, 104, 0.6);
	}

	.sort-arrow {
		position: absolute;
		bottom: 1px;
		right: 2px;
		font-size: 0.45rem;
		color: #c8a96e;
		line-height: 1;
	}

	.tag-btn {
		background: transparent;
		border: none;
		border-radius: 3px;
		padding: 3px 5px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: rgba(200, 169, 110, 0.5);
		height: 28px;
		transition: background 0.1s, color 0.1s;
		white-space: nowrap;
	}

	.tag-btn:hover {
		background: rgba(200, 169, 110, 0.1);
		color: rgba(200, 169, 110, 0.9);
	}

	.tag-btn.active {
		background: rgba(190, 140, 104, 0.2);
		color: #c8a96e;
		border: 1px solid rgba(190, 140, 104, 0.5);
	}

	.clear-btn {
		opacity: 0.4;
		width: 22px;
		height: 22px;
		margin-left: 2px;
	}

	.clear-btn img {
		width: 14px;
		height: 14px;
	}

	.clear-btn:hover {
		opacity: 0.8;
		background: rgba(200, 60, 60, 0.15);
		border-color: rgba(200, 60, 60, 0.3);
	}
</style>