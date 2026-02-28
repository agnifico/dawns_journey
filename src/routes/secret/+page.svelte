<script lang="ts">
	import ImageSlideshow from '$lib/components/ImageSlideshow.svelte';
	const images = [
		{ src: '/images/characters/nsfw/File-01.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-00.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-02.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-03.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-04.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-05.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-06.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-07.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-08.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-09.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-10.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-11.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-12.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-13.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-14.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-15.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-16.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-17.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-18.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-19.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-20.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-21.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-22.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-23.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-24.png', alt: 'Main Characters' },
		{ src: '/images/characters/nsfw/File-25.png', alt: 'Main Characters' }
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
				<button on:click={() => changeImage(-1)}>Previous</button>
				<!-- <span>{currentImageIndex + 1} / {images.length}</span> -->
				<button on:click={() => changeImage(1)}>Next</button>
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
        right: 2rem;
		display: flex;
        flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}
	.slideshow-controls button {
		background: #333;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}
	.slideshow-controls button:disabled {
		background: #333;
		cursor: not-allowed;
	}
</style>
