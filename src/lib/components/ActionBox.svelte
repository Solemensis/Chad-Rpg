<script lang="ts">
	import { game } from '../../stores'
	import { ui } from '../../stores'
	import { selectedItem } from '../../stores'
	import { character } from '../../stores'

	import { misc } from '../../stores'
	import { descWindow } from '../../stores'
	import { coolDowns } from '../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}

	export let title: any
	export let actions: any

	function hideWindow() {
		$misc.showDescription = 'none'
	}

	function handleSell(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
			$selectedItem = {}

			$selectedItem = item
			$ui.sellWarnMsg = prompt
		} else return
	}

	$: hpPercentage = ($character.stats[0].hp / $character.stats[0].maxHp) * 100
	$: mpPercentage = ($character.stats[0].mp / $character.stats[0].maxMp) * 100

	function handleMouseMove(event: any, item: any) {
		$misc.showDescription = 'block'
		$misc.x = event.clientX + 10
		$misc.y = event.clientY - 40

		// for (let key in $descWindow) {
		//     $descWindow[key] = undefined
		// 					}

		$descWindow.name = item && item.name ? item.name : undefined
		$descWindow.damage = item && item.damage ? item.damage : undefined
		$descWindow.type = item && item.type ? item.type : undefined
		$descWindow.healing = item && item.healing ? item.healing : undefined
		$descWindow.mana = item && item.mana ? item.mana : undefined
		$descWindow.point = item && item.point ? item.point : undefined
		$descWindow.armor = item && item.armor ? item.armor : undefined
		$descWindow.element = item && item.element ? item.element : undefined
		$descWindow.weaponClass = item && item.weaponClass ? item.weaponClass : undefined
		$descWindow.manaCost = item && item.manaCost ? item.manaCost : undefined
		$descWindow.price = item && item.price ? item.price : undefined
		$descWindow.amount = item && item.amount ? item.amount : undefined
	}

	function useItem(item: any) {
		$selectedItem = {}
		const { type, name, damage, manaCost, healing, mana, cooldown, point } = item
		const { mp, maxMp, hp, maxHp } = $character.stats[0]
		const { inCombat, shopMode } = $game.event[0]

		if (type === 'weapon') {
			if (shopMode) return
			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')

			$selectedItem.combatScore = Math.floor(calculateCombatScore(damage))

			let takenDamage: any
			if ($game.enemy[0] && $game.enemy[0].enemyHp) {
				if ($misc.diceNumber == 1) {
					$misc.diceNumber = 2
				}
				takenDamage = Math.floor($game.enemy[0].enemyHp / $misc.diceNumber)
			} else {
				takenDamage = 5
			}

			if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 20) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name}! (give hard times to player in @story, where player lands the worst possible attack, which leads to player receiving ${takenDamage} total damage but giving ${$selectedItem.combatScore} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}
			if ($selectedItem.combatScore >= 20 && $selectedItem.combatScore < 50) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name}! (give a medi-ocre @story, where player lands a decent attack, which leads to player giving ${$selectedItem.combatScore} total damage to enemy but taking ${takenDamage} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}

			if ($selectedItem.combatScore >= 50 && $selectedItem.combatScore < 85) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name}! (give a great @story where player lands a powerful attack, giving ${$selectedItem.combatScore} total damage but receiving ${takenDamage} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}

			if ($selectedItem.combatScore >= 85) {
				$selectedItem.prompt = `Attack with ${name}! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy end winning the combat. )`
			}

			$selectedItem.name = name
			$selectedItem.damage = damage
			$selectedItem.healing = undefined
			return
		}

		if (type === 'destruction spell') {
			if (shopMode) return

			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown)
				return ($ui.errorWarnMsg =
					'This spell is on cooldown. ' + $coolDowns[name] + '/' + cooldown)
			$coolDowns[name] = cooldown

			$selectedItem.combatScore = Math.floor(calculateCombatScore(damage))

			let takenDamage: any
			if ($game.enemy[0] && $game.enemy[0].enemyHp) {
				if ($misc.diceNumber == 1) {
					$misc.diceNumber = 2
				}
				takenDamage = Math.floor($game.enemy[0].enemyHp / $misc.diceNumber)
			} else {
				takenDamage = 5
			}

			if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 20) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name} spell! (give hard times to player in @story, where player lands the worst possible attack, which leads to player receiving ${takenDamage} total damage but giving ${$selectedItem.combatScore} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name} spell! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}
			if ($selectedItem.combatScore >= 20 && $selectedItem.combatScore < 50) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name} spell! (give a medi-ocre @story, where player lands a decent attack, which leads to player giving ${$selectedItem.combatScore} total damage to enemy but taking ${takenDamage} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name} spell! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}

			if ($selectedItem.combatScore >= 50 && $selectedItem.combatScore < 85) {
				if (
					$game.enemy[0] &&
					$game.enemy[0].enemyHp &&
					$game.enemy[0].enemyHp > $selectedItem.combatScore
				) {
					$selectedItem.prompt = `Attack with ${name}! (give a great @story where player lands a powerful attack, giving ${$selectedItem.combatScore} total damage but receiving ${takenDamage} total damage back. Combat goes on.)`
				} else {
					$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
				}
			}

			if ($selectedItem.combatScore >= 85) {
				$selectedItem.prompt = `Attack with ${name}! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`
			}

			$selectedItem.name = name
			$selectedItem.damage = damage
			$selectedItem.healing = undefined
			$selectedItem.manaCost = manaCost

			return
		}

		if (type === 'healing spell') {
			if (shopMode) return

			if (hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown) return ($ui.errorWarnMsg = 'On cooldown')
			if (!inCombat) {
				emitAnswer(`Heal myself with ${name} spell by ${calculateCombatScore(healing)} amount.)`)
				$character.stats[0].hp += calculateCombatScore(healing)
				if ($character.stats[0].hp > $character.stats[0].maxHp) {
					$character.stats[0].hp = $character.stats[0].maxHp
				}
				return
			}

			$coolDowns[name] = cooldown
			$selectedItem.combatScore = calculateCombatScore(healing)

			$selectedItem.prompt = `Heal myself with ${name} spell by ${$selectedItem.combatScore} amount, and continue combat.`
			$selectedItem.name = name
			$selectedItem.healing = healing
			$selectedItem.damage = undefined
			$selectedItem.manaCost = manaCost

			return
		}
		if (type === 'unique spell') {
			if (shopMode) return

			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown)
				return ($ui.errorWarnMsg =
					'This spell is on cooldown. ' + $coolDowns[name] + '/' + cooldown)
			$coolDowns[name] = cooldown
			$selectedItem.combatScore = calculateCombatScore(1)

			if (name == 'Summon') {
				if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 5) {
					$selectedItem.prompt = `Use my Summon spell and summon a little bird to help me in this combat.`
				}
				if ($selectedItem.combatScore >= 5 && $selectedItem.combatScore < 10) {
					$selectedItem.prompt = `Use my Summon spell and summon a powerful tiger to help me in this combat.`
				}
				if ($selectedItem.combatScore >= 10 && $selectedItem.combatScore < 15) {
					$selectedItem.prompt = `Use my Summon spell and summon a storm spirit (which is a magician) to help me in this combat.`
				}
				if ($selectedItem.combatScore >= 15 && $selectedItem.combatScore <= 20) {
					$selectedItem.prompt = `Use my Summon spell and summon an ultimate demon to help me in this combat. (combat immedietaly ends with the power of the demon)`
				}
			}
			if (name == 'Teleportation') {
				// if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore <= 20) {
				$selectedItem.prompt = `Use my Teleportation spell and teleport myself to a secure place away from combat.`
				// }
			}

			$selectedItem.name = name
			$selectedItem.damage = 0
			$selectedItem.healing = undefined
			$selectedItem.manaCost = manaCost

			return
		}

		if (type === 'potion') {
			if (shopMode) return

			if (healing && hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (inCombat) return ($ui.errorWarnMsg = "You can't drink in combat.")

			if (healing && hp < maxHp) {
				// emitAnswer(`Drink a ${name} from your inventory to heal by ${healing}.`)

				$character.stats[0].hp += parseInt(healing)
				if ($character.stats[0].hp > $character.stats[0].maxHp) {
					$character.stats[0].hp = $character.stats[0].maxHp
				}

				//delete the potion from inventory
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
				return
			}
			if (mana && mp >= maxMp) return ($ui.errorWarnMsg = "You're at full mana.")
			if (inCombat) return ($ui.errorWarnMsg = "You can't drink in combat.")
			if (mana && mp < maxMp) {
				// emitAnswer(`Drink a ${name} from your inventory to fill up mana by ${mana}.`)
				$character.stats[0].mp += parseInt(mana)
				if ($character.stats[0].mp > $character.stats[0].maxMp) {
					$character.stats[0].mp = $character.stats[0].maxMp
				}

				//delete the potion from inventory
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()

				return
			}
			if (point) {
				$misc.interactivePoints += parseInt(point)

				//delete the chat point from inventory
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
			}
		}

		//for the items which are not implemented (like consumable foods or magic scrolls etc)
		if (
			type !== 'potion' &&
			type !== 'weapon' &&
			type !== 'destruction spell' &&
			type !== 'healing spell' &&
			type !== 'unique spell'
		) {
			if (shopMode) return
			if (healing && hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (mana && mp >= maxMp) return ($ui.errorWarnMsg = "You're at full mana.")
			if (healing || (mana && inCombat)) return ($ui.errorWarnMsg = "You can't consume in combat.")
			if (damage) {
				$selectedItem.combatScore = Math.floor(calculateCombatScore(damage))

				if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 20) {
					if ($game.enemy[0].enemyHp > $selectedItem.combatScore) {
						$selectedItem.prompt = `Attack with ${name}! (give a bad @story, where player lands a unlucky attack, which leads to player giving only ${$selectedItem.combatScore} damage to enemy.)`
					} else {
						$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
					}
				}
				if ($selectedItem.combatScore >= 20 && $selectedItem.combatScore < 50) {
					if ($game.enemy[0].enemyHp > $selectedItem.combatScore) {
						$selectedItem.prompt = `Attack with ${name}! (give a medi-ocre @story, where player lands a decent attack, which leads to player giving ${$selectedItem.combatScore} damage to enemy.)`
					} else {
						$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
					}
				}

				if ($selectedItem.combatScore >= 50 && $selectedItem.combatScore < 85) {
					if ($game.enemy[0].enemyHp > $selectedItem.combatScore) {
						$selectedItem.prompt = `Attack with ${name}! (give a great @story where player lands a powerful attack, giving ${$selectedItem.combatScore} damage.)`
					} else {
						$selectedItem.prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`
					}
				}

				if ($selectedItem.combatScore >= 85) {
					$selectedItem.prompt = `Attack with ${name}! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`
				}

				$selectedItem.name = name
				$selectedItem.damage = damage
				$selectedItem.other = true
				$selectedItem.healing = undefined

				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
				return
			}
		}
	}

	function calculateCombatScore(damage: any) {
		let dice = Math.floor(Math.random() * 20) + 1

		$misc.diceNumber = dice
		return damage * dice
	}
</script>

<div
	style="opacity:{$game.choices.length ? '1' : '0'}; transition:opacity 1.5s;"
	class="container-box"
>
	{#if title == 'Inventory'}
		<div
			class="hp-bar"
			style="background-image: linear-gradient(to right, #b02863aa {hpPercentage}%, #1f1f1fc8 {hpPercentage}%);"
		>
			{$character.stats[0].hp}/{$character.stats[0].maxHp}
		</div>
	{:else if title == 'Spells'}
		<div
			class="mp-bar"
			style="background-image: linear-gradient(to right, #76399caa {mpPercentage}%, #1f1f1fc8 {mpPercentage}%);"
		>
			{$character.stats[0].mp}/{$character.stats[0].maxMp}
		</div>
	{/if}
	<div in:fade={{ delay: 200, duration: 1500 }} class="box">
		<h3>{title}</h3>
		{#each actions as action}
			<button
				disabled={$misc.loading || $misc.death}
				on:click={() => {
					useItem(action)
					handleSell(`You sure to sell ${action.name}?`, action)
				}}
				in:fade={{ duration: 600 }}
			>
				{#if action.type == 'weapon'}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.weaponClass}.svg"
						alt="a weapon"
					/>
				{:else if action.type == 'potion'}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.type}.svg"
						alt="a potion"
					/>
				{:else if action.element}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.element}.svg"
						alt="a spell"
					/>
				{:else}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/item.svg"
						alt="an item"
					/>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.container-box {
		width: 25%;
		display: flex;
		flex-direction: column;
		height: 100%;
		backdrop-filter: blur(2px);
	}

	.hp-bar,
	.mp-bar {
		text-align: center;
		font-size: 1.2rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding: 0.2rem 0;
	}
	.box {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		/* background-color: #362525bc; */
		background-color: #242323bc;

		border-radius: 0.2rem;
		min-height: 25vh;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.box h3 {
		grid-column-start: 1;
		grid-column-end: 4;
		justify-self: center;
		font-weight: 400;
		font-size: 1.4rem;
		color: #3fcf8e;
	}
	.box img {
		width: 85%;
		margin-inline: auto;
		padding: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.box img:active {
		animation: button-pop 0.3s ease-out;
	}
	.box button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		border-radius: 0.4rem;
		width: 85%;
		height: 85%;
		cursor: pointer;
	}

	@media (orientation: portrait) {
		.box {
			min-height: 1rem;
			height: 15vh;
			width: 100%;
		}
		.box h3 {
			/* font-size: 1.1rem; */
			padding: 0.3rem 0 0.6rem 0;
		}
		.box img {
			padding: 0.4rem;
			width: 80%;
		}
		.container-box {
			width: 100%;
		}
		.hp-bar,
		.mp-bar {
			padding: 0;
			/* font-size: 1.1rem; */
		}
	}

	@media (orientation: portrait) and (min-width: 500px) {
		.box img {
			width: 60%;
		}
	}
</style>
