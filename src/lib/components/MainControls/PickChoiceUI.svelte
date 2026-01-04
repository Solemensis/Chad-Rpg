<script lang="ts">
	import { game } from '../../../stores'
	import { misc } from '../../../stores'
	import { ui } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	let delay: number = 0

	function getDelayTime() {
		delay += 80
		return { delay }
	}

	function emitAnswer(answer: any) {
		if (!answer) return
		dispatch('emittedAnswer', { answer })
		delay = 0
	}

	function emitInteractiveAnswer(answer: any) {
		if (!answer) return
		if (answer.includes('sex') || answer.includes('kill')) {
			$ui.errorWarnMsg = "There's a flawed word in your answer."
			return
		}

		if ($misc.interactivePoints == 0) {
			$ui.errorWarnMsg = '0 chat points left. Buy from merchants or win battles.'
			return
		}
		$misc.interactivePoints -= 1

		dispatch('emittedAnswer', { answer })
		delay = 0
	}
</script>

<div class="choices-panel choices-container">
	<!-- Choice Buttons -->
	<div class="choices-list">
		{#each $game.gameData.choices as choice, i}
			<button
				class="choice-btn"
				disabled={$misc.loading}
				in:fly={{ y: 15, duration: 300, delay: i * 80 }}
				on:click={() => emitAnswer(choice)}
			>
				<span class="choice-indicator">{i + 1}</span>
				<span class="choice-text">{choice}</span>
			</button>
		{/each}
	</div>

	<!-- Custom Input -->
	{#if $game.gameData.choices?.length >= 1}
		<div class="custom-input" in:fade={{ duration: 300, delay: 300 }}>
			<div class="input-wrapper">
				<input
					type="text"
					placeholder="Write your own action..."
					bind:value={$misc.query}
					on:keydown={(e) => e.key === 'Enter' && emitInteractiveAnswer($misc.query)}
				/>
				<span class="points-badge">{$misc.interactivePoints}</span>
			</div>
			<button
				class="submit-btn"
				disabled={$misc.loading || !$misc.query}
				on:click={() => emitInteractiveAnswer($misc.query)}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.choices-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: 100%;
		height: 100%;
		padding: var(--space-md);
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.choices-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.choice-btn {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-glass);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.choice-btn:hover:not(:disabled) {
		background: rgba(124, 92, 224, 0.15);
		border-color: rgba(124, 92, 224, 0.4);
		transform: translateX(4px);
	}

	.choice-btn:active:not(:disabled) {
		transform: translateX(2px) scale(0.99);
	}

	.choice-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.choice-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		border-radius: var(--radius-sm);
		font-size: 0.8rem;
		font-weight: 600;
		color: white;
		flex-shrink: 0;
	}

	.choice-text {
		font-size: 0.9rem;
		color: var(--color-text-primary);
		line-height: 1.4;
	}

	/* Custom Input */
	.custom-input {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-xs);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 0 var(--space-sm);
	}

	.input-wrapper input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		padding: var(--space-sm) 0;
	}

	.input-wrapper input::placeholder {
		color: var(--color-text-muted);
	}

	.points-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 var(--space-xs);
		background: var(--color-accent-gold);
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, var(--color-accent-primary), #9b6eff);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.submit-btn:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 20px rgba(124, 92, 224, 0.4);
	}

	.submit-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.submit-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.submit-btn svg {
		color: white;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.choice-btn {
			padding: var(--space-sm);
			gap: var(--space-sm);
		}

		.choice-indicator {
			width: 24px;
			height: 24px;
			font-size: 0.7rem;
		}

		.choice-text {
			font-size: 0.85rem;
		}

		.submit-btn {
			width: 40px;
			height: 40px;
		}
	}

	@media (max-width: 480px) {
		.choices-container {
			padding: var(--space-sm);
		}

		.choice-btn {
			padding: var(--space-xs) var(--space-sm);
		}

		.choice-indicator {
			width: 22px;
			height: 22px;
			font-size: 0.65rem;
		}

		.choice-text {
			font-size: 0.8rem;
		}

		/* Thinner custom input on mobile */
		.custom-input {
			padding: 2px;
			gap: 4px;
		}

		.input-wrapper {
			padding: 0 var(--space-xs);
		}

		.input-wrapper input {
			font-size: 0.75rem;
			padding: var(--space-xs) 0;
		}

		.submit-btn {
			width: 34px;
			height: 34px;
		}

		.points-badge {
			min-width: 20px;
			height: 20px;
			font-size: 0.65rem;
		}
	}
</style>
