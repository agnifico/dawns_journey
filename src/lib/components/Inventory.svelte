<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { game } from '$lib/game/game';
	import type { Item, Set } from '$lib/types';
	import ItemBox from './ItemBox.svelte';
	import { getItemById } from '$lib/services/InventoryService';
	import { getSetForRelic } from '$lib/services/SetDataService';
	import { statDefinitions } from '$lib/data/statDefinitions';
	import Stat from './Stat.svelte';
	import { afterUpdate } from 'svelte';
	import { derived } from 'svelte/store';
	import ExploBubble from './ExploBubble.svelte';
	import MasteryDisplay from './ui/MasteryDisplay.svelte';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import InstantEffectDisplay from './ui/InstantEffectDisplay.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	import { activeItem, inventoryTab, homesteadSubTab } from '$lib/stores/uiStore';
    import InventoryFilterBar from './ui/InventoryFilterBar.svelte';
    import { inventoryFilterStore } from '$lib/stores/inventoryFilterStore';

	const isConsumable = (item: Item) =>
		item.type === 'general' &&
		((item.effects && item.effects.length > 0) ||
			(item.activeEffects && item.activeEffects.length > 0));
	const isEquippable = (item: Item) => item.type === 'weapon' || item.type === 'relic';

    $: ({ elementFilter, tagFilters, statSort } = $inventoryFilterStore);

	const filteredInventory = derived(
		[playerStore, inventoryTab, homesteadSubTab, inventoryFilterStore],
		([$playerStore, $inventoryTab, $homesteadSubTab, $inventoryFilterStore]) => {
			let itemsToFilter = $playerStore.inventory.filter((item) => {
				if (!item) return false;
				switch ($inventoryTab) {
					case 'weapons':
						return item.type === 'weapon';
					case 'relics':
						return item.type === 'relic';
					case 'homestead':
						if ($homesteadSubTab === 'farming') {
							return item.flags?.includes('crop') || item.flags?.includes('seed');
						}
						return false;
					case 'general':
					default:
						return (
							item.type === 'general' &&
							!item.flags?.includes('seed') &&
							!item.flags?.includes('crop')
						);
				}
			});

            // Apply element filter (only for weapons tab)
            if ($inventoryFilterStore.elementFilter && $inventoryTab === 'weapons') {
                itemsToFilter = itemsToFilter.filter(item =>
                    item.type === 'weapon' && item.element === $inventoryFilterStore.elementFilter
                );
            }

            // Apply tag filters
            if ($inventoryFilterStore.tagFilters.length > 0) {
                itemsToFilter = itemsToFilter.filter(item =>
                    item.flags?.some(flag => $inventoryFilterStore.tagFilters.includes(flag))
                );
            }

            // Apply stat sorting
            if ($inventoryFilterStore.statSort) {
                const { statId, direction } = $inventoryFilterStore.statSort;
                itemsToFilter.sort((a, b) => {
                    const getStatValue = (item: Item, id: string) => {
                        const stat = item.stats?.find(s => s.name === id);
                        return stat ? stat.value : 0;
                    };

                    const aStat = getStatValue(a, statId);
                    const bStat = getStatValue(b, statId);

                    if (direction === 'asc') {
                        return aStat - bStat;
                    } else {
                        return bStat - aStat;
                    }
                });
            }

			return itemsToFilter;
		}
	);

	const groupedInventory = derived(filteredInventory, ($filteredInventory) => {
		const grouped = new Map<string, Item>();
		const nonStackable: Item[] = [];

		for (const item of $filteredInventory) {
			if (item.flags?.includes('stackable')) {
				if (grouped.has(item.id)) {
					const existingItem = grouped.get(item.id)!;
					existingItem.amount = (existingItem.amount || 0) + 1;
				} else {
					// Create a new representative item for the stack
					const stackableItem = { ...item, amount: 1 };
					grouped.set(item.id, stackableItem);
				}
			} else {
				// Non-stackable items are just added to a separate list
				nonStackable.push(item);
			}
		}
		// Combine the grouped stackable items with the non-stackable items
		return [...Array.from(grouped.values()), ...nonStackable];
	});

	let relicSet: Set | undefined;
	$: {
		if ($activeItem && $activeItem.type === 'relic') {
			relicSet = getSetForRelic($activeItem.id);
		} else {
			relicSet = undefined;
		}
	}

	let scrollContent: HTMLDivElement;
	let isScrollable = false;
	afterUpdate(() => {
		if (scrollContent) {
			isScrollable = scrollContent.scrollHeight > scrollContent.clientHeight;
		}
	});

	function getStatName(statId: string): string {
		return statDefinitions[statId]?.name || statId;
	}
