<script lang="ts">
    import { game } from '../../stores.js';
    import { ui } from '../../stores.js';
    import { selectedItem } from '../../stores.js'
	import { character } from '../../stores.js';

	import { misc } from '../../stores.js';
	import { descWindow } from '../../stores.js';
	import { coolDowns } from '../../stores.js';


	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();


    function emitAnswer(answer:any) {
		dispatch('emittedAnswer', {
			answer: answer
		});
	}

	export let title:any;
	export let actions:any;


	function hideWindow() {
		$misc.showDescription = 'none'

	}



	function handleSell(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
$selectedItem={}

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
            $descWindow.armor = item && item.armor ? item.armor : undefined
         $descWindow.element = item && item.element ? item.element : undefined
            $descWindow.weaponClass = item && item.weaponClass ? item.weaponClass : undefined
             $descWindow.manaCost = item && item.manaCost ? item.manaCost : undefined
            $descWindow.price = item && item.price ? item.price : undefined
             $descWindow.amount = item && item.amount ? item.amount : undefined
}

	

function useItem(item: any) {
$selectedItem={};

		const { type, name, damage, manaCost, healing, mana, cooldown } = item
		const { mp, maxMp, hp, maxHp } = $character.stats[0]
		const { inCombat, shopMode } = $game.event[0]

		if (type === 'weapon') {
			if (shopMode) return
			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')
			$selectedItem.combatScore = calculateCombatScore(damage)


			if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 10) {
				$selectedItem.prompt = `Attack with ${name}! (give hard times to player in @story, where player lands the worst possible attack, which leads to player receiving ${$misc.diceNumber} damage and giving ${Math.floor(
					$selectedItem.combatScore
				)} damage back.)`
			}
			if ($selectedItem.combatScore >= 10 && $selectedItem.combatScore < 20) {
				$selectedItem.prompt = `Attack with ${name}! (give a sad @story where player lands a bad attack, which leads to player takes some hits but giving some little damage back at least.)`
			}
			if ($selectedItem.combatScore >= 20 && $selectedItem.combatScore < 50) {
				$selectedItem.prompt = `Attack with ${name}! (give a medi-ocre @story where player lands a decent attack, which leads to an okayish scenario in combat for now.)`
			}
			if ($selectedItem.combatScore >= 50 && $selectedItem.combatScore < 80) {
				$selectedItem.prompt = `Attack with ${name}! (Tell a thrilling @story where player lands a great attack, dealing significant damage to the enemy and gaining an advantage in combat.)`
			}
			if ($selectedItem.combatScore >= 80 && $selectedItem.combatScore < 100) {
				$selectedItem.prompt = `Attack with ${name}! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy or causing massive damage.)`
			}

			if ($selectedItem.combatScore >= 100) {
				$selectedItem.prompt = `Attack with ${name}! (Craft a legendary @story where player uses the most powerful spell, unleashing an unstoppable force that annihilates the enemy and wins the battle.)`
			}

			$selectedItem.name = name
			$selectedItem.damage = damage
			$selectedItem.healing = undefined
			console.log($selectedItem)
			return
		}

		if (type === 'destruction spell') {
			if (shopMode) return

			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown)
				return ($ui.errorWarnMsg =
					'This skill is on cooldown. ' + $coolDowns[name] + '/' + cooldown)
			$coolDowns[name] = cooldown
			$selectedItem.combatScore = calculateCombatScore(damage)

			if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 10) {
				$selectedItem.prompt = `Attack with ${name} spell! (give hard times to player in @story, where player lands the worst possible attack, which leads to player taking some serious hits and lose some huge health from enemy attacks, losing combat advantage aswell.)`
			}
			if ($selectedItem.combatScore >= 10 && $selectedItem.combatScore < 20) {
				$selectedItem.prompt = `Attack with ${name} spell! (give a sad @story where player lands a bad attack, which leads to player takes some hits but giving some little damage back at least.)`
			}
			if ($selectedItem.combatScore >= 20 && $selectedItem.combatScore < 50) {
				// $selectedItem.prompt = `Attack with ${name} spell! (give a medi-ocre @story where player lands a decent attack, which leads to an okayish scenario in combat for now.)`
				// $selectedItem.prompt = `Attack with ${name} spell! (give an okay scenario which gives 20 damage to enemy)`
				$selectedItem.prompt = `Give a fascinating scenario where player defeats the enemy with ease. (then, change 'inCombat' to false and clear the @enemy array.)`
				// enemy[0].enemyHp -=20 (burda verilmez bu)
			}
			if ($selectedItem.combatScore >= 50 && $selectedItem.combatScore < 80) {
				$selectedItem.prompt = `Attack with ${name} spell! (Tell a thrilling @story where player lands a great attack, dealing significant damage to the enemy and gaining an advantage in combat.)`
			}
			if ($selectedItem.combatScore >= 80 && $selectedItem.combatScore < 100) {
				$selectedItem.prompt = `Attack with ${name} spell! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy or causing massive damage.)`
			}

			if ($selectedItem.combatScore >= 100) {
				$selectedItem.prompt = `Attack with ${name} spell! (Craft a legendary @story where player uses the most powerful spell, unleashing an unstoppable force that annihilates the enemy and wins the battle.)`
			}

			$selectedItem.name = name
			$selectedItem.damage = damage
			$selectedItem.healing = undefined
			$selectedItem.manaCost = manaCost
			console.log($selectedItem)

			return
		}

		if (type === 'healing spell') {
			if (shopMode) return

			if (hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown) return ($ui.errorWarnMsg = 'On cooldown')
			if (!inCombat)
				return  emitAnswer(
					`Heal myself with ${name} spell by ${calculateCombatScore(healing)} amount.)`
				)

			$coolDowns[name] = cooldown
			$selectedItem.combatScore = calculateCombatScore(healing)

			$selectedItem.prompt = `Heal myself with ${name} spell by ${$selectedItem.combatScore} amount.`
			$selectedItem.name = name
			$selectedItem.healing = healing
			$selectedItem.damage = undefined
			$selectedItem.manaCost = manaCost
			console.log($selectedItem)

			return
		}
		if (type === 'unique spell') {
			if (shopMode) return
		}

		if (type === 'potion') {
			if (shopMode) return

			if (healing && hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (inCombat) return ($ui.errorWarnMsg = "You can't drink in combat.")

			if (healing && hp < maxHp) {
				return  emitAnswer(
					`Drink a ${name} from your inventory to heal by ${healing}. (that potion must be gone from inventory after that)`
				)
			}
			if (mp && mp >= maxMp) return ($ui.errorWarnMsg = "You're at full mana.")
			if (inCombat) return ($ui.errorWarnMsg = "You can't drink in combat.")
			if (mp && mp < maxMp) {
				return  emitAnswer(
					`Drink a ${name} from your inventory to fill up mana by ${mana}. (that potion must be gone from inventory after that)`
				)
			}
		}
	}

	function calculateCombatScore(damage: any) {
		let dice = Math.floor(Math.random() * 20) + 1

		console.log(damage)
		console.log(dice)
		console.log(damage * dice)

		$misc.diceNumber=dice
		return damage * dice
	}
