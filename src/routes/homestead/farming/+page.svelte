<script lang="ts">
    import FarmingArea from '$lib/components/homestead/FarmingArea.svelte';
    import FarmingCodex from '$lib/components/codex/FarmingCodex.svelte';
    import CompostPage from '$lib/components/compost/CompostPage.svelte';

    let showCodex = false;
    let showCompost = false;
</script>

<main>
    <div class="header-bar">
        <h1>Farming</h1>
        <div class="header-buttons">
            <button class="header-button" on:click={() => (showCompost = true)}>Compost</button>
            <button class="header-button" on:click={() => (showCodex = true)}>Farming Codex</button>
        </div>
    </div>

    {#if showCodex}
        <FarmingCodex on:close={() => (showCodex = false)} />
    {/if}

    {#if showCompost}
        <CompostPage on:close={() => (showCompost = false)} />
    {/if}

    <FarmingArea />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        min-height: 100vh;
        font-family: sans-serif;
        text-align: center;
        background-color: #1d6962;
        color: white;
        padding: 20px;
        gap: 1rem;
    }

    .header-bar {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        box-sizing: border-box;
    }

    h1 {
        color: #61dafb;
    }

    .header-buttons {
        display: flex;
        gap: 1rem;
    }

    .header-button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .header-button:hover {
        background-color: #45a049;
    }
</style>
