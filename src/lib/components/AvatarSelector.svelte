<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
    import { setAvatar } from '$lib/stores/playerStore';

    let editing = false;
    const avatars = [
        '/images/characters/alchemist.png',
        '/images/characters/assassin.png',
        '/images/characters/spirit_beast.png',
        '/images/characters/gladiator.png',
        '/images/characters/guardian.png',
        '/images/characters/player1.png',
        '/images/characters/player2.png',
        '/images/characters/player3.png',
        '/images/characters/player4.png',
        '/images/characters/player5.png',
        '/images/characters/player6.png',
        '/images/characters/player7.png',
        '/images/characters/player9.png',
        '/images/characters/player11.png',
        '/images/characters/player13.png',
        '/images/characters/player14.png',
        '/images/characters/player16.png',
        '/images/characters/player18.png',
        '/images/characters/player19.png',
        '/images/characters/player20.png',
    ];

    let selectedAvatar = $playerStore.profile.avatar;
    let currentIndex = avatars.indexOf(selectedAvatar);

    function startEditing() { editing = true; }
    function cancelEditing() {
        editing = false;
        selectedAvatar = $playerStore.profile.avatar;
        currentIndex = avatars.indexOf(selectedAvatar);
    }
    function selectAvatar() { setAvatar(selectedAvatar); editing = false; }
    function nextAvatar() {
        currentIndex = (currentIndex + 1) % avatars.length;
        selectedAvatar = avatars[currentIndex];
    }
    function prevAvatar() {
        currentIndex = (currentIndex - 1 + avatars.length) % avatars.length;
        selectedAvatar = avatars[currentIndex];
    }
</script>

<div class="avatar-selector">
    <div class="avatar-container">
        <img src={selectedAvatar} alt="Player Avatar" class="avatar-image" />
        {#if !editing}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="edit-overlay" on:click={startEditing}>
                <span class="edit-label">Change</span>
            </div>
        {:else}
            <div class="edit-controls">
                <button class="ctrl-btn" on:click={prevAvatar}>
                    <img src="/game_icons/arrow_left.png" alt="Previous">
                </button>
                <div class="ctrl-confirm">
                    <button class="ctrl-btn" on:click={selectAvatar}>
                        <img src="/game_icons/confirm.png" alt="Select">
                    </button>
                    <button class="ctrl-btn" on:click={cancelEditing}>
                        <img src="/game_icons/cancel.png" alt="Cancel">
                    </button>
                </div>
                <button class="ctrl-btn" on:click={nextAvatar}>
                    <img src="/game_icons/arrow_right.png" alt="Next">
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .avatar-selector {
        flex-shrink: 0;
    }

    .avatar-container {
        position: relative;
        width: 120px;
        height: 120px;
        border-radius: 10px;
        overflow: hidden;
        border: 2px solid rgba(196, 154, 54, 0.5);
        box-shadow: #00000056 0 6px 10px 0;
        cursor: pointer;
    }

    .avatar-container:hover .edit-overlay {
        opacity: 1;
    }

    .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        image-rendering: auto;
    }

    .edit-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 8px;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .edit-label {
        font-family: var(--font-family-pixel);
        font-size: 0.6rem;
        color: rgba(228, 216, 190, 0.85);
        letter-spacing: 0.08em;
    }

    .edit-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 6px;
        image-rendering: pixelated;
    }

    .ctrl-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
    }

    .ctrl-btn img {
        width: 20px;
        height: 20px;
        image-rendering: pixelated;
    }

    .ctrl-confirm {
        display: flex;
        gap: 4px;
    }
</style>