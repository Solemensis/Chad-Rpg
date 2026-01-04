<script lang="ts">
	import { game } from '../../stores'
	import { character } from '../../stores'
	import { ui } from '../../stores'
	import { selectedItem } from '../../stores'

	import { fade } from 'svelte/transition'

	function buyItem(item: any) {
		$selectedItem = {}
		if ($character.gold < item.price) return ($ui.errorWarnMsg = 'Not enough gold.')

		$character.gold -= item.price
		if (item.type == 'weapon' || item.type == 'potion') {
			$character.inventory.push(item)
			$character.inventory = $character.inventory

			let newArray: any = $game.gameData.shop.filter((shopItem: any) => shopItem != item)
			$game.gameData.shop = newArray
			// return $ui.errorWarnMsg='Buyout succesful!'
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			$character.spells.push(item)
			$character.spells = $character.spells

			let newArray: any = $game.gameData.shop.filter((shopItem: any) => shopItem != item)
			$game.gameData.shop = newArray
			// return $ui.errorWarnMsg='Buyout succesful!'
		}
	}

	function sellItem(item: any) {
		$selectedItem = {}
		if (!$game.gameData.event.shopMode) return

		if (!item.price) {
			let newArray: any = $character.inventory.filter((obj: any) => obj.name !== item.name)
			$character.inventory = newArray
		}

		$character.gold += item.price

		if (!item.element) {
			let newArray: any = $character.inventory.filter((obj: any) => obj.name !== item.name)
			$character.inventory = newArray
		} else {
			let newArray: any = $character.spells.filter((obj: any) => obj.name !== item.name)
			$character.spells = newArray
		}

		//hide the description window after selling item
		$selectedItem.showDescription = 'none'
	}
</script>

<!-- ingame notification window (out of ui) -->
{#if $ui.errorWarnMsg}
	<div transition:fade={{ duration: 200 }} class="notification-window">
		<p>
			{$ui.errorWarnMsg}
		</p>
		<button on:click={() => ($ui.errorWarnMsg = '')}>Got it</button>
	</div>
{/if}
<!-- ingame notification window ends here -->

<!-- askbuy window (out of ui) -->
{#if $ui.buyWarnMsg}
	<div transition:fade={{ duration: 200 }} class="notification-window">
		<p>
			{$ui.buyWarnMsg}
		</p>
		<div class="dual-button">
			<button
				on:click={() => {
					buyItem($selectedItem)
					$ui.buyWarnMsg = ''
				}}>Yes</button
			>
			<button on:click={() => ($ui.buyWarnMsg = '')}>No</button>
		</div>
	</div>
{/if}
<!-- askbuy window -->

<!-- asksell window (out of ui) -->
{#if $ui.sellWarnMsg}
	<div transition:fade={{ duration: 200 }} class="notification-window">
		<p>
			{$ui.sellWarnMsg}
		</p>
		<div class="dual-button">
			<button
				on:click={() => {
					sellItem($selectedItem)
					$ui.sellWarnMsg = ''
				}}>Yes</button
			>
			<button on:click={() => ($ui.sellWarnMsg = '')}>No</button>
		</div>
	</div>
{/if}

<!-- asksell window -->
<style>
	.notification-window {
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		padding: var(--space-xl) var(--space-xxl, 3rem);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.5);
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--space-lg);
		z-index: 999;
		min-width: 280px;
		max-width: 90vw;
	}

	.notification-window p {
		color: var(--color-text-primary);
		font-size: 1.1rem;
		font-weight: 400;
		margin: 0;
		line-height: 1.5;
	}

	.notification-window button {
		background: var(--color-bg-card);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-xl);
		color: var(--color-text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 100px;
	}

	.notification-window button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.dual-button {
		display: flex;
		justify-content: center;
		gap: var(--space-md);
	}

	.dual-button button:nth-child(1) {
		background: linear-gradient(135deg, rgba(63, 207, 142, 0.2), rgba(63, 207, 142, 0.1));
		border-color: var(--color-accent-secondary);
		color: var(--color-accent-secondary);
	}

	.dual-button button:nth-child(1):hover {
		background: linear-gradient(135deg, rgba(63, 207, 142, 0.3), rgba(63, 207, 142, 0.15));
		box-shadow: 0 0 12px rgba(63, 207, 142, 0.3);
	}

	.dual-button button:nth-child(2) {
		background: linear-gradient(135deg, rgba(224, 92, 124, 0.2), rgba(224, 92, 124, 0.1));
		border-color: var(--color-accent-hp);
		color: var(--color-accent-hp);
	}

	.dual-button button:nth-child(2):hover {
		background: linear-gradient(135deg, rgba(224, 92, 124, 0.3), rgba(224, 92, 124, 0.15));
		box-shadow: 0 0 12px rgba(224, 92, 124, 0.3);
	}

	@media (max-width: 480px) {
		.notification-window {
			padding: var(--space-lg) var(--space-md);
			min-width: 240px;
		}

		.notification-window p {
			font-size: 0.95rem;
		}

		.notification-window button {
			padding: var(--space-sm) var(--space-md);
			font-size: 0.85rem;
		}
	}
</style>
