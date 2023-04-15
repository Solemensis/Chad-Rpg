<script lang="ts">
	import { misc } from '../../../stores.js'
	import { game } from '../../../stores.js'
	import { character } from '../../../stores.js'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer("You got hit while trying to escape, couldn't escape and lost 20 health.")

			$character.stats[0].hp -= 20
		} else {
			emitAnswer('You have escaped succesfully!')
			$game.event[0].inCombat = false
		}
	}

	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	function leaveButton(leaveString: any) {
		emitAnswer(leaveString)

		$game.event[0].shopMode = false
		$game.event[0].lootMode = false
		$game.lootBox = []
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

{#if !$misc.loading}
	{#if $game.choices.length >= 2 || $game.event[0].inCombat || $game.event[0].shopMode || $game.event[0].lootMode}
		<div transition:fade={{ duration: 700 }} class="stats">
			<div class="stat">
				<img class="svg-images" src="images/gold.svg" alt="" />
				<p>{$character.gold}</p>
			</div>

			{#if $game.event[0].inCombat}
				<button class="leave-button run-button">
					<img src="images/run.svg" alt="retreat button" />
					<p
						disabled={$misc.loading}
						style="opacity: {$game.choices.length ? '1' : '0'};"
						on:click={() => calculateRetreat()}
					>
						Try to <span class="red-span">Retreat.</span>
					</p>
				</button>
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
			{:else if extractHours($misc.time) >= 20 && !$misc.place.includes('Town') && !$misc.place.includes('Tavern') && !$misc.place.includes('Inn') && !$misc.place.includes('City')}
				<button
					disabled={$misc.loading}
					class="leave-button night-time"
					style="opacity: {extractHours($misc.time) >= 20 ? '1' : '0'}; "
					on:click={() =>
						emitAnswer("It's night time, i'll go back to the town before got caught to monsters.")}
					>It's night time, go back to inn for safety.</button
				>
			{/if}
			<div class="stat">
				<img class="svg-images" src="images/time.svg" alt="" />

				<p>{$game.placeAndTime[0].time ? $game.placeAndTime[0].time : '00:00'}</p>
			</div>
		</div>
	{/if}
{/if}

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
		cursor: pointer;
	}

	.leave-button:hover {
		background-color: rgba(49, 49, 49, 0.83);
	}
	.run-button img {
		width: 1rem;
	}
	.run-button {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.night-time {
		background-color: rgba(42, 42, 42, 0.852);
		color: orangered;
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
</style>
