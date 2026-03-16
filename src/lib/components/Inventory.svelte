<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import type { Item, Set } from '$lib/types';
	import ItemBox from './ItemBox.svelte';
	import { equipItem, getItemById, useItem } from '$lib/services/InventoryService';
	import { getSetForRelic } from '$lib/services/SetDataService';
	import { statDefinitions } from '$lib/data/statDefinitions';
	import Stat from './Stat.svelte';
	import { derived } from 'svelte/store';
	import ExploBubble from './ExploBubble.svelte';
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

	function isEquipped(item: Item): boolean {
		const eq = $playerStore.equipment;
		return [...eq.weapon_slots, ...eq.relic_slots].some(s => s?.instanceId === item.instanceId);
	}

	/** Stack-aware use: always consumes the next live instance by template id. */
	function handleUse(item: Item) {
		const instance = $playerStore.inventory.find(i => i.id === item.id);
		if (!instance?.instanceId) return;
		useItem(instance.instanceId);
		// If no more instances remain, close the drawer too
		const remaining = $playerStore.inventory.filter(i => i.id === item.id);
		if (remaining.length <= 1) closeDrawer(); // the one we just used is still in store during this tick
	}

	$: ({ elementFilter, tagFilters, statSort } = $inventoryFilterStore);

	const filteredInventory = derived(
		[playerStore, inventoryTab, homesteadSubTab, inventoryFilterStore],
		([$playerStore, $inventoryTab, $homesteadSubTab, $inventoryFilterStore]) => {
			let itemsToFilter = $playerStore.inventory.filter((item) => {
				if (!item) return false;
				switch ($inventoryTab) {
					case 'weapons': return item.type === 'weapon';
					case 'relics':  return item.type === 'relic';
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

			if ($inventoryFilterStore.elementFilter && $inventoryTab === 'weapons') {
				itemsToFilter = itemsToFilter.filter(item =>
					item.type === 'weapon' && item.element === $inventoryFilterStore.elementFilter
				);
			}
			if ($inventoryFilterStore.tagFilters.length > 0) {
				itemsToFilter = itemsToFilter.filter(item =>
					item.flags?.some(flag => $inventoryFilterStore.tagFilters.includes(flag))
				);
			}
			if ($inventoryFilterStore.statSort) {
				const { statId, direction } = $inventoryFilterStore.statSort;
				itemsToFilter.sort((a, b) => {
					const getStatValue = (item: Item, id: string) => {
						const stat = item.stats?.find(s => s.name === id);
						return stat ? stat.value : 0;
					};
					const aStat = getStatValue(a, statId);
					const bStat = getStatValue(b, statId);
					return direction === 'asc' ? aStat - bStat : bStat - aStat;
				});
			}
			return itemsToFilter;
		}
	);

	const groupedInventory = derived(filteredInventory, ($filteredInventory) => {
		const result: Item[] = [];
		const stackIndex = new Map<string, number>(); // templateId → index in result

		for (const item of $filteredInventory) {
			if (item.flags?.includes('stackable')) {
				const existing = stackIndex.get(item.id);
				if (existing !== undefined) {
					// Spread to avoid mutating — increment amount on the representative
					result[existing] = { ...result[existing], amount: (result[existing].amount || 1) + 1 };
				} else {
					// Use template id as the stable instanceId for keying in the grid
					stackIndex.set(item.id, result.length);
					result.push({ ...item, instanceId: item.id, amount: 1 });
				}
			} else {
				result.push(item);
			}
		}
		return result;
	});

	let relicSet: Set | undefined;
	$: {
		if ($activeItem && $activeItem.type === 'relic') {
			relicSet = getSetForRelic($activeItem.id);
		} else {
			relicSet = undefined;
		}
	}

	let actionSheetItem: Item | null = null;

	// Drawer is driven by $activeItem — shared with Equipment so clicking
	// an equipped item updates the details panel here automatically.
	$: drawerItem = $activeItem;

	function selectItem(item: Item) {
		$activeItem = item;
		actionSheetItem = null;
	}

	function closeDrawer() {
		$activeItem = null;
	}

	function openActionSheet(item: Item, e: MouseEvent) {
		e.stopPropagation();
		actionSheetItem = actionSheetItem?.instanceId === item.instanceId ? null : item;
		$activeItem = item;
	}

	function closeActionSheet() { actionSheetItem = null; }

function getStatName(statId: string): string {
		return statDefinitions[statId]?.name || statId;
	}

	function formatValue(value: number, statId: string): string {
		if (Math.abs(value) < 1 && value !== 0) {
			return `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`;
		}
		return `${value > 0 ? '+' : ''}${value}`;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if actionSheetItem}
	<div class="sheet-backdrop" on:click={closeActionSheet}></div>
{/if}

<div class="inventory">
	<div class="tabs">
		<button on:click={() => ($inventoryTab = 'general')} class:active={$inventoryTab === 'general'}>General</button>
		<button on:click={() => ($inventoryTab = 'weapons')} class:active={$inventoryTab === 'weapons'}>Weapons</button>
		<button on:click={() => ($inventoryTab = 'relics')}  class:active={$inventoryTab === 'relics'}>Relics</button>
		<button on:click={() => ($inventoryTab = 'homestead')} class:active={$inventoryTab === 'homestead'}>Homestead</button>
	</div>

	{#if $inventoryTab === 'homestead'}
		<div class="sub-tabs">
			<button on:click={() => ($homesteadSubTab = 'farming')}  class:active={$homesteadSubTab === 'farming'}>Farming</button>
			<button on:click={() => ($homesteadSubTab = 'crafting')} class:active={$homesteadSubTab === 'crafting'}>Crafting</button>
		</div>
	{/if}

	{#if $inventoryTab === 'weapons'}
		<InventoryFilterBar isWeaponTab={true} />
	{/if}
	{#if $inventoryTab === 'relics'}
		<InventoryFilterBar isWeaponTab={false} />
	{/if}

	<!-- Grid + Drawer side by side -->
	<div class="grid-and-drawer">
		<div class="grid-wrapper">
			<div class="item-grid">
				{#each $groupedInventory as item (item.instanceId || item.id)}
					<div
						class="grid-item"
						class:selected={$activeItem?.id === item.id}
						on:click={() => selectItem(item)}
						on:contextmenu|preventDefault={(e) => openActionSheet(item, e)}
					>
						<ItemBox {item} viewSize="small" base="" />

						<!-- Action sheet above slot on right-click / long-press -->
						{#if actionSheetItem?.id === item.id}
							<div class="item-action-sheet">
								{#if isConsumable(item)}
									<button class="ias-btn ias-use" on:click|stopPropagation={() => { handleUse(item); closeActionSheet(); }}>Use</button>
								{/if}
								{#if isEquippable(item)}
									<button class="ias-btn ias-equip" on:click|stopPropagation={() => { equipItem(item.instanceId); closeActionSheet(); }}>Equip</button>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Right drawer — slides in when item selected -->
		{#if drawerItem}
			<div class="item-drawer">
				<button class="drawer-close" on:click={closeDrawer}>✕</button>

				<div class="drawer-img">
					<ItemBox item={drawerItem} viewSize="large" />
				</div>

				<div class="drawer-header">
					<h3 class="drawer-name">{drawerItem.name}</h3>
					{#if drawerItem.type === 'weapon'}
						<ElementTag element={drawerItem.element} size="mini" />
					{/if}
				</div>

				

				<!-- Stats -->
				{#if drawerItem.stats && drawerItem.stats.length > 0}
					<!-- <div class="drawer-section-label">Stats</div> -->
					<div class="drawer-stats">
						{#each drawerItem.stats as stat}
							<Stat statId={stat.name} value={stat.value} view="mini" />
						{/each}
					</div>
				{/if}

				<!-- Set info -->
				{#if relicSet}
					<div class="drawer-section-label">Set: {relicSet.name}</div>
					<div class="drawer-set">
						{#each relicSet.bonuses as bonus}
							<div class="set-bonus-line">
								<span class="set-pieces">({bonus.pieces}-pc)</span>
								{#each bonus.stats as stat, i}
									{getStatName(stat.name)} {formatValue(stat.value, stat.name)}{i < bonus.stats.length - 1 ? ', ' : ''}
								{/each}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Instant effects -->
				{#if drawerItem.effects && drawerItem.effects.length > 0}
					<div class="drawer-section-label">Instant Effects</div>
					<div class="drawer-effects">
						{#each drawerItem.effects as effect (Object.keys(effect)[0])}
							<InstantEffectDisplay {effect} />
						{/each}
					</div>
				{/if}

				<!-- Active effects -->
				{#if drawerItem.activeEffects && drawerItem.activeEffects.length > 0}
					<div class="drawer-section-label">Buffs</div>
					<div class="drawer-effects">
						{#each drawerItem.activeEffects as effect (effect.id)}
							<BuffDisplay {effect} />
						{/each}
					</div>
				{/if}

				<!-- Exploration -->
				{#if drawerItem.exploration}
					<div class="drawer-section-label">Exploration</div>
					<div class="drawer-effects">
						{#each drawerItem.exploration as effect}
							<ExploBubble name={effect.name} level={effect.level} />
						{/each}
					</div>
				{/if}

				<p class="drawer-desc">{drawerItem.description}</p>

				<!-- Actions -->
				<div class="drawer-actions">
					{#if isConsumable(drawerItem)}
						<button class="drawer-btn drawer-use" on:click={() => handleUse(drawerItem)}>Use</button>
					{/if}
					{#if isEquippable(drawerItem) && !isEquipped(drawerItem)}
						<button class="drawer-btn drawer-equip" on:click={() => equipItem(drawerItem.instanceId)}>Equip</button>
					{/if}
					<!-- Drop: <button class="drawer-btn drawer-drop" on:click={() => { dropItem(drawerItem.instanceId); closeDrawer(); }}>Drop</button> -->
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.inventory {
		display: flex;
		flex-direction: column;
		padding: 11px 13px 17px;
		box-sizing: border-box;
		border-radius: 8px;
		border: 1px solid rgba(200, 169, 110, 0.28);
		box-shadow: #00000056 0 -6px 0 3px inset;
	}

	/* ── Tabs ── */
	.tabs {
		display: flex;
		flex-shrink: 0;
		border-inline: 3px solid rgba(0,0,0,0.3);
		margin-bottom: 0;
	}
	.tabs button {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		box-sizing: border-box;
		background-color: rgba(0,0,0,0.3);
		color: var(--text-muted);
		padding: 0.5rem 1rem;
		cursor: pointer;
		flex-grow: 1;
		border: none;
		transition: all 0.15s;
		border-top: 3px solid rgba(0,0,0,0.3);
	}
	.tabs button.active {
		background: var(--color-accent);
		color: var(--text-white);
	}
	.sub-tabs {
		display: flex;
		flex-shrink: 0;
		background-color: rgba(0,0,0,0.2);
		border-inline: 3px solid rgba(0,0,0,0.3);
	}
	.sub-tabs button {
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		padding: 0.25rem 0.75rem;
		cursor: pointer;
		border-radius: 3px;
		font-family: var(--font-family-pixel);
		font-size: 0.7rem;
	}
	.sub-tabs button.active { color: var(--color-accent); }

	/* ── Grid + Drawer layout ── */
	.grid-and-drawer {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		min-height: 0;
	}

	.grid-wrapper {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		max-height: calc(5 * (44px + 4px) + 16px);
		scrollbar-width: none;
		border-radius: 0 0 6px 6px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid rgba(0,0,0,0.3);
		background-color: rgba(30,24,16,0.6);
		transition: max-height 0.2s ease;
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 44px);
		gap: 7px 3px;
		justify-content: flex-start;
		padding: 10px 6px 10px 8px;
	}

	/* ── Grid items ── */
	.grid-item {
		width: 40px;
		height: 40px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background-color: rgba(40, 34, 24, 0.9);
		border: 1px solid rgba(200, 169, 110, 0.08);
		border-radius: 4px;
		padding: 2px;
		box-sizing: border-box;
		transition: border-color 0.1s, background-color 0.1s;
	}

	.grid-item:hover {
		border-color: rgba(200, 169, 110, 0.35);
		background-color: rgba(60, 50, 30, 0.9);
	}

	.grid-item.selected {
		border-color: rgba(200, 169, 110, 0.8);
		box-shadow: 0 0 0 1px rgba(200, 169, 110, 0.4);
	}


/* ── Item action sheet (right-click) ── */
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 98;
	}

	.item-action-sheet {
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		background: #1c1610;
		border: 1px solid rgba(200, 169, 110, 0.35);
		border-radius: 6px 6px 0 0;
		padding: 5px;
		display: flex;
		gap: 4px;
		z-index: 99;
		box-shadow: 0 -4px 12px rgba(0,0,0,0.5);
		white-space: nowrap;
	}

	.ias-btn {
		padding: 4px 10px;
		border-radius: 4px;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		cursor: pointer;
		border: 1px solid;
		transition: background 0.1s;
	}
	.ias-use   { background: rgba(60,160,90,0.15);  border-color: rgba(60,160,90,0.4);  color: #50c878; }
	.ias-equip { background: rgba(200,169,110,0.12); border-color: rgba(200,169,110,0.4); color: #c8a96e; }
	.ias-drop  { background: rgba(180,50,50,0.12);   border-color: rgba(180,50,50,0.35);  color: #d06060; }
	.ias-use:hover   { background: rgba(60,160,90,0.28); }
	.ias-equip:hover { background: rgba(200,169,110,0.25); }
	.ias-drop:hover  { background: rgba(180,50,50,0.25); }

	/* ── Right drawer ── */
	.item-drawer {
		width: 200px;
		flex-shrink: 0;
		border-radius: 8px;
		border: 1px solid rgba(200, 169, 110, 0.25);
		background: rgba(28, 22, 16, 0.95);
		box-shadow: #00000056 0 -5px 0 2px inset;
		padding: 12px 12px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		position: relative;
		max-height: calc(5 * (44px + 4px) + 16px);
		overflow-y: auto;
		scrollbar-width: none;
	}

	.drawer-close {
		position: absolute;
		top: 6px;
		right: 8px;
		background: none;
		border: none;
		color: rgba(200,169,110,0.4);
		font-size: 0.7rem;
		cursor: pointer;
		padding: 2px 4px;
		line-height: 1;
	}
	.drawer-close:hover { color: rgba(200,169,110,0.8); }

	.drawer-img {
		display: flex;
		/* justify-content: center;
		align-items: center; */
		/* padding: 8px; */
		/* background: rgba(0,0,0,0.2); */
		border-radius: 6px;
		/* border: 1px solid rgba(200,169,110,0.12); */
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}

	.drawer-name {
		margin: 0;
		font-family: var(--font-family-main);
		font-size: 1rem;
		font-weight: 400;
		color: var(--text-item-name, #c8a96e);
		flex-grow: 1;
	}

	.drawer-desc {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.drawer-section-label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(200,169,110,0.4);
		margin-top: 2px;
	}

	.drawer-stats {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.drawer-set {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.set-bonus-line {
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: var(--color-accent);
		padding: 4px 8px;
		background: rgba(0,0,0,0.25);
		border-radius: 4px;
	}
	.set-pieces {
		color: var(--text-muted);
		margin-right: 4px;
	}

	.drawer-effects {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.drawer-actions {
		display: flex;
		gap: 6px;
		margin-top: auto;
		padding-top: 4px;
		border-top: 1px solid rgba(200,169,110,0.1);
	}

	.drawer-btn {
		flex: 1;
		padding: 6px 0;
		border-radius: 5px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		cursor: pointer;
		border: 1px solid;
		text-align: center;
		transition: background 0.1s;
	}
	.drawer-use   { background: rgba(60,160,90,0.15);  border-color: rgba(60,160,90,0.4);  color: #50c878; }
	.drawer-equip { background: rgba(200,169,110,0.12); border-color: rgba(200,169,110,0.4); color: #c8a96e; }
	.drawer-drop  { background: rgba(180,50,50,0.12);   border-color: rgba(180,50,50,0.35);  color: #d06060; }
	.drawer-use:hover   { background: rgba(60,160,90,0.28); }
	.drawer-equip:hover { background: rgba(200,169,110,0.25); }
	.drawer-drop:hover  { background: rgba(180,50,50,0.25); }

	@media (max-width: 768px) {
		.grid-wrapper { max-height: none; }
		.item-drawer  { max-width: 100%; max-height: none; }
		/* .grid-and-drawer { flex-direction: column;} */
	}
</style>