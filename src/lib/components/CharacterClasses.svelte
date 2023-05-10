<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { game } from '../../stores'
	const dispatch = createEventDispatcher()
	function emitAnswer(heroClass: string) {
		$game.heroClass = heroClass
		dispatch('emittedAnswer')
	}
</script>

<h2>Choose Your Class!</h2>
<div class="cards">
	<button
		on:click={() => {
			emitAnswer('warrior')
		}}
		class="card"
	>
		<div class="wrapper">
			<img src="images/characters/warrior1.webp" class="cover-image" />
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
			<img src="images/characters/mage1.webp" class="cover-image" />
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

		left: 50%;
		top: 1.5rem;
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
		--card-height: 300px;
		--card-width: calc(var(--card-height) / 1.5);
	}
	.card {
		width: var(--card-width);
		height: var(--card-height);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 0 36px;
		perspective: 2500px;
		margin: 0 50px;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		height: 80px;
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
		height: 120px;
	}
	.title {
		transition: transform 0.4s;
		font-family: 'Amatic SC';
		font-size: 2rem;
		margin-bottom: 0.8rem;
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
</style>
