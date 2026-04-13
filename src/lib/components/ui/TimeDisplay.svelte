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
		position: relative;
		/* background-color: #4f2475; */
		padding: 0.25em;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 4px;
		cursor: pointer;
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 3px;
	}
	.time-display:hover {
		/* background-color: #ffffff; */
		/* border-color: #777; */
	}
	img {
		margin-block: 2px;
		width: 20px;
		height: 20px;
		display: block;
	}
	.dawnrise img {
		filter: brightness(0) saturate(100%) invert(74%) sepia(89%) saturate(335%) hue-rotate(359deg)
			brightness(104%) contrast(95%);
            &:hover {
              filter: invert(1);  
            }
	}
	.duskfall img {
		filter: brightness(0) saturate(100%) invert(62%) sepia(83%) saturate(1426%) hue-rotate(219deg)
			brightness(97%) contrast(83%);
            &:hover {
              filter: invert(1);  
            }
	}
</style>
