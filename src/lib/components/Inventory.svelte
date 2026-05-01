<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import type { Item, Set } from '$lib/types';
	import ItemBox from './ItemBox.svelte';
	import {
		equipItem,
		getItemById,
		useItem,
		countInventoryItem
	} from '$lib/services/InventoryService';
	import { getSetForRelic, formatBonusLines } from '$lib/services/SetDataService';
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
	import GearPassive from './GearPassive.svelte';
	import { getGearPassiveById } from '$lib/data/abilities';

	// ── Material/Sigil grouping (General tab only) ────────────────────────────
	const ELEMENTAL_MATERIAL_IDS = new Set([
		'citrine',
		'turquoise',
		'emerald',
		'sapphire',
		'amethyst',
		'ruby',
		'red_bar',
		'purple_bar',
		'light_bar',
		'earth_bar',
		'sky_bar',
		'water_bar'
	]);
	const SIGIL_IDS = new Set([
		'water_sigil',
		'wind_sigil',
		'earth_sigil',
		'light_sigil',
		'dark_sigil',
		'fire_sigil'
	]);

	function isMaterial(item: Item) {
		return (
			ELEMENTAL_MATERIAL_IDS.has(item.id) ||
			item.flags?.includes('bar') ||
			item.flags?.includes('gem')
		);
	}
	function isSigil(item: Item) {
		return (
			SIGIL_IDS.has(item.id) ||
			item.flags?.includes('sigil') ||
			item.flags?.includes('boss_material')
		);
	}

	// Collapsible state for material/sigil sections
	let materialsExpanded = false;
	let sigilsExpanded = false;

	const isConsumable = (item: Item) =>
		item.type === 'general' &&
		((item.effects && item.effects.length > 0) ||
			(item.activeEffects && item.activeEffects.length > 0));
	const isEquippable = (item: Item) => item.type === 'weapon' || item.type === 'relic';

	function isEquipped(item: Item): boolean {
		const eq = $playerStore.equipment;
		return [...eq.weapon_slots, ...eq.relic_slots].some((s) => s?.instanceId === item.instanceId);
	}

	function handleUse(item: Item) {
		const instance = $playerStore.inventory.find((i) => i.id === item.id);
		if (!instance?.instanceId) return;
		useItem(instance.instanceId);
		const remaining = $playerStore.inventory.filter((i) => i.id === item.id);
		if (remaining.length <= 1) closeDrawer();
	}

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
						if ($homesteadSubTab === 'crafting') {
							// Crafting tab: elemental materials, sigils, bars, gems
							return (
								item.type === 'general' &&
								(ELEMENTAL_MATERIAL_IDS.has(item.id) ||
									SIGIL_IDS.has(item.id) ||
									item.flags?.includes('bar') ||
									item.flags?.includes('gem') ||
									item.flags?.includes('sigil') ||
									item.flags?.includes('boss_material') ||
									item.flags?.includes('crafting_material'))
							);
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
				itemsToFilter = itemsToFilter.filter(
					(item) => item.type === 'weapon' && item.element === $inventoryFilterStore.elementFilter
				);
			}
			if ($inventoryFilterStore.tagFilters.length > 0) {
				itemsToFilter = itemsToFilter.filter((item) =>
					item.flags?.some((flag) => $inventoryFilterStore.tagFilters.includes(flag))
				);
			}
			if ($inventoryFilterStore.statSort) {
				const { statId, direction } = $inventoryFilterStore.statSort;
				itemsToFilter.sort((a, b) => {
					const getStatValue = (item: Item, id: string) => {
						const stat = item.stats?.find((s) => s.name === id);
						return stat ? stat.value : 0;
					};
					return direction === 'asc'
						? getStatValue(a, statId) - getStatValue(b, statId)
						: getStatValue(b, statId) - getStatValue(a, statId);
				});
			}
			return itemsToFilter;
		}
	);

	// Stack-deduplicate
	function dedupeStackables(items: Item[]): Item[] {
		const result: Item[] = [];
		const stackIndex = new Map<string, number>();
		for (const item of items) {
			if (item.flags?.includes('stackable')) {
				const existing = stackIndex.get(item.id);
				if (existing !== undefined) {
					result[existing] = { ...result[existing], amount: (result[existing].amount || 1) + 1 };
				} else {
					stackIndex.set(item.id, result.length);
					result.push({ ...item, instanceId: item.id, amount: 1 });
				}
			} else {
				result.push(item);
			}
		}
		return result;
	}

	const groupedInventory = derived([filteredInventory, inventoryTab], ([$filtered, $tab]) => {
		const deduped = dedupeStackables($filtered);
		if ($tab !== 'general') return { regular: deduped, materials: [], sigils: [] };

		const materials: Item[] = [];
		const sigils: Item[] = [];
		const regular: Item[] = [];

		for (const item of deduped) {
			if (isMaterial(item)) materials.push(item);
			else if (isSigil(item)) sigils.push(item);
			else regular.push(item);
		}
		return { regular, materials, sigils };
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
	function closeActionSheet() {
		actionSheetItem = null;
	}

	function getStatName(statId: string): string {
		return statDefinitions[statId]?.name || statId;
	}
	function formatValue(value: number, statId: string): string {
		if (Math.abs(value) < 1 && value !== 0)
			return `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`;
		return `${value > 0 ? '+' : ''}${value}`;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if actionSheetItem}
	<div class="sheet-backdrop" on:click={closeActionSheet}></div>
{/if}

<div class="inventory">
	<!-- Tabs -->
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
		<button
			on:click={() => ($inventoryTab = 'homestead')}
			class:active={$inventoryTab === 'homestead'}>Homestead</button
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

	{#if $inventoryTab === 'weapons'}<InventoryFilterBar isWeaponTab={true} />{/if}
	{#if $inventoryTab === 'relics'}
		<InventoryFilterBar isWeaponTab={false} />{/if}

	<!-- Grid + Drawer -->
	<div class="grid-and-drawer">
		<div class="grid-wrapper">
			<div class="item-grid">
				{#if $inventoryTab === 'general'}
					<!-- Materials collapsible section — shown first -->
					{#if $groupedInventory.materials.length > 0}
						<button
							class="section-header"
							on:click={() => (materialsExpanded = !materialsExpanded)}
						>
							<span class="sh-label">Elemental Materials</span>
							<span class="sh-count">{$groupedInventory.materials.length}</span>
							<span class="sh-chevron" class:open={materialsExpanded}>›</span>
						</button>
						{#if materialsExpanded}
							{#each $groupedInventory.materials as item (item.instanceId || item.id)}
								<div
									class="grid-item"
									class:selected={$activeItem?.id === item.id}
									on:click={() => selectItem(item)}
									on:contextmenu|preventDefault={(e) => openActionSheet(item, e)}
								>
									<ItemBox {item} viewSize="medium" base="" />
									{#if actionSheetItem?.id === item.id}
										<div class="item-action-sheet">
											{#if isConsumable(item)}<button
													class="ias-btn ias-use"
													on:click|stopPropagation={() => {
														handleUse(item);
														closeActionSheet();
													}}>Use</button
												>{/if}
											{#if isEquippable(item)}<button
													class="ias-btn ias-equip"
													on:click|stopPropagation={() => {
														equipItem(item.instanceId);
														closeActionSheet();
													}}>Equip</button
												>{/if}
										</div>
									{/if}
								</div>
							{/each}
						{/if}
					{/if}

					<!-- Sigils collapsible section -->
					{#if $groupedInventory.sigils.length > 0}
						<button class="section-header" on:click={() => (sigilsExpanded = !sigilsExpanded)}>
							<span class="sh-label">Boss Materials</span>
							<span class="sh-count">{$groupedInventory.sigils.length}</span>
							<span class="sh-chevron" class:open={sigilsExpanded}>›</span>
						</button>
						{#if sigilsExpanded}
							{#each $groupedInventory.sigils as item (item.instanceId || item.id)}
								<div
									class="grid-item"
									class:selected={$activeItem?.id === item.id}
									on:click={() => selectItem(item)}
									on:contextmenu|preventDefault={(e) => openActionSheet(item, e)}
								>
									<ItemBox {item} viewSize="medium" base="" />
									{#if actionSheetItem?.id === item.id}
										<div class="item-action-sheet">
											{#if isConsumable(item)}<button
													class="ias-btn ias-use"
													on:click|stopPropagation={() => {
														handleUse(item);
														closeActionSheet();
													}}>Use</button
												>{/if}
										</div>
									{/if}
								</div>
							{/each}
						{/if}
					{/if}

					<!-- Regular items -->
					{#each $groupedInventory.regular as item (item.instanceId || item.id)}
						<div
							class="grid-item"
							class:selected={$activeItem?.id === item.id}
							on:click={() => selectItem(item)}
							on:contextmenu|preventDefault={(e) => openActionSheet(item, e)}
						>
							<ItemBox {item} viewSize="medium" base="" />
							{#if actionSheetItem?.id === item.id}
								<div class="item-action-sheet">
									{#if isConsumable(item)}<button
											class="ias-btn ias-use"
											on:click|stopPropagation={() => {
												handleUse(item);
												closeActionSheet();
											}}>Use</button
										>{/if}
									{#if isEquippable(item)}<button
											class="ias-btn ias-equip"
											on:click|stopPropagation={() => {
												equipItem(item.instanceId);
												closeActionSheet();
											}}>Equip</button
										>{/if}
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<!-- Weapons / Relics / Homestead — no grouping -->
					{#each $groupedInventory.regular as item (item.instanceId || item.id)}
						<div
							class="grid-item"
							class:selected={$activeItem?.id === item.id}
							on:click={() => selectItem(item)}
							on:contextmenu|preventDefault={(e) => openActionSheet(item, e)}
						>
							<ItemBox {item} viewSize="medium" base="" />
							{#if actionSheetItem?.id === item.id}
								<div class="item-action-sheet">
									{#if isConsumable(item)}<button
											class="ias-btn ias-use"
											on:click|stopPropagation={() => {
												handleUse(item);
												closeActionSheet();
											}}>Use</button
										>{/if}
									{#if isEquippable(item)}<button
											class="ias-btn ias-equip"
											on:click|stopPropagation={() => {
												equipItem(item.instanceId);
												closeActionSheet();
											}}>Equip</button
										>{/if}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Item detail drawer -->
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

				{#if drawerItem.description}
					<p class="drawer-desc">{drawerItem.description}</p>
				{/if}

				{#if drawerItem.stats && drawerItem.stats.length > 0}
					<div class="drawer-section-label">Stats</div>
					<div class="drawer-stats">
						{#each drawerItem.stats as stat}
							<Stat statId={stat.name} value={stat.value} view="mini" />
						{/each}
					</div>
				{/if}

				{#if relicSet}
					<div class="drawer-section-label">Set: {relicSet.name}</div>
					<div class="drawer-set">
						{#each relicSet.bonuses as bonus}
							{@const lines = formatBonusLines(bonus)}
							<div class="set-bonus-line">
								<span class="set-pieces">({bonus.pieces}-pc)</span>
								{#each lines as line, i}
									{line}{i < lines.length - 1 ? ' · ' : ''}
								{/each}
							</div>
						{/each}
					</div>
				{/if}

				{#if drawerItem.effects && drawerItem.effects.length > 0}
					<div class="drawer-section-label">Instant Effects</div>
					<div class="drawer-effects">
						{#each drawerItem.effects as effect (Object.keys(effect)[0])}
							<InstantEffectDisplay {effect} />
						{/each}
					</div>
				{/if}

				{#if drawerItem.activeEffects && drawerItem.activeEffects.length > 0}
					<div class="drawer-section-label">Buffs</div>
					<div class="drawer-effects">
						{#each drawerItem.activeEffects as effect (effect.id)}
							<BuffDisplay {effect} />
						{/each}
					</div>
				{/if}

				{#if drawerItem.gearPassives && drawerItem.gearPassives.length > 0}
					<div class="drawer-section-label">Passives</div>
					{#each drawerItem.gearPassives ?? [] as passiveId}
						{@const passive = getGearPassiveById(passiveId)}
						{#if passive}
							<GearPassive
								weaponName={drawerItem.name}
								passiveName={passive.name}
								description={passive.description}
								icon={drawerItem.image}
								view="mini"
							/>
						{/if}
					{/each}
				{/if}

				<!-- Actions -->
				<div class="drawer-actions">
					{#if isConsumable(drawerItem)}
						<button class="drawer-btn drawer-use" on:click={() => handleUse(drawerItem)}>Use</button
						>
					{/if}
					{#if isEquippable(drawerItem)}
						<button
							class="drawer-btn drawer-equip"
							on:click={() => equipItem(drawerItem.instanceId)}>Equip</button
						>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.inventory {
		display: flex;
		flex-direction: column;
		background: rgba(18, 14, 8, 0.6);
		border-radius: 10px;
		border: 1px solid rgba(200, 169, 110, 0.15);
		overflow: hidden;
		min-width: 0;
		flex: 1;
	}

	/* ── Tabs ── */
	.tabs {
		display: flex;
		flex-shrink: 0;
	}
	.tabs button {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		background: rgba(0, 0, 0, 0.3);
		color: var(--text-muted);
		padding: 0.5rem 1rem;
		cursor: pointer;
		flex-grow: 1;
		border: none;
		border-top: 3px solid rgba(0, 0, 0, 0.3);
		transition: all 0.15s;
	}
	.tabs button.active {
		background: var(--color-accent);
		color: var(--text-white);
	}
	.sub-tabs {
		display: flex;
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.2);
		border-inline: 3px solid rgba(0, 0, 0, 0.3);
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
	.sub-tabs button.active {
		color: var(--color-accent);
	}

	/* ── Grid + Drawer ── */
	.grid-and-drawer {
		display: flex;
		gap: 0;
		min-height: 0;
		flex: 1;
	}
	.grid-wrapper {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
		border-top: 3px solid rgba(0, 0, 0, 0.3);
		background: rgba(30, 24, 16, 0.6);
	}
	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 68px);
		gap: 7px 3px;
		justify-content: flex-start;
		padding: 10px 6px 10px 8px;
		align-items: start;
	}

	/* ── Section headers for grouped items ── */
	.section-header {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 8px 6px;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(200, 169, 110, 0.15);
		border-radius: 5px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		color: rgba(200, 169, 110, 0.6);
		transition: background 0.1s;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}
	.section-header:hover {
		background: rgba(200, 169, 110, 0.08);
		color: rgba(200, 169, 110, 0.85);
	}
	.sh-label {
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		flex: 1;
	}
	.sh-count {
		font-size: 0.6rem;
		color: rgba(200, 169, 110, 0.4);
	}
	.sh-chevron {
		font-size: 0.8rem;
		transition: transform 0.15s;
		flex-shrink: 0;
	}
	.sh-chevron.open {
		transform: rotate(90deg);
	}

	.grid-item {
		width: 60px;
		height: 60px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 4px;
		padding: 2px;
		box-sizing: border-box;
		border: 1px solid transparent;
		transition:
			border-color 0.1s,
			background 0.1s;
	}
	.grid-item:hover {
		border-color: rgba(200, 169, 110, 0.35);
		background: rgba(60, 50, 30, 0.9);
	}
	.grid-item.selected {
		border-color: rgba(200, 169, 110, 0.8);
		box-shadow: 0 0 0 1px rgba(200, 169, 110, 0.4);
	}

	/* ── Action sheet ── */
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
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.5);
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
	.ias-use {
		background: rgba(60, 160, 90, 0.15);
		border-color: rgba(60, 160, 90, 0.4);
		color: #50c878;
	}
	.ias-equip {
		background: rgba(200, 169, 110, 0.12);
		border-color: rgba(200, 169, 110, 0.4);
		color: #c8a96e;
	}
	.ias-use:hover {
		background: rgba(60, 160, 90, 0.28);
	}
	.ias-equip:hover {
		background: rgba(200, 169, 110, 0.25);
	}

	/* ── Item drawer ── */
	.item-drawer {
		width: 200px;
		flex-shrink: 0;
		border-left: 1px solid rgba(200, 169, 110, 0.15);
		background: rgba(22, 16, 10, 0.95);
		padding: 12px 12px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		position: relative;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.drawer-close {
		position: absolute;
		top: 6px;
		right: 8px;
		background: none;
		border: none;
		color: rgba(200, 169, 110, 0.4);
		font-size: 0.7rem;
		cursor: pointer;
		padding: 2px 4px;
	}
	.drawer-close:hover {
		color: rgba(200, 169, 110, 0.8);
	}
	.drawer-img {
		display: flex;
		border-radius: 6px;
	}
	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}
	.drawer-name {
		margin: 0;
		font-family: var(--font-family-pixel);
		font-size: 1rem;
		font-weight: 400;
		color: #c8a96e;
		flex-grow: 1;
	}
	.drawer-desc {
		font-family: 'Lexend';
		font-style: italic;
		font-size: 0.85rem;
		color: var(--text-muted);
		line-height: 1.2;
		margin: 0;
	}
	.drawer-section-label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.4);
		margin-top: 2px;
	}
	.drawer-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
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
		background: rgba(0, 0, 0, 0.25);
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
		border-top: 1px solid rgba(200, 169, 110, 0.1);
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
	.drawer-use {
		background: rgba(60, 160, 90, 0.15);
		border-color: rgba(60, 160, 90, 0.4);
		color: #50c878;
	}
	.drawer-equip {
		background: rgba(200, 169, 110, 0.12);
		border-color: rgba(200, 169, 110, 0.4);
		color: #c8a96e;
	}
	.drawer-use:hover {
		background: rgba(60, 160, 90, 0.28);
	}
	.drawer-equip:hover {
		background: rgba(200, 169, 110, 0.25);
	}
</style>