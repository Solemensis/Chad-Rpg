<script lang="ts">
	import { fade } from 'svelte/transition'

	import { createEventDispatcher } from 'svelte'
	import { game } from '../../stores'
	const dispatch = createEventDispatcher()
	function emitAnswer(heroClass: string) {
		$game.heroClass = heroClass
		dispatch('emittedAnswer')
	}
</script>

<h2>Choose Your Class!</h2>
<div transition:fade={{ duration: 800 }} class="cards">
	<button
		on:click={() => {
			emitAnswer('warrior')
		}}
		class="card"
	>
		<div class="wrapper">
			<img
				transition:fade={{ duration: 1300 }}
				src="images/characters/warrior1.webp"
				class="cover-image"
			/>
		</div>
		<h3 class="title">Warrior</h3>

		<img src="images/characters/warrior2.webp" class="character" />
	</button>

	<button
		on:click={() => {
			emitAnswer('mage')
		}}
		class="card"
	>
		<div class="wrapper">
			<img
				transition:fade={{ duration: 1300 }}
				src="images/characters/mage1.webp"
				class="cover-image"
			/>
		</div>
		<h3 class="title">Mage</h3>
		<img src="images/characters/mage2.webp" class="character" />
	</button>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap');
	h2 {
		position: absolute;
		font-family: 'MedievalSharp', sans-serif;
		text-align: center;
		left: 50%;
		top: 2rem;
		transform: translateX(-50%);

		color: orange;

		font-size: 2.2rem;
		font-weight: 500;
	}
	.cards {
		position: absolute;
		left: 50%;
		bottom: 2rem;
		transform: translateX(-50%);
		display: flex;
	}
	:root {
		--card-height: 18rem;
		--card-width: calc(var(--card-height) / 1.5);
	}
	.card {
		width: var(--card-width);
		height: var(--card-height);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 0 1.7rem;
		perspective: 2500px;
		margin: 0 2.4rem;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 0.5rem;
	}

	.wrapper {
		transition: all 0.4s;
		position: absolute;
		width: 100%;
		z-index: -1;
	}

	.card:hover .wrapper {
		transform: perspective(900px) translateY(-5%) rotateX(25deg) translateZ(0);
		box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
		-webkit-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
		-moz-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
	}

	.wrapper::before,
	.wrapper::after {
		content: '';
		opacity: 0;
		width: 100%;
		height: 3.9rem;
		transition: all 0.4s;
		position: absolute;
		left: 0;
	}
	.wrapper::before {
		top: 0;
		height: 100%;
		background-image: linear-gradient(
			to top,
			transparent 46%,
			rgba(12, 13, 19, 0.5) 68%,
			rgba(12, 13, 19) 97%
		);
	}
	.wrapper::after {
		bottom: 0;
		opacity: 1;
		background-image: linear-gradient(
			to bottom,
			transparent 46%,
			rgba(12, 13, 19, 0.5) 68%,
			rgba(12, 13, 19) 97%
		);
	}

	.card:hover .wrapper::before,
	.wrapper::after {
		opacity: 1;
	}

	.card:hover .wrapper::after {
		height: 5.8rem;
	}
	.title {
		transition: transform 0.4s;
		font-family: 'Amatic SC';
		font-size: 2rem;
		margin-bottom: 0.4rem;
		color: #bbb;
	}
	.card:hover .title {
		transform: translate3d(0%, -50px, 100px);
	}

	.character {
		width: 100%;
		opacity: 0;
		transition: all 0.4s;
		position: absolute;
		z-index: -1;
	}

	.card:hover .character {
		opacity: 1;
		transform: translate3d(0%, -30%, 100px);
	}

	@media (orientation: portrait) {
		.card {
			margin: 0 0.8rem;
		}
		.cards {
			bottom: 50%;
			transform: translate(-50%, 50%);
		}
		:root {
			--card-height: 14rem;
		}
	}
</style>
