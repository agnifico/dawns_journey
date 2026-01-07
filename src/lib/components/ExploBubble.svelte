<script lang="ts">
	export let name: string;
	export let level: number | undefined = undefined; // Make level optional
	export let hotkey: string | undefined = undefined;
</script>

<div class="explo-bubble {name.toLowerCase()}">
	<span class="name">{name} Exploration</span>
	{#if level !== undefined}
		<span class="level {name.toLowerCase()}">{level}</span>
	{/if}
	{#if hotkey}
		<span class="hotkey">({hotkey.toUpperCase()})</span>
	{/if}
</div>

<style>
	.explo-bubble {
		display: inline-flex;
		align-items: center;
		border-radius: 4px;
		/* padding: 2px 0px 0 4px; */
		font-size: 0.75em;
		color: white;
		margin-right: 8px;
		margin-bottom: 4px;
		border: 4px solid white;
		width: 22ch;
		padding-left: 4px;
		justify-content: space-between;
		box-shadow:
			black 2px 2px,
            black 1px -1px,
            black -1px 1px,
			black -1px -1px;
	}

	.fire {
		background-color: #cc4113;
		border-color: hsla(0, 0%, 0%, 0.2);
		color: #ffffff;
	}

	.water {
		background-color: #276b9f;
		border-color: hsla(0, 0%, 0%, 0.2);
	}

	.earth {
		background-color: #2d7645;
		border-color: hsla(0, 0%, 0%, 0.2);
	}

	.wind {
		background-color: #4bc7e3;
		border-color: hsla(0, 0%, 0%, 0.2);
		color: hsl(0, 0%, 17%);
	}

	.light {
		background-color: #f0e68c;
		border-color: hsla(0, 0%, 0%, 0.2);
		color: #111;
	}

	.dark {
		background-color: #452e6f;
		border-color: #a9a9a9;
		color: #f8a6d4;
		border-color: hsla(0, 0%, 0%, 0.2);
	}

	.name {
		margin-right: 4px;
        font-family: var(--font-family-pixel);
        font-size: .75rem;
	}

	.level {
		background-color: hsla(0, 0%, 0%, 0.2);
		/* border-radius: 50%; */
		/* width: 20px; */
		/* height: 20px; */
        padding: 3px 0 3px 6px;
		display: flex;
		justify-content: center;
		align-items: center;
		/* font-weight: bold; */
        font-family: var(--font-family-pixel);
        font-size: .75rem;
	}

	.hotkey {
		margin-left: 4px;
		font-weight: bold;
	}
</style>
