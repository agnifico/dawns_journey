<script lang="ts">
	import { phase, formattedTime } from '$lib/stores/timeStore';
	import Tooltip from './Tooltip.svelte';
</script>

<Tooltip text={$formattedTime} direction="down">
	{#if $phase === 'Dawnrise'}
		<div class="time-display dawnrise">
			<img src="/game_icons/sun.svg" alt="Dawnrise" />
		</div>
	{:else}
		<div class="time-display duskfall">
			<img src="/game_icons/moon.svg" alt="Duskfall" />
		</div>
	{/if}
</Tooltip>

<style>
	.time-display {
		/* background-color: #4f2475; */
		padding: 0.25em;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: help;
	}
	.time-display:hover {
		background-color: #ffffff;
		/* border-color: #777; */
	}
	img {
		width: 24px;
		height: 24px;
		display: block;
	}
	.dawnrise {
		filter: brightness(0) saturate(100%) invert(74%) sepia(89%) saturate(335%) hue-rotate(359deg)
			brightness(104%) contrast(95%);
	}
	.duskfall {
		filter: brightness(0) saturate(100%) invert(62%) sepia(83%) saturate(1426%) hue-rotate(219deg)
			brightness(97%) contrast(83%);
	}
</style>
