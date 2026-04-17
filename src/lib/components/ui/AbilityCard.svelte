<script lang="ts">
	/**
	 * AbilityCard — unified ability display component.
	 *
	 * mode="chip"   — Wraps AbilityTag with a popover on hover (desktop) / tap (mobile).
	 *                 Used in Arena, NPC viewer, Inventory, anywhere inline.
	 *
	 * mode="card"   — Full expanded card. Used in Glossary.
	 *
	 * AbilityTag is NOT imported here to avoid circular deps — chip mode renders
	 * its own mini version of the same visual. If you want to compose them,
	 * use AbilityTag directly alongside AbilityCard in the parent.
	 */
	import type { Ability } from '$lib/types';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import AbilityEffect from './AbilityEffect.svelte';

	export let ability: Ability;
	export let mode: 'chip' | 'card' = 'chip';
	/** For elemental damage colouring in chip mode */
	export let activeElement: string | undefined = undefined;
	/** Chip only — whether to show the popover at all */
	export let showPopover: boolean = true;

	// ── Colour logic (same as AbilityTag) ────────────────────────────────────
	function getColors(ab: Ability, el: string | undefined) {
		if (ab.abilityType === 'Elemental Damage' && el) {
			return {
				bg: elementBgs[el.toLowerCase()] ?? '#2a2a2a',
				color: elementColors[el.toLowerCase()] ?? '#eee'
			};
		}
		if (ab.abilityType === 'Physical Damage') {
			return { bg: elementBgs['physical'] ?? '#3a2a1a', color: elementColors['physical'] ?? '#e8c090' };
		}
		return { bg: '#2a2a3a', color: '#a0a0cc' };
	}
	$: colors = getColors(ability, activeElement);

	// ── Category badge colours ────────────────────────────────────────────────
	const categoryColors: Record<string, string> = {
		'Physical Damage': '#e8c090',
		'Elemental Damage': '#a0c8e0',
		'Special': '#a0a0cc',
	};
	$: categoryColor = categoryColors[ability.abilityType] ?? '#8e8c7f';

	// ── Popover state (chip mode) ─────────────────────────────────────────────
	let popoverOpen = false;
	let chipEl: HTMLElement;
	let popoverEl: HTMLElement;

	// Mobile tap to toggle, desktop hover
	function handleTap(e: MouseEvent | TouchEvent) {
		if (!showPopover) return;
		e.stopPropagation();
		popoverOpen = !popoverOpen;
	}

	function handleMouseEnter() {
		if (!showPopover) return;
		if (window.matchMedia('(hover: hover)').matches) popoverOpen = true;
	}
	function handleMouseLeave() {
		if (window.matchMedia('(hover: hover)').matches) popoverOpen = false;
	}

	// Close on outside tap (mobile)
	function handleOutsideClick(e: MouseEvent) {
		if (!popoverOpen) return;
		if (chipEl && !chipEl.contains(e.target as Node)) {
			popoverOpen = false;
		}
	}

	// Popover position — flip up if near bottom of viewport
	let popoverAbove = false;
	$: if (popoverOpen && chipEl) {
		const rect = chipEl.getBoundingClientRect();
		popoverAbove = rect.bottom + 240 > window.innerHeight;
	}

	// ── isPassive badge ───────────────────────────────────────────────────────
	$: isPassive = (ability as any).isPassive === true;
</script>

<svelte:window on:click={handleOutsideClick} />

