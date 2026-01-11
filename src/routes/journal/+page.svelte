<script lang="ts">
    import GameDesignChapter from './GameDesignChapter.svelte';
    import HowToPlayChapter from './HowToPlayChapter.svelte';

    type Chapter = 'dev_notes' | 'how_to_play';
    let activeChapter: Chapter = 'dev_notes';

    const chapters: { id: Chapter, title: string }[] = [
        { id: 'dev_notes', title: "Developer's Notes" },
        { id: 'how_to_play', title: 'How to Play' },
        // { id: 'characters', title: 'Characters' }, // Future chapters
        // { id: 'storyline', title: 'Storyline' },
        // { id: 'world', title: 'World' },
    ];
</script>

<div class="journal-container">
    <nav class="navbar">
        <a href="/" class="brand">Return to Game</a>
    </nav>

    <div class="journal-content">
        <header class="journal-header">
            <h1>Journal</h1>
            <div class="tabs">
                {#each chapters as chapter}
                    <button 
                        class="tab-button" 
                        class:active={activeChapter === chapter.id}
                        on:click={() => activeChapter = chapter.id}
                    >
                        {chapter.title}
                    </button>
                {/each}
                <a href="/journal/character" class="tab-button">Characters</a>
            </div>
        </header>

        <main class="chapter-content">
            {#if activeChapter === 'dev_notes'}
                <GameDesignChapter />
            {:else if activeChapter === 'how_to_play'}
                <HowToPlayChapter />
            {/if}
        </main>
    </div>
</div>

<style>
    .journal-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #e5b67f;
        color: #614b3b;
    }
    .navbar {
        padding: 0.5em 1em;
        background-color: #6d403b;
    }
    .brand {
        color: #e5b67f;
        text-decoration: none;
        font-family: 'Silkscreen';
        font-size: 1.2em;
    }
    .journal-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2rem;
        max-width: 900px;
        margin: 0 auto;
        width: 100%;
    }
    .journal-header {
        text-align: center;
        margin-bottom: 2rem;
        border-bottom: 2px solid #c7895d;
        padding-bottom: 1rem;
    }
    .journal-header h1 {
        font-family: 'Silkscreen';
        font-size: 3rem;
        color: #634041;
        margin: 0 0 1rem 0;
    }
    .tabs {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    .tab-button {
        font-family: 'Silkscreen';
        background-color: #c7895d;
        color: #614b3b;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
    }
    .tab-button:hover {
        background-color: #b57a50;
    }
    .tab-button.active {
        background-color: #6d403b;
        color: #e5b67f;
    }
    .chapter-content {
        padding-top: 1rem;
    }
</style>
