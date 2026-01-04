<script lang="ts">
	import { game } from '../../stores'
	import { misc } from '../../stores'

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

{#if $misc.started}
	<div class="ui-mid">
		<!-- Death Screen -->
		{#if $misc.death}
			<Death />
			<!-- Combat Screen -->
		{:else if $game.gameData.event?.inCombat && $game.gameData.enemy}
			<Combat on:emittedAnswer={handleEmittedAnswer} />
			<!-- Loot Screen -->
		{:else if $game.gameData.event?.lootMode}
			<Loot on:emittedAnswer={handleEmittedAnswer} />
			<!-- Shop Mode - Show BOTH choices and shop -->
		{:else if $game.gameData.event?.shopMode}
			<div class="shop-layout">
				<!-- Choices on top -->
				<PickChoice on:emittedAnswer={handleEmittedAnswer} />
				<!-- Shop items below -->
				<Shop />
			</div>
			<!-- Normal Mode - Just choices -->
		{:else if $game.gameData.event}
			<PickChoice on:emittedAnswer={handleEmittedAnswer} />
		{/if}

		<GoldTime on:emittedAnswer={handleEmittedAnswer} />
	</div>
{/if}

<style>
	.ui-mid {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.shop-layout {
		display: grid;
		grid-template-columns: 60% 1fr;
		gap: var(--space-md);
		width: 100%;
	}

	/* Responsive: Stack on smaller screens */
	@media (max-width: 768px) {
		.shop-layout {
			grid-template-columns: 1fr;
		}
	}

	::placeholder {
		color: #aaa;
	}
</style>
