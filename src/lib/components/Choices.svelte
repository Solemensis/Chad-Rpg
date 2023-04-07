<script lang="ts">
import { game } from '../../stores.js';
	import { character } from '../../stores.js';
    import { ui } from '../../stores.js';
	import { selectedItem} from '../../stores.js';
	import { misc } from '../../stores.js';
	import { coolDowns } from '../../stores.js';
	import { descWindow } from '../../stores.js';

	import  PickChoice  from '$lib/components/choices/PickChoice.svelte';
	import  Combat  from '$lib/components/choices/Combat.svelte';
	import  Shop from '$lib/components/choices/Shop.svelte';

	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();



    function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}


    
	//transition delay logic
	let delay: any = -300
	
    function getDelayTime() {
		delay += 300

		return { delay }
	}

    

    function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer("You got hit while trying to escape, couldn't escape and lost 20 health.")
			//lose 20 health here
		} else {
			emitAnswer('You have escaped succesfully!')
		}
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

		let newArray: any = $game.lootBox.filter((lootItem:any) => lootItem.name !== item.name)
		$game.lootBox = newArray

		if (!$game.lootBox.length) {
			emitAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			$game.event[0].lootMode = false
		}
	}
	function lootAll() {
		$game.lootBox.forEach((item:any) => {
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
			emitAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			$game.event[0].lootMode = false
		}
	}


	function emitAnswer(answer:any) {
		dispatch('emittedAnswer', {
			answer: answer
		});

					//choice transition delay reset for every new conversation

        delay=-300
	}

	function handleEmittedAnswer(event:any){
emitAnswer(event.detail.answer)
	}
    </script>


<!-- ui bottom mid starts here -->
<div class="ui-mid">
    {#if $game.event[0] && !$game.event[0].shopMode && !$game.event[0].inCombat && !$game.event[0].lootMode}
        <PickChoice on:emittedAnswer={handleEmittedAnswer}/>

        

    {:else if $game.event[0] && $game.event[0].inCombat}
	<Combat on:emittedAnswer={handleEmittedAnswer}/>
       

    {:else if $game.event[0] && $game.event[0].shopMode}
       <Shop/>

        <!-- loot ui-->
    {:else if $game.event[0].lootMode}
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
                                    <img class="buyable-img" src="images/{item.weaponClass}.svg" alt="" />
                                {/if}
                                {#if item.element}
                                    <img class="buyable-img" src="images/{item.element}.svg" alt="" />
                                {/if}
                                {#if item.type == 'potion' || item.type == 'currency'}
                                    <img class="buyable-img" src="images/{item.type}.svg" alt="" />
                                {/if}
                            </button>
                        {/each}
                        <button on:click={() => lootAll()}>Loot All</button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
    <!-- loot ui ends here -->

    <!-- gold&time and reject choices -->
    {#if $game.choices.length >= 2 || $game.event[0].inCombat || $game.event[0].shopMode}
        <div transition:fade={{ duration: 700 }} class="stats">
            <div class="stat">
                <img class="svg-images" src="images/gold.svg" alt="" />
                <p>{$character.gold}</p>
            </div>

            {#if $game.event[0].inCombat}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.choices.length ? '1' : '0'};"
                    on:click={() => calculateRetreat()}>Retreat.</button
                >
            {:else if $game.event[0].shopMode}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.event[0].shopMode ? '1' : '0'};"
                    on:click={() => {
                        emitAnswer('Leave the shop')
                        $game.event[0].shopMode = null
                    }}>Leave the Shop</button
                >
            {:else if $game.lootBox.length}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.lootBox.length ? '1' : '0'};"
                    on:click={() => emitAnswer('Leave the loot.')}>Leave it.</button
                >
            {:else if extractHours($misc.time) >= 20 && $misc.place != 'Town' && $misc.place != 'Tavern' && $misc.place != 'Inn'}
                <button
                    disabled={$misc.loading}
                    class="leave-button night-time"
                    style="opacity: {extractHours($misc.time) >= 20 ? '1' : '0'}; "
                    on:click={() =>
                        emitAnswer(
                            "It's night time, i'll go back to the town before got caught to monsters."
                        )}>It's night time, go back to inn for safety.</button
                >
            {/if}
            <div class="stat">
                <img class="svg-images" src="images/time.svg" alt="" />

                <p>{$game.placeAndTime[0].time ? $game.placeAndTime[0].time : '00:00'}</p>
            </div>
        </div>
    {/if}
    <!-- gold&time and reject choices ends here -->
</div>
<!-- ui bottom mid ends here -->



<style>


.svg-images {
		width: 1.1rem;
		height: 1.1rem;
	}
	

	.leave-button {
		border: none;
		background-color: rgba(49, 49, 49, 0.73);
		padding: 0.3rem 2rem;
		border-radius: 0.3rem;
		font-size: 1rem;
		transition: background-color 0.3s, opacity 1.5s;
		backdrop-filter: blur(3px);
	}

	.leave-button:hover {
		background-color: rgba(49, 49, 49, 0.83);
	}

	.night-time {
		background-color: #964B00aa;
	}


	

	

	
	.stats {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(64, 64, 64, 0.8);
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
	}
	

	.stat p {
		font-size: 1.2rem;
	}
	.ui-mid {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.8rem;
	}

	
	::placeholder {
		color: #aaa;
	}
	

	


    </style>