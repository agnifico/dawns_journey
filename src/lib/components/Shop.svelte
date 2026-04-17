<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import {
		getAllItems,
		addItems,
		countInventoryItem,
		removeItemsByItemId
	} from '$lib/services/InventoryService';
	import { messageStore } from '$lib/stores/messageStore';
	import type { Item } from '$lib/types';
	import { toastStore } from '$lib/stores/toastStore';

	// ── Tab definitions — add new tabs here, never touch the logic below ──
	const TABS: { id: string; label: string; flag: string }[] = [
		{ id: 'cafe',    label: 'Café',           flag: 'cafe'     },
		{ id: 'grocery', label: 'Grocery',         flag: 'grocery'  },
		{ id: 'special', label: 'Horizonte Alley', flag: 'special'  },
	];

	let activeTabId = TABS[0].id;
	let shopItems: Item[] = [];
	let argentum = 0;

	$: {
		const tab = TABS.find(t => t.id === activeTabId)!;
		shopItems = getAllItems().filter(item => item.flags?.includes(tab.flag));
	}

	$: activeTab = TABS.find(t => t.id === activeTabId)!;

	playerStore.subscribe((player) => {
		argentum = countInventoryItem(player.inventory, 'argentum');
	});

	function buyItem(item: Item, e: MouseEvent) {
		e.stopPropagation();
		if (!item.price) {
			messageStore.addMessage(`${item.name} has no price.`, ['System', 'World']);
			return;
		}
		playerStore.update((player) => {
			if (countInventoryItem(player.inventory, 'argentum') < item.price!) {
				toastStore.warning(`Not enough Argentum to buy ${item.name}.`);
				return player;
			}
			let p = removeItemsByItemId(player, 'argentum', item.price!);
			p = addItems(p, item.id, 1, true);
			toastStore.success(`Bought: ${item.name}!`);
			return p;
		});
	}
</script>

