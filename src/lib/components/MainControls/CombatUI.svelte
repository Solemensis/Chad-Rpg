<script lang="ts">
	import { isFunctionOrConstructorTypeNode } from 'typescript'
	import { game } from '../../../stores'
	import { selectedItem } from '../../../stores'
	import { ui } from '../../../stores'
	import { character } from '../../../stores'
	import { misc } from '../../../stores'
	import { coolDowns } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function capitalizeFirstLetter(str: any) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	let diceThrown: boolean = false
	async function throwDice(combatEvent: any) {
		if (!combatEvent.name) return ($ui.errorWarnMsg = 'You need to choose a weapon or spell.')

		//give the skill a cooldown time (actually everything, but works only for spells)
		if ($coolDowns[combatEvent.name]) {
			$coolDowns[combatEvent.name] = 0
		}

		//if a weapon or destruction spell choosen:
		if (combatEvent.damage) {
			//lower the player hp (with a little buff if the dice is 1)
			if ($game.gameData.enemy && $game.gameData.enemy.enemyHp)
				if ($selectedItem.damage != 0 && !$selectedItem.other) {
					if ($misc.diceNumber == 1) {
						$misc.diceNumber = 2
						$character.stats[0].hp -= Math.floor($game.gameData.enemy.enemyHp / $misc.diceNumber)
					} else {
						//if dice is greater than 15, do not lower hp
						// if ($misc.diceNumber > 15) {
						// 	$character.stats[0].hp = $character.stats[0].hp
						// } else {
						$character.stats[0].hp -= Math.floor($game.gameData.enemy.enemyHp / $misc.diceNumber)
						// }
					}
				} else {
					$character.stats[0].hp -= 5
				}

			//lower the enemy hp
			if ($game.gameData.enemy && $game.gameData.enemy.enemyHp) {
				$game.gameData.enemy.enemyHp -= $selectedItem.combatScore
			}
		}

		//a timeout to show the dice number to player for a sec.
		diceThrown = true
		function wait(ms: number) {
			return new Promise((resolve) => setTimeout(resolve, ms))
		}
		await wait(1000)

		//if player dies, give the end-game prompt.
		if ($character.stats[0].hp > 0) {
			emitAnswer(combatEvent.prompt)
		} else {
			emitAnswer('give a sad gameData.story, because player dies in the last combat event.')
			$misc.death = true
		}

		//lower the player mana
		if (combatEvent.manaCost) {
			$character.stats[0].mp -= combatEvent.manaCost
		}

		$misc.diceNumber = 0

		//if heal skill used, heal player
		if (combatEvent.healing) {
			$character.stats[0].hp += $selectedItem.combatScore
			if ($character.stats[0].hp > $character.stats[0].maxHp) {
				$character.stats[0].hp = $character.stats[0].maxHp
			}
		}

		//empty the object after
		$selectedItem.name = ''
		$selectedItem.damage = undefined
		$selectedItem.healing = undefined
		$selectedItem.mana = undefined
		$selectedItem.prompt = ''
		$selectedItem.combatScore = undefined
		$selectedItem.manaCost = 0

		diceThrown = false
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}

	// enemy hp bar calculation
	$: hpPercentage =
		$game.gameData.enemy && $game.gameData.enemy.enemyHp
			? ($game.gameData.enemy.enemyHp / $game.gameData.enemy.enemyMaxHp) * 100
			: 100
</script>

<!-- combat ui -->
{#if !$misc.loading}
	<div transition:fade={{ duration: 1000 }} class="combat">
		<div class="combat-box">
			<div class="heading-and-enemy">
				<h3>You are now in a <span class="red-span">Combat</span> against:</h3>
				{#if $game.gameData.enemy}
					<div>
						<!-- <h5>{capitalizeFirstLetter($game.gameData.enemy.enemyName)}</h5> -->
						{#if $game.gameData.enemy.enemyName}
							<h5>{$game.gameData.enemy.enemyName}</h5>
						{/if}
						{#if $game.gameData.enemy.name}
							<h5>{$game.gameData.enemy.name}</h5>
						{/if}
						<div
							style="background-image: linear-gradient(to right, #E1683Caa {hpPercentage}%, #1f1f1fc8 {hpPercentage}%);"
							class="enemy"
						>
							<p>
								{$game.gameData.enemy.enemyHp} <span class="hp-mp-text">HP</span>
							</p>
						</div>
					</div>
				{/if}
			</div>
			<div class="combat-but-and-info">
				<ul>
					{#if !$selectedItem.name}
						<li>
							Choose a <span class="g-span">weapon</span> or a
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
					{:else}
						<li>
							You chose <span class="g-span">{$selectedItem.name}</span> with
							<span class="g-span">unique</span> power!
						</li>
					{/if}

					<li>
						Then, press the <span class="g-span">dice</span> to learn your fate!
					</li>
					<li>
						<!-- Or, just try to <span class="red-span">Retreat!</span> -->
						Success is related to <span class="g-span">damage</span> and the
						<span class="g-span">dice number.</span>
					</li>
				</ul>
				<button
					transition:fade={{ duration: 200 }}
					on:click={() => throwDice($selectedItem)}
					class="combat-button"
				>
					{#if !diceThrown}
						<img
							transition:fade={{ duration: 300 }}
							src="images/dice.webp"
							alt="throw dice button"
						/>
					{:else}
						<p transition:fade={{ duration: 300 }} class="diceNumber">
							{$misc.diceNumber}<span>/23</span>
						</p>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

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

	.combat-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0 0.5rem;
		gap: 2rem;
		padding-top: 0.75rem;
	}

	.combat-box h3 {
		font-weight: 300;
		font-size: 1.3rem;
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
		padding: 0.5rem 0.5rem 0.1rem 0.5rem;
		width: 4.5rem;
		height: 4.5rem;
		cursor: pointer;
		transition: 0.2s;
		border-radius: 0.6rem;
		position: relative;
	}
	.combat-button:hover {
		transform: scale(1.05);
	}
	/* .combat-button:active {
		animation: button-pop 0.3s ease-out;
	} */

	.combat-button img {
		width: 3.5rem;
	}
	.diceNumber {
		font-size: 2rem;
		position: absolute;
		left: 0;
		top: 0;
		width: 4.3rem;
		height: 4.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #3fcf8e;
	}
	.diceNumber span {
		color: #999;
		font-size: 0.8rem;
	}
	.combat-but-and-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
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

	@media (orientation: portrait) {
		.combat {
			min-height: 90%;
		}
		li {
			font-size: 0.9rem;
		}
		h3 {
			font-size: 1.15rem !important;
		}
	}
</style>
