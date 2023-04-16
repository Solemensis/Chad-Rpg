<script lang="ts">
	import { game } from '../../stores.js'
	import { misc } from '../../stores.js'

	import PickChoice from '$lib/components/MainControls/PickChoiceUI.svelte'
	import Combat from '$lib/components/MainControls/CombatUI.svelte'
	import Shop from '$lib/components/MainControls/ShopUI.svelte'
	import Loot from '$lib/components/MainControls/LootUI.svelte'
	import Death from '$lib/components/MainControls/DeathUI.svelte'

	import GoldTime from '$lib/components/MainControls/BottomUIBar.svelte'

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
	{#if $game.event[0] && !$game.event[0].shopMode && !$game.event[0].inCombat && !$game.event[0].lootMode && !$misc.death}
		<PickChoice on:emittedAnswer={handleEmittedAnswer} />
	{:else if $game.event[0] && $game.event[0].inCombat && !$misc.death}
		<Combat on:emittedAnswer={handleEmittedAnswer} />
	{:else if $game.event[0] && $game.event[0].shopMode && !$misc.death}
		<Shop />
	{:else if $game.event[0] && $game.event[0].lootMode && !$misc.death}
		<Loot on:emittedAnswer={handleEmittedAnswer} />
	{:else if $misc.death}
		<Death />
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