</script>

<div class="inventory">
	<!-- ====== TOP BOX: INFO & DESCRIPTION ====== -->
	<div class="item-info-box">
		<div class="item-image">
			{#if $activeItem}
				<ItemBox item={$activeItem} viewSize="large" />
			{:else}
				<div class="empty-active-item"></div>
			{/if}
		</div>
		<div class="item-description">
			{#if $activeItem}
				<div class="item-header">
					<h3>{$activeItem.name}</h3>
					{#if $activeItem.type === 'weapon'}
						<ElementTag element={$activeItem.element} />
					{/if}
				</div>
				<p class="description-text">{$activeItem.description}</p>
			{:else}
				<p>Select an item to see details.</p>
			{/if}
		</div>
	</div>

	<div class="tabs">
		<button on:click={() => ($inventoryTab = 'general')} class:active={$inventoryTab === 'general'}
			>General</button
		>
		<button on:click={() => ($inventoryTab = 'weapons')} class:active={$inventoryTab === 'weapons'}
			>Weapons</button
		>
		<button on:click={() => ($inventoryTab = 'relics')} class:active={$inventoryTab === 'relics'}
			>Relics</button
		>
		<button on:click={() => ($inventoryTab = 'homestead')} class:active={$inventoryTab === 'homestead'}
			>Homestead</button
		>
	</div>

	{#if $inventoryTab === 'homestead'}
		<div class="sub-tabs">
			<button
				on:click={() => ($homesteadSubTab = 'farming')}
				class:active={$homesteadSubTab === 'farming'}>Farming</button
			>
			<button
				on:click={() => ($homesteadSubTab = 'crafting')}
				class:active={$homesteadSubTab === 'crafting'}>Crafting</button
			>
		</div>
	{/if}

    {#if $inventoryTab === 'weapons'}
        <InventoryFilterBar isWeaponTab={true} />
    {/if}
    {#if $inventoryTab === 'relics'}
        <InventoryFilterBar isWeaponTab={false} />
    {/if}

	<div class="grid-wrapper">
		<div class="item-grid">
			{#each $groupedInventory as item (item.instanceId || item.id)}
				<div class="grid-item" on:click={() => ($activeItem = item)}>
					<ItemBox {item} viewSize="small" base="" />
				</div>
			{/each}
		</div>
	</div>

	<!-- ====== BOTTOM BOX: STATS & EFFECTS ====== -->
	<div class="item-stats-box">
		{#if $activeItem}
			<div class="scroll-content" bind:this={scrollContent}>
				<!-- Stats -->
				{#if $activeItem.stats && $activeItem.stats.length > 0}
					<div class="stats-grid">
						{#each $activeItem.stats as stat (stat.name)}
							<div class="stat-line">
								<Stat statId={stat.name} value={stat.value} />
							</div>
						{/each}
					</div>
				{/if}

				<!-- Mastery -->
				{#if $activeItem.type === 'weapon' && $activeItem.mastery}
					<MasteryDisplay mastery={$activeItem.mastery} elements={[$activeItem.element]} size="mini"/>
				{/if}

				<!-- Set Info -->
				{#if relicSet}
					<div class="set-info">
						<p>{relicSet.name} <i>(Relic Set)</i></p>
						<ul>
							{#each relicSet.bonuses as bonus}
								<li>
									<p>
										({bonus.pieces}-Piece Bonus):
									</p>
									{#each bonus.stats as stat, i}
										{getStatName(stat.name)} +{stat.value}{i < bonus.stats.length - 1 ? ', ' : ''}
									{/each}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Instant & Active Effects -->
				<div class="effects-list">
					{#if $activeItem.effects && $activeItem.effects.length > 0}
						{#each $activeItem.effects as effect (Object.keys(effect)[0])}
							<InstantEffectDisplay {effect} />
						{/each}
					{/if}
					{#if $activeItem.activeEffects && $activeItem.activeEffects.length > 0}
						{#each $activeItem.activeEffects as effect (effect.id)}
							<BuffDisplay {effect} />
						{/each}
					{/if}
				</div>

				<!-- Exploration -->
				{#if $activeItem.exploration}
					<div class="exploration">
						{#each $activeItem.exploration as effect}
							<ExploBubble name={effect.name} level={effect.level} />
						{/each}
					</div>
				{/if}
			</div>
			<div class="buttons">
				{#if isConsumable($activeItem)}
					<button class="action-button" on:click={() => game.useItem($activeItem.instanceId)}>Use</button>
				{/if}
				{#if isEquippable($activeItem)}
					<button class="action-button" on:click={() => game.equipItem($activeItem.instanceId)}
						>Equip</button
					>
				{/if}
			</div>
			{#if isScrollable}
				<div class="scroll-indicator">
					<img src="/game_icons/down.png" alt="Scroll down" />
				</div>
			{/if}
		{/if}
	</div>
</div>
<style>
	.inventory {
		display: flex;
		flex-direction: column;
		padding: 1em;
		box-sizing: border-box;
		background-color: var(--surface-1);
		height: 100%;
		border-radius: 12px;
		box-shadow: #00000056 0 -6px 0 6px inset;
		border-top: 3px solid #00000056;
	}

	/* ====== TOP BOX ====== */
	.item-info-box {
		display: flex;
		margin-bottom: 1em;
		height: 120px; /* Fixed height */
	}

	.item-image {
		margin-right: 1em;
		width: 120px;
		height: 120px;
		padding-bottom: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-secondary);
		/* border: 3px solid var(--color-border); */
		border-radius: 5px;
		flex-shrink: 0;
		box-sizing: border-box;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid #00000056;
	}

	.item-description {
		flex-grow: 1;
		background-color: var(--surface-2);
		color: var(--color-text);
		padding: 0.5em 1em;
		/* border: 3px solid var(--color-border); */
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		/* border: 3px solid var(--color-border); */
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid #00000056;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	.item-header h3 {
		margin: 0;
		color: var(--text-item-name);
		font-family: var(--font-family-main);
		font-size: 1.2rem;
		font-weight: 400;
		flex-grow: 1;
	}

	.element-icon {
		width: 24px;
		height: 24px;
	}

	.description-text {
		font-family: var(--font-family-pixel);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		color: var(--text-muted);
		flex-grow: 1;
		overflow-y: auto;
		padding-top: 0.5em;
		/* line-break: normal; */
		white-space: pre-line;
	}

	/* ====== BOTTOM BOX ====== */
	.item-stats-box {
		position: relative;
		/* border: 3px solid var(--color-border); */
		border-radius: 5px;
		background-color: var(--surface-2);
		margin-bottom: 1rem;
		flex-grow: 1;
		min-height: 0; /* Prevent flex overflow */
		display: flex;
		flex-direction: column;
		padding-bottom: 1rem;
		box-shadow: #00000056 0 -6px 0 3px inset;
		box-sizing: border-box;
		border-top: 3px solid #00000056;
	}

	.scroll-content {
		overflow-y: auto;
		padding: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		scrollbar-width: none;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.5em 1em;
		font-size: 0.75em;
		color: var(--color-text);
	}

	.effects-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
	}

	.set-info {
		/* font-style: italic; */
		color: var(--color-accent);
		font-size: 0.9em;
		/* background-color: var(--color-background); */
		background-color: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 6px;
		font-family: var(--font-family-pixel);
		/* font-size: .75rem; */
		/* margin-block: 1rem; */
		color: var(--color-text);
	}
	.set-info ul {
		list-style-type: none;
		padding-left: 0rem;
		/* margin: 0.5em 0 0 0; */
		font-style: normal;
		font-size: 0.9em;
		display: flex;
		flex-direction: column;
	}
	.set-info li {
		border-radius: 4px;
		color: var(--color-primary);
		background-color: hsl(0, 0%, 0%, .5);
		padding: 8px 16px;
        margin-bottom: 8px;

        p {
            color: var(--color-text-muted);

            i {
                color: var(--color-secondary);
            }
        }
	}

	.buttons {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		gap: 0.5em;
	}

	.scroll-indicator {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translate(-50%, 0);
		}
		40% {
			transform: translate(-50%, -3px);
		}
		60% {
			transform: translate(-50%, -1.5px);
		}
	}

	.tabs {
		display: flex;
		flex-shrink: 0;
		border-inline: 3px solid color-mix(in srgb, var(--surface-2) 50%, black);
	}

	.tabs button {
		font-family: var(--font-family-pixel);
		font-size: 1rem;
		box-sizing: border-box;
		background-color: color-mix(in srgb, var(--surface-2) 70%, black);
		color: var(--text-muted);
		padding: 0.5rem 1rem;
		cursor: pointer;
		flex-grow: 1;
		border: none;
		/* border-radius: 6px; */
		/* box-shadow: #00000056 0 -3px 0 3px inset; */
		transition: all 0.2s ease-in-out;
		border-top: 3px solid color-mix(in srgb, var(--surface-2) 50%, black);
	}

	.tabs button.active {
		background: var(--color-accent);
		color: var(--text-white);
		/* border-color: #09625b; */
		/* box-shadow: #09625b 4px 4px, #00000056 0 -3px 0 3px inset; */
		/* font-weight: 600; */
		/* color: var(--text-muted); */
	}

	.sub-tabs {
		display: flex;
		/* margin-bottom: 0.5em; */
		flex-shrink: 0;
		background-color: color-mix(in srgb, var(--surface-2) 70%, black);
		border-inline: 3px solid color-mix(in srgb, var(--surface-2) 50%, black);
	}

	.sub-tabs button {
		border: none;
		background: var(--surface-2);
		background-color: transparent;
		color: var(--color-text-muted);
		padding: 0.25rem 0.75rem;
		cursor: pointer;
		border-radius: 3px;
	}

	.sub-tabs button.active {
		/* background: var(--color-secondary); */
		color: var(--color-accent);
	}

	.grid-wrapper {
		background-color: transparent;
		overflow-y: auto;
		height: calc(5 * (40px + 10px));
		scrollbar-width: none;
		margin-bottom: 1rem;
		border-radius: 0 0 6px 6px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid #00000056;
		transition: all 0.2s ease-in-out;
		background-color: var(--surface-2);
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 40px);
		gap: 8px;
		justify-content: flex-start;
		padding: 16px 0px 16px 8px;
	}

	.grid-item {
		width: 40px;
		height: 40px;
		/* padding: 4px 2px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		background-color: rgba(0, 0, 0, 0.208);
		background-color: rgb(68, 65, 78);
		/* border: 1px solid var(--color-border); */
		box-shadow: #00000056 0 -2px 0 2px inset;
		border-top: 2px solid #00000056;
		border-radius: 5px;
		/* display: inline-block; */
        padding: 2px;

	}

	.grid-item:hover {
		transition: 0.1s all ease-in;
		background-color: var(--color-text);
		/* cursor: none; */
	}

	.action-button {
		font-family: var(--font-family-pixel);
		background-color: var(--color-accent);
		color: var(--text-white);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 3px;
		font-size: 0.8em;
		line-height: 1;
		white-space: nowrap;
		cursor: pointer;
		box-shadow:
			inset 0 30px 30px -15px rgba(255, 255, 255, 0.1),
			inset 0 0 0 1px rgba(255, 255, 255, 0.3),
			inset 0 1px 20px rgba(0, 0, 0, 0),
			0 3px 0 #00000056,
			0 3px 2px rgba(0, 0, 0, 0.2),
			0 5px 10px rgba(0, 0, 0, 0.1),
			0 10px 20px rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		transition: 150ms all ease-in-out;

		&:active {
			transform: translateY(3px);
			box-shadow:
				inset 0 16px 2px -15px rgba(0, 0, 0, 0),
				inset 0 0 0 1px rgba(255, 255, 255, 0.15),
				inset 0 1px 20px rgba(0, 0, 0, 0.1),
				0 0 0 #00000056,
				0 0 0 2px rgba(255, 255, 255, 0.5),
				0 0 0 rgba(0, 0, 0, 0),
				0 0 0 rgba(0, 0, 0, 0);
		}
	}

	@media (max-width: 768px) {
		.grid-wrapper {
			height: auto;
			overflow-y: visible;
		}
	}
</style>
