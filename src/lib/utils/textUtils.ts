/**
 * textUtils.ts
 *
 * Central place for text token replacement.
 * Import resolveText() anywhere a string is shown to the player.
 *
 * Supported tokens:
 *   {playerName}  — replaced with the player's chosen name (or 'Traveller')
 *   {enemy}       — replaced by EncounterService before reaching here (already handled)
 *
 * Usage:
 *   import { resolveText } from '$lib/utils/textUtils';
 *   const line = resolveText("Hello, {playerName}!", playerName);
 *   const lines = resolveText(["Line one", "Hello, {playerName}!"], playerName);
 */

export function resolveText(text: string, playerName: string): string;
export function resolveText(text: string[], playerName: string): string[];
export function resolveText(text: string | string[], playerName: string): string | string[] {
    const replace = (s: string) => s.replace(/\{playerName\}/g, playerName);
    return Array.isArray(text) ? text.map(replace) : replace(text);
}