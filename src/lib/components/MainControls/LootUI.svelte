<script lang="ts">
	import { game } from '../../../stores'
	import { misc } from '../../../stores'
	import { descWindow } from '../../../stores'
	import { character } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function handleMouseMove(event: any, item: any) {
		$misc.showDescription = 'block'
		$misc.x = event.clientX + 10
		$misc.y = event.clientY - 40

		// for (let key in $descWindow) {
		//     $descWindow[key] = undefined
		// 					}

		$descWindow.name = item && item.name ? item.name : undefined
		$descWindow.damage = item && item.damage ? item.damage : undefined
		$descWindow.type = item && item.type ? item.type : undefined
		$descWindow.healing = item && item.healing ? item.healing : undefined
		$descWindow.mana = item && item.mana ? item.mana : undefined
		$descWindow.point = item && item.point ? item.point : undefined
		$descWindow.armor = item && item.armor ? item.armor : undefined
		$descWindow.element = item && item.element ? item.element : undefined
		$descWindow.weaponClass = item && item.weaponClass ? item.weaponClass : undefined
		$descWindow.manaCost = item && item.manaCost ? item.manaCost : undefined
		$descWindow.price = item && item.price ? item.price : undefined
		$descWindow.amount = item && item.amount ? item.amount : undefined
	}

	function hideWindow() {
		$misc.showDescription = 'none'
	}

	function lootItem(item: any) {
		if (item.type == 'weapon' || item.type == 'potion') {
			$character.inventory.push(item)
			$character.inventory = $character.inventory
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			$character.spells.push(item)
			$character.spells = $character.spells
		} else if (item.type == 'currency') {
			$character.gold += parseInt(item.amount)
		} else {
			$character.inventory.push(item)
			$character.inventory = $character.inventory
		}

		let newArray: any = $game.gameData.lootBox.filter(
			(lootItem: any) => lootItem.name !== item.name
		)
		$game.gameData.lootBox = newArray

		if (!$game.gameData.lootBox?.length) {
			emitAnswer("I'll loot it all (clear the gameData.lootBox array in your next response!)")
			$game.gameData.event.lootMode = false
		}

		hideWindow()
	}
	function lootAll() {
		$game.gameData.lootBox.forEach((item: any) => {
			if (item.type == 'weapon' || item.type == 'potion') {
				$character.inventory.push(item)
				$character.inventory = $character.inventory
			} else if (
				item.type == 'destruction spell' ||
				item.type == 'healing spell' ||
				item.type == 'unique spell'
			) {
				$character.spells.push(item)
				$character.spells = $character.spells
			} else if (item.type == 'currency') {
				$character.gold += parseInt(item.amount)
			} else {
				$character.inventory.push(item)
				$character.inventory = $character.inventory
			}
		})

		$game.gameData.lootBox = []

		if (!$game.gameData.lootBox?.length) {
			emitAnswer(
				"I've looted all. What should i do now..? (clear the gameData.lootBox array in your next response!)"
			)
			$game.gameData.event.lootMode = false
		}
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

<!-- loot ui-->
<div class="loot-panel" transition:fade={{ duration: 400 }}>
	<!-- Loot Header -->
	<div class="loot-header">
		<span class="loot-icon">💰</span>
		<h3>
			You're <span class="loot-accent">looting</span>
		</h3>
	</div>

	<!-- Loot Items Grid -->
	{#if !$game.gameData.lootBox?.length}
		<p class="empty-loot">No loot available</p>
	{:else}
		<div class="loot-items">
			{#each $game.gameData.lootBox as item, i}
				<button
					class="loot-item-btn"
					disabled={$misc.loading}
					on:click={() => lootItem(item)}
					on:mouseenter={(event) => handleMouseMove(event, item)}
					on:mousemove={(event) => handleMouseMove(event, item)}
					on:mouseleave={hideWindow}
					in:fade={{ duration: 200, delay: i * 50 }}
				>
					{#if item.type == 'weapon'}
						<img class="item-icon" src="images/{item.weaponClass}.svg" alt={item.name} />
					{:else if item.element}
						<img class="item-icon" src="images/{item.element}.svg" alt={item.name} />
					{:else if item.type == 'potion' || item.type == 'currency'}
						<img class="item-icon" src="images/{item.type}.svg" alt={item.name} />
					{:else}
						<img class="item-icon" src="images/item.svg" alt={item.name} />
					{/if}
				</button>
			{/each}

			<button class="loot-all-btn" disabled={$misc.loading} on:click={() => lootAll()}>
				Loot All
			</button>
		</div>
	{/if}
</div>

<!-- loot ui ends here -->
<style>
	.loot-panel {
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg) var(--space-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	.loot-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.loot-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 400;
		color: var(--color-text-primary);
	}

	.loot-icon {
		font-size: 1.2rem;
	}

	.loot-accent {
		color: var(--color-accent-secondary);
		font-weight: 500;
	}

	.loot-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		justify-content: center;
		align-items: center;
	}

	.loot-item-btn {
		width: 60px;
		height: 60px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		position: relative;
	}

	.loot-item-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-accent-secondary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(63, 207, 142, 0.2);
	}

	.loot-item-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.loot-item-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.item-icon {
		width: 70%;
		height: 70%;
		object-fit: contain;
	}

	.loot-all-btn {
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, rgba(63, 207, 142, 0.2), rgba(63, 207, 142, 0.1));
		border: 1px solid var(--color-accent-secondary);
		border-radius: var(--radius-md);
		color: var(--color-accent-secondary);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.loot-all-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(63, 207, 142, 0.3), rgba(63, 207, 142, 0.15));
		box-shadow: 0 0 12px rgba(63, 207, 142, 0.3);
	}

	.loot-all-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-loot {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		text-align: center;
	}

	@media (max-width: 480px) {
		.loot-panel {
			padding: var(--space-md);
		}

		.loot-item-btn {
			width: 50px;
			height: 50px;
		}

		.loot-header h3 {
			font-size: 0.95rem;
		}
	}
</style>
