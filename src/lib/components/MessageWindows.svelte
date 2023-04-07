<script lang="ts">
	import { game } from '../../stores.js';
	import { character } from '../../stores.js';
    import { ui } from '../../stores.js';
    import { selectedItem } from '../../stores.js'


	import { fade } from 'svelte/transition'


    function buyItem(item: any) {
		if ($character.gold < item.price) return ($ui.errorWarnMsg = 'Not enough gold.')

		$character.gold -= item.price
		if (item.type == 'weapon' || item.type == 'potion') {
			$character.inventory.push(item)
			$character.inventory = $character.inventory

			let newArray: any = $game.shop.filter((shopItem:any) => shopItem != item)
			$game.shop = newArray
			// return $ui.errorWarnMsg='Buyout succesful!'
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			$character.spells.push(item)
			$character.spells = $character.spells

			let newArray: any = $game.shop.filter((shopItem:any) => shopItem != item)
			$game.shop = newArray
			// return $ui.errorWarnMsg='Buyout succesful!'
		}
	}

    function sellItem(item: any) {
		if (!$game.event[0].shopMode) return

		$character.gold += item.price

		if (!item.element) {
			let newArray: any = $character.inventory.filter((obj:any) => obj.name !== item.name)
			$character.inventory = newArray
		} else {
			let newArray: any = $character.spells.filter((obj:any) => obj.name !== item.name)
			$character.spells = newArray
		}

        //hide the description window after selling item.
		$selectedItem.showDescription = 'none'
	}
   

   


</script>




<!-- ingame notification window (out of ui) -->
{#if $ui.errorWarnMsg}
<div transition:fade={{ duration: 300 }} class="notification-window">
    <p>
        {$ui.errorWarnMsg}
    </p>
    <button on:click={() => ($ui.errorWarnMsg = '')}>Got it</button>
</div>
{/if}
<!-- ingame notification window ends here -->

<!-- askbuy window (out of ui) -->
{#if $ui.buyWarnMsg}
<div transition:fade={{ duration: 300 }} class="notification-window">
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
        <button on:click={() => ($ui.buyWarnMsg = '')}>Cancel</button>
    </div>
</div>
{/if}
<!-- askbuy window -->

<!-- asksell window (out of ui) -->
{#if $ui.sellWarnMsg}
<div transition:fade={{ duration: 300 }} class="notification-window">
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
        <button on:click={() => ($ui.sellWarnMsg = '')}>Cancel</button>
    </div>
</div>
{/if}
<!-- asksell window -->



<style>

.notification-window {
		background-color: rgb(33, 33, 33, 0.7);
		backdrop-filter: blur(4px);
		padding: 2rem 4rem;
		border-radius: 1rem;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;

		z-index: 999;
	}

	.notification-window button {
		border: 2px solid rgb(65, 124, 65);
		background-color: transparent;
		border-radius: 2px;
		border-radius: 0.5rem;
		padding: 0.4rem 1rem;
		transition: 0.2s;

		display: flex;
		justify-content: center;
	}
	.notification-window button:hover {
		transform: translateY(-3%);
	}

	.dual-button {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	.dual-button button:nth-child(1) {
		border: 2px solid green;
	}
	.dual-button button:nth-child(2) {
		border: 2px solid rgb(111, 30, 0);
	}
    </style>