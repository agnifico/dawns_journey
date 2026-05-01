import type { Set, SetBonus } from '$lib/types';
import { sets } from '$lib/data/sets';
import { statDefinitions } from '$lib/data/statDefinitions';

// Create a lookup map for efficient searching
const relicToSetMap = new Map<string, Set>();

for (const set of sets) {
    for (const relicId of set.relicIds) {
        relicToSetMap.set(relicId, set);
    }
}

/**
 * Retrieves the set definition for a given relic ID.
 * @param relicId The ID of the relic to check.
 * @returns The Set object if the relic is part of a set, otherwise undefined.
 */
export function getSetForRelic(relicId: string): Set | undefined {
    return relicToSetMap.get(relicId);
}

// ---------------------------------------------------------------------------
// Bonus formatting
// ---------------------------------------------------------------------------

function statName(id: string): string {
    return statDefinitions[id]?.name ?? id;
}

function formatStatValue(value: number): string {
    const sign = value > 0 ? '+' : '';
    if (Math.abs(value) < 1 && value !== 0) {
        return `${sign}${Math.round(value * 100)}%`;
    }
    return `${sign}${value}`;
}

/**
 * Formats a single SetBonus tier into one or more human-readable lines.
 * Each line is a short phrase suitable for inline display.
 * Covers all four bonus shapes: stats, elementalBonus, tagBonus, speedConditionalBonus.
 *
 * Returns an empty array if the bonus is somehow empty (shouldn't happen).
 */
export function formatBonusLines(bonus: SetBonus): string[] {
    const lines: string[] = [];

    // Always-on stats
    if (bonus.stats?.length) {
        lines.push(
            bonus.stats.map(s => `${statName(s.name)} ${formatStatValue(s.value)}`).join(', '),
        );
    }

    // Element-conditional stats
    if (bonus.elementalBonus) {
        const eb = bonus.elementalBonus;
        const inner = eb.stats.map(s => `${statName(s.name)} ${formatStatValue(s.value)}`).join(', ');
        lines.push(`While wielding ${eb.element}: ${inner}`);
    }

    // Tag-based damage multiplier
    if (bonus.tagBonus) {
        const pct = Math.round((bonus.tagBonus.damageMultiplier - 1) * 100);
        const sign = pct >= 0 ? '+' : '';
        lines.push(`${sign}${pct}% damage to [${bonus.tagBonus.tag}] abilities`);
    }

    // Speed-conditional
    if (bonus.speedConditionalBonus) {
        const sc = bonus.speedConditionalBonus;
        const condText = sc.condition === 'attacker_faster'
            ? 'When faster than enemy'
            : 'When slower than enemy';
        const parts: string[] = [];
        if (sc.stats?.length) {
            parts.push(sc.stats.map(s => `${statName(s.name)} ${formatStatValue(s.value)}`).join(', '));
        }
        if (sc.tagBonus) {
            const pct = Math.round((sc.tagBonus.damageMultiplier - 1) * 100);
            const sign = pct >= 0 ? '+' : '';
            parts.push(`${sign}${pct}% damage to [${sc.tagBonus.tag}] abilities`);
        }
        lines.push(`${condText}: ${parts.join(', ')}`);
    }

    return lines;
}