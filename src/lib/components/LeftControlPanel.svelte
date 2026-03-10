<script lang="ts">
	import { showQuestTracker, showMessageBox, showEventScreen } from '$lib/stores/uiStore';
	import { settingsStore, setRenderScale } from '$lib/stores/settingsStore';
	import { rainEnabled } from '$lib/stores/weatherStore';
	import { goto } from '$app/navigation';
	import * as SaveLoadService from '$lib/services/SaveLoadService';

	function zoomIn() {
		const newScale = $settingsStore.renderScale + 1;
		setRenderScale(newScale);
	}

	function zoomOut() {
		const newScale = $settingsStore.renderScale - 1;
		setRenderScale(newScale);
	}

	function toggle(store) {
		store.update((value) => !value);
	}

	let views = ['save', 'zoom', 'toggles'];
	let currentIndex = 0;

	function nextView() {
		currentIndex = (currentIndex + 1) % views.length;
	}

	function prevView() {
		currentIndex = (currentIndex - 1 + views.length) % views.length;
	}
</script>

<div class="control-panel">
	<div class="button-group">
		<button class="icon-button" on:click={() => goto('/')} title="Home">
			<img class="rotate" src="/game_icons/medallion1.png" alt="Home" />
		</button>
		<button class="icon-button" on:click={() => goto('/map')} title="Map">
			<img src="/game_icons/map.png" alt="Map" />
		</button>
		<button class="icon-button" on:click={() => goto('/inventory')} title="Inventory">
			<img src="/game_icons/inventory.png" alt="Inventory" />
		</button>
		<button class="icon-button" on:click={() => goto('/homestead')} title="Homestead">
			<img src="/game_icons/homestead.png" alt="Homestead" />
		</button>
		<button class="icon-button" on:click={() => goto('/journal')} title="Journal">
			<img src="/game_icons/journal.png" alt="Journal" />
		</button>
	</div>

	<hr />

	<div class="toggle-group">
		<div class="switchers">
			<button on:click={prevView}><img src="/game_icons/arrow_left.png" alt="Previous" /></button>
			<button on:click={nextView}><img src="/game_icons/arrow_right.png" alt="Next" /></button>
		</div>
		{#if views[currentIndex] === 'save'}
			<button class="icon-button" on:click={SaveLoadService.saveGame} title="Save Game">
				<img src="/game_icons/save.png" alt="Save" />
			</button>
			<button class="icon-button" on:click={SaveLoadService.loadGame} title="Load Game">
				<img src="/game_icons/load.png" alt="Load" />
			</button>
			<button class="icon-button danger" on:click={SaveLoadService.clearSave} title="Delete Save">
				<img src="/game_icons/cancel.png" alt="Delete" />
			</button>
		{:else if views[currentIndex] === 'toggles'}
			<div class="toggle-group">
				<button
					class="icon-button"
					class:active={$showQuestTracker}
					on:click={() => toggle(showQuestTracker)}
					title="Quest Tracker"
				>
					<img src="/game_icons/quest.png" alt="Quest Tracker" />
				</button>

				<button
					class="icon-button"
					class:active={$showMessageBox}
					on:click={() => toggle(showMessageBox)}
					title="Messages"
				>
					<img src="/game_icons/message.png" alt="Messages" />
				</button>
				<button
					class="icon-button"
					class:active={$showEventScreen}
					on:click={() => toggle(showEventScreen)}
					title="Event Panel"
				>
					<img src="/game_icons/map.png" alt="Event Panel" />
				</button>
				<button
					class="icon-button"
					class:active={$rainEnabled}
					on:click={() => rainEnabled.set(!$rainEnabled)}
					title="Toggle Rain"
				>
					<img src="/game_icons/rain.png" alt="Toggle Rain" />
				</button>
			</div>
		{:else}
			<div class="zoom-group">
				<button class="icon-button" on:click={zoomIn} title="Zoom In">+</button>
				<button class="icon-button" on:click={zoomOut} title="Zoom Out">-</button>
				<button class="icon-button" on:click={() => goto('/settings')} title="Settings">
					<img src="/game_icons/settings.png" alt="Settings" />
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.control-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		/* height: 600px; */
		padding: 1rem 0.5rem;
		padding-bottom: 2rem;
		box-sizing: border-box;
		background-color: var(--surface-2);
		border-radius: 18px;
		box-sizing: border-box;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		box-sizing: border-box;
	}
	.button-group,
	.toggle-group,
	.zoom-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.switchers {
		display: flex;
		gap: 0;
		border-radius: 6px;
		overflow: hidden;
		button {
			border: none;
			font-size: 0.5rem;
			width: 100%;
			height: 30px;
			padding: 4px;
			background-color: var(--surface-2);
		}
		button:hover {
			background-color: var(--surface-1);
			color: wheat;
		}
	}
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 48px;
		cursor: pointer;
		font-size: 1.5rem;
		font-weight: 600;
		text-decoration: none;

		border: none;
		background-color: var(--surface-3);
		color: var(--text-header);
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 6px;
	}
	.icon-button:hover {
		background-color: #444;
		border-color: #777;
		.rotate {
			transform: rotate(-45deg);
		}
	}
	.icon-button img {
		width: 32px;
		height: 32px;
		display: block;
		transition: 0.1s transform ease-in;
	}

	hr {
		border: none;
		border-top: 3px solid rgba(0, 0, 0, 0.2);
		width: 50%;
	}
	/* Green for 'on' */
	.toggle-group .icon-button.active {
		background-color: var(--color-buff);
		/* border-color: #4caf50; */
	}
	/* Red for 'off' - applied to all toggle buttons by default */
	.toggle-group .icon-button {
		/* background-color: #6d2828; */
		/* border-color: #c53030; */
	}
</style>
