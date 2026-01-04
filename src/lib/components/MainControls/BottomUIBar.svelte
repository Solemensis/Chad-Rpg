<script lang="ts">
	import { misc } from '../../../stores'
	import { game } from '../../../stores'
	import { character } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer(
				"Player tries to escape, but got hit while trying to escape, couldn't escape and lost 20 health. Combat goes on."
			)
			$character.stats[0].hp -= 20
		} else {
			emitAnswer('Player tries to escape, and escapes from the combat area successfully!')
			$game.gameData.event.inCombat = false
			$game.gameData.enemy = []
		}
	}

	function leaveButton(leaveString: any) {
		emitAnswer(leaveString)
		$game.gameData.event.shopMode = null
		$game.gameData.event.lootMode = false
		$game.gameData.lootBox = []
	}

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', { answer })
	}

	function extractHours(time: string): number {
		if (!time) return 0
		const parts = time.split(':')
		return parseInt(parts[0]) || 0
	}
</script>

{#if !$misc.loading}
	{#if $game.gameData.choices?.length >= 2 || $game.gameData.event?.inCombat || $game.gameData.event?.shopMode || $game.gameData.event?.lootMode}
		<div class="bottom-bar" in:fly={{ y: 20, duration: 400, delay: 200 }}>
			<!-- Gold Display -->
			<div class="stat-chip gold">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<circle cx="12" cy="12" r="10" fill="#f0c040" />
					<circle cx="12" cy="12" r="6" fill="#d4a832" />
				</svg>
				<span class="stat-value">{$character.gold}</span>
			</div>

			<!-- Action Buttons (contextual) -->
			<div class="action-buttons">
				{#if $game.gameData.event?.inCombat}
					<button
						class="action-btn retreat"
						disabled={$misc.loading}
						on:click={() => calculateRetreat()}
						in:fade={{ duration: 200 }}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
						<span>Retreat</span>
					</button>
				{:else if $game.gameData.event?.shopMode}
					<button
						class="action-btn leave-shop"
						disabled={$misc.loading}
						on:click={() => {
							leaveButton("I'll leave the shop.")
							$game.gameData.event.shopMode = null
						}}
					>
						🚪 Leave Shop
					</button>
				{:else if $game.gameData.event?.lootMode}
					<button
						class="action-btn"
						disabled={$misc.loading}
						style="opacity: {$game.gameData.lootBox?.length ? '1' : '0'};"
						on:click={() => leaveButton('Leave the loot.')}
					>
						Leave it
					</button>
				{/if}
			</div>

			<!-- Time Display -->
			<div class="stat-chip time">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</svg>
				<span class="stat-value">{$game.gameData.placeAndTime?.time || '00:00'}</span>
			</div>
		</div>
	{/if}
{/if}

<style>
	.bottom-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-sm) 0;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
	}

	/* Stat Chips */
	.stat-chip {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		background: var(--color-bg-card);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		min-width: 80px;
	}

	.stat-chip.gold svg {
		flex-shrink: 0;
	}

	.stat-chip.time svg {
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.stat-value {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-primary);
		font-variant-numeric: tabular-nums;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		justify-content: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		background: var(--color-bg-glass);
		backdrop-filter: blur(12px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.action-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
	}

	.action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.action-btn.retreat {
		background: var(--color-bg-card);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-color: var(--color-border);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.action-btn.retreat:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
	}

	.action-btn.secondary {
		background: transparent;
		border-color: rgba(255, 255, 255, 0.15);
	}

	.action-btn.leave-shop {
		background: var(--color-bg-card);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-color: var(--color-border);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.action-btn.leave-shop:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
	}

	/* Responsive */
	@media (max-width: 600px) {
		.bottom-bar {
			flex-wrap: wrap;
			gap: var(--space-sm);
		}

		.stat-chip {
			min-width: 70px;
			padding: var(--space-xs) var(--space-sm);
		}

		.stat-value {
			font-size: 0.85rem;
		}

		.action-btn {
			font-size: 0.75rem;
			padding: var(--space-xs) var(--space-sm);
		}
	}
</style>
