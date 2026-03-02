<script lang="ts">
	import ImageSlideshow from '$lib/components/ImageSlideshow.svelte';
	const images = [
		{ src: '/images/characters/nsfw/01.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/02.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/03.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/04.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/05.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/06.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/07.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/08.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/09.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/10.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/11.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/12.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/13.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/14.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/15.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/16.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/17.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/18.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/19.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/20.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/21.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/22.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/23.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/24.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/25.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/26.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/27.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/28.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/29.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/30.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/31.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/32.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/33.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/34.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/35.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/36.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/37.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/38.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/39.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/40.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/41.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/42.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/43.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/44.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/45.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/46.png', alt: 'Main Characters' }
	];
	let currentImageIndex = 0;

	function changeImage(direction: number) {
		if (!images) return;
		const newIndex = currentImageIndex + direction;
		if (newIndex >= 0 && newIndex < images.length) {
			currentImageIndex = newIndex;
		} else if (direction == -1 && currentImageIndex == 0) {
			currentImageIndex = images.length - 1;
		} else {
			currentImageIndex = 0;
		}
	}
</script>

<main>
	<div class="slideshow-container">
		{#if images && images.length > 0}
			<img
				src={images[currentImageIndex].src}
				alt={images[currentImageIndex].alt}
				class="main-image"
			/>

			<div class="slideshow-controls">
				<button on:click={() => changeImage(-1)}>⬅️</button>
				<!-- <span>{currentImageIndex + 1} / {images.length}</span> -->
				<button on:click={() => changeImage(1)}>➡️</button>
			</div>
		{:else}
			<p>No images available for this character.</p>
		{/if}
	</div>
</main>

<style>
	main {
		position: relative;
		width: 100%;
		height: 100%;
		image-rendering:smooth;
	}
	.slideshow-container {
		position: relative;
		text-align: center;
		margin-bottom: 2rem;
		height: 100%;
	}
	.main-image {
		position: relative;
		width: 100%;
		height: 100%;
		margin-bottom: 1rem;
		object-fit: contain;
	}
	.slideshow-controls {
		position: absolute;
		top: 50%;
		left: 2rem;
		right: 2rem;
		/* width: 100%; */
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	.slideshow-controls button {
		background: transparent;
		color: white;
		border: none;
		padding: 0;
		cursor: pointer;
		font-size: 3rem;
		margin: 0;
	}
	.slideshow-controls button:disabled {
		background: #333;
		cursor: not-allowed;
	}
</style>
