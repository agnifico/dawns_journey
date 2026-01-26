<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let images = [];
  let currentIndex = 0;
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
    }, 5000); // Change image every 5 seconds
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="slideshow-container">
  {#each images as image, i}
    <div class="slide" style="background-image: url({image.src})" class:active={i === currentIndex}>
    </div>
  {/each}
</div>

<style>
  .slideshow-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .slide {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1s ease-in-out;
    animation: kenburns 20s infinite;
  }

  .slide.active {
    opacity: 1;
  }

  @keyframes kenburns {
    0% {
      transform: scale(1) translate(0, 0);
    }
    50% {
      transform: scale(1.2) translate(5%, 5%);
    }
    100% {
      transform: scale(1) translate(0, 0);
    }
  }
</style>
