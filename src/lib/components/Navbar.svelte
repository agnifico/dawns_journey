<script lang="ts">
	import { goto } from '$app/navigation';
	import * as SaveLoadService from '$lib/services/SaveLoadService';
	import TimeDisplay from './ui/TimeDisplay.svelte';
	import { playerStats } from '$lib/stores/playerStore';
	import StatBar from './ui/StatBar.svelte';

	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function navigate(path: string) {
		goto(path);
		menuOpen = false;
	}
</script>

<!-- Close menu when clicking outside -->
{#if menuOpen}
	<div class="backdrop" on:click={() => (menuOpen = false)} role="presentation"></div>
{/if}

<nav class="navbar">
	<div class="navbar-left">
		<!-- <a href="/" class="brand">Dawn's Journey</a> -->
		<a href="/">
			<img class="logo" src="/dawns_journey_logo_v2.svg" alt="" srcset="" />
		</a>
		<!-- <div class="nav-stat-bars">
            <StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
            <StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#a98467" />
        </div> -->
	</div>

	<div class="navbar-right desktop-only">
		<!-- Page Links -->
		<button class="icon-button" on:click={() => goto('/map')} title="Map">
			<img src="/game_icons/map.png" alt="Map" />
		</button>
		<button class="icon-button" on:click={() => goto('/inventory')} title="Inventory">
			<img src="/game_icons/inventory.png" alt="Inventory" />
		</button>
		<button class="icon-button" on:click={() => goto('/journal')} title="Journal">
			<img src="/game_icons/journal.png" alt="Journal" />
		</button>
		<button class="icon-button" on:click={() => goto('/help')} title="Help">
			<img src="/game_icons/help.png" alt="Help" />
		</button>
		<button class="icon-button" on:click={() => goto('/shop')} title="Shop">
			<img src="/game_icons/shop.png" alt="Shop" />
		</button>
		<button class="icon-button" on:click={() => goto('/homestead/farming')} title="Farming">
			<img src="/game_icons/homestead.png" alt="Farming" />
		</button>
		<button class="icon-button" on:click={() => goto('/arena')} title="Arena">
			<img src="/game_icons/arena_helmet.png" alt="Arena" />
		</button>
		<button class="icon-button" on:click={() => goto('/homestead/workshop')} title="Crafting">
			<img src="/game_icons/crafting_gloves.png" alt="Crafting" />
		</button>
		<button class="icon-button" on:click={() => goto('/settings')} title="Settings">
			<img src="/game_icons/settings.png" alt="Settings" />
		</button>
		<button class="icon-button" on:click={() => goto('/secret')}>
			<img src="/game_icons/black_flag.png" alt="Vault" />
		</button>

		<TimeDisplay />

		<div class="divider"></div>

		<!-- Game Actions -->
		<button class="icon-button" on:click={SaveLoadService.saveGame} title="Save Game">
			<img src="/game_icons/save.png" alt="Save" />
		</button>
		<button class="icon-button" on:click={SaveLoadService.loadGame} title="Load Game">
			<img src="/game_icons/load.png" alt="Load" />
		</button>
		<button class="icon-button danger" on:click={SaveLoadService.clearSave} title="Delete Save">
			<img src="/game_icons/cancel.png" alt="Delete" />
		</button>
	</div>

	<!-- Hamburger button (mobile only) -->
	<button
		class="hamburger mobile-only"
		on:click={toggleMenu}
		aria-label="Toggle menu"
		aria-expanded={menuOpen}
	>
		<span class="bar" class:open={menuOpen}></span>
		<span class="bar" class:open={menuOpen}></span>
		<span class="bar" class:open={menuOpen}></span>
	</button>
</nav>

<!-- Mobile Drawer -->
<div class="mobile-menu mobile-only" class:open={menuOpen}>
	<div class="mobile-menu-section">
		<p class="section-label">Navigate</p>
		<div class="mobile-icon-grid">
			<button class="icon-button" on:click={() => navigate('/map')} title="Map">
				<img src="/game_icons/map.png" alt="Map" />
				<span>Map</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/inventory')} title="Inventory">
				<img src="/game_icons/inventory.png" alt="Inventory" />
				<span>Inventory</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/journal')} title="Journal">
				<img src="/game_icons/journal.png" alt="Journal" />
				<span>Journal</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/help')} title="Help">
				<img src="/game_icons/help.png" alt="Help" />
				<span>Help</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/shop')} title="Shop">
				<img src="/game_icons/shop.png" alt="Shop" />
				<span>Shop</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/homestead/farming')} title="Farming">
				<img src="/game_icons/homestead.png" alt="Farming" />
				<span>Farming</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/arena')} title="Arena">
				<img src="/game_icons/arena_helmet.png" alt="Arena" />
				<span>Arena</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/homestead/workshop')} title="Crafting">
				<img src="/game_icons/crafting_gloves.png" alt="Crafting" />
				<span>Crafting</span>
			</button>
			<button class="icon-button" on:click={() => navigate('/settings')} title="Settings">
				<img src="/game_icons/settings.png" alt="Settings" />
				<span>Settings</span>
			</button>
		</div>
	</div>

	<div class="mobile-divider"></div>

	<div class="mobile-menu-section">
		<p class="section-label">Game</p>
		<div class="mobile-time">
			<TimeDisplay />
		</div>
		<div class="mobile-icon-grid">
			<button
				class="icon-button"
				on:click={() => {
					SaveLoadService.saveGame();
					menuOpen = false;
				}}
				title="Save Game"
			>
				<img src="/game_icons/save.png" alt="Save" />
				<span>Save</span>
			</button>
			<button
				class="icon-button"
				on:click={() => {
					SaveLoadService.loadGame();
					menuOpen = false;
				}}
				title="Load Game"
			>
				<img src="/game_icons/load.png" alt="Load" />
				<span>Load</span>
			</button>
			<button
				class="icon-button danger"
				on:click={() => {
					SaveLoadService.clearSave();
					menuOpen = false;
				}}
				title="Delete Save"
			>
				<img src="/game_icons/cancel.png" alt="Delete" />
				<span>Delete</span>
			</button>
			<button class="icon-button" on:click={() => goto('/secret')}>
				<img src="/game_icons/black_flag.png" alt="Vault" />
				<span>Vault</span>
			</button>
		</div>
	</div>
</div>

<style>
	.navbar {
		position: absolute;
		inset: 0;
		height: 50px;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--color-secondary);
		padding: 1rem 1rem;
		color: white;
		border-bottom: 4px solid #00000056;
		z-index: 100;
	}

	.logo {
		/* width: 100%; */
		height: 30px;
		padding-block: 0.25rem;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.navbar-left .brand {
		color: white;
		text-decoration: none;
		/* font-weight: bold; */
		font-family: 'Silkscreen';
		font-size: 1.2em;
		white-space: nowrap;
	}

	.nav-stat-bars {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.navbar-right {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.icon-button {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		background-color: rgba(0, 0, 0, 0.549);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-button:hover {
		filter: brightness(1.2);
	}

	.icon-button:hover img {
		scale: 1.1;
	}

	.icon-button.danger:hover {
		background-color: #c53030;
	}

	.icon-button img {
		width: 24px;
		height: 24px;
		display: block;
	}

	.divider {
		width: 2px;
		height: 32px;
		background-color: #444;
		margin: 0 0.5em;
	}

	/* Hamburger button */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		background-color: rgba(0, 0, 0, 0.549);
	}

	.bar {
		display: block;
		width: 22px;
		height: 2px;
		background-color: white;
		border-radius: 2px;
		transition:
			transform 0.25s ease,
			opacity 0.25s ease;
		transform-origin: center;
	}

	/* Animate to X when open */
	.hamburger .bar:nth-child(1).open {
		transform: translateY(7px) rotate(45deg);
	}
	.hamburger .bar:nth-child(2).open {
		opacity: 0;
		transform: scaleX(0);
	}
	.hamburger .bar:nth-child(3).open {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Mobile drawer */
	.mobile-menu {
		position: fixed;
		top: 50px; /* just below navbar */
		right: 0;
		width: fit-content;
		background-color: var(--color-secondary);
		border-left: 3px solid #00000056;
		border-bottom: 3px solid #00000056;
		border-radius: 0 0 0 10px;
		padding: 1rem;
		z-index: 99;
		display: none;
		flex-direction: column;
		gap: 0.75rem;
		transform: translateX(100%);
		transition: transform 0.25s ease;
		box-shadow: -4px 4px 20px rgba(0, 0, 0, 0.5);
	}

	.mobile-menu.open {
		transform: translateX(0);
	}

	.section-label {
		margin: 0 0 0.4rem 0;
		font-size: 0.7em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #aaa;
	}

	.mobile-icon-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}

	.mobile-icon-grid .icon-button {
		flex-direction: column;
		gap: 4px;
		padding: 6px 4px;
		font-size: 0.6em;
		color: white;
	}

	.mobile-icon-grid .icon-button span {
		font-size: 0.75rem;
		color: #ccc;
	}

	.mobile-divider {
		height: 1px;
		background-color: #444;
		margin: 0.25rem 0;
	}

	.mobile-time {
		margin-bottom: 0.5rem;
	}

	/* Backdrop */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 98;
	}

	/* Responsive visibility */
	.mobile-only {
		display: none;
	}

	@media (max-width: 768px) {
		.desktop-only {
			display: none;
		}

		.mobile-only {
			display: flex;
		}

		.mobile-menu {
			display: flex;
		}

		.navbar-left .brand {
			font-size: 1em;
		}

		/* Optionally hide stat bars on very small screens */
		@media (max-width: 420px) {
			.nav-stat-bars {
				display: none;
			}
		}
	}
</style>
