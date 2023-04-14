<script lang="ts">
	import { game } from '../../stores.js'

	import PickChoice from '$lib/components/choices/PickChoice.svelte'
	import Combat from '$lib/components/choices/Combat.svelte'
	import Shop from '$lib/components/choices/Shop.svelte'
	import Loot from '$lib/components/choices/Loot.svelte'

	import GoldTime from '$lib/components/choices/GoldTime.svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}

	function handleEmittedAnswer(event: any) {
		emitAnswer(event.detail.answer)
	}
</script>

<div class="ui-mid">
	{#if $game.event[0] && !$game.event[0].shopMode && !$game.event[0].inCombat && !$game.event[0].lootMode}
		<PickChoice on:emittedAnswer={handleEmittedAnswer} />
	{:else if $game.event[0] && $game.event[0].inCombat}
		<Combat on:emittedAnswer={handleEmittedAnswer} />
	{:else if $game.event[0] && $game.event[0].shopMode}
		<Shop />
	{:else if $game.event[0] && $game.event[0].lootMode}
		<Loot on:emittedAnswer={handleEmittedAnswer} />
	{/if}
	<GoldTime on:emittedAnswer={handleEmittedAnswer} />
</div>

<style>
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
