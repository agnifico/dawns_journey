<script lang="ts">
	export let element: string;
	export let size = 'full';
</script>

<div class="element-tag" title={element} class:full={size==='full'}>
	<img src={`/images/${element.toLowerCase()}.png`} alt={element} class="element-icon" />
	{#if size !== 'mini'}
		<span class="element-name {element.toLowerCase()}">{element.toUpperCase()}</span>
	{/if}
</div>

<style>
	.element-tag {
		width: fit-content;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		color: var(--color-text-muted);
		background-color: hsla(0, 0%, 0%, 0.25);
		padding: 4px;
		flex-direction: row;
	}
    .full {
		flex-direction: column;
		background-color: var(--black);
		border: 2px solid rgba(0, 0, 0, 0.5);
        padding: 0.2rem 0.25em 0.2rem 0.25rem;
    }
	.element-icon {
		width: 20px;
		height: 20px;
	}
	.element-name {
		/* font-weight: bold; */
		margin-bottom: 0;
		margin-top: auto;
	}

	.fire {
		color: #cc4113;
	}

	.water {
		color: #276b9f;
	}

	.earth {
		color: #2db55a;
	}

	.wind {
		color: #47ddff;
	}

	.light {
		color: #f0e68c;
	}

	.dark {
		color: #f8a6d4;
	}
</style>
