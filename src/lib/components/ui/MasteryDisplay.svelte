<script lang="ts">
	import ElementTag from './ElementTag.svelte';

	export let mastery: number;
	export let elements: string[];
</script>

<div class="mastery-display">
	<div class="mastery-section">
		<img src="/game_icons/mastery.png" alt="Mastery" class="mastery-icon" />
		Weapon Mastery
	</div>
	<div class="elements-section">
		{#each elements as element}
			<ElementTag {element} />
		{/each}
	</div>
	<span class="mastery-value">{mastery}</span>
</div>

<style>
	.mastery-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: var(--surface-3);
		padding: 0.2rem 1rem .5rem;
		border-radius: 12px;
		width: fit-content;
        box-shadow: #00000056 0 -3px 0 3px inset;
		border-top: 3px solid #00000056;

	}

	.mastery-section,
	.elements-section {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-family: var(--font-family-pixel);
		font-size: .75rem;
	}

	.mastery-icon {
		width: 32px;
		height: 32px;
	}

	.mastery-value {
		font-weight: bold;
		color: var(--text-header);
		font-family: var(--font-family-pixel);
        font-size: 1rem;
        margin: 0 0 0 auto;
	}
</style>
