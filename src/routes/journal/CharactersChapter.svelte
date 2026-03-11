<script lang="ts">
	import { npcStore } from '$lib/stores/npcStore';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let npcList: any[] = [];

	onMount(async () => {
		if (Object.keys(get(npcStore).globalNpcs).length === 0) {
			await npcStore.initializeGlobalNpcs();
		}
	});

	$: npcList = Object.values($npcStore.globalNpcs);

	function getCardImage(npc: any): string {
		const zeroImage = npc.galleryImages?.find((img: string) => img.endsWith('0.png'));
		return zeroImage || npc.image;
	}

	// Selected character for side-panel preview (optional UX enhancement)
	let hoveredId: string | null = null;
</script>

<div class="chars-wrap">
	<div class="chars-header">
		<p class="chars-eyebrow">Dawn's Journey</p>
		<h2 class="chars-title">Characters</h2>
		<p class="chars-sub">The remarkable inhabitants of Ashenfall.</p>
		<div class="rule"></div>
	</div>

	{#if npcList.length === 0}
		<div class="empty-state">
			<span class="empty-icon">👤</span>
			<p>No characters discovered yet.<br />Explore Ashenfall to meet its inhabitants.</p>
		</div>
	{:else}
		<div class="card-gallery">
			{#each npcList as npc (npc.id)}
				<button
					class="char-card"
					class:hovered={hoveredId === npc.id}
					style="background-image: url({getCardImage(npc)})"
					on:click={() => goto(`/journal/character/${npc.id}`)}
					on:mouseenter={() => (hoveredId = npc.id)}
					on:mouseleave={() => (hoveredId = null)}
					aria-label={npc.name}
				>
					<!-- Gradient overlay always visible at bottom -->
					<div class="card-gradient"></div>

					<!-- Name + elements -->
					<div class="card-footer">
						<span class="char-name">{npc.name}</span>
						<div class="element-tags">
							{#each npc.types || [] as element}
								<ElementTag {element} />
							{/each}
						</div>
					</div>

					<!-- Gold border shimmer on hover -->
					<div class="card-border-overlay"></div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.chars-wrap {
		max-width: 900px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.chars-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.chars-eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.chars-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.chars-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Empty state ── */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #3d2810;
	}

	.empty-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 1rem;
		opacity: 0.3;
	}

	.empty-state p {
		font-size: 0.75rem;
		font-style: italic;
		line-height: 1.6;
	}

	/* ── Gallery grid ── */
	.card-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 1rem;
	}

	/* ── Character card ── */
	.char-card {
		position: relative;
		aspect-ratio: 3 / 4;
		border-radius: 12px;
		border: 3px solid #3d2810;
		box-shadow:
			#00000056 0 -5px 0 0px inset,
			0 4px 16px rgba(0, 0, 0, 0.6);
		background-size: cover;
		background-position: center top;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			border-color 0.2s ease;
		image-rendering: auto;
	}

	.char-card:hover,
	.char-card.hovered {
		transform: translateY(-4px) scale(1.02);
		box-shadow:
			#00000056 0 -5px 0 0px inset,
			0 12px 32px rgba(0, 0, 0, 0.8),
			0 0 0 1px rgba(201, 151, 58, 0.4);
		border-color: #7a5020;
	}

	.char-card:active {
		transform: translateY(0) scale(0.99);
	}

	/* Bottom gradient */
	.card-gradient {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 55%;
		background: linear-gradient(to top, rgba(10, 6, 2, 0.95) 0%, rgba(10, 6, 2, 0.5) 60%, transparent 100%);
		pointer-events: none;
	}

	/* Card footer: name + elements */
	.card-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.5rem 0.6rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.char-name {
		font-size: 0.6rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #e8d4a8;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
		line-height: 1.2;
	}

	.element-tags {
		display: flex;
		justify-content: flex-start;
		gap: 0.2rem;
		flex-wrap: wrap;
	}

	/* Subtle gold border shimmer on hover */
	.card-border-overlay {
		position: absolute;
		inset: 0;
		border-radius: 9px;
		border: 1px solid transparent;
		transition: border-color 0.2s;
		pointer-events: none;
	}

	.char-card:hover .card-border-overlay {
		border-color: rgba(201, 151, 58, 0.2);
	}

	@media (max-width: 500px) {
		.card-gallery {
			grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
			gap: 0.6rem;
		}
	}
</style>