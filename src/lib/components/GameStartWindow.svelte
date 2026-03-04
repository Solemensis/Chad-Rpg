<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
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

	async function handleGameMode(answer: any) {
		const el = document.getElementById('game-start-window')
		let oldHeight = 'auto'

		if (el) {
			oldHeight = `${el.clientHeight}px`
			el.style.height = oldHeight // Lock height temporarily
		}

		gameModeSelected = true
		gameStarterPrompt = answer

		await tick() // Wait for DOM update and svelte transitions

		if (el) {
			// Find the old fading element to temporarily hide it so we can measure ONLY the new content
			const oldContent = el.querySelector('.start-content') as HTMLElement | null
			let oldDisplay = ''
			if (oldContent) {
				oldDisplay = oldContent.style.display
				oldContent.style.display = 'none'
			}

			// Release lock to get new natural height
			el.style.height = 'auto'
			const newHeight = `${el.clientHeight}px`

			// Restore old element for the fade transition
			if (oldContent) {
				oldContent.style.display = oldDisplay
			}

			// Animate smoothly between old and new heights
			el.style.height = oldHeight
			const animation = el.animate([{ height: oldHeight }, { height: newHeight }], {
				duration: 400,
				easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
			})

			animation.onfinish = () => {
				el.style.height = 'auto' // Set to auto after animation so it remains responsive
			}
		}
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 500 }}>
	<div class="start-window" id="game-start-window" in:fly={{ y: 30, duration: 600, delay: 200 }}>
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
		max-height: 90vh; /* Replaced fixed height for responsiveness */
		background: rgba(10, 10, 15, 0.75); /* Darker ethereal glass for better contrast */
		backdrop-filter: blur(30px) saturate(120%);
		-webkit-backdrop-filter: blur(30px) saturate(120%);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05);

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
		height: auto;
		max-height: 100%;
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
		background: rgba(255, 255, 255, 0.05); /* slightly lighter glass for cards */
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.mode-card.available:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.05);
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
		background: linear-gradient(135deg, rgba(124, 92, 224, 0.8), rgba(155, 110, 255, 0.8));
		backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		box-shadow: 0 0 10px rgba(124, 92, 224, 0.5);
	}

	.play-btn.primary:hover {
		transform: scale(1.05);
		box-shadow: 0 0 20px rgba(155, 110, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5);
		border-color: rgba(255, 255, 255, 0.6);
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
