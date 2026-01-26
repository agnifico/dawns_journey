<script lang="ts">
	import { onMount } from 'svelte';

	export let rainLevel = 0;

	let frontRow: HTMLElement;
	let backRow: HTMLElement;

	function makeItRain() {
		if (!frontRow || !backRow) return;

		frontRow.innerHTML = '';
		backRow.innerHTML = '';

		let increment = 0;
		let drops = '';
		let backDrops = '';

		while (increment < 100) {
			const randoHundo = Math.floor(Math.random() * 98) + 1;
			const randoFiver = Math.floor(Math.random() * 4) + 2;
			increment += randoFiver;

			const animationDelay = `0.${randoHundo}s`;
			const animationDuration = `0.5${randoHundo}s`;

			drops += `<div class="drop" style="left: ${increment}%; bottom: ${randoFiver + randoFiver - 1 + 100}%; animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"><div class="stem" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div><div class="splat" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div></div>`;
			backDrops += `<div class="drop" style="right: ${increment}%; bottom: ${randoFiver + randoFiver - 1 + 100}%; animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"><div class="stem" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div><div class="splat" style="animation-delay: ${animationDelay}; animation-duration: ${animationDuration};"></div></div>`;
		}

		frontRow.innerHTML = drops;
		backRow.innerHTML = backDrops;
	}

	$: {
		if (rainLevel > 0) {
			makeItRain();
		} else {
			if (frontRow) {
				frontRow.innerHTML = '';
			}
			if (backRow) {
				backRow.innerHTML = '';
			}
		}
	}
</script>

{#if rainLevel > 0}
	<div class="rain-container rain-level-{rainLevel}">
		<div class="rain front-row" bind:this={frontRow}></div>
		<div class="rain back-row" bind:this={backRow}></div>
	</div>
{/if}

<style>
	.rain-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		pointer-events: none;
		transition: all 0.1s linear;
        background-color: none;
	}

	.rain-level-2 {
		background-color: rgba(37, 43, 46, 0.2);
	}

	.rain-level-3 {
		background-color: rgba(37, 43, 46, 0.5);
	}

	.rain-level-4 {
		background-color: rgba(37, 43, 46, 0.5);
	}

	.rain {
		position: absolute;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.rain-level-1 .rain {
		transform: rotateZ(-5deg);
	}

    .rain-level-2 .rain {
		transform: rotateZ(-5deg);
	}

	.rain-level-3 .rain {
		transform: rotateZ(-30deg);
	}

	.rain-level-4 .rain {
		backdrop-filter: blur(1px);
		transform: rotateZ(-30deg);
	}

	.rain.back-row {
		display: block;
		z-index: 1;
		bottom: 60px;
		opacity: 0.5;
	}

	:global(.drop) {
		position: absolute;
		bottom: 100%;
		width: 15px;
		height: 120px;
		pointer-events: none;
		animation: drop 0.5s linear infinite;
	}

	@keyframes drop {
		0% {
			transform: translateY(0vh);
		}
		75% {
			transform: translateY(110vh);
		}
		100% {
			transform: translateY(110vh);
		}
	}

	:global(.stem) {
		width: 2px;
		height: 60%;
		margin-left: 7px;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25));
		animation: stem 0.5s linear infinite;
	}

	@keyframes stem {
		0% {
			opacity: 1;
		}
		65% {
			opacity: 1;
		}
		75% {
			opacity: 0;
		}
		100% {
			opacity: 0;
		}
	}

	:global(.splat) {
		width: 15px;
		height: 10px;
		border-top: 2px dotted rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		opacity: 1;
		transform: scale(0);
		animation: splat 0.5s linear infinite;
		display: block;
	}

	@keyframes splat {
		0% {
			opacity: 1;
			transform: scale(0);
		}
		80% {
			opacity: 1;
			transform: scale(0);
		}
		90% {
			opacity: 0.5;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.5);
		}
	}
</style>
