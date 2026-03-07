/**
 * abilityConfig.ts
 *
 * Single source of truth for ability visibility mode.
 *
 * 'dev'  → allAbilities includes ALL abilities (player + NPC).
 *          Use this while testing so every ability is selectable in the UI.
 *
 * 'live' → allAbilities is filtered to player-only abilities.
 *          NPC abilities are still loaded internally (for the engine),
 *          but won't appear in the player's ability picker.
 *
 * Flip this one line when shipping.
 */
export const ABILITY_MODE: 'dev' | 'live' = 'live';