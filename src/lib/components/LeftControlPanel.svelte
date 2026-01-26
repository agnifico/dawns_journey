<script lang="ts">
	import { showQuestTracker, showHomesteadTracker, showMessageBox } from '$lib/stores/uiStore';
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

	let view: 'save' | 'zoom' | 'toggles';
	view = 'save';
</script>

<div class="control-panel">
	<div class="button-group">
		<button class="icon-button" on:click={() => goto('/map')}>
			<img src="/game_icons/map.png" alt="Map" />
		</button>
		<button class="icon-button" on:click={() => goto('/inventory')}>
			<img src="/game_icons/backpack.png" alt="Backpack" />
		</button>
		<button class="icon-button" on:click={() => goto('/homestead')}>
			<img src="/game_icons/homestead.png" alt="Homestead" />
		</button>
		<button class="icon-button" on:click={() => goto('/journal')} title="Journal">
            <img src="/game_icons/journal.png" alt="Journal" />
        </button>
	</div>

	<hr />

	<div class="toggle-group">
		<div class="switchers">

			<button on:click={() => (view = 'zoom')} class:active={view === 'zoom'}>Z</button>
			<button on:click={() => (view = 'save')} class:active={view === 'save'}>S</button>
			<button on:click={() => (view = 'toggles')} class:active={view === 'toggles'}>T</button>
		</div>
		{#if view === 'save'}
			<button class="icon-button" on:click={SaveLoadService.saveGame} title="Save Game">
				<img src="/game_icons/save.png" alt="Save" />
			</button>
			<button class="icon-button" on:click={SaveLoadService.loadGame} title="Load Game">
				<img src="/game_icons/load.png" alt="Load" />
			</button>
			<button class="icon-button danger" on:click={SaveLoadService.clearSave} title="Delete Save">
				<img src="/game_icons/cancel.png" alt="Delete" />
			</button>
		{:else if view === 'toggles'}
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
					class:active={$showHomesteadTracker}
					on:click={() => toggle(showHomesteadTracker)}
					title="Homestead Tracker"
				>
					<img src="/game_icons/homestead.png" alt="Homestead Tracker" />
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
		background-color: var(--color-surface-2);
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
		button {
			border: none;
			font-size: .5rem;
			width: 100%;
			height: 30px;
		}
		button.active {
			background-color: green;
			color: wheat;
		}
	}
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 46px;
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
	}
	.icon-button img {
		width: 20px;
		height: 20px;
		display: block;
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
