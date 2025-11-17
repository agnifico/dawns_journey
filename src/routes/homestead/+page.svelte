<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<main>
    <h1>Homestead</h1>
    <nav class="homestead-nav">
        <button on:click={() => goto('/homestead/farming')}>Farming Area</button>
        <button on:click={() => goto('/homestead/fishing')}>Fishing Area (Coming Soon)</button>
        <button on:click={() => goto('/homestead/cooking')}>Cooking Area (Coming Soon)</button>
    </nav>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: sans-serif;
        text-align: center;
        background-color: #282c34;
        color: white;
        padding: 20px;
    }

    h1 {
        color: #61dafb;
        margin-bottom: 2rem;
    }

    .homestead-nav {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .homestead-nav button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .homestead-nav button:hover {
        background-color: #45a049;
    }
</style>