</script>

<div style="opacity:{$game.choices.length ? '1' : '0'}; transition:opacity 1.5s;" class="container-box">
	{#if title=="Inventory"}
	<div
		class="hp-bar"
		style="background-image: linear-gradient(to right, #b02863aa {hpPercentage}%, #1f1f1fc8);"
	>
		{$character.stats[0].hp}/{$character.stats[0].maxHp}
	</div>
	{:else if title =="Spells"}
	<div
	class="mp-bar"
	style="background-image: linear-gradient(to right, #76399caa {mpPercentage}%, #1f1f1fc8);"
>
	{$character.stats[0].mp}/{$character.stats[0].maxMp}
</div>
	{/if}
	<div in:fade={{ delay: 200, duration: 1500 }} class="box">
		<h3>{title}</h3>
		{#each actions as action}
			<button
				disabled={$misc.loading}
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
						alt=""
					/>
				{:else if action.type == 'potion'}
					<img
						on:mousemove={(event) => handleMouseMove(event, action)}
						on:mouseleave={hideWindow}
						src="/images/{action.type}.svg"
						alt=""
					/>
				{:else if action.element}
				<img
				on:mousemove={(event) => handleMouseMove(event, action)}
				on:mouseleave={hideWindow}
				src="/images/{action.element}.svg"
				alt=""
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
		background-color: #362525bc;

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
		/* font-family:"medieval" !important; */
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
	}

	</style>