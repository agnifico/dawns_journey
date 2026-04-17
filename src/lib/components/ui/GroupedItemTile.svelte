<script lang="ts">
	/**
	 * GroupedItemTile — a 2×2 accordion tile that collapses a category of items.
	 * Sits inside the inventory grid. Clicking expands inline to show the items.
	 * Clicking an item inside selects it (fires onSelect).
	 */
	import type { Item } from '$lib/types';
	import ItemBox from '$lib/components/ItemBox.svelte';
	import { activeItem } from '$lib/stores/uiStore';

	export let label: string;           // e.g. "Seeds", "Materials", "Sigils"
	export let icon: string;            // representative icon path
	export let items: Item[];           // the grouped items (deduplicated stackables)
	export let color: string = 'rgba(200,169,110,0.3)'; // accent colour for the tile

	let expanded = false;
	function toggle() { expanded = !expanded; }
	function selectItem(item: Item) { $activeItem = item; }
</script>

{#if !expanded}
	<!-- Collapsed: 2×2 tile showing up to 4 preview icons + label + count -->
	<div
		class="grouped-tile collapsed"
		style:--tile-color={color}
		on:click={toggle}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && toggle()}
		title="Expand {label}"
	>
		<div class="tile-previews">
			{#each items.slice(0, 4) as item}
				<div class="preview-img">
					<img src={item.image} alt={item.name}
						on:error={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
					/>
				</div>
			{/each}
			{#if items.length < 4}
				{#each Array(4 - items.length) as _}
					<div class="preview-img empty"></div>
				{/each}
			{/if}
		</div>
		<div class="tile-footer">
			<span class="tile-label">{label}</span>
			<span class="tile-count">{items.length}</span>
		</div>
	</div>
{:else}
	<!-- Expanded: full-width panel with all items, collapses on header click -->
	<div class="grouped-tile expanded" style:--tile-color={color}>
		<div class="expanded-header" on:click={toggle} role="button" tabindex="0"
			on:keydown={(e) => e.key === 'Enter' && toggle()}>
			<span class="tile-label">{label}</span>
			<span class="tile-count">{items.length} items</span>
			<span class="collapse-hint">▲</span>
		</div>
		<div class="expanded-grid">
			{#each items as item (item.instanceId || item.id)}
				<div
					class="expanded-item"
					class:selected={$activeItem?.id === item.id}
					on:click={() => selectItem(item)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && selectItem(item)}
				>
					<ItemBox {item} viewSize="medium" />
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* ── Collapsed tile — same footprint as 2 grid items wide ── */
	.grouped-tile.collapsed {
		width: 127px;  /* ~2 grid items: 2×60px + 7px gap */
		height: 60px;
		background: rgba(26,20,10,0.6);
		border: 1px solid var(--tile-color);
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: border-color 0.15s;
		box-shadow: #00000056 0 -2px 0 0 inset;
	}
	.grouped-tile.collapsed:hover {
		border-color: color-mix(in srgb, var(--tile-color) 100%, white 20%);
		background: rgba(40,32,16,0.8);
	}
	.tile-previews {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		flex: 1;
		gap: 1px;
		padding: 3px 3px 0;
	}
	.preview-img {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0,0,0,0.2);
		border-radius: 2px;
		overflow: hidden;
	}
	.preview-img.empty { opacity: 0; }
	.preview-img img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		image-rendering: pixelated;
	}
	.tile-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2px 5px 3px;
		background: rgba(0,0,0,0.25);
	}
	.tile-label {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		color: rgba(200,169,110,0.6);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.tile-count {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: rgba(200,169,110,0.45);
		flex-shrink: 0;
	}

	/* ── Expanded panel — spans full grid width ── */
	.grouped-tile.expanded {
		grid-column: 1 / -1;   /* span all columns */
		background: rgba(26,20,10,0.7);
		border: 1px solid var(--tile-color);
		border-radius: 6px;
		overflow: hidden;
	}
	.expanded-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px 7px;
		background: rgba(0,0,0,0.3);
		cursor: pointer;
		border-bottom: 1px solid rgba(200,169,110,0.1);
	}
	.expanded-header:hover { background: rgba(0,0,0,0.45); }
	.collapse-hint {
		margin-left: auto;
		font-size: 0.55rem;
		color: rgba(200,169,110,0.4);
	}
	.expanded-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 68px);
		gap: 7px 3px;
		padding: 8px;
	}
	.expanded-item {
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border-radius: 4px;
		padding: 2px;
		box-sizing: border-box;
		border: 1px solid transparent;
		transition: border-color 0.1s, background 0.1s;
	}
	.expanded-item:hover {
		background: rgba(60,50,30,0.9);
		border-color: rgba(200,169,110,0.3);
	}
	.expanded-item.selected {
		border-color: rgba(200,169,110,0.8);
		box-shadow: 0 0 0 1px rgba(200,169,110,0.4);
	}
</style>