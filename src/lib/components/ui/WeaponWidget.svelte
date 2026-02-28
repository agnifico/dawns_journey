<script lang="ts">
	import { playerStore } from '$lib/stores/playerStore';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import ItemBox from '../ItemBox.svelte';

	let showDetails = false;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="weapons-widget"
	on:mouseleave={() => (showDetails = false)}
	on:mouseenter={() => (showDetails = true)}
>
	{#each $playerStore.equipment.weapon_slots as item}
		{#if item}
			<ItemBox {item} viewSize="small" hoverEnabled={true}/>
		{/if}
	{/each}
</div>

<style>
	.weapons-widget {
		display: flex;
		position: relative;
	}
	img {
		position: relative;
		width: 32px;
		height: 32px;
		padding: 6px;
		border-radius: 0px;
		&:last-of-type {
			border-radius: 0 9px 9px 0;
		}
		&:first-of-type {
			border-radius: 9px 0 0 9px;
		}
	}
	img:hover {
		background-color: #222;
	}
</style>
