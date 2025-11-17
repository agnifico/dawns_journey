<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import * as ItemService from '$lib/services/ItemService';
	import type { Item } from '$lib/types';
	import ItemBox from './ItemBox.svelte';
	import { getItemById } from '$lib/stores/itemStore';
	import Stat from './Stat.svelte';
    import { onMount, afterUpdate } from 'svelte';
    import ExploBubble from './ExploBubble.svelte';

	let currentTab: 'general' | 'weapons' | 'relics' | 'homestead' = 'general';
    let homesteadSubTab: 'farming' = 'farming';
	let activeItem: Item | null = null;
    let scrollContent: HTMLDivElement;
    let isScrollable = false;

	const isConsumable = (item: Item) =>
		item.type === 'general' && item.effects && item.effects.length > 0;
	const isEquippable = (item: Item) => item.type === 'weapon' || item.type === 'relic';

    const elementIcons = {
        Fire: '/images/fire.png',
        Water: '/images/water.png',
        Earth: '/images/earth.png',
        Wind: '/images/wind.png',
        Light: '/images/light.png',
        Dark: '/images/dark.png'
    };

	$: filteredInventory = $playerStore.inventory.filter((inventoryItem) => {
		const item = getItemById(inventoryItem.itemId);
		if (!item) return false;

        switch (currentTab) {
            case 'weapons':
                return item.type === 'weapon';
            case 'relics':
                return item.type === 'relic';
            case 'homestead':
                if (homesteadSubTab === 'farming') {
                    return item.flags?.includes('crop') || item.flags?.includes('seed');
                }
                return false;
            case 'general':
            default:
                return item.type === 'general' && !item.flags?.includes('crop') && !item.flags?.includes('seed');
        }
	});

    afterUpdate(() => {
        if (scrollContent) {
            isScrollable = scrollContent.scrollHeight > scrollContent.clientHeight;
        }
    });
</script>

