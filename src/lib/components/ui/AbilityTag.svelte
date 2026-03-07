<script lang="ts">
	import type { Ability } from '$lib/types';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';

	export let ability: Ability;
	/** The player's active element — used to colour Elemental Damage abilities. */
	export let activeElement: string | undefined = undefined;
	/** If true, renders as a clickable button; if false, purely decorative. */
	export let interactive: boolean = false;
	/** Callback fired when clicked (only relevant when interactive=true). */
	export let onClick: (() => void) | undefined = undefined;
	/** Disabled state — dims the tag and blocks clicks. */
	export let disabled: boolean = false;

	function getColors(
		ability: Ability,
		activeElement: string | undefined
	): { bg: string; color: string } {
		if (ability.abilityType === 'Elemental Damage' && activeElement) {
			return {
				bg: elementBgs[activeElement.toLowerCase()] ?? '#2a2a2a',
				color: elementColors[activeElement.toLowerCase()] ?? '#eee'
			};
		}
		if (ability.abilityType === 'Physical Damage') {
			return {
				bg: elementBgs['physical'] ?? '#3a2a1a',
				color: elementColors['physical'] ?? '#e8c090'
			};
		}
		// Special
		return { bg: '#2a2a3a', color: '#a0a0cc' };
	}

	$: colors = getColors(ability, activeElement);

	function handleClick() {
		if (!disabled && onClick) onClick();
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="ability-tag"
	class:interactive
	class:disabled
	role={interactive ? 'button' : undefined}
	tabindex={interactive && !disabled ? 0 : undefined}
	style:--tag-bg={colors.bg}
	style:--tag-color={colors.color}
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	title={ability.description}
>
	<div class="ability-icon">
		<img
			src={`/abilities/${ability.id}.png`}
			alt={ability.name}
			draggable="false"
			on:error={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = 'none';
			}}
		/>
	</div>
	<span class="ability-name">{ability.name}</span>
	{#if ability.accuracy !== undefined && ability.accuracy < 1}
		<span class="accuracy-badge">{Math.round(ability.accuracy * 100)}%</span>
	{/if}
</div>

<style>
	.ability-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px 4px 4px;
		border-radius: 5px;
		background-color: #00000080;
		background-color: var(--tag-bg, #2a2a2a);
		color: var(--tag-color, #eee);
		/* border: 2px solid color-mix(in srgb, var(--tag-color, #eee)Z 30%, transparent); */
		/* box-shadow: inset 0 -2px 0 color-mix(in srgb, black 40%, transparent); */
		font-family: monospace;
		font-family: var(--font-family-pixel);
		font-weight: 400;
		font-size: 1rem;
		line-height: 2rem;
		white-space: nowrap;
		user-select: none;
		transition:
			filter 0.15s ease,
			transform 0.1s ease,
			box-shadow 0.1s ease,
			font-weight 0.05s ease;
		height: fit-content;
	}

	/* Clickable variant */
	.ability-tag.interactive {
		cursor: pointer;
		width: 100%;
		box-sizing: border-box;
	}
	.ability-tag.interactive:hover:not(.disabled) {
		filter: brightness(1.2);
		transform: translateY(-2px);
		/* color: var(--color-accent); */
		/* box-shadow:
			inset 0 -2px 0 color-mix(in srgb, black 40%, transparent),
			0 3px 8px color-mix(in srgb, var(--tag-color, #eee) 25%, transparent); */
		/* font-weight: bold; */
	}
	.ability-tag.interactive:active:not(.disabled) {
		transform: translateY(1px);
		box-shadow: inset 0 1px 0 color-mix(in srgb, black 50%, transparent);
	}

	/* Disabled */
	.ability-tag.disabled {
		filter: saturate(0.2) brightness(0.6);
		cursor: not-allowed;
	}

	/* Icon */
	.ability-icon {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, black 80%, transparent);
		border-radius: 3px;
		overflow: hidden;
	}
	.ability-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
	}

	/* Name */
	.ability-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Accuracy badge — shown only when < 100% */
	.accuracy-badge {
		font-size: 0.75rem;
		border-radius: 3px;
		/* border: 2px solid color-mix(in srgb, black 40%, transparent); */
		color: color-mix(in srgb, var(--tag-color, #eee) 70%, white);
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
