<script lang="ts">
	import ElementTag from './ElementTag.svelte';

	export let mastery: number;
	export let elements: string[];
	export let size = 'full';
</script>

<div class="mastery-display">
	<div class="mastery-section">
		<img src="/game_icons/mastery.png" alt="Mastery" class="mastery-icon" />
		Weapon Mastery
		<span class="mastery-value">{mastery}</span>
	</div>
	{#if size === 'full'}
		<div class="elements-section">
			{#each elements as element}
				<ElementTag {element} {size} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.mastery-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: var(--surface-3);
		padding: 0.5rem 1rem;
		border-radius: 12px;
		width: fit-content;
		box-shadow: #00000056 0 -3px 0 3px inset;
		border-top: 3px solid #00000056;
		height: fit-content;
		justify-content: space-between;
	}

	.mastery-section,
	.elements-section {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		/* width: 11ch; */
	}

	.mastery-icon {
		width: 32px;
		height: 32px;
		margin: auto;
		padding-bottom: 6px;
	}

	.mastery-value {
		font-weight: bold;
		color: var(--text-header);
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		margin: 0 0 0 auto;
	}
</style>
