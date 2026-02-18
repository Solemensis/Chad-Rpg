<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	import CharacterClasses from '$lib/components/CharacterClasses.svelte'

	import { misc } from '../../stores'
	import { character } from '../../stores'

	import medievalTavernStarter from '$lib/gamedata/gamestarters/medievalTavernStarter.json'

	function getRandomValueFromArray(array: any) {
		const randomIndex = Math.floor(Math.random() * array?.length)
		return array[randomIndex]
	}

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		$character.stats[0].hp = 1
		dispatch('emittedAnswer', { answer })
	}

	let gameStarterPrompt: string = ''
	let gameModeSelected: boolean = false

	function handleGameMode(answer: any) {
		gameModeSelected = true
		gameStarterPrompt = answer
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 500 }}>
	<div class="start-window" in:fly={{ y: 30, duration: 600, delay: 200 }}>
		{#if gameModeSelected}
			<div class="character-select" transition:fade={{ duration: 400 }}>
				<CharacterClasses
					on:emittedAnswer={() => {
						emitAnswer(gameStarterPrompt)
					}}
				/>
			</div>
		{:else}
			<div class="start-content" transition:fade={{ duration: 400 }}>
				<!-- Header -->
				<header class="start-header">
					<h1>
						Welcome to <span class="brand">Chad-Rpg!</span>
					</h1>
					<!-- <button class="info-btn" on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
						What is That?
					</button> -->
				</header>

				<!-- Game Mode Grid -->
				<div class="modes-grid">
					<!-- FRPG Starter -->
					<div class="mode-card available">
						<div class="mode-icon">
							<img src="images/landscape-svgs/rpg.webp" alt="FRPG" />
						</div>
						<div class="mode-info">
							<h3>FRPG Starter</h3>
							<p>Start as a new adventurer in a fantasy role-playing world, entering a tavern.</p>
							<button
								class="play-btn primary"
								on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))}
							>
								Play
							</button>
						</div>
					</div>

					<!-- Cyberpunk Starter -->
					<div class="mode-card disabled">
						<div class="mode-icon">
							<img src="images/landscape-svgs/cyberpunk.webp" alt="Cyberpunk" />
						</div>
						<div class="mode-info">
							<h3>Cyberpunk Starter</h3>
							<p>Start as a capable human being at a neon city in a Cyberpunk world.</p>
							<button class="play-btn" disabled>Coming Soon</button>
						</div>
					</div>

					<!-- Random Starter -->
					<div class="mode-card disabled">
						<div class="mode-icon">
							<img src="images/landscape-svgs/random.svg" alt="Random" />
						</div>
						<div class="mode-info">
							<h3>Random Starter</h3>
							<p>Start the game at a random place, in a random world, while on a random event.</p>
							<button class="play-btn" disabled>Coming Soon</button>
						</div>
					</div>

					<!-- Custom Starter -->
					<div class="mode-card disabled">
						<div class="mode-icon">
							<img src="images/landscape-svgs/custom.svg" alt="Custom" />
						</div>
						<div class="mode-info">
							<h3>Custom Starter</h3>
							<p>Start your own unique adventure in your own world!</p>
							<button class="play-btn" disabled>Coming Soon</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
	}

	.start-window {
		width: min(90%, 800px);
		height: min(85vh, 700px); /* Fixed height for smoother transition */
		background: var(--color-bg-card); /* Updated to match glass theme */
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-lg);

		/* Grid layout to stack children */
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.start-content,
	.character-select {
		grid-area: 1 / 1; /* Both occupy the same cell */
		width: 100%;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.start-content {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		height: 100%;
	}

	.character-select {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	/* Header */
	.start-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0; /* Prevent header from shrinking */
	}

	.start-header h1 {
		font-family: 'MedievalSharp', serif;
		font-size: clamp(1.8rem, 5vw, 2.5rem);
		font-weight: 400;
		margin: 0;
		text-align: center;
	}

	.brand {
		color: var(--color-accent-gold);
	}

	.info-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-xs) var(--space-md);
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.info-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-text-primary);
	}

	/* Game Modes Grid */
	.modes-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
		flex: 1; /* Take up remaining space */
		align-content: center; /* Center grid rows vertically */
	}

	.mode-card {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.mode-card.available:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	.mode-card.disabled {
		opacity: 0.5;
		filter: grayscale(0.8);
	}

	.mode-icon {
		flex-shrink: 0;
		width: 64px;
		height: 64px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: rgba(0, 0, 0, 0.2);
	}

	.mode-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mode-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.mode-info h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-accent-gold);
	}

	.mode-info p {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
		flex: 1;
	}

	.play-btn {
		align-self: flex-end;
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text-secondary);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.play-btn.primary {
		background: linear-gradient(135deg, var(--color-accent-primary), #9b6eff);
		border-color: transparent;
		color: white;
	}

	.play-btn.primary:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 15px rgba(124, 92, 224, 0.4);
	}

	.play-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Responsive */
	@media (max-width: 700px) {
		.modes-grid {
			grid-template-columns: 1fr;
		}

		.start-content {
			padding: var(--space-md);
		}

		.mode-icon {
			width: 56px;
			height: 56px;
		}
	}

	@media (max-width: 480px) {
		.mode-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.mode-info {
			align-items: center;
		}

		.play-btn {
			align-self: center;
		}
	}
</style>
