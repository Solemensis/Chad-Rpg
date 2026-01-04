<script lang="ts">
	import { game } from '../../stores'
	import { ui } from '../../stores'
	import { selectedItem } from '../../stores'
	import { character } from '../../stores'
	import { misc } from '../../stores'
	import { descWindow } from '../../stores'
	import { coolDowns } from '../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	import { DICE_SIDES, COMBAT_TIERS, COMBAT_PROMPTS } from '$lib/config/constants'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', { answer })
	}

	export let title: any
	export let actions: any

	function hideWindow() {
		$misc.showDescription = 'none'
	}

	function handleSell(prompt: any, item: any) {
		if ($game.gameData.event?.shopMode) {
			$selectedItem = {}
			$selectedItem = item
			$ui.sellWarnMsg = prompt
		}
	}

	$: hpPercentage = ($character.stats[0].hp / $character.stats[0].maxHp) * 100
	$: mpPercentage = ($character.stats[0].mp / $character.stats[0].maxMp) * 100

	function handleMouseMove(event: any, item: any) {
		$misc.showDescription = 'block'
		$misc.x = event.clientX + 10
		$misc.y = event.clientY - 40

		$descWindow.name = item?.name
		$descWindow.damage = item?.damage
		$descWindow.type = item?.type
		$descWindow.healing = item?.healing
		$descWindow.mana = item?.mana
		$descWindow.point = item?.point
		$descWindow.armor = item?.armor
		$descWindow.element = item?.element
		$descWindow.weaponClass = item?.weaponClass
		$descWindow.manaCost = item?.manaCost
		$descWindow.price = item?.price
		$descWindow.amount = item?.amount
	}

	function useItem(item: any) {
		$selectedItem = {}
		const { type, name, damage, manaCost, healing, mana, cooldown, point } = item
		const { mp, maxMp, hp, maxHp } = $character.stats[0]
		const { inCombat, shopMode } = $game.gameData.event || {}

		if (type === 'weapon') {
			if (shopMode) return
			if (!damage) return ($ui.errorWarnMsg = 'You can only sell that item.')
			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')

			$selectedItem.combatScore = Math.floor(calculateCombatScore(damage, type))
			const isVictory =
				$game.gameData.enemy?.enemyHp && $game.gameData.enemy.enemyHp <= $selectedItem.combatScore

			if (
				$selectedItem.combatScore >= COMBAT_TIERS.POOR.min &&
				$selectedItem.combatScore < COMBAT_TIERS.POOR.max
			) {
				$selectedItem.prompt = isVictory ? COMBAT_PROMPTS.VICTORY(name) : COMBAT_PROMPTS.POOR(name)
			} else if (
				$selectedItem.combatScore >= COMBAT_TIERS.DECENT.min &&
				$selectedItem.combatScore < COMBAT_TIERS.DECENT.max
			) {
				$selectedItem.prompt = isVictory
					? COMBAT_PROMPTS.VICTORY(name)
					: COMBAT_PROMPTS.DECENT(name)
			} else if (
				$selectedItem.combatScore >= COMBAT_TIERS.GREAT.min &&
				$selectedItem.combatScore < COMBAT_TIERS.GREAT.max
			) {
				$selectedItem.prompt = isVictory ? COMBAT_PROMPTS.VICTORY(name) : COMBAT_PROMPTS.GREAT(name)
			} else if ($selectedItem.combatScore >= COMBAT_TIERS.EPIC.min) {
				$selectedItem.prompt = COMBAT_PROMPTS.EPIC(name)
			}

			$selectedItem.name = name
			$selectedItem.damage = damage
			$selectedItem.healing = undefined
			return
		}

		if (type === 'destruction spell') {
			if (shopMode) return
			if (!damage) return ($ui.errorWarnMsg = 'You can only sell that item.')
			if (!inCombat) return ($ui.errorWarnMsg = 'You are not in a combat.')
			if (mp < manaCost) return ($ui.errorWarnMsg = 'You have not enough mana.')
			if ($coolDowns[name] && $coolDowns[name] < cooldown)
				return ($ui.errorWarnMsg =
					'This spell is on cooldown. ' + $coolDowns[name] + '/' + cooldown)
			$coolDowns[name] = cooldown

			$selectedItem.combatScore = Math.floor(calculateCombatScore(damage, type))
			const isVictorySpell =
				$game.gameData.enemy?.enemyHp && $game.gameData.enemy.enemyHp <= $selectedItem.combatScore

			if (
				$selectedItem.combatScore >= COMBAT_TIERS.POOR.min &&
				$selectedItem.combatScore < COMBAT_TIERS.POOR.max
			) {
				$selectedItem.prompt = isVictorySpell
					? `Attack with ${name} spell! (this blow destroys the enemy!)`
					: `Attack with ${name} spell! (player lands a weak attack)`
			} else if (
				$selectedItem.combatScore >= COMBAT_TIERS.DECENT.min &&
				$selectedItem.combatScore < COMBAT_TIERS.DECENT.max
			) {
				$selectedItem.prompt = isVictorySpell
					? `Attack with ${name} spell! (this blow destroys the enemy!)`
					: `Attack with ${name} spell! (gives some damage)`
			} else if (
				$selectedItem.combatScore >= COMBAT_TIERS.GREAT.min &&
				$selectedItem.combatScore < COMBAT_TIERS.GREAT.max
			) {
				$selectedItem.prompt = isVictorySpell
					? `Attack with ${name} spell! (this blow destroys the enemy!)`
					: `Attack with ${name} spell! (great damage!)`
			} else if ($selectedItem.combatScore >= COMBAT_TIERS.EPIC.min) {
				$selectedItem.prompt = `Attack with ${name} spell! (devastating attack!)`
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
			if ($coolDowns[name] && $coolDowns[name] < cooldown)
				return ($ui.errorWarnMsg =
					'This spell is on cooldown. ' + $coolDowns[name] + '/' + cooldown)

			if (!inCombat) {
				emitAnswer(
					`Heal myself with ${name} spell by ${calculateCombatScore(healing, type)} amount.`
				)
				$character.stats[0].hp += calculateCombatScore(healing, type)
				if ($character.stats[0].hp > $character.stats[0].maxHp) {
					$character.stats[0].hp = $character.stats[0].maxHp
				}
				return
			}

			$coolDowns[name] = cooldown
			$selectedItem.combatScore = calculateCombatScore(healing, type)
			$selectedItem.prompt = `Heal myself with ${name} spell by ${$selectedItem.combatScore} amount.`
			$selectedItem.name = name
			$selectedItem.healing = healing
			$selectedItem.damage = undefined
			$selectedItem.manaCost = manaCost
			return
		}

		if (type === 'potion') {
			if (shopMode) return
			if (healing && hp >= maxHp) return ($ui.errorWarnMsg = "You're at full health.")
			if (inCombat) return ($ui.errorWarnMsg = "You can't drink in combat.")

			if (healing && hp < maxHp) {
				$character.stats[0].hp += parseInt(healing)
				if ($character.stats[0].hp > $character.stats[0].maxHp) {
					$character.stats[0].hp = $character.stats[0].maxHp
				}
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
				return
			}
			if (mana && mp >= maxMp) return ($ui.errorWarnMsg = "You're at full mana.")
			if (mana && mp < maxMp) {
				$character.stats[0].mp += parseInt(mana)
				if ($character.stats[0].mp > $character.stats[0].maxMp) {
					$character.stats[0].mp = $character.stats[0].maxMp
				}
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
				return
			}
			if (point) {
				$misc.interactivePoints += parseInt(point)
				let newArray: any = $character.inventory.filter((obj: any) => obj.name !== name)
				$character.inventory = newArray
				hideWindow()
			}
		}
	}

	function calculateCombatScore(damage: any, type: any) {
		let dice
		if (type == 'weapon') {
			dice = Math.floor(Math.random() * DICE_SIDES.WEAPON) + 1
		} else {
			dice = Math.floor(Math.random() * DICE_SIDES.SPELL) + 1
		}
		$misc.diceNumber = dice
		return damage * dice
	}
</script>

<div class="action-panel" in:fly={{ y: 30, duration: 400, delay: 100 }}>
	<!-- Header with stats -->
	<div class="panel-header">
		{#if title === 'Inventory'}
			<div class="stat-bar hp">
				<div class="stat-fill" style="width: {hpPercentage}%" />
				<span class="stat-text">{$character.stats[0].hp}/{$character.stats[0].maxHp}</span>
			</div>
		{:else if title === 'Spells'}
			<div class="stat-bar mp">
				<div class="stat-fill" style="width: {mpPercentage}%" />
				<span class="stat-text">{$character.stats[0].mp}/{$character.stats[0].maxMp}</span>
			</div>
		{:else}
			<div class="stat-bar neutral">
				<div class="stat-fill" style="width: 100%" />
			</div>
		{/if}
		<h3 class="panel-title">{title}</h3>
	</div>

	<!-- Items Grid -->
	<div class="items-grid">
		{#each actions as action, i}
			<button
				class="item-btn"
				disabled={$misc.loading || $misc.death}
				on:click={() => {
					useItem(action)
					handleSell(`Sell ${action.name}?`, action)
				}}
				on:mouseenter={(e) => handleMouseMove(e, action)}
				on:mousemove={(e) => handleMouseMove(e, action)}
				on:mouseleave={hideWindow}
				in:fade={{ duration: 200, delay: i * 50 }}
			>
				{#if action.type === 'weapon'}
					<img class="item-icon" src="/images/{action.weaponClass}.svg" alt={action.name} />
				{:else if action.type === 'potion'}
					<img class="item-icon" src="/images/potion.svg" alt={action.name} />
				{:else if action.element}
					<img class="item-icon" src="/images/{action.element}.svg" alt={action.name} />
				{:else}
					<img class="item-icon" src="/images/item.svg" alt={action.name} />
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.action-panel {
		min-width: 200px;
		max-width: 320px;
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}

	.panel-header {
		padding: var(--space-sm) var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
		border-bottom: 1px solid var(--color-border);
	}

	.stat-bar {
		height: 24px;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.3);
		position: relative;
		overflow: hidden;
	}

	.stat-bar.hp .stat-fill {
		background: linear-gradient(90deg, var(--color-accent-hp), #ff7eb3);
	}

	.stat-bar.mp .stat-fill {
		background: linear-gradient(90deg, var(--color-accent-mp), var(--color-accent-primary));
	}

	.stat-bar.neutral .stat-fill {
		background: rgba(255, 255, 255, 0.1);
	}

	.stat-fill {
		height: 100%;
		border-radius: 12px;
		transition: width var(--transition-normal);
	}

	.stat-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.75rem;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.panel-title {
		margin: 0;
		text-align: center;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-accent-secondary);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.items-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		padding: var(--space-md);
		max-height: 180px;
		overflow-y: auto;
		justify-content: flex-start;
	}

	.item-btn {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.item-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.item-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.item-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.item-icon {
		width: 60%;
		height: 60%;
		object-fit: contain;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		pointer-events: none;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.action-panel {
			min-width: 160px;
			max-width: 280px;
		}

		.item-btn {
			width: 42px;
			height: 42px;
		}

		.items-grid {
			max-height: 140px;
		}
	}

	@media (max-width: 480px) {
		.action-panel {
			min-width: 130px;
			padding: var(--space-xs);
		}

		.panel-header {
			padding: var(--space-xs);
		}

		/* Thinner HP/MP bars on mobile */
		.stat-bar {
			height: 14px;
			border-radius: 7px;
		}

		.stat-fill {
			border-radius: 7px;
		}

		.stat-text {
			font-size: 0.6rem;
		}

		.panel-title {
			font-size: 0.6rem;
		}

		.item-btn {
			width: 32px;
			height: 32px;
		}

		.items-grid {
			max-height: 70px;
			gap: 2px;
			padding: var(--space-xs);
		}
	}
</style>
