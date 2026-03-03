<script lang="ts">
	import { type CraftingRecipe } from '$lib/types';
	import { craftingRecipes } from '$lib/data/craftingRecipes';
	import { craft } from '$lib/services/CraftingService';
	import { playerStore } from '$lib/stores/playerStore';
	import { hasItem, countInventoryItem } from '$lib/services/InventoryService';
	import { itemDictionary } from '$lib/data/items';
	import Notification from '$lib/components/Notification.svelte';
	import { getTimePointCount } from '$lib/stores/timePointStore';
	import { materialRecipes } from '$lib/data/materialRecipes';

	$: timePointCount = getTimePointCount($playerStore.inventory);

	// ── Tab state ──────────────────────────────────────────────────────────────
	type Tab = 'smithing' | 'cooking' | 'alchemy' | 'materials';
	let activeTab: Tab = 'smithing';

	const tabs = [
		{ id: 'smithing', label: 'Smithing', icon: '⚒', accent: '#c0843a', skillId: 'smithing' },
		{ id: 'cooking', label: 'Cooking', icon: '🍲', accent: '#7ab648', skillId: 'cooking' },
		{ id: 'alchemy', label: 'Alchemy', icon: '⚗', accent: '#9b6fd4', skillId: 'alchemy' },
		{ id: 'materials', label: 'Materials', icon: '💎', accent: '#4aadcc', skillId: 'smithing' }
	];

	// ── Derived data ───────────────────────────────────────────────────────────
	$: activeRecipes = craftingRecipes.filter((r) => r.skillId === activeTab);
	$: activeAccent = tabs.find((t) => t.id === activeTab)?.accent ?? '#c0843a';

	$: rawRecipes =
		activeTab === 'materials'
			? materialRecipes
			: craftingRecipes.filter((r) => r.skillId === activeTab);

	type GridItem = CraftingRecipe | { levelHeader: number };
	$: groupedRecipes = (() => {
		const sorted = [...rawRecipes].sort((a, b) => (a.requiredLevel ?? 1) - (b.requiredLevel ?? 1));
		const result: GridItem[] = [];
		let lastLevel = -1;
		for (const recipe of sorted) {
			const lvl = recipe.requiredLevel ?? 1;
			if (lvl !== lastLevel) {
				result.push({ levelHeader: lvl });
				lastLevel = lvl;
			}
			result.push(recipe);
		}
		return result;
	})();

	function isHeader(item: GridItem): item is { levelHeader: number } {
		return 'levelHeader' in item;
	}

	function getSkillLevel(skillId: string): number {
		return $playerStore.skills.find((s: any) => s.id === skillId)?.level ?? 1;
	}

	function canCraft(recipe: CraftingRecipe): boolean {
		const lvl = getSkillLevel(recipe.skillId ?? '');
		if ((recipe.requiredLevel ?? 1) > lvl) return false;
		return recipe.ingredients.every((ing) =>
			hasItem($playerStore.inventory, ing.itemId, ing.quantity)
		);
	}

	function isLevelLocked(recipe: CraftingRecipe): boolean {
		return (recipe.requiredLevel ?? 1) > getSkillLevel(recipe.skillId ?? '');
	}

	function ingredientCount(itemId: string): number {
		return countInventoryItem($playerStore.inventory, itemId);
	}

	function handleCraft(recipeId: string) {
		craft(recipeId);
	}

	// ── Selected recipe (detail panel) ────────────────────────────────────────
	let selectedRecipe: CraftingRecipe | null = null;
	$: if (activeTab) selectedRecipe = null; // clear on tab switch
	$: detailCraftable = selectedRecipe ? canCraft(selectedRecipe) : false;
	$: detailLocked = selectedRecipe ? isLevelLocked(selectedRecipe) : false;
	$: detailOutputItem = selectedRecipe ? itemDictionary[selectedRecipe.output.itemId] : null;
</script>

