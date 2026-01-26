<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
</script>

<div class="coordinate-display">
    <!-- <div class="compass"><img src="/game_icons/compass.png" alt="" srcset=""></div> -->
    <p>
        X: {$playerStore.position.x}, Y: {$playerStore.position.y}
    </p>
</div>

<style>
    .coordinate-display {
        position: absolute;
        top: 5%;
        left: 0;
        /* inset: 0; */
        height: fit-content;
        background-color: rgba(0, 0, 0, 0.2);
        color: white;
        padding: 8px;
        /* border-radius: 5px; */
        font-family: monospace;
        font-size: 14px;
        z-index: 10;
        /* clip-path: polygon(28% 0%, 0 0, 0% 28%); */
        /* backdrop-filter: blur(20px); */
        /* border: 1px solid salmon; */
        background-color: var(--color-surface-2);
    }
    p {
        padding: 0;
        /* border: 1px solid white; */
        margin: 0;
        text-align: center;
        /* width: 12ch; */
        /* transform-origin: bottom right; */
        /* transform: rotateZ(-45deg); */
        font-weight: 600;
        font-family: var(--font-family-pixel);
        color: var(--color-primary);
    }
</style>
