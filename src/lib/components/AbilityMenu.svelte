<script lang="ts">
	import { combatStore } from '$lib/stores/combatStore';
	import { executePlayerAbility } from '$lib/services/CombatService';
	import AbilityTag from './ui/AbilityTag.svelte';

	$: abilities    = $combatStore.player?.abilities ?? [];
	$: activeElement = $combatStore.player?.activeElement;
	$: isPlayerTurn  = $combatStore.turnPhase === 'player_selecting';
</script>

<div class="ability-menu">
	<ul>
		{#each abilities as ability (ability.id)}
			<li>
				<AbilityTag
					{ability}
					{activeElement}
					interactive
					disabled={!isPlayerTurn}
					onClick={() => executePlayerAbility(ability.id)}
				/>
			</li>
		{/each}
	</ul>
</div>

<style>
	.ability-menu {
		display: flex;
		flex-direction: column;
		height: 150px;
		overflow-y: auto;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.4rem;
		align-content: start;
	}
</style>