<!-- ══════════════════════════════════════════════════════ MARKUP ══════════ -->
<div class="workshop" style="--accent: {activeAccent}">
	<!-- Header -->
	<header class="ws-header">
		<div class="ws-title-row">
			<span class="ws-icon">🔧</span>
			<h1 class="ws-title">Workshop</h1>
			<div
				class="tp-display"
				title="Time Points — earned by spending time in the Workshop. Used in Cooking recipes."
			>
				<span class="tp-icon">⏳</span>
				<span class="tp-count">{timePointCount}</span>
				<span class="tp-label">Time Points</span>
			</div>
		</div>

		<!-- Tab bar -->
		<nav class="tab-bar">
			{#each tabs as tab}
				<button
					class="tab-btn"
					class:active={activeTab === tab.id}
					style="--tab-accent: {tab.accent}"
					on:click={() => (activeTab = tab.id)}
				>
					<span class="tab-icon">{tab.icon}</span>
					<span class="tab-label">{tab.label}</span>
					<span class="tab-lvl">Lv {getSkillLevel(tab.id)}</span>
				</button>
			{/each}
		</nav>
	</header>

	<!-- Body: recipe grid + detail panel -->
	<div class="ws-body">
		<!-- Recipe grid -->
		<section class="recipe-grid">
			{#each groupedRecipes as item (isHeader(item) ? `h-${item.levelHeader}` : item.id)}
				{#if isHeader(item)}
					<div class="level-header" style="--lvl-accent: {activeAccent}">
						<span class="level-header-line"></span>
						<span class="level-header-label">
							{['', 'Novice', 'Apprentice', 'Adept', 'Expert', 'Master'][item.levelHeader] ??
								`Level ${item.levelHeader}`}
						</span>
						<span class="level-header-line"></span>
					</div>
				{:else}
					{@const recipe = item}
					{@const craftable = canCraft(recipe)}
					{@const locked = isLevelLocked(recipe)}
					<button
						class="recipe-card"
						class:craftable
						class:locked
						class:selected={selectedRecipe?.id === recipe.id}
						on:click={() => (selectedRecipe = recipe)}
					>
						<div class="card-img-wrap">
							<img
								src={recipe.image ?? itemDictionary[recipe.output.itemId]?.image}
								alt={recipe.name}
								class="card-img"
							/>
							{#if locked}
								<div class="lock-overlay">🔒 Lv {recipe.requiredLevel}</div>
							{:else if craftable}
								<div class="ready-pip"></div>
							{/if}
						</div>
						<span class="card-name">{recipe.name}</span>
						{#if recipe.xpYield}
							<span class="card-xp">+{recipe.xpYield} xp</span>
						{/if}
					</button>
				{/if}
			{/each}
		</section>

		<!-- Detail panel -->
		<aside class="detail-panel">
			{#if selectedRecipe}
				<div class="detail-img-wrap">
					<img
						src={selectedRecipe.image ?? itemDictionary[selectedRecipe.output.itemId]?.image}
						alt={selectedRecipe.name}
						class="detail-img"
					/>
				</div>

				<h2 class="detail-name">{selectedRecipe.name}</h2>
				<p class="detail-desc">{selectedRecipe.description ?? ''}</p>

				{#if selectedRecipe.requiredLevel && selectedRecipe.requiredLevel > 1}
					<p class="detail-req" class:req-fail={detailLocked}>
						Requires {tabs.find((t) => t.id === selectedRecipe.skillId)?.label} Lv {selectedRecipe.requiredLevel}
					</p>
				{/if}

				<div class="ingredients-list">
					<p class="ingredients-heading">Ingredients</p>
					{#each selectedRecipe.ingredients as ing}
						{@const item = itemDictionary[ing.itemId]}
						{@const have = ingredientCount(ing.itemId)}
						{@const enough = have >= ing.quantity}
						<div class="ingredient-row" class:lacking={!enough}>
							<img src={item?.image} alt={item?.name} class="ing-img" />
							<span class="ing-name">{item?.name ?? ing.itemId}</span>
							<span class="ing-qty">{have}/{ing.quantity}</span>
						</div>
					{/each}
				</div>

				<div class="detail-output">
					<p class="ingredients-heading">Output</p>
					<div class="output-row">
						<img src={detailOutputItem?.image} alt={detailOutputItem?.name} class="ing-img" />
						<span>{detailOutputItem?.name ?? selectedRecipe.output.itemId}</span>
						<span class="ing-qty">× {selectedRecipe.output.quantity}</span>
					</div>
				</div>

				<button
					class="craft-btn"
					disabled={!detailCraftable}
					on:click={() => handleCraft(selectedRecipe.id)}
				>
					{#if detailLocked}
						🔒 Level too low
					{:else if detailCraftable}
						✦ Craft
					{:else}
						Missing ingredients
					{/if}
				</button>
			{:else}
				<div class="detail-empty">
					<span class="detail-empty-icon">{tabs.find((t) => t.id === activeTab)?.icon}</span>
					<p>Select a recipe to see details</p>
				</div>
			{/if}
		</aside>
	</div>
</div>

<Notification />

<!-- ══════════════════════════════════════════════════════ STYLES ══════════ -->
<style>
	/* ── Fonts ── */
	@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

	/* ── Tokens ── */
	.workshop {
		--bg0: #12100e;
		--bg1: #1c1915;
		--bg2: #252118;
		--bg3: #2f2a1f;
		--border: #3a3228;
		--text: #e8dfc8;
		--muted: #7a7060;
		--accent: #c0843a; /* overridden per-tab via inline style */
		--danger: #c04040;
		--success: #6aad50;

		font-family: 'Crimson Pro', Georgia, serif;
		background: var(--bg0);
		color: var(--text);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.level-header {
		grid-column: 1 / -1;
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.35rem 0;
		background: var(--bg0);
	}

	.level-header-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			color-mix(in srgb, var(--lvl-accent) 40%, var(--border)),
			transparent
		);
	}

	.level-header-label {
		font-family: 'Cinzel', serif;
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--lvl-accent);
		white-space: nowrap;
		padding: 0.15rem 0.5rem;
		border: 1px solid color-mix(in srgb, var(--lvl-accent) 35%, transparent);
		border-radius: 3px;
		background: color-mix(in srgb, var(--lvl-accent) 8%, var(--bg0));
	}

	/* ── Header ── */
	.ws-header {
		background: var(--bg1);
		border-bottom: 1px solid var(--border);
		padding: 1.25rem 1.5rem 0;
	}

	.ws-title-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.ws-icon {
		font-size: 1.4rem;
	}

	.ws-title {
		font-family: 'Cinzel', serif;
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--accent);
		margin: 0;
		text-shadow: 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
	}

	/* ── Time Point display ── */
	.tp-display {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--bg2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
	}

	.tp-icon {
		font-size: 0.9rem;
	}

	.tp-count {
		font-family: 'Cinzel', serif;
		font-size: 0.95rem;
		color: var(--accent);
		font-weight: 600;
		min-width: 1.5ch;
	}

	.tp-label {
		color: var(--muted);
		font-size: 0.72rem;
		font-style: italic;
	}

	.tp-session {
		font-size: 0.65rem;
		color: var(--success);
		font-style: italic;
		padding-left: 0.3rem;
		border-left: 1px solid var(--border);
	}

	/* ── Tab bar ── */
	.tab-bar {
		display: flex;
		gap: 0.25rem;
	}

	.tab-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 0.5rem 1.2rem 0.6rem;
		background: transparent;
		border: 1px solid transparent;
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		color: var(--muted);
		font-family: 'Crimson Pro', serif;
		font-size: 0.85rem;
		transition:
			color 0.2s,
			background 0.2s,
			border-color 0.2s;
		position: relative;
		bottom: -1px;
	}

	.tab-btn:hover {
		color: var(--text);
		background: var(--bg2);
	}

	.tab-btn.active {
		background: var(--bg0);
		border-color: var(--border);
		border-bottom-color: var(--bg0);
		color: var(--tab-accent);
	}

	.tab-icon {
		font-size: 1.1rem;
	}
	.tab-label {
		font-family: 'Cinzel', serif;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.tab-lvl {
		font-size: 0.7rem;
		color: var(--muted);
	}
	.tab-btn.active .tab-lvl {
		color: color-mix(in srgb, var(--tab-accent) 70%, var(--muted));
	}

	/* ── Body layout ── */
	.ws-body {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 0;
		flex: 1;
		overflow: hidden;
	}

	/* ── Recipe grid ── */
	.recipe-grid {
		padding: 1.25rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		gap: 0.75rem;
		align-content: start;
		overflow-y: auto;
	}

	.recipe-card {
		background: var(--bg2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.6rem;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		transition:
			border-color 0.15s,
			transform 0.1s,
			background 0.15s;
		opacity: 0.55;
		text-align: center;
	}

	.recipe-card:hover {
		background: var(--bg3);
		border-color: var(--muted);
	}
	.recipe-card.craftable {
		opacity: 1;
	}
	.recipe-card.selected {
		border-color: var(--accent);
		background: var(--bg3);
		box-shadow: 0 0 0 1px var(--accent);
	}
	.recipe-card.locked {
		opacity: 0.35;
		cursor: default;
	}

	.card-img-wrap {
		position: relative;
		width: 64px;
		height: 64px;
	}

	.card-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		image-rendering: pixelated;
	}

	.ready-pip {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--success);
		box-shadow: 0 0 6px var(--success);
	}

	.lock-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.65rem;
		color: var(--muted);
		font-family: 'Cinzel', serif;
		letter-spacing: 0.05em;
	}

	.card-name {
		font-family: 'Cinzel', serif;
		font-size: 0.62rem;
		letter-spacing: 0.05em;
		color: var(--text);
		line-height: 1.2;
	}

	.card-xp {
		font-size: 0.6rem;
		color: var(--accent);
		font-style: italic;
	}

	/* ── Detail panel ── */
	.detail-panel {
		background: var(--bg1);
		border-left: 1px solid var(--border);
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		overflow-y: auto;
	}

	.detail-img-wrap {
		display: flex;
		justify-content: center;
	}

	.detail-img {
		width: 96px;
		height: 96px;
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 4px 12px color-mix(in srgb, var(--accent) 35%, transparent));
	}

	.detail-name {
		font-family: 'Cinzel', serif;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--accent);
		margin: 0;
		text-align: center;
	}

	.detail-desc {
		font-size: 0.9rem;
		color: var(--muted);
		font-style: italic;
		margin: 0;
		text-align: center;
		line-height: 1.5;
	}

	.detail-req {
		text-align: center;
		font-size: 0.78rem;
		font-family: 'Cinzel', serif;
		color: var(--success);
		margin: 0;
	}
	.detail-req.req-fail {
		color: var(--danger);
	}

	/* ── Ingredients ── */
	.ingredients-heading {
		font-family: 'Cinzel', serif;
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin: 0 0 0.4rem;
	}

	.ingredients-list,
	.detail-output {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.ingredient-row,
	.output-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.5rem;
		border-radius: 4px;
		background: var(--bg2);
		font-size: 0.85rem;
	}

	.ingredient-row.lacking {
		background: color-mix(in srgb, var(--danger) 12%, var(--bg2));
		border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
	}

	.ing-img {
		width: 24px;
		height: 24px;
		object-fit: contain;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.ing-name {
		flex: 1;
		color: var(--text);
	}

	.ing-qty {
		font-size: 0.78rem;
		color: var(--muted);
		white-space: nowrap;
	}

	.ingredient-row.lacking .ing-qty {
		color: var(--danger);
	}

	/* ── Craft button ── */
	.craft-btn {
		margin-top: auto;
		padding: 0.7rem 1rem;
		background: var(--accent);
		color: #0d0b08;
		border: none;
		border-radius: 6px;
		font-family: 'Cinzel', serif;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition:
			filter 0.15s,
			transform 0.1s;
	}

	.craft-btn:hover:not(:disabled) {
		filter: brightness(1.15);
		transform: translateY(-1px);
	}
	.craft-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.craft-btn:disabled {
		background: var(--bg3);
		color: var(--muted);
		cursor: not-allowed;
		border: 1px solid var(--border);
	}

	/* ── Empty state ── */
	.detail-empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: var(--muted);
		font-style: italic;
	}

	.detail-empty-icon {
		font-size: 2.5rem;
		opacity: 0.4;
	}

	/* ── Scrollbar ── */
	::-webkit-scrollbar {
		width: 4px;
	}
	::-webkit-scrollbar-track {
		background: var(--bg1);
	}
	::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 2px;
	}
</style>
