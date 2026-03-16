<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Item } from '../types';
	import { useItem } from '$lib/services/InventoryService';
	import { playerStore } from '$lib/stores/playerStore';
	import { rarityClass } from '$lib/services/InventoryService';

	export let item: Item;
	export let viewSize: 'small' | 'medium' | 'large' = 'medium';

	$: size = viewSize === 'small' ? 40 : viewSize === 'large' ? 120 : 60;

	// ── Rarity — single source of truth ─────────────────────────────────────
	// legendary > special > common. Mutually exclusive display states.
	$: isLegendary  = item?.flags?.includes('legendary');
	$: isSpecial    = item?.flags?.includes('special') && !isLegendary;

	// ── Consumability ────────────────────────────────────────────────────────
	$: isConsumable = item?.type === 'general' && (
		(item.effects?.length ?? 0) > 0 ||
		(item.activeEffects?.length ?? 0) > 0
	);

	$: isWeapon = item?.type === 'weapon';
	$: isRelic  = item?.type === 'relic';

	// ── Equipped state — for hiding irrelevant slot buttons only ─────────────
	// Does NOT affect visual styling of the item slot itself.
	$: equippedWeaponSlots = ($playerStore.equipment.weapon_slots ?? [])
		.map((w, i) => (w?.instanceId === item?.instanceId ? i : -1))
		.filter(i => i !== -1);

	$: equippedRelicSlots = ($playerStore.equipment.relic_slots ?? [])
		.map((r, i) => (r?.instanceId === item?.instanceId ? i : -1))
		.filter(i => i !== -1);

	$: isEquipped = equippedWeaponSlots.length > 0 || equippedRelicSlots.length > 0;

	$: availableWeaponSlots = isWeapon && !isEquipped
		? [0, 1]
		: [];

	$: availableRelicSlots = isRelic && !isEquipped
		? [0, 1, 2, 3]
		: [];

	$: hasActions = isConsumable ||
		availableWeaponSlots.length > 0 ||
		availableRelicSlots.length > 0;

	// ── Sheet ────────────────────────────────────────────────────────────────
	let selected = false;
	let boxEl: HTMLDivElement;
	let sheetStyle = '';

	function updateSheetPosition() {
		if (!browser || !boxEl) return;
		const rect = boxEl.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		if (rect.top >= 80 || rect.top > window.innerHeight - rect.bottom) {
			sheetStyle = `position:fixed;left:${cx}px;bottom:${window.innerHeight - rect.top + 4}px;transform:translateX(-50%);z-index:9999;`;
		} else {
			sheetStyle = `position:fixed;left:${cx}px;top:${rect.bottom + 4}px;transform:translateX(-50%);z-index:9999;`;
		}
	}

	function toggle() {
		if (!hasActions) return;
		selected = !selected;
		if (selected && browser) requestAnimationFrame(updateSheetPosition);
	}

	function close() { selected = false; }

	function handleOutside(e: MouseEvent) {
		if (selected && boxEl && !boxEl.contains(e.target as Node)) close();
	}

	onMount(() => { if (browser) window.addEventListener('click', handleOutside, true); });
	onDestroy(() => { if (browser) window.removeEventListener('click', handleOutside, true); });

	// ── Use — stack-aware ────────────────────────────────────────────────────
	// For stackable items the item prop is the representative of the stack.
	// We find the first actual instance in inventory and use that, so repeated
	// clicks consume the next instance automatically without re-clicking the slot.
	function handleUse() {
		if (!item) return;
		const instance = $playerStore.inventory.find(i => i.id === item.id);
		if (!instance?.instanceId) return;
		useItem(instance.instanceId);
		// Keep sheet open if more of the same item remain
		const remaining = $playerStore.inventory.filter(i => i.id === item.id);
		if (remaining.length === 0) close();
	}

	// ── Equip to specific slot ───────────────────────────────────────────────
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
		close();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="item-box"
	class:legendary={isLegendary}
	class:special={isSpecial}
	class:selected
	class:actionable={hasActions}
	style="width:{size}px;height:{size}px;min-width:{size}px;min-height:{size}px;"
	on:click={toggle}
	bind:this={boxEl}