<div class="shop">

	<!-- Header -->
	<div class="shop-header">
		<div class="header-left">
			<p class="shop-eyebrow">Dawn's Journey</p>
			<h1 class="shop-title">{activeTab.label}</h1>
		</div>
		<div class="currency-badge">
			<img src="/general/argentum.png" alt="Argentum" class="currency-icon" />
			<span class="currency-num">{argentum.toLocaleString()}</span>
			<span class="currency-label">Argentum</span>
		</div>
	</div>

	<!-- Tab bar -->
	<div class="tab-bar">
		{#each TABS as tab}
			<button
				class="tab-btn"
				class:active={activeTabId === tab.id}
				on:click={() => (activeTabId = tab.id)}
			>{tab.label}</button>
		{/each}
		<div class="tab-spacer" />
		<span class="item-count">{shopItems.length} items</span>
	</div>

	<!-- Grid -->
	<div class="item-grid">
		{#each shopItems as item (item.id)}
			<div class="item-card">

				<div class="item-img-wrap">
					<img src={item.image} alt={item.name} class="item-img" />
				</div>

				<div class="item-body">
					<h3 class="item-name">{item.name}</h3>
					<p class="item-desc">{item.description}</p>
				</div>

				<!-- Hover-expand price→buy pill -->
				<div class="price-pill">
					<img src="/general/argentum.png" alt="" class="price-icon" />
					<span class="price-num">{item.price?.toLocaleString()}</span>
					<button class="buy-action" on:click={(e) => buyItem(item, e)}>
						Buy
					</button>
				</div>

			</div>
		{:else}
			<div class="empty-state">
				<span class="empty-icon">🛒</span>
				<p>Nothing for sale here yet.</p>
			</div>
		{/each}
	</div>
</div>

<style>
	/* ── Root ── */
	.shop {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #161616;
		font-family: var(--font-family-pixel, monospace);
		color: #e4d8be;
		overflow: hidden;
	}

	/* ── Header ── */
	.shop-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		padding: 1.5rem 2rem 0.75rem;
		flex-shrink: 0;
		border-bottom: 1px solid rgba(200,169,110,0.1);
		background: rgba(0,0,0,0.25);
	}

	.header-left { display: flex; flex-direction: column; gap: 2px; }

	.shop-eyebrow {
		font-size: 0.85rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #7a5a20;
		margin: 0;
	}

	.shop-title {
		font-family: 'Lexend', var(--font-family-pixel, monospace);
		font-size: 2.2rem;
		font-weight: 600;
		color: #e8c870;
		margin: 0;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		text-shadow: 0 0 30px rgba(232,200,112,0.15);
	}

	.currency-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(200,169,110,0.08);
		border: 1px solid rgba(200,169,110,0.25);
		border-radius: 8px;
		padding: 0.5rem 0.9rem;
		box-shadow: rgba(0,0,0,0.5) 0 -2px 0 0 inset;
	}

	.currency-icon { width: 20px; height: 20px; image-rendering: pixelated; }
	.currency-num  { font-size: 1rem; color: #c8a96e; letter-spacing: 0.04em; }
	.currency-label { font-size: 0.85rem; color: #6a5030; letter-spacing: 0.08em; }

	/* ── Tab bar ── */
	.tab-bar {
		display: flex;
		align-items: center;
		padding: 0.75rem 2rem 0;
		flex-shrink: 0;
		border-bottom: 2px solid rgba(200,169,110,0.1);
		background: rgba(0,0,0,0.15);
	}

	.tab-btn {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.9rem;
		letter-spacing: 0.06em;
		padding: 0.55rem 1.4rem 0.7rem;
		border: none;
		border-bottom: 3px solid transparent;
		background: transparent;
		color: #5a4020;
		cursor: pointer;
		transition: 0.12s all ease-in;
		border-radius: 6px 6px 0 0;
	}
	.tab-btn:hover:not(.active) {
		color: #c8a96e;
		background: rgba(200,169,110,0.05);
		padding-bottom: 0.55rem;
	}
	.tab-btn.active {
		color: #e8d090;
		border-bottom-color: #c8a96e;
		background: rgba(200,169,110,0.08);
		padding-bottom: 0.55rem;
		cursor: default;
	}

	.tab-spacer { flex: 1; }

	.item-count {
		font-size: 0.85rem;
		color: #3a2a10;
		letter-spacing: 0.08em;
		padding-bottom: 0.7rem;
	}

	/* ── Item grid ── */
	.item-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 0.85rem;
		padding: 1.25rem 2rem 1.5rem;
		overflow-y: auto;
		align-content: start;
		scrollbar-width: thin;
		scrollbar-color: #2a1e08 transparent;
	}

	/* ── Item card ── */
	.item-card {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		padding: 0.75rem 0.75rem 0.75rem 0.75rem;
		background: linear-gradient(160deg, #1e1810 0%, #161008 100%);
		border: 1px solid rgba(200,169,110,0.12);
		border-radius: 12px;
		box-shadow: rgba(0,0,0,0.55) 0 -4px 0 0 inset;
		transition: border-color 0.18s;
		/* Enough right padding for the pill */
		padding-right: 1rem;
	}

	.item-card:hover {
		border-color: rgba(200,169,110,0.3);
	}

	/* Expand the pill on card hover */
	.item-card:hover .buy-action {
		max-width: 60px;
		opacity: 1;
		padding-left: 10px;
		padding-right: 10px;
		border-left: 1px solid rgba(200,169,110,0.25);
	}

	/* Image */
	.item-img-wrap {
		flex-shrink: 0;
		width: 72px;
		height: 72px;
		background: rgba(0,0,0,0.35);
		border-radius: 8px;
		border: 1px solid rgba(200,169,110,0.1);
		box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-img {
		width: 52px;
		height: 52px;
		image-rendering: pixelated;
		object-fit: contain;
	}

	/* Body */
	.item-body {
		flex: 1;
		flex-grow: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
		/* leave room for the pill at top-right */
		padding-right: 4.5rem;
		/* border: 1px solid white; */
	}
	
	.item-name {
		font-size: 0.75rem;
		flex-grow: 1;
		width: 20ch;
		color: #e8c870;
		margin: 0;
		letter-spacing: 0.04em;
	}
	
	.item-desc {
		font-size: 0.85rem;
		color: #8a5a5a;
		margin: 0;
		line-height: 1.55;
	}

	/* ── Price pill ── */
	.price-pill {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(200,169,110,0.1);
		border: 1px solid rgba(200,169,110,0.22);
		border-radius: 20px;
		padding: 4px 10px;
		box-shadow: rgba(0,0,0,0.5) 0 -2px 0 0 inset;
		white-space: nowrap;
		overflow: hidden;
		/* Transition for pill width expansion */
		transition: background 0.18s, border-color 0.18s;
	}

	.item-card:hover .price-pill {
		background: rgba(200,169,110,0.16);
		border-color: rgba(200,169,110,0.4);
	}

	.price-icon {
		width: 14px;
		height: 14px;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.price-num {
		font-size: 0.85rem;
		color: #c8a96e;
		letter-spacing: 0.04em;
	}

	/* The buy action — hidden portion of the pill, slides in on card hover */
	.buy-action {
		/* Collapse to nothing by default */
		max-width: 0;
		opacity: 0;
		overflow: hidden;
		padding: 0;
		border: none;
		border-left: 1px solid transparent;
		background: transparent;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.85rem;
		color: #e8c870;
		cursor: pointer;
		letter-spacing: 0.06em;
		transition:
			max-width 0.22s ease,
			opacity 0.18s ease,
			padding 0.18s ease,
			color 0.12s;
		white-space: nowrap;
		/* Vertically match the pill */
		line-height: 1;
	}

	.buy-action:hover {
		color: #fff8e0;
	}

	.buy-action:active {
		color: #c8a96e;
	}

	/* ── Empty state ── */
	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 4rem 1rem;
		color: #3a2a10;
	}

	.empty-icon { font-size: 2rem; opacity: 0.25; }

	.empty-state p {
		font-size: 0.9rem;
		font-style: italic;
		margin: 0;
	}
</style>