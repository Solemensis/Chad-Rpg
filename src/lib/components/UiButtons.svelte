<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	import { misc } from '../../stores.js'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}

	let mapOn: any
</script>

<div>
	<!--  map and places  -->

	<div class="map-and-places">
		<button on:click={() => (mapOn = !mapOn)}>
			<img src="images/map-svgs/2.svg" alt="" />
		</button>
		{#if mapOn}
			<div class="places-to-go">
				<button
					on:click={() => emitAnswer("I'll go to nearest Woods.")}
					transition:fade={{ duration: 100 }}
					><img src="images/landscape-svgs/1.svg" alt="" />
					<p transition:fade={{ duration: 100 }}>Woods</p></button
				>

				<button
					on:click={() => emitAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/2.svg" alt="" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Harbor</p></button
				>

				<button
					on:click={() => emitAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/3.svg" alt="" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Town</p></button
				>
			</div>
		{/if}
	</div>

	<!--  game info button done  -->
	<button class="game-info-button" on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
		<img src="images/info.svg" alt="" />
	</button>

	<!-- game info window -->
	{#if $misc.showInfoWindow}
		<div transition:fade={{ duration: 200 }}>
			<div class="info-window">
				<button on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
					<img src="/images/close-button.svg" alt="close info window" />
				</button>

				<div class="text-box">
					<div>
						<h3 class="rules">About the Game</h3>
						<ul>
							<li>
								This is a limitless, free to play, interactive role playing game where you are the
								player and the Artificial Intelligence is the DM (Game Master) of the game.
							</li>
							<li>
								You'll give your own choices throughout the game, and AI will shape the story based
								on your choices (and combat success).
							</li>
							<li>To fill your hp and mana, you can rest at a Inn, or have time in a Tavern.</li>
							<li>There are no cooldowns for items but there are for spells.</li>
							<li>Game ends if your health points drops to 0.</li>
							<li>
								There is no save game functionality for now, current version is just a tastement.
							</li>
							<li>You can encounter some bugs sometimes for now, for numerous reasons.</li>
						</ul>
					</div>
					<div>
						<h3 class="updates">Potantial Updates</h3>
						<ul>
							<li>Game balance will be improved, level system will be added.</li>
							<li>Armors-pendants-amulets-elixirs to be added.</li>
							<li>
								Other worlds to be added rather than just Medieval. For example; Cyberpunk,
								Magicians World, Post-apocalyptic, Zombie survival etc.
							</li>
							<li>
								Other starting conditions to be added rather than just starting as a new adventurer.
							</li>
							<li>
								Background images will be more organized, and songs will change according to places.
							</li>
							<li>
								If this project gets support, i want to add save game functionality and continue
								developing it using gpt-4 models, as all these improvements are so pricy for me.
							</li>
							<li>
								You can support this project for the upper improvements from this LTC (litecoin)
								wallet account: <p class="wallet">LQpjuAKLBCpanv4PnHekpzwxJsdWyjeBJA</p>
							</li>
						</ul>
					</div>
				</div>
				<span>Game is currently powered by the chatGPT model: gpt-3.5-turbo.</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.info-window {
		height: 80%;
		width: 80%;
		background-color: #2e2e2ecc;
		backdrop-filter: blur(4px);
		border-radius: 1rem;

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	.info-window button {
		position: absolute;
		right: 2rem;
		top: 1.5rem;
		cursor: pointer;
	}
	.info-window button img {
		width: 2rem;
	}

	.info-window span {
		position: absolute;
		bottom: 0.8rem;
		left: 3%;
		color: #aaa;
	}
	.text-box {
		display: flex;
		justify-content: space-around;
		margin-top: 3rem;

		padding: 0 8rem;
		gap: 5rem;
	}
	.text-box div {
		width: 100%;
	}
	.text-box h3 {
		font-weight: 400;
		font-size: 1.8rem;
		text-align: center;
		margin-bottom: 1.5rem;
	}
	.text-box h3::before {
		padding-right: 0.2rem;
		margin-left: -0.5rem;
	}
	.rules {
		color: #d6d631;
	}
	.rules::before {
		content: '⚔️';
	}
	.updates {
		color: #4bca73;
	}
	.updates::before {
		content: '🔮';
	}
	.text-box ul {
		list-style: circle;
	}
	.text-box li {
		margin-bottom: 1rem;
		font-size: 1.1rem;
		color: #ccc;
	}

	/* map and places */
	.map-and-places {
		position: absolute;
		left: 1.5rem;
		top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.map-and-places button {
		cursor: pointer;
	}
	.map-and-places img {
		width: 3.5rem;
	}
	.map-and-places button:active {
		animation: button-pop 0.3s ease-out;
	}

	.places-to-go {
		display: grid;
		grid-template-columns: 1fr;
		align-items: center;
		gap: 0.7rem;
	}

	/* game info button */
	.game-info-button {
		cursor: pointer;
		position: absolute;
		right: 1.5rem;
		bottom: 1.5rem;
	}
	.game-info-button img {
		width: 3.5rem;
	}
	.wallet {
		margin-top: 0.5rem;
		color: #ccc;
		user-select: all !important;
	}
</style>
