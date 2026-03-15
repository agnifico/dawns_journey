<script lang="ts">
	import ExploBubble_OLD from './ExploBubble_OLD.svelte';
	import ExploBubble from '$lib/components/ExploBubble.svelte';

	const total = 3;
	const elements = ['Fire', 'Water', 'Wind', 'Earth', 'Dark', 'Light'];
</script>

<main>
	{#each { length: total } as _, i}
		<button class="style{i + 1}">
			Style : {i + 1}
		</button>
		{#if i === 2}
			<div class="separator"></div>
		{/if}
	{/each}
	{#each elements as element}
		<ExploBubble_OLD name={element} level="13" />
	{/each}
	<div class="separator"></div>
	{#each elements as element}
		<ExploBubble name={element} level="13" />
	{/each}
</main>

<style>
	main {
		background-color: #ccddd2;
		height: 100%;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		position: relative;
	}
	button {
		font-family: var(--font-family-pixel);
		font-size: 1.8rem;
	}
	.separator {
		display: block;
		min-width: 50%;
		height: 1px;
		margin: 0;
		background-color: #313131;
	}

	.style1 {
		background-color: var(--color-accent);
		border: 3px solid #313131;
		color: var(--color-secondary);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		padding-bottom: 0.75rem;
		font-family: var(--font-family-pixel);
		border-radius: 0.5rem;
		box-shadow: #313131 0 -6px 0 0px inset;
		width: fit-content;
		transition: 0.1s all ease-in;
		&:hover {
			padding-bottom: 0.5rem;
			transform: translateY(0.25rem);
			box-shadow: #313131 0 -6px 0px -4px inset;
			filter: brightness(1.3) contrast(1.2);
		}
	}

	.style2 {
		background-color: var(--color-accent);
		border: 4px solid #313131;
		color: var(--color-secondary);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		padding-bottom: 0.75rem;
		font-family: var(--font-family-pixel);
		border-radius: 0.5rem;
		box-shadow: #00000056 0 -8px 0 0px inset;
		width: fit-content;
		transition: 0.1s all ease-in;
		&:hover {
			filter: brightness(1.3) contrast(1.2);
			/* padding-bottom: 0.5rem; */
			/* transform: translateY(0.25rem); */
			box-shadow: #00000056 0 -8px 0px -4px inset;
		}
	}

	.style3 {
		box-sizing: border-box;
		/* flex-grow: 1;/ */
		padding: 1rem;
		color: #e9d9ca;
		background-color: #435e52;
		border-radius: 18px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		transition: 0.1s all ease-in;
		&:hover {
			transform: translateY(2px);
			filter: brightness(1.3) contrast(1.2);
			box-shadow: #00000056 0 -6px 0px -4px inset;
			/* background-color: var(--color-accent); */
		}
	}
</style>
