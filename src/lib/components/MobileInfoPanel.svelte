<script lang="ts">
	import MessageLog from './MessageLog.svelte';
	import EventScreen from './EventScreen.svelte';
	import { eventScreenStore } from '$lib/stores/eventScreenStore';
	import { mobileInfoPanelView } from '$lib/stores/uiStore';
</script>

<div class="mobile-info-panel">
	{#if $mobileInfoPanelView === 'log'}
		<div class="log-view">
			<MessageLog />
		</div>
	{:else}
		<div class="event-view">
			<EventScreen image={$eventScreenStore.image} />
		</div>
	{/if}
</div>

<style>
	.mobile-info-panel {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #222;
	}

	.log-view,
	.event-view {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 5px;
		box-sizing: border-box;
	}
</style>
