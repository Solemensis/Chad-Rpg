<script lang="ts">
	import { misc } from '../../../stores'
	import { game } from '../../../stores'
	import { character } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer(
				"Player tries to escape, but got hit while trying to escape, couldn't escape and lost 20 health. Combat goes on."
			)

			$character.stats[0].hp -= 20
		} else {
			emitAnswer('Player tries to escape, and escapes from the combat area successfully!')
			$game.gameData.event.inCombat = false
			$game.gameData.enemy = []
		}
	}

	function leaveButton(leaveString: any) {
		emitAnswer(leaveString)

		$game.gameData.event.shopMode = null
		$game.gameData.event.lootMode = false
		$game.gameData.lootBox = []
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

{#if !$misc.loading}
	{#if $game.gameData.choices?.length >= 2 || $game.gameData.event?.inCombat || $game.gameData.event?.shopMode || $game.gameData.event?.lootMode}
		<div transition:fade={{ duration: 700 }} class="stats">
			<div class="stat">
				<img class="svg-images" src="images/gold.svg" alt="" />
				<p>{$character.gold}</p>
			</div>

			{#if $game.gameData.event.inCombat}
				<button
					style="opacity: {$game.gameData.choices?.length ? '1' : '0'};"
					disabled={$misc.loading}
					on:click={() => calculateRetreat()}
					class="leave-button run-button"
				>
					<img src="images/run.svg" alt="retreat button" />

					<p>
						Try to <span class="red-span">Retreat.</span>
					</p>
				</button>
			{:else if $game.gameData.event.shopMode}
				<button
					disabled={$misc.loading}
					class="leave-button"
					style="opacity: {$game.gameData.event.shopMode ? '1' : '0'};"
					on:click={() => {
						leaveButton("I won't buy anything. (shopMode must be null in the next response.)")
						$game.gameData.event.shopMode = null
					}}>Close Menu</button
				>
				<button
					disabled={$misc.loading}
					class="leave-button"
					style="opacity: {$game.gameData.event.shopMode ? '1' : '0'};"
					on:click={() => {
						leaveButton(
							"I'll leave the shop. (shopMode must be null in the next response, and player must be leaving the shop.)"
						)
						$game.gameData.event.shopMode = null
					}}>Leave Shop</button
				>
			{:else if $game.gameData.event.lootMode}
				<button
					disabled={$misc.loading}
					class="leave-button"
					style="opacity: {$game.gameData.lootBox?.length ? '1' : '0'};"
					on:click={() => leaveButton('Leave the loot.')}>Leave it.</button
				>
				<!-- {:else if extractHours($misc.time) >= 20 && !$misc.place?.includes('Town') && !$misc.place?.includes('Tavern') && !$misc.place?.includes('Inn') && !$misc.place?.includes('City') && !$misc.place?.includes('Shop') && !$misc.place?.includes('smith') && !$misc.place?.includes('Market') && !$misc.place?.includes('Merchant')}
				<button
					disabled={$misc.loading}
					class="leave-button night-time"
					style="opacity: {extractHours($misc.time) >= 20 ? '1' : '0'}; "
					on:click={() =>
						emitAnswer(
							"Don't forget that you're leading a text-based rpg game and give your responses in JSON format like in your first response! Now it's night time, i'll go back to the nearest Inn before got caught to monsters."
						)}>It's night time, go back to inn for safety.</button
				> -->
			{/if}
			<div class="stat">
				<img class="svg-images" src="images/time.svg" alt="" />

				<p>{$game.gameData.placeAndTime.time ? $game.gameData.placeAndTime.time : '00:00'}</p>
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

	@media (orientation: portrait) {
		.night-time {
			font-size: 0.9rem;
			padding: 0.35rem 0.6rem;
		}
	}
</style>
