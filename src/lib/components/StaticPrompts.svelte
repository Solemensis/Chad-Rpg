<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { misc } from '../../stores'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

<div class="static-prompts">
	<button
		disabled={$misc.loading}
		on:click={() => emitAnswer('Sit at a table and observe the people in the tavern')}
	>
		<p>Sit at a table and observe the people in the tavern</p>
	</button>
	<button
		disabled={$misc.loading}
		on:click={() => emitAnswer("Ask the bartender about the town and it's mysteries")}
	>
		<p>Ask the bartender about the town and it's mysteries</p>
	</button>
	<button
		disabled={$misc.loading}
		on:click={() => emitAnswer('Strike up a conversation with a nearby adventurer')}
	>
		<p>Strike up a conversation with a nearby adventurer</p>
	</button>
</div>

<style>
	.static-prompts {
		position: absolute;
		left: 2rem;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	button {
		background-color: rgba(52, 52, 52, 0.558);
		padding: 0.3rem 0.5rem;
		border-radius: 0.2rem;
		cursor: pointer;
		transition: 0.2s;
	}
	button:hover {
		background-color: rgba(52, 52, 52, 0.658);
	}
	button p {
		font-size: 0.9rem;
		color: #bbb;
		transition: 0.2s;
	}
	button:hover p {
		color: #ddd;
	}

	/* responsive */
	@media (orientation: portrait) {
		.static-prompts {
			display: none;
		}
	}
</style>
