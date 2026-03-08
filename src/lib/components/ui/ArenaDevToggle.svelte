<!-- 
  Drop this anywhere in your Arena page .svelte file.
  It reads the current mode and toggles abilityConfig.ts for you — 
  except since that's a static import, it actually just shows the mode
  and reminds you to flip the flag. See the reactive version below.

  ─── OPTION A: Static reminder badge (simplest, no store needed) ─────────────
  Just drop this in your arena page template. It shows you the current mode
  visually. You flip abilityConfig.ts manually (one keystroke in your editor).
-->

<script lang="ts">
    import { ABILITY_MODE } from '$lib/config/abilityConfig';
  </script>
  
  {#if ABILITY_MODE === 'dev'}
    <div class="dev-mode-badge">
      ⚔️ DEV MODE — All abilities unlocked
    </div>
  {/if}
  
  <style>
    .dev-mode-badge {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: #1a1a2e;
      border: 1px solid #e94560;
      color: #e94560;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      z-index: 9999;
      pointer-events: none;
      letter-spacing: 0.03em;
    }
  </style>
  
