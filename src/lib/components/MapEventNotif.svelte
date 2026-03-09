<script lang="ts">
	/**
	 * MapEventNotif.svelte
	 *
	 * Tight in-map notifications for non-item events:
	 * XP gained, level up, buff applied/expired.
	 *
	 * Designed to sit top-right inside the map canvas.
	 * One icon + one piece of text per entry. That's it.
	 *
	 * Place in MapHUD alongside NewItemNotif:
	 *   <MapEventNotif />  (in the top-right div)
	 */
	import { notificationStore } from '$lib/stores/notificationStore';
	import { fly } from 'svelte/transition';

	const skillIcons: Record<string, string> = {
		woodcutting: 'woodcutting.png',
		mining:      'mining.png',
		smithing:    'smithing.png',
		farming:     'farming.png',
		cooking:     'cooking.png',
		alchemy:     'alchemy.png',
	};

	function icon(n: any): string {
		if (n.type === 'xp_gained')    return `/game_icons/${skillIcons[n.skill?.toLowerCase()] ?? 'player_level.png'}`;
		if (n.type === 'level_up')     return `/game_icons/${skillIcons[n.skill?.toLowerCase()] ?? 'player_level.png'}`;
		if (n.type === 'buff_applied') return '/game_icons/buff_applied.png';
		if (n.type === 'buff_expired') return '/game_icons/buff_expired.png';
		return '/game_icons/player_level.png';
	}

	function label(n: any): string {
		if (n.type === 'xp_gained') return `+${n.amount} ${n.skill ?? 'XP'}`;
		if (n.type === 'level_up')  return `${n.skill ?? 'Player'} Lv.${n.level}`;
		if (n.type === 'buff_applied') return n.buffName;
		if (n.type === 'buff_expired') return n.buffName;
		return '';
	}

	function accent(n: any): string {
		if (n.type === 'xp_gained')    return '#90a955';
		if (n.type === 'level_up')     return '#facc15';
		if (n.type === 'buff_applied') return '#48cae4';
		if (n.type === 'buff_expired') return '#666';
		return '#888';
	}
</script>

<div class="map-event-notif">
	{#each $notificationStore as n (n.id)}
		{#if n.type === 'xp_gained' || n.type === 'level_up' || n.type === 'buff_applied' || n.type === 'buff_expired'}
			<div
				class="entry"
				class:is-level-up={n.type === 'level_up'}
				style="color: {accent(n)}; border-left-color: {accent(n)}"
				in:fly={{ x: 16, duration: 200 }}
				out:fly={{ x: 16, duration: 150 }}
			>
				<img src={icon(n)} alt="" class="entry-icon" class:glow={n.type === 'level_up'} />
				<span class="entry-label">{label(n)}</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.map-event-notif {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		pointer-events: none;
		position: absolute;
		top: 3.5rem;
		right: 0.5rem;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.55);
		border-left: 2px solid #888;
		border-radius: 0 4px 4px 0;
		padding: 2px 6px 2px 4px;
		backdrop-filter: blur(2px);
	}

	/* Level up gets a touch more breathing room */
	.entry.is-level-up {
		padding: 3px 8px 3px 5px;
		background: rgba(0, 0, 0, 0.7);
	}

	.entry-icon {
		width: 10px;
		height: 10px;
		object-fit: contain;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.glow {
		filter: drop-shadow(0 0 3px #facc15cc);
		width: 12px;
		height: 12px;
	}

	.entry-label {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.75rem;
		white-space: nowrap;
		letter-spacing: 0.04em;
	}
</style>