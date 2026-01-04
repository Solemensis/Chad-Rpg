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
		$game.gameData.enemy && $game.gameData.enemy?.enemyHp && $game.gameData.enemy?.enemyMaxHp
			? ($game.gameData.enemy.enemyHp / $game.gameData.enemy.enemyMaxHp) * 100
			: 100
</script>

<!-- combat ui -->
{#if !$misc.loading}
	<div class="combat-panel" transition:fade={{ duration: 400 }}>
		<!-- Combat Header -->
		<div class="combat-header">
			<h3>You are now in a <span class="combat-accent">Combat</span> against:</h3>
			{#if $game.gameData.enemy}
				<div class="enemy-info">
					{#if $game.gameData.enemy.enemyName}
						<span class="enemy-name">{$game.gameData.enemy.enemyName}</span>
					{/if}
					{#if $game.gameData.enemy.name}
						<span class="enemy-name">{$game.gameData.enemy.name}</span>
					{/if}
					<div class="enemy-hp-bar">
						<div class="enemy-hp-fill" style="width: {hpPercentage}%" />
						<span class="enemy-hp-text">
							{$game.gameData.enemy.enemyHp} HP
						</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Combat Info -->
		<div class="combat-content">
			<ul class="combat-instructions">
				{#if !$selectedItem.name}
					<li>
						<span class="icon">⚔️</span>
						Choose a <span class="highlight">weapon</span> or a
						<span class="highlight">spell.</span>
					</li>
				{:else if $selectedItem.damage}
					<li>
						<span class="icon">⚔️</span>
						You chose <span class="highlight">{$selectedItem.name}</span> with
						<span class="highlight">x{$selectedItem.damage}</span> damage!
					</li>
				{:else if $selectedItem.healing}
					<li>
						<span class="icon">⚔️</span>
						You chose <span class="highlight">{$selectedItem.name}</span> with
						<span class="highlight">x{$selectedItem.healing}</span> heal power!
					</li>
				{:else}
					<li>
						<span class="icon">⚔️</span>
						You chose <span class="highlight">{$selectedItem.name}</span> with
						<span class="highlight">unique</span> power!
					</li>
				{/if}

				<li>
					<span class="icon">🎲</span>
					Then, press the <span class="highlight">dice</span> to learn your fate!
				</li>
				<li class="tip">
					<span class="icon">🔮</span>
					Success is related to <span class="highlight">damage</span> and the
					<span class="highlight">dice number.</span>
				</li>
			</ul>

			<button
				class="dice-btn"
				on:click={() => throwDice($selectedItem)}
				transition:fade={{ duration: 200 }}
			>
				{#if !diceThrown}
					<img src="images/dice.webp" alt="throw dice" transition:fade={{ duration: 300 }} />
				{:else}
					<p class="dice-number" transition:fade={{ duration: 300 }}>
						{$misc.diceNumber}<span>/23</span>
					</p>
				{/if}
			</button>
		</div>
	</div>
{/if}

<!-- combat ui ends here-->
<style>
	.combat-panel {
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		width: 100%;
	}

	.combat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-md);
	}

	.combat-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 400;
		color: var(--color-text-primary);
	}

	.combat-accent {
		color: var(--color-accent-hp);
		font-weight: 500;
	}

	.enemy-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-xs);
	}

	.enemy-name {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.enemy-hp-bar {
		width: 120px;
		height: 24px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		position: relative;
		overflow: hidden;
	}

	.enemy-hp-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-accent-hp), #ff7eb3);
		border-radius: 12px;
		transition: width var(--transition-normal);
	}

	.enemy-hp-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.combat-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
	}

	.combat-instructions {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		flex: 1;
	}

	.combat-instructions li {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		line-height: 1.4;
		display: flex;
		align-items: flex-start;
		gap: var(--space-xs);
	}

	.combat-instructions li .icon {
		flex-shrink: 0;
	}

	.combat-instructions li.tip {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.highlight {
		color: var(--color-accent-secondary);
		font-weight: 500;
	}

	.dice-btn {
		width: 72px;
		height: 72px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		flex-shrink: 0;
		position: relative;
	}

	.dice-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-accent-secondary);
		transform: scale(1.05);
		box-shadow: 0 4px 16px rgba(63, 207, 142, 0.2);
	}

	.dice-btn:active {
		transform: scale(0.98);
	}

	.dice-btn img {
		width: 56px;
		height: 56px;
		object-fit: contain;
	}

	.dice-number {
		font-size: 1.8rem;
		font-weight: 600;
		color: var(--color-accent-secondary);
		margin: 0;
	}

	.dice-number span {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	@media (max-width: 768px) {
		.combat-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.enemy-info {
			align-items: flex-start;
			width: 100%;
		}

		.enemy-hp-bar {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.combat-panel {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.combat-header h3 {
			font-size: 0.95rem;
		}

		.combat-content {
			flex-direction: column;
			gap: var(--space-md);
		}

		.combat-instructions li {
			font-size: 0.85rem;
		}

		.dice-btn {
			width: 60px;
			height: 60px;
		}

		.dice-btn img {
			width: 44px;
			height: 44px;
		}
	}
</style>
