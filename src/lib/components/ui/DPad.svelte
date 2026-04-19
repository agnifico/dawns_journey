<script lang="ts">
    import { onDestroy } from 'svelte';
    import { game } from '$lib/game/game';

    // ── Movement ─────────────────────────────────────────────────────────────
    function handleMove(dx: number, dy: number) {
        game.movePlayer(dx, dy);
    }

    function handleAction(action: 'A' | 'B') {
        console.log(`Action button ${action} pressed`);
    }

    // ── Hold-to-walk (mobile) ────────────────────────────────────────────────
    // Tap = single step (immediate). Hold past HOLD_DELAY_MS = continuous run
    // at TICK_MS. Pointerup / leave / cancel all stop the run.
    const HOLD_DELAY_MS = 180;
    const TICK_MS = 110; // ≈ desktop hold rate; tune if game.movePlayer expects different

    let activeDir: { dx: number; dy: number } | null = null;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let runInterval: ReturnType<typeof setInterval> | null = null;

    function startHold(dx: number, dy: number) {
        // Immediate single step (the tap).
        handleMove(dx, dy);
        activeDir = { dx, dy };

        // After a delay, if still held, start the continuous run.
        holdTimer = setTimeout(() => {
            if (!activeDir) return;
            runInterval = setInterval(() => {
                if (!activeDir) return;
                handleMove(activeDir.dx, activeDir.dy);
            }, TICK_MS);
        }, HOLD_DELAY_MS);
    }

    function endHold() {
        activeDir = null;
        if (holdTimer)   { clearTimeout(holdTimer);   holdTimer = null; }
        if (runInterval) { clearInterval(runInterval); runInterval = null; }
    }

    onDestroy(endHold);
</script>

<div class="d-pad-layout">
    <!-- ── Mobile Layout ──────────────────────────────────────────────────── -->
    <div class="mobile-d-pad">
        <div class="d-pad-cluster">
            <button
                class="d-pad-button up"
                on:pointerdown|preventDefault={() => startHold(0, -1)}
                on:pointerup={endHold}
                on:pointerleave={endHold}
                on:pointercancel={endHold}
            >▲</button>
            <button
                class="d-pad-button left"
                on:pointerdown|preventDefault={() => startHold(-1, 0)}
                on:pointerup={endHold}
                on:pointerleave={endHold}
                on:pointercancel={endHold}
            >◀</button>
            <div class="d-pad-center"></div>
            <button
                class="d-pad-button right"
                on:pointerdown|preventDefault={() => startHold(1, 0)}
                on:pointerup={endHold}
                on:pointerleave={endHold}
                on:pointercancel={endHold}
            >▶</button>
            <button
                class="d-pad-button down"
                on:pointerdown|preventDefault={() => startHold(0, 1)}
                on:pointerup={endHold}
                on:pointerleave={endHold}
                on:pointercancel={endHold}
            >▼</button>
        </div>
        <div class="action-buttons">
            <button class="action-button b-button" on:click={() => handleAction('B')}>B</button>
            <button class="action-button a-button" on:click={() => handleAction('A')}>A</button>
        </div>
    </div>

    <!-- ── Desktop Layout (overlay; keyboard does the real walking) ───────── -->
    <div class="desktop-d-pad">
        <button class="d-pad-button up"    on:click={() => handleMove(0, -1)}>▲</button>
        <button class="d-pad-button left"  on:click={() => handleMove(-1, 0)}>◀</button>
        <div class="d-pad-center"></div>
        <button class="d-pad-button right" on:click={() => handleMove(1, 0)}>▶</button>
        <button class="d-pad-button down"  on:click={() => handleMove(0, 1)}>▼</button>
    </div>
</div>

<style>
    .d-pad-button,
    .action-button {
        background-color: var(--surface-1);
        border: 3px solid var(--color-secondary);
        color: white;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: none; /* important: prevents scroll/zoom while holding */
    }

    .d-pad-button:active,
    .action-button:active {
        background-color: rgba(255, 255, 255, 0.4);
    }

    /* --- Desktop Overlay Styles --- */
    .desktop-d-pad {
        display: grid;
        grid-template-columns: repeat(3, 40px);
        grid-template-rows: repeat(2, 40px);
        gap: 4px;
    }
    .desktop-d-pad .d-pad-button {
        text-shadow: 2px 2px 0 rgba(0, 0, 0, .2);
        font-size: 1.2rem;
        box-shadow:
            inset 0 30px 30px -15px rgba(255, 255, 255, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.3),
            inset 0 1px 20px rgba(0, 0, 0, 0),
            0 3px 0 var(--surface-2),
            0 3px 2px rgba(0, 0, 0, 0.2),
            0 5px 10px rgba(0, 0, 0, 0.1),
            0 10px 20px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        transition: 150ms all ease-in-out;

        &:active {
            transform: translateY(3px);
            box-shadow:
                inset 0 16px 2px -15px rgba(0, 0, 0, 0),
                inset 0 0 0 1px rgba(255, 255, 255, 0.15),
                inset 0 1px 20px rgba(0, 0, 0, 0.1),
                0 0 0 var(--surface-2),
                0 0 0 2px rgba(255, 255, 255, 0.5),
                0 0 0 rgba(0, 0, 0, 0),
                0 0 0 rgba(0, 0, 0, 0);
        }
    }
    .desktop-d-pad .d-pad-center { grid-area: 2 / 2 / 3 / 3; }
    .desktop-d-pad .up    { grid-area: 1 / 2 / 2 / 3; }
    .desktop-d-pad .left  { grid-area: 2 / 1 / 3 / 2; }
    .desktop-d-pad .right { grid-area: 2 / 3 / 3 / 4; }
    .desktop-d-pad .down  { grid-area: 2 / 2 / 3 / 3; }

    /* --- Mobile Block Styles --- */
    .mobile-d-pad {
        display: none;
        width: 100%;
        padding: 1rem 2rem;
        box-sizing: border-box;
        background-color: #222;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .d-pad-cluster {
        display: grid;
        grid-template-columns: repeat(3, 60px);
        grid-template-rows: repeat(3, 60px);
        gap: 8px;
    }
    .mobile-d-pad .d-pad-button {
        font-size: 2rem;
        border-radius: 10px;
    }
    .mobile-d-pad .d-pad-center { grid-area: 2 / 2 / 3 / 3; }
    .mobile-d-pad .up    { grid-area: 1 / 2 / 2 / 3; }
    .mobile-d-pad .left  { grid-area: 2 / 1 / 3 / 2; }
    .mobile-d-pad .right { grid-area: 2 / 3 / 3 / 4; }
    .mobile-d-pad .down  { grid-area: 3 / 2 / 4 / 3; }

    .action-buttons {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .action-button {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        font-size: 2rem;
        font-family: 'Silkscreen', sans-serif;
    }
    .a-button { background-color: #e63946; }
    .b-button { background-color: #f1faee; color: #1d3557; }

    @media (max-width: 768px) {
        .desktop-d-pad { display: none; }
        .mobile-d-pad  { display: flex; }
    }
    @media (min-width: 769px) {
        .mobile-d-pad  { display: none; }
        .desktop-d-pad { display: grid; }
    }
</style>