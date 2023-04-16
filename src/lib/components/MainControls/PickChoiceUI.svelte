<script lang="ts">
	import { game } from '../../../stores.js'
	import { misc } from '../../../stores.js'
	import { ui } from '../../../stores.js'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	let delay: any = -300

	function getDelayTime() {
		delay += 300

		return { delay }
	}

	function emitAnswer(answer: any) {
		if (!answer) return

		dispatch('emittedAnswer', {
			answer: answer
		})

		//choice transition delay reset for every new conversation
		delay = -300

		//
	}

	function emitInteractiveAnswer(answer: any) {
		if ($misc.interactivePoints == 0)
			$ui.errorWarnMsg =
				'0 interactive chat points left. You can gain it by buying it from merchants or winnings battles.'

		$misc.interactivePoints -= 1

		if (!answer) return

		dispatch('emittedAnswer', {
			answer: answer
		})

		//choice transition delay reset for every new conversation
		delay = -300

		//
	}
</script>

<!-- {#if $game.event[0] && !$game.event[0].shopMode && !$game.event[0].inCombat && !$game.event[0].lootMode} -->
<!-- choices ui starts here -->
<div class="choices">
	{#each $game.choices as choice}
		<button
			disabled={$misc.loading}
			transition:fade={{ ...getDelayTime(), duration: 700 }}
			class="choice"
			on:click={() => emitAnswer(choice)}>{choice}</button
		>
	{/each}
	{#if $game.choices.length >= 2}
		<div transition:fade={{ ...getDelayTime(), duration: 400 }} class="choice choiceInput">
			<input
				placeholder="Write your own answer. ({$misc.interactivePoints} interactive chat points left)"
				type="text"
				bind:value={$misc.query}
			/>
			<button disabled={$misc.loading} on:click={() => emitInteractiveAnswer($misc.query)}
				>Answer</button
			>
		</div>
	{/if}
</div>

<!-- choices ui ends here -->

<!-- {/if} -->
<style>
	.choices {
		/* min-height: 36.9%; */
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
		margin-inline: auto;
		padding: 0;
	}
	.choice {
		backdrop-filter: blur(3px);
		background-color: #2d1e1ecc;
		/* background-color: #282424cc; */
		border-radius: 0.5rem;
		font-size: 1.35rem;
		color: #ccc;
		padding: 0.4rem 0.6rem;
		border: none;
		position: relative;
		text-align: center;
		transition: 0.2s;
	}

	.choice:hover:not(:last-child) {
		background-color: #201919cc;
	}
	.choiceInput {
		background-color: #1f1f1fc8;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
	}

	.choiceInput input {
		background-color: transparent;
		border: none;
		width: 85%;
		height: 100%;
		font-size: 1.2rem;
		outline: none;
		padding: 0.1rem 0.3rem;
		text-align: start;
	}
	.choiceInput button {
		border: none;
		color: #ddd;
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
		background-color: #9018c486;
	}
	.choiceInput button:active {
		animation: button-pop 0.3s ease-out;
	}
	.choiceInput button:hover {
		background-color: #a61ce186;
	}
</style>
