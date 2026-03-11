<script lang="ts">
	let searchQuery = '';

	type GlossaryEntry = {
		term: string;
		definition: string;
		category: string;
	};

	const entries: GlossaryEntry[] = [
		// Core stats
		{ term: 'World Resonance', category: 'Stats', definition: 'Your primary progression stat. Accumulates passively over time, through quest rewards, and from first-kill bonuses. Used to determine whether you can defeat an enemy.' },
		{ term: 'Physical Attack', category: 'Stats', definition: 'Base damage dealt by normal attacks. Scales with weapon Physical ATK stat.' },
		{ term: 'Elemental Attack', category: 'Stats', definition: 'Damage dealt by elemental abilities and infused attacks. Scales with your equipped weapon\'s element.' },
		{ term: 'Physical Defence', category: 'Stats', definition: 'Reduces incoming physical damage. Primarily granted by Earth-element weapons and relics.' },
		{ term: 'Elemental Defence', category: 'Stats', definition: 'Reduces incoming elemental damage. Primarily granted by Water-element weapons and relics.' },
		{ term: 'Precision', category: 'Stats', definition: 'Increases your chance of landing hits and reduces the opponent\'s effective evasion. A Fire-element specialty.' },
		{ term: 'Evasion', category: 'Stats', definition: 'Your chance of dodging incoming attacks entirely. A Wind-element specialty.' },
		{ term: 'Speed', category: 'Stats', definition: 'Determines turn order in combat. Higher Speed means you act first more often. A Wind-element specialty.' },
		{ term: 'Critical Chance', category: 'Stats', definition: 'The probability that an attack deals critical damage. A Light-element specialty.' },
		{ term: 'Critical Damage', category: 'Stats', definition: 'The damage multiplier applied on a critical hit. A Dark-element specialty.' },
		{ term: 'Aura Shield', category: 'Stats', definition: 'A secondary HP pool that absorbs damage before your HP is affected. Depleted before HP, regenerates under certain conditions.' },
		// Elements
		{ term: 'Fire', category: 'Elements', definition: 'The element of Precision. Fire weapons boost your accuracy and aggressive striking power.' },
		{ term: 'Earth', category: 'Elements', definition: 'The element of endurance. Earth weapons grant Physical Defence and max HP bonuses.' },
		{ term: 'Water', category: 'Elements', definition: 'The element of resilience. Water weapons grant Elemental Defence and HP bonuses.' },
		{ term: 'Wind', category: 'Elements', definition: 'The element of mobility. Wind weapons boost Evasion and Speed.' },
		{ term: 'Light', category: 'Elements', definition: 'The element of sudden fortune. Light weapons increase Critical Chance.' },
		{ term: 'Dark', category: 'Elements', definition: 'The element of precision consequence. Dark weapons amplify Critical Damage.' },
		{ term: 'Normal', category: 'Elements', definition: 'No elemental bonus, but often higher raw stats than elemental equivalents. A generalist choice.' },
		// Equipment
		{ term: 'Relic', category: 'Equipment', definition: 'A secondary equipment slot alongside your weapon. Relics grant Exploration levels — the key to unlocking new map regions — but do not contribute to combat Mastery.' },
		{ term: 'Exploration Level', category: 'Equipment', definition: 'An elemental unlock stat granted by Relics (and some Weapons). Required to enter certain map regions. Example: Water Exploration 2 unlocks the Eastern Waters.' },
		{ term: 'Set Bonus', category: 'Equipment', definition: 'Additional stats granted when you equip a matching number of items from the same set. Shown in the Equipment panel.' },
		// Systems
		{ term: 'Heart Rank', category: 'Systems', definition: 'Your friendship/trust level with a character. Built through conversations, gifts, and time. Unlocks new dialogue, rewards, and story content.' },
		{ term: 'Sword Rank', category: 'Systems', definition: 'Your combat respect level with a character. Built through duels and victories. Some characters respond more to this than to gifts.' },
		{ term: 'Argentum', category: 'Systems', definition: 'The primary currency of Ashenfall. Used in shops and crafting. Found in the world and earned through quests.' },
		{ term: 'Time Point', category: 'Systems', definition: 'A secondary currency linked to in-game time. Used primarily in Cooking recipes. Accumulates passively as you play.' },
		{ term: 'Level Up Point', category: 'Systems', definition: 'Awarded on player level-up. Spent in the stats menu to permanently improve specific combat stats.' },
		{ term: 'World Resonance Requirement', category: 'Systems', definition: 'The minimum World Resonance needed to defeat a specific enemy. Each enemy lists two paths to victory in the Event Screen.' },
		// Factions
		{ term: 'Solis Saints', category: 'Factions', definition: 'A church-military organization that genuinely feeds people and shelters refugees — and maintains formidable power in the name of divine order. Both things are true.' },
		{ term: 'Shadowhand', category: 'Factions', definition: 'A clandestine civil service that maintains democracy and liberty by any means necessary. They leave no trace. They only intervene when collapse is imminent.' },
		{ term: 'Faction Score', category: 'Factions', definition: 'Your standing with a faction, earned through quests, NPC interactions, and events. Higher score unlocks better rewards and new faction content.' },
		{ term: 'Faction Rank', category: 'Factions', definition: 'A tiered status within a faction, upgraded at score thresholds. Gaining rank with one faction may penalize the other.' },
	];

	const categories = [...new Set(entries.map((e) => e.category))];

	$: filteredEntries = entries.filter((e) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q);
	});

	$: groupedEntries = categories
		.map((cat) => ({
			category: cat,
			entries: filteredEntries.filter((e) => e.category === cat)
		}))
		.filter((g) => g.entries.length > 0);

	$: noResults = searchQuery.trim().length > 0 && filteredEntries.length === 0;
