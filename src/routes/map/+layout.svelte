<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { hideNavbar } from '$lib/stores/uiStore';

	let { children } = $props();

	let mq: MediaQueryList | null = null;

	function apply(e: { matches: boolean } | MediaQueryList) {
		// Desktop (min-width: 769px) → hide navbar.
		// Mobile → show the navbar at the top.
		hideNavbar.set(e.matches);
	}

	onMount(() => {
		mq = window.matchMedia('(min-width: 769px)');
		apply(mq);
		mq.addEventListener('change', apply);
	});

	onDestroy(() => {
		hideNavbar.set(false);
		mq?.removeEventListener('change', apply);
	});
</script>

{@render children?.()}