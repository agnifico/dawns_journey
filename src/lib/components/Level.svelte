<script lang="ts">
	export let level: number;
	export let currentXp: number;
	export let maxXp: number;
	export let icon: string = '/game_icons/player_level.png';

	$: pct = maxXp > 0 ? Math.min(100, Math.max(0, (currentXp / maxXp) * 100)) : 0;
</script>

<div class="player-level">
	<img src={icon} alt="Level" class="lv-icon" />
	<div class="lv-body">
		<div class="lv-header">
			<span class="lv-label">Level</span>
			<span class="lv-value">Lv. {level}</span>
		</div>
		<div class="lv-track">
			<div class="lv-fill" style="width: {pct}%"></div>
		</div>
		<span class="lv-xp">{currentXp} / {maxXp} XP</span>
	</div>
</div>

<style>
	.player-level {
        width: 100%;
        /* margin-bottom: 1rem; */
		display: flex;
		align-items: center;
        box-sizing: border-box;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 8px;
		background: rgba(46, 46, 46, 0.658);
		border: 1px solid rgba(196, 154, 54, 0.602);
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			#00000056 -60px -20px 40px 0px inset,
			#00000056 -100px -20px 40px 0px inset;
		box-shadow: #00000056 0 6px 0 3px;
	}

	.lv-icon {
		width:  24px;
		height: 24px;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.lv-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.lv-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.lv-label {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		/* font-weight: 600; */
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #b3a183;
		color: rgba(214, 209, 183, 0.787);
        /* margin-right: 3rem; */
	}

	.lv-value {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted, #c8a96e);
	}

	.lv-track {
		height: 5px;
		background: #0a0a0a;
		border-radius: 3px;
		overflow: hidden;
		border: 1px solid #000;
		box-shadow: #00000056 0 -1px 0 0 inset;
	}

	.lv-fill {
		height: 100%;
		background: linear-gradient(90deg, #c8a96e, #e8c880);
		border-radius: 2px;
		transition: width 0.4s ease-in-out;
	}

	.lv-xp {
		font-family: var(--font-family-pixel);
		font-size: 0.45rem;
		color: var(--text-muted, #5a5040);
		letter-spacing: 0.06em;
	}
</style>
