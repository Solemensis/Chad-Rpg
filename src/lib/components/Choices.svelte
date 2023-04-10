<script lang="ts">
import { game } from '../../stores.js';
	import { character } from '../../stores.js';
	import { misc } from '../../stores.js';

	import  PickChoice  from '$lib/components/choices/PickChoice.svelte';
	import  Combat  from '$lib/components/choices/Combat.svelte';
	import  Shop from '$lib/components/choices/Shop.svelte';
	import  Loot from '$lib/components/choices/Loot.svelte';

	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();



    function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}


    
	//transition delay logic
	let delay: any = -300
	
    // function getDelayTime() {
	// 	delay += 300

	// 	return { delay }
	// }

    

    function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer("You got hit while trying to escape, couldn't escape and lost 20 health.")
			//lose 20 health here
		} else {
			emitAnswer('You have escaped succesfully!')
			$game.event[0].inCombat= false
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


	function leaveButton(leaveString:any){
		emitAnswer(leaveString)

		$game.event[0].shopMode =false
		$game.event[0].lootMode =false
		$game.lootBox=[]
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

    {:else if $game.event[0] && $game.event[0].lootMode}
        <Loot on:emittedAnswer={handleEmittedAnswer}/>
    {/if}

    <!-- gold&time and reject choices -->
    {#if $game.choices.length >= 2 || $game.event[0].inCombat || $game.event[0].shopMode || $game.event[0].lootMode}
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
                        leaveButton('Leave the shop')
                        $game.event[0].shopMode = null
                    }}>Leave the Shop</button
                >
            {:else if $game.lootBox.length}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.lootBox.length ? '1' : '0'};"
                    on:click={() => leaveButton('Leave the loot.')}>Leave it.</button
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
		background-color: rgba(34, 34, 34, 0.352);
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