<script lang="ts">
	// ItemDetailPanel.svelte
	// Details + actions for the selected inventory item ($activeItem).
	//   narrow (default): Inventory's side drawer in the classic layout.
	//   wide: the gear column in the new inventory layout. Identity on the left
	//         (image, name, element); actions pinned top-right with the details
	//         beneath them. No close button: the panel is always there.

	import type { Item, Set } from '$lib/types';
	import ItemBox from './ItemBox.svelte';
	import Stat from './Stat.svelte';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import InstantEffectDisplay from './ui/InstantEffectDisplay.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	import GearPassive from './GearPassive.svelte';
	import { activeItem } from '$lib/stores/uiStore';
	import { playerStore } from '$lib/stores/playerStore';
	import { equipItem, useItem } from '$lib/services/InventoryService';
	import { getSetForRelic, formatBonusLines } from '$lib/services/SetDataService';
	import { getGearPassiveById } from '$lib/data/abilities';

	export let item: Item;
	export let wide = false;

	const isConsumable = (item: Item) =>
		item.type === 'general' &&
		((item.effects && item.effects.length > 0) ||
			(item.activeEffects && item.activeEffects.length > 0));
	const isEquippable = (item: Item) => item.type === 'weapon' || item.type === 'relic';

	let relicSet: Set | undefined;
	$: relicSet = item.type === 'relic' ? getSetForRelic(item.id) : undefined;
	$: hasActions = isConsumable(item) || isEquippable(item);

	function close() {
		$activeItem = null;
	}

	function handleUse() {
		const instance = $playerStore.inventory.find((i) => i.id === item.id);
		if (!instance?.instanceId) return;
		useItem(instance.instanceId);
		const remaining = $playerStore.inventory.filter((i) => i.id === item.id);
		if (remaining.length <= 1) close();
	}
</script>

{#if wide}
	<div class="item-detail wide">
		<div class="identity">
			<div class="drawer-img">
				<ItemBox {item} viewSize="large" />
			</div>
			<h3 class="drawer-name">{item.name}</h3>
			{#if item.type === 'weapon'}
				<ElementTag element={item.element} size="mini" />
			{/if}
		</div>

		<div class="info">
			{#if hasActions}
				{@render actions()}
			{/if}
			<div class="info-body">
				{#if item.description}
					<p class="drawer-desc">{item.description}</p>
				{/if}
				{@render sections()}
			</div>
		</div>
	</div>
{:else}
	<div class="item-detail">
		<button class="drawer-close" on:click={close}>✕</button>

		<div class="drawer-img">
			<ItemBox {item} viewSize="large" />
		</div>
		<div class="drawer-header">
			<h3 class="drawer-name">{item.name}</h3>
			{#if item.type === 'weapon'}
				<ElementTag element={item.element} size="mini" />
			{/if}
		</div>
		{#if item.description}
			<p class="drawer-desc">{item.description}</p>
		{/if}

		{@render sections()}

		{#if hasActions}
			{@render actions()}
		{/if}
	</div>
{/if}

{#snippet actions()}
	<div class="drawer-actions">
		{#if isConsumable(item)}
			<button class="drawer-btn drawer-use" on:click={handleUse}>Use</button>
		{/if}
		{#if isEquippable(item)}
			<button class="drawer-btn drawer-equip" on:click={() => equipItem(item.instanceId)}>Equip</button>
		{/if}
	</div>
{/snippet}

{#snippet sections()}
	{#if item.stats && item.stats.length > 0}
		<div class="drawer-section-label">Stats</div>
		<div class="drawer-stats">
			{#each item.stats as stat}
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

	{#if item.effects && item.effects.length > 0}
		<div class="drawer-section-label">Instant Effects</div>
		<div class="drawer-effects">
			{#each item.effects as effect (Object.keys(effect)[0])}
				<InstantEffectDisplay {effect} />
			{/each}
		</div>
	{/if}

	{#if item.activeEffects && item.activeEffects.length > 0}
		<div class="drawer-section-label">Buffs</div>
		<div class="drawer-effects">
			{#each item.activeEffects as effect (effect.id)}
				<BuffDisplay {effect} />
			{/each}
		</div>
	{/if}

	{#if item.gearPassives && item.gearPassives.length > 0}
		<div class="drawer-section-label">Passives</div>
		{#each item.gearPassives ?? [] as passiveId}
			{@const passive = getGearPassiveById(passiveId)}
			{#if passive}
				<GearPassive
					weaponName={item.name}
					passiveName={passive.name}
					description={passive.description}
					icon={item.image}
					view="mini"
				/>
			{/if}
		{/each}
	{/if}
{/snippet}

<style>
	.item-detail {
		display: flex;
		flex-direction: column;
		gap: 6px;
		position: relative;
		flex: 1;
	}
	.drawer-close {
		position: absolute;
		top: -6px;
		right: -4px;
		background: none;
		border: none;
		color: rgba(200, 169, 110, 0.4);
		font-size: 0.7rem;
		cursor: pointer;
		padding: 2px 4px;
		z-index: 1;
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

	/* ── Wide: identity column | actions + scrolling details ── */
	.wide {
		flex-direction: row;
		gap: 14px;
		min-height: 0;
	}
	.identity {
		width: 130px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
	.wide .drawer-name {
		flex-grow: 0;
		font-size: 1.05rem;
		line-height: 1.15;
		overflow-wrap: anywhere;
	}
	.info {
		flex: 1;
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.wide .drawer-actions {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
		flex-shrink: 0;
	}
	.wide .drawer-btn {
		padding: 9px 0 10px;
		font-size: 0.85rem;
		letter-spacing: 0.05em;
	}
	.info-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 6px;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.wide .set-bonus-line {
		font-size: 0.7rem;
	}
	.wide .drawer-stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
	}
</style>
