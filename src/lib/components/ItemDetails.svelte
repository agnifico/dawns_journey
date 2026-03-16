<script lang="ts">
	import type { Item } from '$lib/types';
	import Stat from './Stat.svelte';
	import InstantEffectDisplay from './ui/InstantEffectDisplay.svelte';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	import { useItem } from '$lib/services/InventoryService';
	import { playerStore } from '$lib/stores/playerStore';

	export let item: Item | null;

	$: isConsumable = item?.type === 'general' &&
		((item.effects && item.effects.length > 0) ||
		 (item.activeEffects && item.activeEffects.length > 0));

	$: isWeapon = item?.type === 'weapon';
	$: isRelic  = item?.type === 'relic';

	function handleUse() {
		if (!item) return;
		// Always look up the next live instance by template id — handles stackables
		// and prevents stale instanceId after the first use.
		const instance = $playerStore.inventory.find(i => i.id === item!.id);
		if (!instance?.instanceId) return;
		useItem(instance.instanceId);
	}

	function equipToSlot(slotType: 'weapon_slots' | 'relic_slots', slotIndex: number) {
		if (!item?.instanceId) return;
		const instanceId = item.instanceId;
		playerStore.update(player => {
			const invIdx = player.inventory.findIndex(i => i.instanceId === instanceId);
			if (invIdx === -1) return player;

			const itemToEquip = player.inventory[invIdx];
			const newInventory = [...player.inventory];
			newInventory.splice(invIdx, 1);

			const slots = [...player.equipment[slotType]] as (Item | null)[];
			const displaced = slots[slotIndex];
			slots[slotIndex] = itemToEquip as any;

			return {
				...player,
				inventory: displaced ? [...newInventory, displaced] : newInventory,
				equipment: { ...player.equipment, [slotType]: slots }
			};
		});
	}
</script>

{#if item}
	<div class="item-details-panel">

		<!-- Header -->
		<div class="idp-header">
			<div class="idp-image">
				<img src={item.image} alt={item.name} />
			</div>
			<div class="idp-title">
				<div class="idp-name-row">
					<h3 class="idp-name">{item.name}</h3>
					{#if item.type === 'weapon' && item.element}
						<ElementTag element={item.element} size="mini" />
					{/if}
				</div>
				{#if item.flags?.includes('legendary')}
					<span class="idp-rarity legendary">Legendary</span>
				{:else if item.flags?.includes('special')}
					<span class="idp-rarity special">Special</span>
				{/if}
			</div>
		</div>

		<!-- Description -->
		<p class="idp-desc">{item.description}</p>

		<!-- Weapon stats -->
		{#if item.stats && item.stats.length > 0}
			<div class="idp-section">
				<span class="idp-section-label">Stats</span>
				<div class="idp-stats-grid">
					{#each item.stats as stat}
						<Stat statId={stat.name} value={stat.value} view="mini" />
					{/each}
				</div>
			</div>
		{/if}

		<!-- Instant effects -->
		{#if item.effects && item.effects.length > 0}
			<div class="idp-section">
				<span class="idp-section-label">On Use</span>
				<div class="idp-effects-row">
					{#each item.effects as effect (Object.keys(effect)[0])}
						<InstantEffectDisplay {effect} />
					{/each}
				</div>
			</div>
		{/if}

		<!-- Active effects / buffs -->
		{#if item.activeEffects && item.activeEffects.length > 0}
			<div class="idp-section">
				<span class="idp-section-label">Buffs</span>
				<div class="idp-effects-row">
					{#each item.activeEffects as effect (effect.id)}
						<BuffDisplay {effect} />
					{/each}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="idp-actions">
			{#if isConsumable}
				<button class="idp-btn idp-btn-use" on:click={handleUse}>
					Use
				</button>
			{/if}

			{#if isWeapon}
				<button class="idp-btn idp-btn-equip" on:click={() => equipToSlot('weapon_slots', 0)}>
					Slot 1
				</button>
				<button class="idp-btn idp-btn-equip" on:click={() => equipToSlot('weapon_slots', 1)}>
					Slot 2
				</button>
			{/if}

			{#if isRelic}
				{#each [0, 1, 2, 3] as i}
					<button class="idp-btn idp-btn-equip" on:click={() => equipToSlot('relic_slots', i)}>
						#{i + 1}
					</button>
				{/each}
			{/if}
		</div>

	</div>
{/if}

<style>
	.item-details-panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 200px;
		flex-shrink: 0;
		background: #1c1610;
		border: 1px solid rgba(200,169,110,0.22);
		border-radius: 8px;
		padding: 12px;
		box-shadow: #00000060 0 -5px 0 2px inset;
	}

	/* Header */
	.idp-header {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.idp-image {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		background: #252018;
		border-radius: 6px;
		border: 1px solid rgba(200,169,110,0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		image-rendering: pixelated;
	}

	.idp-image img {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
	}

	.idp-title {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.idp-name-row {
		display: flex;
		align-items: flex-start;
		gap: 5px;
	}

	.idp-name {
		margin: 0;
		font-family: var(--font-family-main);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-accent, #c8a96e);
		line-height: 1.2;
		flex: 1;
	}

	.idp-rarity {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		font-weight: 600;
		padding: 2px 5px;
		border-radius: 3px;
		white-space: nowrap;
	}

	.idp-rarity.legendary {
		background: rgba(232,201,110,0.15);
		border: 1px solid rgba(232,201,110,0.4);
		color: #e8c96e;
	}

	.idp-rarity.special {
		background: rgba(160,80,220,0.12);
		border: 1px solid rgba(160,80,220,0.4);
		color: #c070f0;
	}

	/* Description */
	.idp-desc {
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: var(--text-muted, #6a6050);
		line-height: 1.6;
		margin: 0;
	}

	/* Sections */
	.idp-section {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.idp-section-label {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(200,169,110,0.38);
	}

	.idp-stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3px;
	}

	.idp-effects-row {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	/* Actions */
	.idp-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-top: auto;
		padding-top: 4px;
		border-top: 1px solid rgba(200,169,110,0.1);
	}

	.idp-btn {
		flex: 1;
		min-width: 40px;
		padding: 6px 8px;
		border-radius: 5px;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
		border: 1px solid;
		transition: background 0.12s;
	}

	.idp-btn-use {
		background: rgba(60,160,90,0.15);
		border-color: rgba(60,160,90,0.4);
		color: #50c878;
	}
	.idp-btn-use:hover { background: rgba(60,160,90,0.28); }

	.idp-btn-equip {
		background: rgba(200,169,110,0.1);
		border-color: rgba(200,169,110,0.3);
		color: #c8a96e;
	}
	.idp-btn-equip:hover { background: rgba(200,169,110,0.22); }
</style>