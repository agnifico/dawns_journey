<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Notification from '$lib/components/Notification.svelte';
	import GiftModal from '$lib/components/ui/GiftModal.svelte';
	import GenericModal from '$lib/components/ui/GenericModal.svelte';
	import AchievementNotification from '$lib/components/AchievementNotification.svelte';
	// import RainOverlay from '$lib/components/ui/RainOverlay.svelte';
	import './app.css';
	import '$lib/styles/theme.css';
	import favicon from '$lib/assets/favicon.svg';
	import { phase } from '$lib/stores/timeStore';
	import { messageStore } from '$lib/stores/messageStore';
	import { skillTreeStore } from '$lib/stores/skillTreeStore'; // Import skillTreeStore
	import { onMount } from 'svelte';
	// import LeftControlPanel from '$lib/components/LeftControlPanel.svelte';
	// import { playerStore } from '$lib/stores/playerStore';

	let { children } = $props();

	let initial = true;
	$effect(() => {
		const tod = $phase;
		if (!initial) {
			messageStore.addMessage(`It is now ${tod}.`, ['System']);
		}
		initial = false;
	});

	onMount(async () => {
		await skillTreeStore.initialize(); // Initialize the skill tree
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Dawn's Journey : A serverless browser based game</title>
</svelte:head>

<Navbar />

<div class="page-content">
	{@render children?.()}
	<!-- {#if $playerStore.isInitialized}
		<div class="lcp-wr">
			<LeftControlPanel />
		</div>
	{/if} -->
</div>

<!-- <Notification /> -->
<GiftModal />
<GenericModal />
<AchievementNotification />

<!-- <RainOverlay /> -->

<style>
	.page-content {
		position: relative;
		height: 100%;
		height: 100%;
		padding-top: 50px;
		box-sizing: border-box;
	}

	.lcp-wr {
		position: absolute;
		top: 0%;
		bottom: 0%;
		display: flex;
		align-items: center;
		padding-left: 1rem;
	}
</style>
