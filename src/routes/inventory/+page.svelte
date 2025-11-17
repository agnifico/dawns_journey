<script lang="ts">
    import PlayerStats from "$lib/components/PlayerStats.svelte";
    import Inventory from "$lib/components/Inventory.svelte";
</script>

<main>
    <!-- <h1>Player Data</h1> -->
    <div class="player-data-container">
        <PlayerStats />
        <Inventory />
    </div>
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
        margin-bottom: 1rem;
    }
    
    .player-data-container {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5rem;
    }

</style>