</script>

<div class="glossary-wrap">
	<div class="gloss-header">
		<p class="gloss-eyebrow">Dawn's Journey</p>
		<h2 class="gloss-title">Glossary</h2>
		<p class="gloss-sub">Terms, systems, and mechanics defined.</p>
		<div class="rule"></div>

		<div class="search-wrap">
			<span class="search-icon">⌕</span>
			<input
				class="search-input"
				type="text"
				placeholder="Search terms…"
				autocomplete="off"
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="search-clear" on:click={() => (searchQuery = '')}>✕</button>
			{/if}
		</div>
	</div>

	{#each groupedEntries as group (group.category)}
		<div class="gloss-section">
			<div class="section-head">
				<span class="section-label">{group.category}</span>
				<div class="section-line"></div>
			</div>

			<div class="entry-list">
				{#each group.entries as entry}
					<div class="gloss-entry">
						<div class="entry-term">{entry.term}</div>
						<div class="entry-def">{entry.definition}</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if noResults}
		<div class="no-results">No terms match "{searchQuery}".</div>
	{/if}
</div>

<style>
	.glossary-wrap {
		max-width: 760px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.gloss-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.gloss-eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.gloss-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.gloss-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto 1.5rem;
	}

	/* ── Search ── */
	.search-wrap {
		position: relative;
		max-width: 360px;
		margin: 0 auto;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: #5a3a18;
		font-size: 1rem;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		background: #1a1208;
		border: 2px solid #3d2810;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.5rem 2rem 0.5rem 2rem;
		color: #e8d4a8;
		font-family: var(--font-family-pixel, 'Silkscreen', monospace);
		font-size: 0.65rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus {
		border-color: #7a5020;
	}

	.search-input::placeholder {
		color: #3d2810;
	}

	.search-clear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #5a3a18;
		cursor: pointer;
		font-size: 0.65rem;
		padding: 2px;
	}
	.search-clear:hover {
		color: #c8a878;
	}

	/* ── Sections ── */
	.gloss-section {
		margin-bottom: 2rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 0.6rem;
	}

	.section-label {
		font-size: 0.55rem;
		letter-spacing: 4px;
		color: #7a5a20;
		text-transform: uppercase;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: rgba(92, 61, 30, 0.35);
	}

	/* ── Entries ── */
	.entry-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.gloss-entry {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 1rem;
		background: #1a1208;
		border: 2px solid #2a1808;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 6px;
		padding: 0.6rem 0.85rem;
		transition: border-color 0.12s;
	}

	.gloss-entry:hover {
		border-color: #3d2810;
	}

	.entry-term {
		font-size: 0.65rem;
		letter-spacing: 0.04em;
		color: #c9973a;
		text-transform: uppercase;
		align-self: start;
		padding-top: 1px;
		line-height: 1.35;
	}

	.entry-def {
		font-size: 0.7rem;
		color: #7a5a38;
		line-height: 1.55;
		font-style: italic;
	}

	/* ── No results ── */
	.no-results {
		text-align: center;
		padding: 2.5rem;
		color: #3d2810;
		font-style: italic;
		font-size: 0.75rem;
	}

	@media (max-width: 500px) {
		.gloss-entry {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
		.entry-term {
			color: #e8b96a;
		}
	}
</style>