{#if mode === 'chip'}
	<!-- ── CHIP MODE ── -->
	<div
		class="chip-wrap"
		bind:this={chipEl}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		on:click={handleTap}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && (popoverOpen = !popoverOpen)}
	>
		<div
			class="chip"
			style:--tag-bg={colors.bg}
			style:--tag-color={colors.color}
		>
			<div class="chip-icon">
				<img
					src={`/abilities/${ability.id}.png`}
					alt=""
					draggable="false"
					on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
				/>
			</div>
			<span class="chip-name">{ability.name}</span>
			{#if ability.accuracy !== undefined && ability.accuracy < 1}
				<span class="chip-acc">{Math.round(ability.accuracy * 100)}%</span>
			{/if}
			{#if isPassive}
				<span class="passive-pip">P</span>
			{/if}
			{#if showPopover}
				<span class="chip-caret" class:open={popoverOpen}>▾</span>
			{/if}
		</div>

		<!-- Popover -->
		{#if popoverOpen && showPopover}
			<div
				class="popover"
				class:above={popoverAbove}
				bind:this={popoverEl}
				role="tooltip"
			>
				<div class="pop-header">
					<span class="pop-name">{ability.name}</span>
					<span class="pop-type" style:color={categoryColor}>{ability.abilityType}</span>
				</div>
				{#if ability.accuracy !== undefined && ability.accuracy < 1}
					<div class="pop-accuracy">
						<span class="pop-acc-label">Accuracy</span>
						<span class="pop-acc-val">{Math.round(ability.accuracy * 100)}%</span>
					</div>
				{/if}
				<p class="pop-desc">{ability.description}</p>
				<div class="pop-effects">
					{#each ability.effects as effect}
						<AbilityEffect {effect} />
					{/each}
				</div>
				{#if isPassive}
					<div class="pop-passive-note">Passive — applied automatically</div>
				{/if}
			</div>
		{/if}
	</div>

{:else}
	<!-- ── CARD MODE (Glossary) ── -->
	<div
		class="card"
		style:--tag-bg={colors.bg}
		style:--tag-color={colors.color}
	>
		<div class="card-header">
			<div class="card-icon">
				<img
					src={`/abilities/${ability.id}.png`}
					alt=""
					draggable="false"
					on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
				/>
			</div>
			<div class="card-identity">
				<span class="card-name">{ability.name}</span>
				<div class="card-badges">
					<span class="card-type-badge" style:color={categoryColor}>{ability.abilityType}</span>
					{#if ability.accuracy !== undefined && ability.accuracy < 1}
						<span class="card-acc-badge">{Math.round(ability.accuracy * 100)}% acc</span>
					{/if}
					{#if isPassive}
						<span class="card-passive-badge">Passive</span>
					{/if}
				</div>
			</div>
		</div>

		<p class="card-desc">{ability.description}</p>

		<div class="card-effects">
			{#each ability.effects as effect}
				<AbilityEffect {effect} />
			{/each}
		</div>
	</div>
{/if}

<style>
	/* ── CHIP ── */
	.chip-wrap {
		position: relative;
		display: inline-block;
		cursor: pointer;
		outline: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px 4px 4px;
		border-radius: 5px;
		background-color: var(--tag-bg, #2a2a2a);
		color: var(--tag-color, #eee);
		font-family: var(--font-family-pixel, monospace);
		font-size: 1rem;
		line-height: 2rem;
		white-space: nowrap;
		user-select: none;
		transition: filter 0.15s ease;
		height: fit-content;
	}
	.chip-wrap:hover .chip,
	.chip-wrap:focus .chip {
		filter: brightness(1.15);
	}
	.chip-icon {
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
	.chip-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
	}
	.chip-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
	.chip-acc { font-size: 0.75rem; color: color-mix(in srgb, var(--tag-color, #eee) 70%, white); flex-shrink: 0; }
	.passive-pip {
		font-size: 0.6rem;
		font-weight: 700;
		background: rgba(109,158,90,0.25);
		color: #6d9e5a;
		border: 1px solid rgba(109,158,90,0.4);
		border-radius: 3px;
		padding: 1px 4px;
	}
	.chip-caret {
		font-size: 0.6rem;
		opacity: 0.4;
		transition: transform 0.15s;
		flex-shrink: 0;
	}
	.chip-caret.open { transform: rotate(180deg); opacity: 0.7; }

	/* ── POPOVER ── */
	.popover {
		position: absolute;
		left: 0;
		top: calc(100% + 4px);
		z-index: 9999;
		min-width: 240px;
		max-width: 300px;
		background: #1a1a24;
		border: 1px solid #3a3a4a;
		border-radius: 8px;
		padding: 10px 12px 12px;
		box-shadow: 0 8px 24px rgba(0,0,0,0.6);
		pointer-events: none; /* no interaction needed — info only */
	}
	/* On mobile we allow pointer events so it doesn't immediately close */
	@media (hover: none) {
		.popover { pointer-events: auto; }
	}
	.popover.above {
		top: auto;
		bottom: calc(100% + 4px);
	}
	.pop-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 4px;
	}
	.pop-name {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.9rem;
		color: var(--text-header, #eee);
		white-space: nowrap;
	}
	.pop-type {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.65rem;
		opacity: 0.8;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.pop-accuracy {
		display: flex;
		gap: 6px;
		align-items: center;
		margin-bottom: 4px;
	}
	.pop-acc-label {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.6rem;
		color: var(--text-muted, #888);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.pop-acc-val {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		color: #c9973a;
	}
	.pop-desc {
		font-size: 0.78rem;
		color: var(--text-muted, #888);
		line-height: 1.5;
		margin: 0 0 8px;
		font-style: italic;
	}
	.pop-effects {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-top: 1px solid rgba(255,255,255,0.06);
		padding-top: 6px;
	}
	.pop-passive-note {
		font-size: 0.65rem;
		color: #6d9e5a;
		font-style: italic;
		margin-top: 6px;
		opacity: 0.8;
	}

	/* ── CARD (Glossary) ── */
	.card {
		background: rgba(26,20,12,0.5);
		border: 1px solid #3d2810;
		border-top: 3px solid var(--tag-bg, #3a3a4a);
		border-radius: 6px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.card-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.card-icon {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 5px;
		background: color-mix(in srgb, var(--tag-bg, #2a2a2a) 60%, black);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.card-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
	}
	.card-identity {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.card-name {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.9rem;
		color: var(--text-header, #eee);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.card-badges {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		align-items: center;
	}
	.card-type-badge {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.6rem;
		opacity: 0.85;
	}
	.card-acc-badge {
		font-size: 0.6rem;
		font-family: var(--font-family-pixel, monospace);
		color: #c9973a;
		background: rgba(201,151,58,0.15);
		border-radius: 3px;
		padding: 1px 5px;
	}
	.card-passive-badge {
		font-size: 0.6rem;
		font-family: var(--font-family-pixel, monospace);
		color: #6d9e5a;
		background: rgba(109,158,90,0.15);
		border: 1px solid rgba(109,158,90,0.3);
		border-radius: 3px;
		padding: 1px 5px;
	}
	.card-desc {
		font-size: 0.78rem;
		color: var(--text-muted, #888);
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}
	.card-effects {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-top: 1px solid rgba(255,255,255,0.06);
		padding-top: 6px;
	}
</style>