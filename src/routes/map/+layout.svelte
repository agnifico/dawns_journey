<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { hideNavbar } from '$lib/stores/uiStore';

	let { children } = $props();

	onMount(() => hideNavbar.set(true));
	onDestroy(() => hideNavbar.set(false));
</script>

{@render children?.()}