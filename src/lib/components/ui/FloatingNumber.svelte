<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	export let amount: number;
	export let type: 'damage' | 'heal' | 'crit';
	export let damageType: 'physical' | 'elemental' | undefined = undefined;
	export let offsetIndex: number = 0; // For stacking multiple numbers vertically

	let visible = true;

	$: color = type === 'heal' ? '#5dbb63' 
	           : type === 'crit' ? '#FFD700'
	           : damageType === 'physical' ? '#4895EF'
	           : '#FF6347';

	$: displayText = type === 'crit' ? `★ ${amount}` 
	                 : type === 'heal' ? `+${amount}`
	                 : `−${amount}`;

	onMount(() => {
		const timer = setTimeout(() => {
			visible = false;
		}, 1200);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div 
		class="floating-number" 
		class:crit={type === 'crit'}
		style="--color: {color}; --offset: {offsetIndex * 25}px"
		in:fly={{ y: 0, duration: 100 }}
		out:fade={{ duration: 400 }}
	>
		{displayText}
	</div>
{/if}

<style>
	.floating-number {
		position: absolute;
		top: calc(50% + var(--offset, 0px));
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: var(--font-family-pixel, monospace);
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--color, #fff);
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
		pointer-events: none;
		z-index: 100;
		animation: float-up 1.2s ease-out forwards;
	}

	.floating-number.crit {
		font-size: 1.5rem;
		text-shadow: 
			0 0 10px rgba(255, 215, 0, 0.8),
			2px 2px 4px rgba(0, 0, 0, 0.9);
	}

	@keyframes float-up {
		0% {
			transform: translate(-50%, -50%);
			opacity: 1;
		}
		70% {
			transform: translate(-50%, -80px);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -100px);
			opacity: 0;
		}
	}
</style>