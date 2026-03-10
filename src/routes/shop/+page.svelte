<script lang="ts">
    import Shop from '$lib/components/Shop.svelte';
    import Notification from '$lib/components/Notification.svelte';
</script>

<main>
    <Shop />
    <Notification />
</main>

<style>
    main {
        /* padding: 1rem; */
        position: relative;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
    }
</style>