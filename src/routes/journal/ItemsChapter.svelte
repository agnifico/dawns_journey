<script lang="ts">
	// Future: import inventoryStore or a static items data file
	// and render a filterable grid — weapons, relics, consumables, currencies
</script>

<div class="stub-wrap">
	<div class="stub-header">
		<p class="stub-eyebrow">Dawn's Journey</p>
		<h2 class="stub-title">Items</h2>
		<p class="stub-sub">Weapons, relics, consumables, and curiosities of Ashenfall.</p>
		<div class="rule"></div>
	</div>

	<div class="empty-state">
		<span class="empty-icon">📦</span>
		<p class="empty-title">Items compendium coming soon</p>
		<p class="empty-body">
			A browsable catalogue of every weapon, relic, and item in the game.<br />
			Check back once you've started collecting.
		</p>
	</div>
</div>

<style>
	.stub-wrap {
		max-width: 900px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.stub-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.stub-eyebrow {
		font-size: 0.55rem;
		letter-spacing: 5px;
		color: #7a5a20;
		text-transform: uppercase;
		margin: 0 0 0.4rem;
	}

	.stub-title {
		font-size: 1.6rem;
		color: #e8b96a;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}

	.stub-sub {
		color: #5a3a18;
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0 0.8rem;
	}

	.rule {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #7a5a20, transparent);
		margin: 0 auto;
	}

	/* ── Empty state ── */
	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
	}

	.empty-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 1rem;
		opacity: 0.2;
	}

	.empty-title {
		font-size: 0.65rem;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #5a3a18;
		margin: 0 0 0.6rem;
	}

	.empty-body {
		font-size: 0.72rem;
		color: #3d2810;
		font-style: italic;
		line-height: 1.7;
		margin: 0;
	}
</style>