<script lang="ts">
	import type { AnyAbilityEffect } from '$lib/services/abilityEffects';

	export let effect: AnyAbilityEffect;

	// Formats a multiplier as a readable percentage string
	function pct(n: number): string {
		return `${Math.round(n * 100)}%`;
	}

	// Formats a stat modifier value: 1.15 → "+15%", 0.85 → "−15%", +20 → "+20"
	function fmtMod(val: number, isAdditive = false): string {
		if (isAdditive) return val >= 0 ? `+${val}` : `${val}`;
		const diff = Math.round((val - 1) * 100);
		return diff >= 0 ? `+${diff}%` : `${diff}%`;
	}

	const statLabels: Record<string, string> = {
		physicalAttack: 'Phys. ATK',
		elementalAttack: 'Elem. ATK',
		physicalDefence: 'Phys. DEF',
		elementalDefence: 'Elem. DEF',
		speed: 'Speed',
		evasion: 'Evasion',
		critChance: 'Crit Chance',
		critDamage: 'Crit DMG',
		precision: 'Precision',
	};
	const additiveStats = new Set(['evasion', 'precision']);

	type EffectLine = { text: string; kind: 'damage' | 'heal' | 'buff' | 'debuff' | 'control' | 'utility' | 'special' };

	function describe(e: AnyAbilityEffect): EffectLine[] {
		switch (e.type) {
			case 'damage': {
				const type = e.damageType === 'physical' ? 'Phys. ATK' : 'Elem. ATK';
				const hits = e.hitCount && e.hitCount > 1 ? ` × ${e.hitCount}` : '';
				return [{ text: `${pct(e.multiplier)} ${type}${hits}`, kind: 'damage' }];
			}
			case 'conditional_damage': {
				const type = e.damageType === 'physical' ? 'Phys. ATK' : 'Elem. ATK';
				const condLabel =
					e.condition === 'hp_below' ? `enemy < ${pct(e.threshold ?? 0)} HP` :
					e.condition === 'hp_above' ? `enemy > ${pct(e.threshold ?? 0)} HP` :
					e.condition === 'self_hp_below' ? `self < ${pct(e.threshold ?? 0)} HP` :
					e.condition === 'self_hp_above' ? `self > ${pct(e.threshold ?? 0)} HP` :
					e.condition;
				return [{
					text: `${pct(e.baseMultiplier)} ${type} · ${pct(e.bonusMultiplier)} if ${condLabel}`,
					kind: 'damage'
				}];
			}
			case 'heal': {
				const base = e.basedOn ? statLabels[e.basedOn] ?? e.basedOn : 'flat';
				return [{ text: `Heal ${pct(e.multiplier)} ${base}`, kind: 'heal' }];
			}
			case 'heal_percent_max_hp':
				return [{ text: `Restore ${pct(e.percent)} max HP`, kind: 'heal' }];
			case 'heal_full':
				return [{ text: `Restore to full HP`, kind: 'heal' }];
			case 'lifesteal': {
				const type = e.damageType === 'physical' ? 'Phys. ATK' : 'Elem. ATK';
				return [{
					text: `${pct(e.multiplier)} ${type} · heal ${pct(e.healRatio)} of damage`,
					kind: 'heal'
				}];
			}
			case 'apply_status': {
				const s = e.statusEffect;
				const lines: EffectLine[] = [];
				const tgt = e.target === 'self' ? 'Self' : 'Enemy';
				const dur = `${s.duration} turns`;

				if (s.isStunned)
					lines.push({ text: `${tgt}: Stun · ${dur}`, kind: 'control' });
				if (s.damagePerTurn)
					lines.push({ text: `${tgt}: ${s.name} · ${pct(s.damagePerTurn)}/turn · ${dur}`, kind: 'debuff' });
				if (s.healPerTurn)
					lines.push({ text: `${tgt}: Regen ${pct(s.healPerTurn)}/turn · ${dur}`, kind: 'heal' });
				if (s.flags?.length)
					s.flags.forEach(f => lines.push({ text: `${tgt}: ${f.replace(/_/g, ' ')}`, kind: 'utility' }));
				if (s.statModifiers) {
					Object.entries(s.statModifiers).forEach(([k, v]) => {
						if (v === undefined) return;
						const label = statLabels[k] ?? k;
						const additive = additiveStats.has(k);
						const formatted = fmtMod(v as number, additive);
						const isPositiveForTarget = e.target === 'self'
							? (additive ? (v as number) > 0 : (v as number) > 1)
							: (additive ? (v as number) < 0 : (v as number) < 1);
						const kind: EffectLine['kind'] = e.target === 'self'
							? ((additive ? (v as number) > 0 : (v as number) > 1) ? 'buff' : 'debuff')
							: ((additive ? (v as number) < 0 : (v as number) < 1) ? 'debuff' : 'buff');
						lines.push({ text: `${tgt}: ${label} ${formatted} · ${dur}`, kind });
					});
				}
				if (lines.length === 0)
					lines.push({ text: `${tgt}: ${s.name} · ${dur}`, kind: 'special' });
				if (e.stackBehavior === 'stack')
					lines[lines.length - 1] = { ...lines[lines.length - 1], text: lines[lines.length - 1].text + ' (stackable)' };
				return lines;
			}
			case 'stat_modifier': {
				const tgt = e.target === 'self' ? 'Self' : 'Enemy';
				return Object.entries(e.modifiers).map(([k, v]) => {
					if (v === undefined) return null;
					const label = statLabels[k] ?? k;
					const additive = additiveStats.has(k);
					const formatted = fmtMod(v as number, additive);
					const kind: EffectLine['kind'] = e.target === 'self'
						? ((v as number) > (additive ? 0 : 1) ? 'buff' : 'debuff')
						: ((v as number) < (additive ? 0 : 1) ? 'debuff' : 'buff');
					return { text: `${tgt}: ${label} ${formatted} · ${e.duration} turns`, kind };
				}).filter(Boolean) as EffectLine[];
			}
			case 'shield_manipulate':
				return [{ text: `Enemy Aura: ${e.operation} ${e.amount !== undefined ? pct(e.amount) : ''}`, kind: 'debuff' }];
			case 'stat_transfer': {
				return e.transfers.map(t => ({
					text: `${statLabels[t.sourceStat] ?? t.sourceStat} → ${statLabels[t.targetStat] ?? t.targetStat} (retain ${pct(t.retainRatio)})`,
					kind: 'special' as EffectLine['kind']
				}));
			}
			case 'cleanse':
				return [{
					text: e.cleanse === 'negative'
						? `Remove all debuffs from ${e.target === 'self' ? 'self' : 'enemy'}`
						: `Strip all buffs from ${e.target === 'self' ? 'self' : 'enemy'}`,
					kind: e.cleanse === 'negative' ? 'utility' : 'debuff'
				}];
			default:
				return [{ text: 'Unknown effect', kind: 'special' }];
		}
	}

	$: lines = describe(effect);
</script>

{#each lines as line}
	<div class="effect-line {line.kind}">
		<span class="effect-dot"></span>
		<span class="effect-text">{line.text}</span>
	</div>
{/each}

<style>
	.effect-line {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 2px 0;
		font-size: 0.75rem;
		font-family: var(--font-family-pixel, monospace);
		line-height: 1.4;
	}
	.effect-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		flex-shrink: 0;
		background: currentColor;
		opacity: 0.6;
	}
	.effect-text { color: var(--text-muted, #aaa); }

	/* Kind colours */
	.damage  { color: #e07a5f; }
	.heal    { color: #6d9e5a; }
	.buff    { color: #51bfc1; }
	.debuff  { color: #c9973a; }
	.control { color: #a78bd4; }
	.utility { color: #7a8fd4; }
	.special { color: #8e8c7f; }

	.damage  .effect-text,
	.heal    .effect-text,
	.buff    .effect-text,
	.debuff  .effect-text,
	.control .effect-text,
	.utility .effect-text,
	.special .effect-text {
		color: inherit;
		opacity: 0.85;
	}
</style>