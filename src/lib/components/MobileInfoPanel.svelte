<script lang="ts">
    import { eventScreen } from '$lib/stores/uiStore';
    import EventScreen from '$lib/components/EventScreen.svelte';
    import MessageLog from '$lib/components/MessageLog.svelte';
    import { mobileInfoPanelView } from '$lib/stores/uiStore';
</script>

<div class="mobile-info-panel">
    {#if $mobileInfoPanelView === 'log'}
        <MessageLog />
    {:else}
        <EventScreen image={$eventScreen.image} />
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
