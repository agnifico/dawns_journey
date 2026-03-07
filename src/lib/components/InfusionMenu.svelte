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

<div
	class="infusion-menu"
	style:color={activeElement ? elementColors[activeElement.toLowerCase()] : 'initial'}
	style:background-color={activeElement ? elementBgs[activeElement.toLowerCase()] : 'initial'}
>
	<div class="labels">
		<span>Elemental Infusion:</span>
		<p>{activeElement}</p>
	</div>
	<div class="elements">
		{#each playerElements as element}
			{#if element !== 'none'}
				<button on:click={() => setInfusion(element)} class:active={activeElement === element}>
					<ElementTag {element} size="mini" />
				</button>
			{/if}
		{/each}
	</div>
</div>

<style>
	.infusion-menu {
		display: flex;
		/* flex-direction: column; */
		align-items: center;
		gap: 0.5rem;
		/* margin: auto; */
		/* background-color: var(--surface-3); */
		/* background-color: transparent; */
		padding: .25rem .25rem .5rem;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		border-radius: 6px;
		transition: .1s all ease-in;
		background-color: #00000056;
	}
	.labels {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		/* border: 1px solid black; */
	}

	span {
		/* border: 3px solid rgb(94, 94, 94); */
		/* border-radius: 6px; */
		padding: 4px;
		/* border-color: hsla(0, 0%, 0%, 0.2); */
		font-family: var(--font-family-pixel);
		font-size: .75rem;
		margin: 0;
		width: 15ch;
		/* box-shadow:
		black 2px 2px,
		black 1px -1px,
		black -1px 1px,
		black -1px -1px; */
	}
	p {
		font-family: var(--font-family-pixel);
		font-size: .75rem;
		text-align: center;
		line-height: .5rem;
		margin: 0;
		padding: 0;
	}
	
	.elements {
		display: flex;
		width: 100%;
		justify-content: space-around;
		gap: 0.5rem;
	}
	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		filter: saturate(0);
		border-radius: 6px;
	}
	button.active {
		filter: saturate(1);
		border: 1px solid rgba(0, 0, 0, 0.666);
	}
</style>
