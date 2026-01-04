<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { game } from '../../stores'

	const dispatch = createEventDispatcher()

	function emitAnswer(heroClass: string) {
		$game.gameData.heroClass = heroClass
		dispatch('emittedAnswer')
	}
</script>

<div class="class-selection">
	<h2>Choose Your Class</h2>

	<div class="cards-container">
		<!-- Warrior Card -->
		<button
			on:click={() => emitAnswer('warrior')}
			class="card"
			in:fly={{ y: 20, duration: 600, delay: 100 }}
		>
			<div class="wrapper">
				<img src="images/characters/warrior1.webp" class="cover-image" alt="Warrior Cover" />
			</div>
			<div class="card-content">
				<h3 class="title">Warrior</h3>
			</div>
			<img src="images/characters/warrior2.webp" class="character" alt="Warrior Character" />
		</button>

		<!-- Mage Card -->
		<button
			on:click={() => emitAnswer('mage')}
			class="card"
			in:fly={{ y: 20, duration: 600, delay: 200 }}
		>
			<div class="wrapper">
				<img src="images/characters/mage1.webp" class="cover-image" alt="Mage Cover" />
			</div>
			<div class="card-content">
				<h3 class="title">Mage</h3>
			</div>
			<img src="images/characters/mage2.webp" class="character" alt="Mage Character" />
		</button>
	</div>
</div>

<style>
	.class-selection {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		gap: var(--space-xl);
	}

	h2 {
		font-family: 'MedievalSharp', serif;
		color: var(--color-accent-gold);
		font-size: 2rem;
		font-weight: 500;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.cards-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-xl);
		padding: var(--space-md);
		width: 100%;
		flex: 1;
	}

	.card {
		--card-height: 300px;
		--card-width: 200px;
		width: var(--card-width);
		height: var(--card-height);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 0 1.5rem;
		perspective: 2500px;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: transform var(--transition-normal);
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-lg);
	}

	.wrapper {
		transition: all 0.5s ease-out;
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: -1;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.card:hover .wrapper {
		transform: perspective(900px) translateY(-5%) rotateX(25deg) translateZ(0);
		box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
		border-color: var(--color-accent-primary);
	}

	.wrapper::before,
	.wrapper::after {
		content: '';
		opacity: 0;
		width: 100%;
		height: 50%;
		transition: all 0.5s;
		position: absolute;
		left: 0;
		z-index: 10;
		pointer-events: none;
	}

	.wrapper::before {
		top: 0;
		background: linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
	}

	.wrapper::after {
		bottom: 0;
		opacity: 1;
		background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
	}

	.card:hover .wrapper::before,
	.card:hover .wrapper::after {
		opacity: 1;
	}

	.title {
		width: 100%;
		transition: transform 0.5s;
		font-family: 'MedievalSharp', serif;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		color: var(--color-text-primary);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
		position: absolute;
		bottom: 0;
		left: 0;
		text-align: center;
		z-index: 20;
	}

	.card:hover .title {
		transform: translate3d(0%, -50px, 100px);
		color: var(--color-accent-gold);
	}

	.character {
		width: 100%;
		opacity: 0;
		transition: all 0.5s;
		position: absolute;
		z-index: -1;
		pointer-events: none;
		bottom: 0;
	}

	.card:hover .character {
		opacity: 1;
		transform: translate3d(0%, -20%, 100px) scale(1.1);
		z-index: 10;
	}

	/* Responsive */
	@media (max-width: 600px) {
		.cards-container {
			flex-direction: column;
			gap: var(--space-lg);
		}

		.card {
			--card-height: 240px;
			--card-width: 160px;
		}
	}
</style>
