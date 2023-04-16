<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	import { misc } from '../../stores.js'
	import { character } from '../../stores.js'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		//this is just to revive player, hp will be set after the prompt.
		$character.stats[0].hp = 1

		//start the game
		dispatch('emittedAnswer', {
			answer: answer
		})
	}
</script>

<div transition:fade={{ duration: 1000 }} class="starting-screen">
	<div class="heading-box">
		<h1>Welcome to <span class="g-span">Chad-Rpg!</span></h1>
		<button on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>What is That?</button>
	</div>
	<div class="game-starters">
		<div class="game-starter">
			<img src="images/landscape-svgs/rpg.webp" alt="game mode img" />
			<div class="game-explanation">
				<h3>FRPG Starter</h3>
				<p>Start as a new adventurer in a fantasy role-playing world, entering a tavern.</p>
				<button
					on:click={() => {
						emitAnswer(
							`Start off as a new adventurer in a fantasy role-playing world. Player enters a bustling tavern in a town.`
						)
					}}>Play</button
				>
			</div>
		</div>
		<div class="game-starter">
			<img src="images/landscape-svgs/cyberpunk.webp" alt="game mode img" />

			<div class="game-explanation">
				<h3>Cyberpunk Starter</h3>
				<p>Start as a capable human being at a neon city in a Cyberpunk world.</p>
				<button>Play</button>
			</div>
		</div>

		<div class="game-starter">
			<img src="images/landscape-svgs/random.svg" alt="game mode img" />

			<div class="game-explanation">
				<h3>Random Starter</h3>
				<p>Start the game at a random place, in a random world, while on a random event.</p>
				<button>Play</button>
			</div>
		</div>
		<div class="game-starter">
			<img src="images/landscape-svgs/custom.svg" alt="game mode img" />

			<div class="game-explanation">
				<h3>Custom Starter</h3>
				<p>Start your own unique adventure in your own world!</p>
				<button>Configure game settings</button>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

	.starting-screen {
		background-color: #242424cc;
		width: 60%;
		height: 60%;
		border-radius: 1rem;
		backdrop-filter: blur(4px);

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.heading-box {
		position: absolute;
		top: 1.8rem;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		display: flex;
		flex-direction: column;
	}
	h1 {
		font-weight: 400;
		font-family: 'MedievalSharp', sans-serif;
		font-size: 2.6rem;
	}
	.g-span {
		font-weight: 400;
		color: orange;
		font-family: 'MedievalSharp', sans-serif;
	}

	.heading-box button {
		margin-top: 0.8rem;
		align-self: end;
		border: none;
		background-color: rgba(239, 102, 52, 0.111);
		color: #eee;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		transition: 0.2s;
	}
	.heading-box button:hover {
		background-color: rgba(239, 102, 52, 0.15);
		cursor: pointer;
	}

	.game-starters img {
		width: 5rem;
	}
	.game-starters {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 1rem;
		grid-row-gap: 2rem;
		justify-items: center;
		align-items: start;

		position: absolute;
		bottom: 3.5rem;
	}
	.game-starter {
		display: flex;
		gap: 1rem;
		width: 80%;
		align-items: start;
	}
	.game-explanation {
		display: flex;
		flex-direction: column;
	}
	.game-explanation h3 {
		margin-bottom: 0.3rem;
		color: orange;
		font-weight: 500;
	}
	.game-explanation p {
		line-height: 1.1;
		font-size: 0.9rem;
		color: #ddd;
	}
	.game-explanation button {
		margin-top: 1rem;
		align-self: end;

		border: none;
		background-color: rgb(180, 46, 224, 0.5);
		color: #eee;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		transition: 0.2s;
	}
	.game-explanation button:hover {
		background-color: rgb(180, 46, 224, 0.8);
		cursor: pointer;
	}

	.game-starter:nth-child(2),
	.game-starter:nth-child(3),
	.game-starter:nth-child(4) {
		filter: grayscale(1);
		opacity: 0.5;
	}
	.game-starter:nth-child(2) button,
	.game-starter:nth-child(3) button,
	.game-starter:nth-child(4) button {
		cursor: not-allowed;
	}
	.game-starter:nth-child(2) button:hover,
	.game-starter:nth-child(3) button:hover,
	.game-starter:nth-child(4) button:hover {
		background-color: rgb(180, 46, 224, 0.5);
	}

	@media (orientation: portrait) {
		.starting-screen {
			width: 85%;
			height: 80%;
		}
		.heading-box {
			top: 3rem;
		}
		.heading-box button {
			display: none;
		}
		.game-starters {
			top: 50%;
			transform: translateY(-50%);
			align-items: center;
			bottom: 2rem;
		}
		.game-starter {
			flex-direction: column;
			align-items: center;
		}
		h1 {
			font-size: 2.2rem;
		}

		.game-explanation button {
			font-size: 1rem;
		}
	}
	@media (min-width: 2650px) {
		button {
			font-size: 0.9rem;
		}
	}
</style>