>
	<img
		src={item.image}
		alt={item.name}
		style:scale={item.flags?.includes('24px') ? Math.round(size / 30) : Math.round(size / 40)}
	/>

	{#if item.amount && item.amount > 1}
		<span class="item-amount">{item.amount}</span>
	{/if}

	<!-- Rarity pip — top-right corner dot, one per item max -->
	{#if isLegendary}
		<span class="rarity-pip legendary-pip"></span>
	{:else if isSpecial}
		<span class="rarity-pip special-pip"></span>
	{/if}

	<!-- Action sheet — fixed-position to escape overflow:hidden parents -->
	{#if selected && hasActions && browser}
		<div class="action-sheet" style={sheetStyle}>
			{#if isConsumable}
				<button class="as-btn as-use" on:click|stopPropagation={handleUse}>
					USE
				</button>
			{/if}
			{#each availableWeaponSlots as i}
				<button class="as-btn as-equip" on:click|stopPropagation={() => equipToSlot('weapon_slots', i)}>
					Slot {i + 1}
				</button>
			{/each}
			{#each availableRelicSlots as i}
				<button class="as-btn as-equip" on:click|stopPropagation={() => equipToSlot('relic_slots', i)}>
					#{i + 1}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* ── Base slot ── */
	.item-box {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #2a2218;
		border-radius: 5px;
		border: 1px solid rgba(200, 169, 110, 0.12);
		box-shadow: #00000056 0 -3px 0 1px inset;
		image-rendering: pixelated;
		transition: border-color 0.12s;
	}

	/* Cursor only when something can happen on click */
	.item-box.actionable { cursor: pointer; }

	/* Hover — all actionable items get a subtle tan highlight */
	.item-box.actionable:hover {
		border-color: rgba(200, 169, 110, 0.35);
	}

	/* Selected — full tan ring */
	.item-box.selected {
		border-color: #c8a96e;
		box-shadow: 0 0 0 1px #c8a96e, #00000056 0 -3px 0 1px inset;
	}

	/* ── Rarity treatments ── */

	/* Legendary — gold border + very faint gold bg tint */
	.item-box.legendary {
		border-color: rgba(232, 201, 110, 0.65);
		background: rgb(106, 94, 59);
	}
	.item-box.legendary.actionable:hover {
		border-color: rgba(232, 201, 110, 0.9);
	}
	.item-box.legendary.selected {
		border-color: #e8c96e;
		box-shadow: 0 0 0 1px #e8c96e, 0 0 8px rgba(232, 201, 110, 0.25), #00000056 0 -3px 0 1px inset;
	}

	/* Special — purple border + very faint purple bg tint */
	.item-box.special {
		border-color: rgba(160, 80, 220, 0.5);
		background: rgb(74, 58, 86);
	}
	.item-box.special.actionable:hover {
		border-color: rgba(160, 80, 220, 0.8);
	}
	.item-box.special.selected {
		border-color: #b050e0;
		box-shadow: 0 0 0 1px #b050e0, 0 0 8px rgba(160, 80, 220, 0.2), #00000056 0 -3px 0 1px inset;
	}

	/* ── Item image ── */
	.item-box img {
		position: relative;
		top: -2px;
		max-width: 32px;
		max-height: 32px;
		image-rendering: pixelated;
	}

	/* ── Stack count ── */
	.item-amount {
		position: absolute;
		bottom: 1px;
		right: 3px;
		font-size: 0.5rem;
		color: rgba(255, 255, 255, 0.65);
		font-family: var(--font-family-pixel);
		pointer-events: none;
	}

	/* ── Rarity pip — small corner dot ── */
	.rarity-pip {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 5px;
		height: 5px;
		border-radius: 1px;
		pointer-events: none;
	}
	.legendary-pip { background: #e8c96e; }
	.special-pip   { background: #b050e0; }

	/* ── Action sheet ── */
	.action-sheet {
		background: #1c1610;
		border: 1px solid rgba(200, 169, 110, 0.25);
		border-radius: 7px;
		padding: 5px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		min-width: 80px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
	}

	.as-btn {
		flex: 1;
		min-width: 34px;
		padding: 4px 6px;
		border-radius: 4px;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
		white-space: nowrap;
		transition: background 0.1s;
		border: 1px solid;
	}

	.as-use {
		background: rgba(60, 160, 90, 0.15);
		border-color: rgba(60, 160, 90, 0.4);
		color: #50c878;
	}
	.as-use:hover { background: rgba(60, 160, 90, 0.28); }

	.as-equip {
		background: rgba(200, 169, 110, 0.1);
		border-color: rgba(200, 169, 110, 0.3);
		color: #c8a96e;
	}
	.as-equip:hover { background: rgba(200, 169, 110, 0.22); }
</style>