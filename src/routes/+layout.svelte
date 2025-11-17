<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';
    import './app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { phase } from '$lib/stores/timeStore';
    import { messageStore } from '$lib/stores/messageStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore'; // Import skillTreeStore
    import { onMount } from 'svelte'; // Import onMount

    let { children } = $props();

    let initial = true;
    $effect(() => {
        const tod = $phase;
        if (!initial) {
            messageStore.addMessage(`It is now ${tod}.`, ['System']);
        }
        initial = false;
    });

    onMount(async () => {
        await skillTreeStore.initialize(); // Initialize the skill tree
    });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Dawn's Journey : A serverless browser based game</title>
</svelte:head>

<Navbar />

<div class="page-content">
    {@render children?.()}
</div>

<style>
    .page-content {
        height: 100vh;
    }
</style>
