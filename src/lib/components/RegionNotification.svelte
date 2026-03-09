<script lang="ts">
	import { mapStore } from '$lib/stores/mapStore';
	import { fade } from 'svelte/transition';
	import ExploBubble from './ExploBubble.svelte';

	$: notification = $mapStore.regionNotification;
</script>

{#if notification && notification.visible && notification.regionName !== 'hidden'}
	<div class="region-notification-container" transition:fade>
		{#if notification.requirements && notification.requirements.length > 0}
		<h2 class="red">{notification.regionName}</h2>
			<div class="requirements">
				<span>Requires:</span>
				<div class="explo-bubbles">
					{#each notification.requirements as req}
						<ExploBubble name={req.name} level={req.level} />
					{/each}
				</div>
			</div>
		{:else}
		<h2>{notification.regionName}</h2>
		{/if}
	</div>
{/if}

<style>
	.region-notification-container {
		/* position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%); */
		background-color: rgba(0, 0, 0, 0);
		color: white;
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		text-align: center;
		z-index: 100;
		border: 1px solid var(--color-border);
		font-family: var(--font-family-pixel);
	}

	h2 {
		font-size: 1rem;
		margin: 0 0 0.5rem 0;
		/* width: 15ch; */
		text-wrap: nowrap;
	}
	/* .red {
		color: var(--color-secondary);
	} */

	.requirements {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		flex-direction: column;
	}

	.explo-bubbles {
		display: flex;
		gap: 0.5rem;
	}
</style>
