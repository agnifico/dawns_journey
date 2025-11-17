<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
</script>

<div class="coordinate-display">
    X: {$playerStore.position.x}, Y: {$playerStore.position.y}
</div>

<style>
    .coordinate-display {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 14px;
        z-index: 1000; /* Ensure it's on top of other map elements */
    }
</style>
