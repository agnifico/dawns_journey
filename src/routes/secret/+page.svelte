<script lang="ts">
	const url = '/images/characters/nsfw/';
	const range = 57;
	let currentImageIndex = 1;

	function changeImage(direction: number) {
		// if (!images) return;
		const newIndex = currentImageIndex + direction;
		if (newIndex >= 0 && newIndex <= range) {
			currentImageIndex = newIndex;
		} else if (direction == -1 && currentImageIndex == 0) {
			currentImageIndex = range;
		} else {
			currentImageIndex = 1;
		}
	}
</script>

<main>
	<div class="slideshow-container">
			<img
				src={url + currentImageIndex + '.png'}
				alt='NPCs'
				class="main-image"
			/>

			<div class="slideshow-controls">
				<button on:click={() => changeImage(-1)}>⬅️</button>
				<!-- <span>{currentImageIndex + 1} / {images.length}</span> -->
				<button on:click={() => changeImage(1)}>➡️</button>
			</div>
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
