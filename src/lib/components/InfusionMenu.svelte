<script lang="ts">
	import { combatStore } from '$lib/stores/combatStore';
	import ElementTag from './ui/ElementTag.svelte'; // Import ElementTag
	import { elementColors, elementBgs } from '$lib/data/statDefinitions'; // Import elementColors

	$: playerElements = $combatStore.player?.elements || [];
	$: activeElement = $combatStore.player?.activeElement;

	function setInfusion(element: string) {
		combatStore.setPlayerActiveElement(element);
	}
</script>

<div class="infusion-menu">
	<span
		style:color={activeElement ? elementColors[activeElement.toLowerCase()] : 'initial'}
		style:background-color={activeElement ? elementBgs[activeElement.toLowerCase()] : 'initial'}
		>Infusion:</span
	>
	<div class="elements">
		{#each playerElements as element}
			{#if element !== 'none'}
				<button on:click={() => setInfusion(element)} class:active={activeElement === element}>
					<ElementTag {element} />
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.infusion-menu {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin: auto;
		/* background-color: var(--surface-3); */
		background-color: rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 6px;
	}

	span {
		border: 3px solid rgb(94, 94, 94);
		border-radius: 6px;
		padding: 4px 8px;
		border-color: hsla(0, 0%, 0%, 0.2);
		font-family: var(--font-family-pixel);
		box-shadow:
			black 2px 2px,
			black 1px -1px,
			black -1px 1px,
			black -1px -1px;
	}

	.elements {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}
	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		filter: saturate(0);
	}
	button.active {
		filter: saturate(1);
	}
</style>
