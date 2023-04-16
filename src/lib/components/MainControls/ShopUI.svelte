<script lang="ts">
	import { game } from '../../../stores.js'
	import { selectedItem } from '../../../stores.js'
	import { ui } from '../../../stores.js'
	import { descWindow } from '../../../stores.js'
	import { misc } from '../../../stores.js'

	import { fade } from 'svelte/transition'

	function hideWindow() {
		$misc.showDescription = 'none'
	}

	function handleBuy(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
			$selectedItem = {}

			$selectedItem = item
			$ui.buyWarnMsg = prompt
		} else return
	}

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
</script>

<!-- shop ui -->

<div transition:fade={{ duration: 1000 }} class="shop">
	<div class="shop-box">
		{#if $game.event[0].shopMode == 'weaponsmith'}
			<h3>You're at a local <span class="g-span">Weaponsmith</span></h3>
		{/if}
		{#if $game.event[0].shopMode == 'armorsmith'}
			<h3>You're at a local <span class="g-span">Armorsmith</span></h3>
		{/if}
		{#if $game.event[0].shopMode == 'spell shop'}
			<h3>You're at a local <span class="g-span">Spell Shop</span></h3>
		{/if}
		{#if $game.event[0].shopMode == 'potion shop'}
			<h3>You're at a local <span class="g-span">Potion Shop</span></h3>
		{/if}
		{#if $game.event[0].shopMode != 'weaponsmith' && $game.event[0].shopMode != 'armorsmith' && $game.event[0].shopMode != 'spell shop' && $game.event[0].shopMode != 'potion shop'}
			<h3>You're at a local <span class="g-span">Merchant</span></h3>
		{/if}

		<div class="buyables-box">
			{#each $game.shop as buyable}
				<button
					class="item-button"
					on:click={() => handleBuy(`Do you wanna buy ${buyable.name}?`, buyable)}
					on:mousemove={(event) => handleMouseMove(event, buyable)}
					on:mouseleave={hideWindow}
				>
					{#if buyable.type == 'weapon'}
						<img
							class="buyable-img"
							src="images/{buyable.weaponClass}.svg"
							alt="a buyable weapon"
						/>
					{:else if buyable.type == 'potion'}
						<img class="buyable-img" src="images/{buyable.type}.svg" alt="a buyable potion" />
					{/if}
					{#if buyable.element}
						<img class="buyable-img" src="images/{buyable.element}.svg" alt="a buyable spell" />
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- shop ui ends here -->
<style>
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