<div class="inventory">
	<div class="top-section">
		<div class="row1">
			<div class="active-item-display">
				{#if activeItem}
					<ItemBox item={activeItem} viewSize="large" base="" />
				{:else}
					<div class="empty-active-item"></div>
				{/if}
			</div>

			<div class="item-details-panel">
				{#if activeItem}
                    <div class="item-header">
					    <h3>{activeItem.name}</h3>
                        {#if activeItem.element}
                            <img src={elementIcons[activeItem.element]} alt={activeItem.element} class="element-icon" />
                        {/if}
                    </div>
                    {#if activeItem.type === 'weapon' && activeItem.mastery}
                        <p class="mastery">Mastery: {activeItem.mastery}</p>
                    {/if}

					{#if activeItem.stats && activeItem.stats.length > 0}
						<div class="stats-grid">
							{#each activeItem.stats as stat}
								<div class="stat-line">
									<Stat statId={stat.name} value={stat.value} />
								</div>
							{/each}
						</div>
					{/if}
					{#if activeItem.effects && activeItem.effects.length > 0}
						<p class="effects-label">Effects:</p>
						<ul class="effects-list">
							{#each activeItem.effects as effect}
								<li>
									{#if effect.hp}HP: {effect.hp}{/if}
									{#if effect.auraShield}Aura Shield: {effect.auraShield}{/if}
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		</div>
		<div class="row2">
			<div class="lower-details-box">
				{#if activeItem}
                    <div class="scroll-content" bind:this={scrollContent}>
					    <p class="description">{activeItem.description}</p>
                        {#if activeItem.exploration}
                            <div class="exploration">
                                {#each activeItem.exploration as effect}
                                    <ExploBubble name={effect.name} level={effect.level} />
                                {/each}
                            </div>
                        {/if}
                    </div>
					<div class="buttons">
						{#if isConsumable(activeItem)}
							<button
								class="action-button pixel-art-button"
								on:click={() => ItemService.useItem(activeItem.id)}>Use</button
							>
						{/if}
						{#if isEquippable(activeItem)}
							<button
								class="action-button pixel-art-button"
								on:click={() => ItemService.equipItem(activeItem.id)}>Equip</button
							>
						{/if}
					</div>
                    {#if isScrollable}
                        <div class="scroll-indicator">
                            <img src="/game_icons/down.png" alt="Scroll down" />
                        </div>
                    {/if}
				{:else}
					<p>Select an item to see details.</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="tabs">
		<button on:click={() => (currentTab = 'general')} class:active={currentTab === 'general'}
			>General</button
		>
		<button on:click={() => (currentTab = 'weapons')} class:active={currentTab === 'weapons'}
			>Weapons</button
		>
		<button on:click={() => (currentTab = 'relics')} class:active={currentTab === 'relics'}
			>Relics</button
		>
        <button on:click={() => (currentTab = 'homestead')} class:active={currentTab === 'homestead'}
			>Homestead</button
		>
	</div>

    {#if currentTab === 'homestead'}
    <div class="sub-tabs">
        <button on:click={() => (homesteadSubTab = 'farming')} class:active={homesteadSubTab === 'farming'}>Farming</button>
    </div>
    {/if}

	<div class="grid-wrapper">
		<div class="item-grid">
		{#each filteredInventory as inventoryItem (inventoryItem.itemId)}
			{@const item = getItemById(inventoryItem.itemId)}
			{#if item}
				<div class="grid-item" on:click={() => (activeItem = item)}>
					<ItemBox item={{ ...item, amount: inventoryItem.amount }} viewSize="small" base="" />
				</div>
			{/if}
		{/each}
	</div>
</div>
</div>
<style>
	.inventory {
		display: flex;
		flex-direction: column;
		border: 1px solid #444;
		padding: 1em;
		width: 360px;
		height: 100%; /* Fill parent container */
		box-sizing: border-box;
		margin-inline: auto;
	}

	.top-section {
		display: flex;
		flex-direction: column;
		flex-shrink: 0; /* Prevent top section from shrinking */
	}

	.row1,
	.row2 {
		display: flex;
	}

	.active-item-display {
		margin: 8px;
		width: 120px;
		height: 120px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #4d2a26;
		box-sizing: border-box;
		box-shadow:
			0px 4px #8e5e58,
			0px -4px #8e5e58,
			-4px 0px #8e5e58,
			4px 0px #8e5e58,
			-4px 8px #6d403b,
			4px 8px #6d403b,
			4px -8px #6d403b,
			-4px -8px #6d403b,
			-8px 4px #6d403b,
			-8px -4px #6d403b,
			8px 4px #6d403b,
			8px -4px #6d403b,
			0px 4px #3f1f1c inset;
		padding: 0;
	}

	.item-details-panel {
		flex-grow: 1;
		width: 212px;
		height: 120px;
		background-color: #e5b67f;
		color: #614b3b;
		padding: 0.5em;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-left: 8px;
		box-shadow:
			4px 4px #c7895d inset,
			-4px -4px #c7895d inset;
	}

    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .element-icon {
        width: 24px;
        height: 24px;
    }

	.item-details-panel h3 {
		margin-top: 0;
		margin-bottom: 0.5em;
		color: #634041;
		font-family: 'Silkscreen';
		font-size: 1em;
		font-weight: 400;
	}

	.item-details-panel p.description {
		font-size: 0.8em;
		color: #aaa;
		flex-grow: 1;
	}

	.item-details-panel .stats-grid {
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.2em 1em;
		font-size: 0.75em;
		color: #eee;
	}

	.lower-details-box {
        position: relative;
		box-shadow:
			4px 4px #c7895d inset,
			-4px -4px #c7895d inset;
		font-family: 'DePixel';
		font-size: 0.75rem;
		color: #634041;
		flex-grow: 1;
		height: 80px;
		background-color: #e5b67f;
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		text-align: left;
		padding: 8px;
		gap: 0.5rem;

		p {
			margin-bottom: auto;
		}
	}

    .scroll-content {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 30px; /* Space for the buttons */
        scrollbar-width: none;
    }

    .scroll-content::-webkit-scrollbar {
        display: none;
    }

	.buttons {
        position: absolute;
        bottom: 8px;
        right: 8px;
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
        0%, 20%, 50%, 80%, 100% {
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
		margin-block: 1em;
		flex-shrink: 0; /* Prevent tabs from shrinking */
	}

	.tabs button {
		box-sizing: border-box;
		background: #e5b67f;
		color: #6d403b;
		border: 3px solid transparent;
		padding: 0.5em 1em;
		cursor: pointer;
		flex-grow: 1;
	}

	.tabs button.active {
		background: #c7895d;
		border-top: 3px solid #6d403b;
	}

    .sub-tabs {
        display: flex;
        margin-bottom: 1em;
        flex-shrink: 0;
    }

    .sub-tabs button {
        background: #a1887f;
        color: #e0e0e0;
        border: 1px solid #5d4037;
        padding: 0.3em 0.8em;
        cursor: pointer;
    }

    .sub-tabs button.active {
        background: #795548;
        color: white;
    }

	.grid-wrapper {
		overflow-y: auto;
		flex-grow: 1;
		min-height: 0;
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 40px);
		gap: 10px;
		justify-content: flex-start;
	}

	.grid-item {
		width: 40px;
		height: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		background-color: #e5b67f;
		border: 2px solid #6d403b;
		box-shadow:
			inset 0 0 0 2px #c7895d;

		display: inline-block;
	}

	.grid-item:hover {
		border-color: #eee;
	}

	.grid-item .item-name {
		font-size: 0.7em;
		color: white;
		text-align: center;
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.action-button {
		padding: 0.3em 0.6em;
		font-size: 0.8em;
		line-height: 1;
		white-space: nowrap;
	}
</style>