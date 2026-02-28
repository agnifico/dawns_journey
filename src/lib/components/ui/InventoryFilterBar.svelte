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
	import Stat from '../Stat.svelte';
	// import ElementTag from './ElementTag.svelte';

	export let isWeaponTab: boolean; // To differentiate between weapon and relic tabs

	const dispatch = createEventDispatcher();

	// Hardcoded for now, ideally these would come from a central game data service
	const elements = ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark', 'Normal'];
	const weaponTags = ['sword', 'fan', 'heavy', 'ranged', 'staff', 'polearm'];
	const commonStats = [
		{ id: 'physicalAttack', name: 'Physical Attack' },
		{ id: 'elementalAttack', name: 'Elemental Attack' },
		{ id: 'physicalDefence', name: 'Physical Defence' },
		{ id: 'elementalDefence', name: 'Elemental Defence' },
		{ id: 'speed', name: 'Speed' },
		{ id: 'critChance', name: 'Crit Chance' },
		{ id: 'critDamage', name: 'Crit Damage' },
		{ id: 'maxHp', name: 'Max HP' },
		{ id: 'maxAuraShield', name: 'Max Aura Shield' }
	];

	let selectedElement: string | null;
	let activeTags: string[];
	let selectedStat: string | null;
	let sortDirection: 'desc' | 'asc';

	$: ({ elementFilter, tagFilters, statSort } = $inventoryFilterStore);
	$: selectedElement = elementFilter;
	$: activeTags = tagFilters;
	$: selectedStat = statSort?.statId || null;
	$: sortDirection = statSort?.direction || 'asc';

	function handleElementChange(element: string | null) {
		setElementFilter(element);
		dispatch('filterChange');
	}

	function handleTagToggle(tag: string) {
		toggleTagFilter(tag);
		dispatch('filterChange');
	}

	function handleStatSortChange(statId: string) {
		if (selectedStat === statId) {
			// Toggle direction or clear if already descending
			if (sortDirection === 'desc') {
				setStatSort(statId as any, 'asc');
			} else {
				clearStatSort();
			}
		} else {
			// New stat selected, default to ascending
			setStatSort(statId as any, 'desc');
		}
		dispatch('filterChange');
	}
</script>

<div class="filter-bar">
	{#if isWeaponTab}
		<div class="filter-group element">
			<div class="row">
				{#each elements as element}
					<button
						class:active={selectedElement === element}
						on:click={() => handleElementChange(element)}
					>
						<img class="stat-icon" src="/images/{element.toLowerCase()}.png" alt="" srcset="" />
					</button>
				{/each}
			</div>
			<button class:active={selectedElement === null} on:click={() => handleElementChange(null)}>
				<img class="cancel" src="/game_icons/cancel.png" alt="" srcset="" />
			</button>
		</div>
	{/if}

	<div class="filter-group stats">
		<div class="row">
			{#each commonStats as stat}
				<button
					class:active={selectedStat === stat.id}
					on:click={() => handleStatSortChange(stat.id)}
				>
					<!-- {stat.name} -->
					<img src={`./game_icons/${stat.id}.png`} alt={stat.name} class="stat-icon" />
					{#if selectedStat === stat.id}
						{#if sortDirection === 'asc'}
							&uarr;
						{:else}
							&darr;
						{/if}
					{/if}
				</button>
			{/each}
		</div>
		<button class:active={selectedStat === null} on:click={() => clearStatSort()}>
			<img class="cancel" src="/game_icons/cancel.png" alt="" srcset="" />
		</button>
	</div>

	<div class="filter-group types">
		<div class="row">
			{#each weaponTags as tag}
				<button class:active={activeTags.includes(tag)} on:click={() => handleTagToggle(tag)}>
					{tag.toUpperCase()}
				</button>
			{/each}
		</div>
		<button class="cancel-btn" on:click={() => clearTagFilter()}>
			<img class="cancel" src="/game_icons/cancel.png" alt="" srcset="" />
		</button>
	</div>
</div>

<style>
	button {
		height: 32px;
	}
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: #333;
		/* border-radius: 5px; */
		/* margin-bottom: 10px; */
		image-rendering: pixelated;
		/* border: 1px solid white; */
	}

	.filter-group {
		display: flex;
		align-items: center;
		/* gap: 5px; */
		/* padding: 5px; */
		border-radius: 3px;
		justify-content: space-between;
		width: 100%;
		/* border: 1px solid white; */
	}

	.row {
		display: flex;
		/* border: 1px solid white; */
	}

	.filter-bar button {
		background-color: transparent;
		color: #fff;
		border: 1px solid #777;
		/* padding: 5px 10px; */
		cursor: pointer;
		transition: background-color 0.2s;
		font-size: 0.8em;
	}

	.filter-bar button:hover {
		background-color: #777;
	}

	.filter-bar button.active {
		background-color: var(--color-accent);
		background-color: #be8c68;
	}

	.element button {
		background-color: transparent;
		border: none;
		border-radius: 0;
		height: 32px;
		width: fit-content;
		padding: 4px;
	}
	.stats {
		border: none;
		button {
			border-radius: 0;
			border: none;
			padding: 4px;
			height: 32px;
			width: fit-content;
			background-color: transparent;
		}
	}
	.stat-icon {
		height: 24px;
		width: 24px;
	}

	.types button {
		border-radius: 0;
		border: none;
		padding: 4px;
		font-family: var(--font-family-pixel);
		/* width: 10ch; */
		font-size: 0.75rem;
	}

	.cancel {
		height: 16px;
		width: 16px;
	}
	.cancel-btn {
		background-color: transparent;
	}
</style>
