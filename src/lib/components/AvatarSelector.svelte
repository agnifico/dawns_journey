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
        // '/images/characters/player8.png',
        '/images/characters/player9.png',
        // '/images/characters/player10.png',
        '/images/characters/player11.png',
        // '/images/characters/player12.png',
        '/images/characters/player13.png',
        '/images/characters/player14.png',
        // '/images/characters/player15.png',
        '/images/characters/player16.png',
        // '/images/characters/player17.png',
        '/images/characters/player18.png',
        '/images/characters/player19.png',
        '/images/characters/player20.png',
    ];
    
    let selectedAvatar = $playerStore.profile.avatar;
    let currentIndex = avatars.indexOf(selectedAvatar);

    function startEditing() {
        editing = true;
    }

    function cancelEditing() {
        editing = false;
        selectedAvatar = $playerStore.profile.avatar;
        currentIndex = avatars.indexOf(selectedAvatar);
    }

    function selectAvatar() {
        setAvatar(selectedAvatar);
        editing = false;
    }

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
            <button class="edit-button" on:click={startEditing}>Change</button>
        {/if}
    </div>

    {#if editing}
        <div class="controls">
            <button on:click={prevAvatar}><img src="/game_icons/arrow_left.png" alt="Previous"></button>
            <div class="buttons">
                <button on:click={selectAvatar}><img src="/game_icons/confirm.png" alt="Select"></button>
                <button on:click={cancelEditing}><img src="/game_icons/cancel.png" alt="Cancel"></button>
            </div>
            <button on:click={nextAvatar}><img src="/game_icons/arrow_right.png" alt="Next"></button>
        </div>
    {/if}
</div>

<style>
    .avatar-selector {
        image-rendering: auto;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 180px;
        min-width: 180px;
        box-sizing: border-box;
        &:hover .edit-button {
            visibility: visible;
        }
    }
    .avatar-container {
        position: relative;
        /* max-width: 200px; */
        flex-grow: 1;
        border-radius: 12px;
        overflow: hidden;
        border: 3px solid rgba(196, 154, 54, 0.602);
        box-shadow: #00000056 0 6px 10px 0px;
    }
    .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
    }
    .edit-button {
        visibility: hidden;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        padding: 0.25em 0.5em;
        border-radius: 5px;
        cursor: pointer;
        font-family: var(--font-family-pixel);
    }
    .controls {
        image-rendering: pixelated;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 3px;
        border-radius: 0 0 8px 8px;
        position: absolute;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
    }
    .controls button {
        background: none;
        border: none;
        cursor: pointer;
    }
    .controls button img {
        width: 24px;
        height: 24px;
    }
    .buttons {
        display: flex;
        justify-content: center;
        gap: .5rem;
        
    }
</style>
