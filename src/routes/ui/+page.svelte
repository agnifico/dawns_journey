<script lang="ts">
	import ExploBubble from '$lib/components/ExploBubble.svelte';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';
	import MasteryTag from '$lib/components/ui/MasteryTag.svelte';
	import AbilityTag from '$lib/components/ui/AbilityTag.svelte';
	import AbilityCard from '$lib/components/ui/AbilityCard.svelte';
	import BuffDisplay from '$lib/components/ui/BuffDisplay.svelte';
	import HPBar from '$lib/components/HPBar.svelte';
	import StatBar from '$lib/components/ui/StatBar.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import AnimatedProgressBar from '$lib/components/ui/AnimatedProgressBar.svelte';
	import PipBar from '$lib/components/ui/PipBar.svelte';
	import AnimatedPipBar from '$lib/components/ui/AnimatedPipBar.svelte';
	import WaterIndicator from '$lib/components/ui/WaterIndicator.svelte';
	import StatDisplay from '$lib/components/ui/StatDisplay.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import Level from '$lib/components/Level.svelte';
	import MasteryDisplay from '$lib/components/ui/MasteryDisplay.svelte';
	import WRBadge from '$lib/components/WRBadge.svelte';
	import WRHeader from '$lib/components/WRHeader.svelte';
	import FloatingNumber from '$lib/components/ui/FloatingNumber.svelte';
	import GearPassive from '$lib/components/GearPassive.svelte';
	import ElementalOverlay from '$lib/components/ElementalOverlay.svelte';
	import RainOverlay from '$lib/components/ui/RainOverlay.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import ItemBox from '$lib/components/ItemBox.svelte';
	import {
		abilityPhysical, abilityElemental, abilitySpecial,
		buffEffect, debuffEffect, critBuff,
		mockWeapon, mockRelic, mockConsumable, mockLegendary
	} from './mockData';

	const elements = ['Fire', 'Water', 'Wind', 'Earth', 'Dark', 'Light'];

	// ── Floating number replay ──────────────────────────────────────────────────
	let floatKey = 0;
	function replayFloats() { floatKey++; }
</script>

