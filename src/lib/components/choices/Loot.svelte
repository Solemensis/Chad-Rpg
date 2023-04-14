<script lang="ts">
	import { game } from '../../../stores.js'
	import { misc } from '../../../stores.js'
	import { descWindow } from '../../../stores.js'
	import { character } from '../../../stores.js'

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
		}

		let newArray: any = $game.lootBox.filter((lootItem: any) => lootItem.name !== item.name)
		$game.lootBox = newArray

		if (!$game.lootBox.length) {
			emitAnswer(
				"I've looted all. What should i do now..? (clear the @lootBox array in your next response!)"
			)
			$game.event[0].lootMode = false
		}

		hideWindow()
	}
	function lootAll() {
		$game.lootBox.forEach((item: any) => {
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
			}
		})

		$game.lootBox = []

		if (!$game.lootBox.length) {
			emitAnswer(
				"I've looted all. What should i do now..? (clear the @lootBox array in your next response!)"
			)
			$game.event[0].lootMode = false
		}
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

<!-- loot ui-->
<div transition:fade={{ duration: 1000 }} class="shop">
	<div class="shop-box">
		<h3>You're <span class="g-span">looting.</span></h3>

		<div class="buyables-box">
			{#if !$game.lootBox.length}
				<p>loading...</p>
			{:else}
				{#each $game.lootBox as item}
					<button
						class="item-button"
						on:click={() => lootItem(item)}
						on:mousemove={(event) => handleMouseMove(event, item)}
						on:mouseleave={hideWindow}
					>
						{#if item.type == 'weapon'}
							<img class="buyable-img" src="images/{item.weaponClass}.svg" alt="a weapon" />
						{/if}
						{#if item.element}
							<img class="buyable-img" src="images/{item.element}.svg" alt="a spell" />
						{/if}
						{#if item.type == 'potion' || item.type == 'currency'}
							<img class="buyable-img" src="images/{item.type}.svg" alt="a lootable item" />
						{/if}
					</button>
				{/each}
				<button on:click={() => lootAll()}>Loot All</button>
			{/if}
		</div>
	</div>
</div>

<!-- loot ui ends here -->
<style>
	/* classes are from shop ui, so class names are shop ui's classes */

	.shop {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		height: 100%;
		margin-inline: auto;
		gap: 1rem;
		backdrop-filter: blur(2px);
	}

	.shop-box h3 {
		text-align: center;
		font-weight: 300;
		font-size: 1.3rem;
	}

	.shop-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-around;
		padding: 0 0.5rem;
		align-items: center;
		padding-bottom: 1rem;
	}

	.item-button {
		border: none;
		background-color: transparent;
	}

	.buyables-box {
		display: flex;
		gap: 1rem;
	}
	.shop-box button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.4rem;
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
	}
	.buyable-img {
		width: 65%;
		height: 65%;
	}

	.g-span {
		color: #3fcf8e;
	}
</style>
