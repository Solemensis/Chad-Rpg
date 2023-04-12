<script lang="ts">
	import { game } from '../../../stores.js'
	import { selectedItem } from '../../../stores.js'
	import { ui } from '../../../stores.js'
	import { character } from '../../../stores.js'
	import { misc } from '../../../stores.js'
	import { coolDowns } from '../../../stores.js'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function capitalizeFirstLetter(str: any) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	function throwDice(combatEvent: any) {
		if (!combatEvent.name) return ($ui.errorWarnMsg = 'You need to choose a weapon or spell.')

		if ($coolDowns[combatEvent.name]) {
			$coolDowns[combatEvent.name] = 0
		}

		//zar numarasını bi süre göstermek için 1-2 saniyelik bi timeout
		//içine alıncak giveYourAnswer
		console.log(combatEvent.prompt)
		emitAnswer(combatEvent.prompt)

		//lower the player mana
		if (combatEvent.manaCost) {
			$character.stats[0].mp -= combatEvent.manaCost
		}

		//lower the player hp (with a little buff if the dice is 1)
		if ($misc.diceNumber == 1) {
			$misc.diceNumber = 2
			$character.stats[0].hp -= Math.floor($game.enemy[0].enemyHp / $misc.diceNumber)
		} else {
			$character.stats[0].hp -= Math.floor($game.enemy[0].enemyHp / $misc.diceNumber)
		}

		$misc.diceNumber = 0

		// $game.event[0].inCombat = !$game.event[0].inCombat

		//empty the object after
		$selectedItem.name = ''
		$selectedItem.damage = undefined
		$selectedItem.healing = undefined
		$selectedItem.prompt = ''
		$selectedItem.combatScore = undefined
		$selectedItem.manaCost = 0

		//close combatmode and empty the enemy array if enemy dies
		if ($game.enemy[0].enemyHp <= 0) $game.event[0].inCombat = false
		$game.enemy = []
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

<!-- combat ui -->

<div transition:fade={{ duration: 1000 }} class="combat">
	<div class="combat-box">
		<div class="heading-and-enemy">
			<h3>You are now in <span class="span-heading">Combat</span> against:</h3>
			{#if $game.enemy[0]}
				<div>
					<h5>{capitalizeFirstLetter($game.enemy[0].enemyName)}</h5>

					<div
						style="background-image: linear-gradient(to right, #E1683Caa 100%, #1f1f1fc8);"
						class="enemy"
					>
						<p>
							{$game.enemy[0].enemyHp} <span class="hp-mp-text">HP</span>
						</p>
					</div>
				</div>
			{/if}
		</div>
		<div class="combat-but-and-info">
			<ul>
				{#if !$selectedItem.name}
					<li>
						Choose an <span class="g-span">item</span> or a
						<span class="g-span">spell.</span>
					</li>
				{:else if $selectedItem.damage}
					<li>
						You chose <span class="g-span">{$selectedItem.name}</span> with
						<span class="g-span">x{$selectedItem.damage}</span> damage!
					</li>
				{:else if $selectedItem.healing}
					<li>
						You chose <span class="g-span">{$selectedItem.name}</span> with
						<span class="g-span">x{$selectedItem.healing}</span> heal power!
					</li>
				{/if}

				<li>Then, press the <span class="g-span">dice</span> to learn your fate!</li>
				<li>
					<!-- Your fighting scenario will be calculated based on these and some element of
                    surprise. -->
					Or, just try to <span class="red-span">Retreat!</span>
				</li>
			</ul>
			<button on:click={() => throwDice($selectedItem)} class="combat-button">
				<img src="images/dice.webp" alt="throw dice button" />
			</button>
		</div>
	</div>
</div>

<!-- combat ui ends here-->
<style>
	.combat {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		height: 100%;
		margin-inline: auto;
		gap: 1rem;
		backdrop-filter: blur(2px);
	}

	.combat-box h3 {
		text-align: center;
		font-weight: 300;
		font-size: 1.3rem;
	}

	.combat-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-around;
		padding: 0 0.5rem;
	}

	.combat-but-and-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
	}

	.combat-box img:active {
		animation: button-pop 0.3s ease-out;
	}

	.combat-box ul {
		font-size: 1rem;
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 0.4rem;
	}

	.combat-box ul {
		width: 60%;
	}
	.combat-button {
		border: none;
		background-color: rgba(19, 19, 19, 0.525);
		border-radius: 0.6rem;
		padding: 0.5rem 0.5rem 0.1rem 0.5rem;
	}

	.combat-button img {
		width: 3.5rem;
	}

	.combat-box ul li {
		color: #bbb;
		padding-left: 0.4rem;
		text-align: start;
		transition: 0.2s;
		line-height: 1.2;
	}

	.combat-box ul li:nth-child(1) {
		list-style-type: '⚔️';
	}
	.combat-box ul li:nth-child(2) {
		list-style-type: '🎲';
	}
	.combat-box ul li:nth-child(3) {
		list-style-type: '🔮';
		font-size: 0.9rem;
		padding-left: 0.5rem;
		margin-left: -0.08rem;

		color: #aaa;
	}
	.span-heading {
		color: rgb(228, 55, 55);
		font-weight: 400;
	}
	.red-span {
		color: rgb(228, 55, 55);
	}
	.heading-and-enemy {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
	}

	.enemy {
		display: flex;

		gap: 0.05rem;
		align-items: center;
		justify-content: space-around;
		width: 8rem;
		height: 1rem;
		border-radius: 0.3rem;

		padding: 0.7rem 0;
	}

	h5 {
		font-weight: 400;
		font-size: 0.9rem;
		color: #ccc;
		text-align: center;
		margin-bottom: 0.1rem;
	}
	.enemy p {
		font-size: 0.9rem;
		text-align: center;
		color: #ccc;
	}
	.enemy span {
		font-size: 0.9rem;

		color: #ccc;
	}
	.g-span {
		color: #3fcf8e;
	}
</style>