<main>
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Bubbles &amp; Tags</h2>

		<div class="subsection">
			<h3>ExploBubble</h3>
			<div class="row wrap">
				{#each elements as el (el)}
					<ExploBubble name={el} level={13} hotkey="Q" />
				{/each}
			</div>
			<div class="row wrap">
				{#each elements as el (el)}
					<ExploBubble name={el} level={5} />
				{/each}
			</div>
		</div>

		<div class="subsection">
			<h3>ElementTag</h3>
			<div class="row wrap">
				{#each elements as el (el)}
					<ElementTag element={el} size="full" />
				{/each}
			</div>
			<div class="row wrap">
				{#each elements as el (el)}
					<ElementTag element={el} size="mini" />
				{/each}
			</div>
		</div>

		<div class="subsection">
			<h3>MasteryTag</h3>
			<div class="row wrap">
				{#each elements as el (el)}
					<MasteryTag element={el} level={7} />
				{/each}
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Ability Display</h2>

		<div class="subsection">
			<h3>AbilityTag</h3>
			<div class="row wrap">
				<AbilityTag ability={abilityPhysical} />
				<AbilityTag ability={abilityElemental} activeElement="Fire" />
				<AbilityTag ability={abilityElemental} activeElement="Water" />
				<AbilityTag ability={abilitySpecial} />
				<AbilityTag ability={abilityPhysical} interactive />
				<AbilityTag ability={abilityElemental} activeElement="Dark" interactive disabled />
			</div>
		</div>

		<div class="subsection">
			<h3>AbilityCard — chip mode</h3>
			<div class="row wrap">
				<AbilityCard ability={abilityPhysical} mode="chip" />
				<AbilityCard ability={abilityElemental} activeElement="Fire" mode="chip" />
				<AbilityCard ability={abilitySpecial} mode="chip" />
			</div>
		</div>

		<div class="subsection">
			<h3>AbilityCard — card mode</h3>
			<div class="row wrap">
				<AbilityCard ability={abilityPhysical} mode="card" />
				<AbilityCard ability={abilityElemental} activeElement="Wind" mode="card" />
				<AbilityCard ability={abilitySpecial} mode="card" />
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>HP &amp; Status Bars</h2>

		<div class="subsection">
			<h3>HPBar</h3>
			<div class="col narrow">
				<HPBar current={80} max={100} type="hp" />
				<HPBar current={40} max={100} type="hp" />
				<HPBar current={10} max={100} type="hp" />
				<HPBar current={60} max={100} type="aura" />
				<HPBar current={30} max={100} type="enemy" />
			</div>
		</div>

		<div class="subsection">
			<h3>StatBar</h3>
			<div class="col narrow">
				<StatBar current={70} max={100} color="#4ade80" side="left" />
				<StatBar current={40} max={100} color="#f87171" side="right" />
				<StatBar current={90} max={100} color="#60a5fa" />
			</div>
		</div>

		<div class="subsection">
			<h3>ProgressBar</h3>
			<div class="col narrow">
				<ProgressBar value={65} max={100} type="growth" />
				<ProgressBar value={30} max={100} type="water" />
			</div>
		</div>

		<div class="subsection">
			<h3>AnimatedProgressBar</h3>
			<div class="col narrow">
				<AnimatedProgressBar value={72} max={100} color="#4ade80" />
				<AnimatedProgressBar value={45} max={100} color="#f472b6" />
				<AnimatedProgressBar value={100} max={100} color="#facc15" isComplete={true} />
			</div>
		</div>

		<div class="subsection">
			<h3>PipBar</h3>
			<div class="col narrow">
				<PipBar value={3} max={5} activeColor="#4ade80" inactiveColor="#1a2a1a" />
				<PipBar value={1} max={5} activeColor="#f87171" inactiveColor="#2a1a1a" />
				<PipBar value={5} max={5} activeColor="#facc15" inactiveColor="#2a2a1a" />
			</div>
		</div>

		<div class="subsection">
			<h3>AnimatedPipBar</h3>
			<div class="col narrow">
				<AnimatedPipBar value={3} max={5} />
				<AnimatedPipBar value={5} max={5} isComplete={true} />
			</div>
		</div>

		<div class="subsection">
			<h3>WaterIndicator</h3>
			<div class="row wrap">
				<WaterIndicator value={2} required={4} />
				<WaterIndicator value={4} required={4} />
				<WaterIndicator value={0} required={3} />
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Stats &amp; Levels</h2>

		<div class="subsection">
			<h3>StatDisplay</h3>
			<div class="row wrap">
				<StatDisplay label="ATK" current={142} color="#f87171" />
				<StatDisplay label="DEF" current={88} initial={70} color="#60a5fa" />
				<StatDisplay label="SPD" current={64} initial={80} color="#4ade80" />
				<StatDisplay label="CRIT" current={0.24} decimals={2} color="#facc15" />
			</div>
		</div>

		<div class="subsection">
			<h3>Stat</h3>
			<div class="row wrap">
				<Stat statId="physicalAttack" value={120} view="full" />
				<Stat statId="elementalAttack" value={95} view="full" />
				<Stat statId="speed" value={64} baseValue={50} view="full" />
				<Stat statId="critChance" value={0.22} view="short" />
				<Stat statId="evasion" value={18} view="mini" />
			</div>
		</div>

		<div class="subsection">
			<h3>Level</h3>
			<div class="row wrap">
				<Level level={12} currentXp={340} maxXp={500} />
				<Level level={99} currentXp={500} maxXp={500} />
			</div>
		</div>

		<div class="subsection">
			<h3>MasteryDisplay</h3>
			<div class="row wrap">
				<MasteryDisplay mastery={7} elements={['Fire', 'Wind']} size="full" />
				<MasteryDisplay mastery={3} elements={['Water']} size="full" />
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Buffs &amp; Debuffs</h2>

		<div class="subsection">
			<h3>BuffDisplay</h3>
			<div class="row wrap">
				<BuffDisplay effect={buffEffect} />
				<BuffDisplay effect={debuffEffect} />
				<BuffDisplay effect={critBuff} />
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Items</h2>

		<div class="subsection">
			<h3>ItemBox — sizes &amp; rarities</h3>
			<div class="row wrap">
				<div>
					<p class="label">small</p>
					<ItemBox item={mockWeapon} viewSize="small" />
				</div>
				<div>
					<p class="label">medium</p>
					<ItemBox item={mockWeapon} viewSize="medium" />
				</div>
				<div>
					<p class="label">large</p>
					<ItemBox item={mockWeapon} viewSize="large" />
				</div>
				<div>
					<p class="label">relic / special</p>
					<ItemBox item={mockRelic} viewSize="medium" />
				</div>
				<div>
					<p class="label">consumable</p>
					<ItemBox item={mockConsumable} viewSize="medium" />
				</div>
				<div>
					<p class="label">legendary</p>
					<ItemBox item={mockLegendary} viewSize="medium" />
				</div>
				<div>
					<p class="label">equipped</p>
					<ItemBox item={mockWeapon} viewSize="medium" equipped={true} />
				</div>
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>World Resonance</h2>

		<div class="subsection">
			<h3>WRBadge</h3>
			<div class="row wrap">
				<WRBadge value={5} />
				<WRBadge required={8} playerValue={10} />
				<WRBadge required={12} playerValue={7} />
			</div>
		</div>

		<div class="subsection">
			<h3>WRHeader</h3>
			<div class="row wrap">
				<WRHeader value={6} elements={['Fire', 'Water']} />
				<WRHeader value={10} elements={['Earth']} />
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Gear Passives</h2>

		<div class="subsection">
			<h3>GearPassive</h3>
			<div class="row wrap">
				<GearPassive
					weaponName="Ember Blade"
					passiveName="Blazing Edge"
					description="Fire abilities deal 20% more damage on the first hit."
					icon="/items/ember_blade.png"
					view="normal"
				/>
				<GearPassive
					weaponName="Storm Ring"
					passiveName="Gust Step"
					description="Evasion +12 during wind-element turns."
					icon="/items/storm_ring.png"
					view="mini"
				/>
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Buttons &amp; Toggles</h2>

		<div class="subsection">
			<h3>Button styles</h3>
			<div class="row wrap">
				<button class="style1">Style 1</button>
				<button class="style2">Style 2</button>
				<button class="style3">Style 3</button>
			</div>
		</div>

		<div class="subsection">
			<h3>Tooltip</h3>
			<div class="row wrap">
				<Tooltip text="Restores 50 HP when used." direction="up">
					<button class="style1">Hover me (up)</button>
				</Tooltip>
				<Tooltip text="This effect lasts 3 turns." direction="down">
					<button class="style2">Hover me (down)</button>
				</Tooltip>
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Floating Numbers</h2>

		<div class="subsection">
			<div class="row">
				<button class="style3" on:click={replayFloats}>Replay</button>
			</div>
			<div class="float-stage">
				{#key floatKey}
					<FloatingNumber amount={248} type="damage" damageType="physical" offsetIndex={0} />
					<FloatingNumber amount={512} type="damage" damageType="elemental" offsetIndex={1} />
					<FloatingNumber amount={1024} type="crit" offsetIndex={2} />
					<FloatingNumber amount={80} type="heal" offsetIndex={3} />
				{/key}
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Elemental Overlays</h2>

		<div class="subsection">
			<div class="row wrap">
				<div class="overlay-card"><ElementalOverlay element="fire"  opacity={0.8} density="normal" /><span class="overlay-label">fire</span></div>
				<div class="overlay-card"><ElementalOverlay element="water" opacity={0.8} density="normal" /><span class="overlay-label">water</span></div>
				<div class="overlay-card"><ElementalOverlay element="wind"  opacity={0.8} density="normal" /><span class="overlay-label">wind</span></div>
				<div class="overlay-card"><ElementalOverlay element="earth" opacity={0.8} density="normal" /><span class="overlay-label">earth</span></div>
				<div class="overlay-card"><ElementalOverlay element="light" opacity={0.8} density="normal" /><span class="overlay-label">light</span></div>
				<div class="overlay-card"><ElementalOverlay element="dark"  opacity={0.8} density="normal" /><span class="overlay-label">dark</span></div>
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<section>
		<h2>Rain Overlay</h2>

		<div class="subsection">
			<div class="row wrap">
				{#each [0, 1, 2, 3] as level (level)}
					<div class="rain-card">
						<RainOverlay rainLevel={level} />
						<span class="overlay-label">level {level}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	main {
		background-color: #1a1f1c;
		min-height: 100%;
		width: 100%;
		padding: 2rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 0;
		color: #d4c9b8;
		font-family: var(--font-family-pixel);
	}

	section {
		padding: 2rem 0;
		border-bottom: 1px solid #2e3830;
	}

	section:last-child {
		border-bottom: none;
	}

	h2 {
		font-size: 1.1rem;
		color: #8fbfa0;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 1.5rem 0;
	}

	h3 {
		font-size: 0.85rem;
		color: #6a8a74;
		margin: 0 0 0.75rem 0;
		letter-spacing: 0.05em;
	}

	.subsection {
		margin-bottom: 2rem;
	}

	.subsection:last-child {
		margin-bottom: 0;
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}

	.row.wrap {
		flex-wrap: wrap;
		align-items: flex-start;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.col.narrow {
		max-width: 320px;
	}

	.label {
		font-size: 0.7rem;
		color: #6a8a74;
		margin: 0 0 0.3rem 0;
	}

	/* ── Floating numbers stage ─────────────────────────────────────────────── */
	.float-stage {
		position: relative;
		height: 120px;
		width: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0d1210;
		border-radius: 8px;
		border: 1px solid #2e3830;
		margin-top: 0.75rem;
	}

	/* ── Elemental overlays ─────────────────────────────────────────────────── */
	.overlay-card {
		position: relative;
		width: 90px;
		height: 90px;
		border-radius: 8px;
		overflow: hidden;
		background: #0d1210;
		border: 1px solid #2e3830;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.overlay-label {
		position: relative;
		z-index: 1;
		font-size: 0.7rem;
		color: #fff;
		text-shadow: 0 1px 3px #000;
		padding-bottom: 6px;
		text-transform: capitalize;
	}

	/* ── Rain overlays ──────────────────────────────────────────────────────── */
	.rain-card {
		position: relative;
		width: 90px;
		height: 90px;
		border-radius: 8px;
		overflow: hidden;
		background: #0d1520;
		border: 1px solid #2e3830;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	/* ── Button styles (carried forward from original page) ─────────────────── */
	button {
		font-family: var(--font-family-pixel);
		font-size: 1.4rem;
	}

	.style1 {
		background-color: var(--color-accent);
		border: 3px solid #313131;
		color: var(--color-secondary);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		padding-bottom: 0.75rem;
		border-radius: 0.5rem;
		box-shadow: #313131 0 -6px 0 0px inset;
		width: fit-content;
		transition: 0.1s all ease-in;
		&:hover {
			padding-bottom: 0.5rem;
			transform: translateY(0.25rem);
			box-shadow: #313131 0 -6px 0px -4px inset;
			filter: brightness(1.3) contrast(1.2);
		}
	}

	.style2 {
		background-color: var(--color-accent);
		border: 4px solid #313131;
		color: var(--color-secondary);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
		height: fit-content;
		padding: 0.5rem;
		padding-bottom: 0.75rem;
		border-radius: 0.5rem;
		box-shadow: #00000056 0 -8px 0 0px inset;
		width: fit-content;
		transition: 0.1s all ease-in;
		&:hover {
			filter: brightness(1.3) contrast(1.2);
			box-shadow: #00000056 0 -8px 0px -4px inset;
		}
	}

	.style3 {
		box-sizing: border-box;
		padding: 1rem;
		color: #e9d9ca;
		background-color: #435e52;
		border-radius: 18px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		transition: 0.1s all ease-in;
		cursor: pointer;
		&:hover {
			transform: translateY(2px);
			filter: brightness(1.3) contrast(1.2);
			box-shadow: #00000056 0 -6px 0px -4px inset;
		}
	}
</style>
