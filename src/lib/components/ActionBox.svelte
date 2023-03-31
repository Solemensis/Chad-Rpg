<script lang="ts">
    import { game } from '../../stores.js';
    import { ui } from '../../stores.js';
    import { selectedItem } from '../../stores.js'
	import { character } from '../../stores.js';

	import { misc } from '../../stores.js';
	import { descWindow } from '../../stores.js';

	import { fade } from 'svelte/transition'

	export let title:any;
	export let actions:any;


	function hideWindow() {
		$misc.showDescription = 'none'

	}



	function handleSell(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
			$selectedItem = item
			$ui.sellWarnMsg = prompt
		} else return
	}


	$: hpPercentage = ($character.stats[0].hp / $character.stats[0].maxHp) * 100
	$: mpPercentage = ($character.stats[0].mp / $character.stats[0].maxMp) * 100



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
            $descWindow.armor = item && item.armor ? item.armor : undefined
         $descWindow.element = item && item.element ? item.element : undefined
            $descWindow.weaponClass = item && item.weaponClass ? item.weaponClass : undefined
             $descWindow.manaCost = item && item.manaCost ? item.manaCost : undefined
            $descWindow.price = item && item.price ? item.price : undefined
             $descWindow.amount = item && item.amount ? item.amount : undefined
}

	
</script>

<div style="opacity:{$game.choices.length ? '1' : '0'}; transition:opacity 1.5s;" class="ui-left">
	{#if title=="Inventory"}
	<div
		class="hp-bar"
		style="background-image: linear-gradient(to right, #b02863aa {hpPercentage}%, #1f1f1fc8);"
	>
		{$character.stats[0].hp}/{$character.stats[0].maxHp}
	</div>
	{:else if title =="Spells"}
	<div
	class="mp-bar"
	style="background-image: linear-gradient(to right, #76399caa {mpPercentage}%, #1f1f1fc8);"
>
	{$character.stats[0].mp}/{$character.stats[0].maxMp}
</div>
	{/if}
	<div in:fade={{ delay: 200, duration: 1500 }} class="inventory">
		<h3>{title}</h3>
		{#each actions as action}
			<button
				disabled={$misc.loading}
				on:click={() => {
					useItem(action)
					handleSell(`You sure to sell ${action.name}?`, action)
				}}
				in:fade={{ duration: 600 }}
			>
				{#if action.type == 'weapon'}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.weaponClass}.svg"
						alt=""
					/>
				{:else if action.type == 'potion'}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.type}.svg"
						alt=""
					/>
				{:else if action.element}
				<img
				on:mousemove={(event) => handleMouseMove(event, action)}
				on:mouseleave={hideWindow}
				src="/images/{action.element}.svg"
				alt=""
			/>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>

.ui-left,
	.ui-right {
		width: 25%;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.hp-bar,
	.mp-bar {
		text-align: center;
		font-size: 1.2rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding: 0.2rem 0;
	}
	.spells,
	.inventory {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		background-color: #362525bc;

		border-radius: 0.2rem;
		min-height: 25vh;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.spells h3,
	.inventory h3 {
		grid-column-start: 1;
		grid-column-end: 4;
		justify-self: center;
		font-weight: 400;
		font-size: 1.4rem;
		color: #3fcf8e;
		/* font-family:"medieval" !important; */
	}
	.spells img,
	.inventory img {
		width: 85%;
		margin-inline: auto;
		padding: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.spells img:active,
	.inventory img:active {
		animation: button-pop 0.3s ease-out;
	}
	.spells button,
	.inventory button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		border-radius: 0.4rem;
		width: 85%;
		height: 85%;
	}

	</style>