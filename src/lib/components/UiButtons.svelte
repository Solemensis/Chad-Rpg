<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	import { misc } from '../../stores'
	import { game } from '../../stores'

	import { supabase } from '$lib/supabaseClient'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})

		$game.event[0].shopMode = null
	}

	let mapOn: any

	//song (can be arranged using webAudioApi to make it loop seemlessly)
	let audioElement: any
	async function startSong() {
		if (!audioElement) {
			const { data: song, error } = await supabase.storage
				.from('audios/chad-rpg')
				.download('tavernLoopOne.mp3')

			audioElement = new Audio(URL.createObjectURL(song))
			audioElement.loop = true
		}
		audioElement.paused ? audioElement.play() : audioElement.pause()
	}

	function toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen()
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen()
			}
		}
	}
</script>

<div>
	<!-- audio play button -->
	{#if $game.started}
		<button class="song-icon" transition:fade={{ duration: 500 }} on:click={() => startSong()}>
			<img src="images/music.svg" alt="music button" />
		</button>
		<button
			transition:fade={{ duration: 500 }}
			class="fullscreen-icon"
			on:click={() => toggleFullScreen()}
		>
			<img src="images/fullscreen.svg" alt="fullscreen button" />
		</button>
	{/if}
	<!--  map and places  -->
	<div class="map-and-places">
		{#if $game.started && !$misc.death}
			<button transition:fade={{ duration: 500 }} on:click={() => (mapOn = !mapOn)}>
				<img src="images/map.svg" alt="map button" />
			</button>
		{/if}
		{#if mapOn}
			<div class="places-to-go">
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to nearest Tavern to rest.")}
					transition:fade={{ delay: 0, duration: 100 }}
					><img src="images/landscape-svgs/tavern.svg" alt="go tavern button" />
					<p transition:fade={{ delay: 0, duration: 100 }}>Tavern</p></button
				>
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/town.svg" alt="go town button" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Town</p></button
				>

				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to nearest Woods.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/forest.svg" alt="go woods button" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Woods</p></button
				>
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 300, duration: 100 }}
					><img src="images/landscape-svgs/dock.svg" alt="go harbor button" />
					<p transition:fade={{ delay: 300, duration: 100 }}>Harbor</p></button
				>
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to weaponsmith.")}
					transition:fade={{ delay: 400, duration: 100 }}
					><img src="images/landscape-svgs/shop1.svg" alt="go weaponsmith button" />
					<p transition:fade={{ delay: 400, duration: 100 }}>Weaponsmith</p></button
				>
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to spell shop.")}
					transition:fade={{ delay: 500, duration: 100 }}
					><img src="images/landscape-svgs/shop2.svg" alt="go spell shop button" />
					<p transition:fade={{ delay: 500, duration: 100 }}>Spell Shop</p></button
				>
				<button
					disabled={$misc.loading || $game.event[0].inCombat}
					on:click={() => emitAnswer("I'll go to potion shop.")}
					transition:fade={{ delay: 600, duration: 100 }}
					><img src="images/landscape-svgs/shop3.svg" alt="go potion shop button" />
					<p transition:fade={{ delay: 600, duration: 100 }}>Potion Shop</p></button
				>
			</div>
		{/if}
	</div>

	<!--  game info button done  -->
	<button class="game-info-button" on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
		<img src="images/info.svg" alt="info button" />
	</button>

	<!-- game info window -->
	{#if $misc.showInfoWindow}
		<div transition:fade={{ duration: 50 }}>
			<div class="info-window">
				<button on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
					<img src="/images/close-button.svg" alt="close info window" />
				</button>

				<div class="text-box">
					<div>
						<h3 class="rules">About the Game</h3>
						<ul>
							<li>
								This is an interactive role playing game where you are the player and Artificial
								Intelligence is the storyteller of the game.
							</li>
							<li>
								You'll give your own choices to events throughout the game, and AI will shape the
								story based on your choices (and combat success).
							</li>
							<li>
								You can write your own answer too, if you got any "interactive chat points". You can
								buy them from potion shops and some merchants.
							</li>
							<li>
								To fill your hp and mana; you can rest at a Inn, have time in a Tavern, or wonder in
								a Town.
							</li>
							<li>There are no cooldowns for items but there are for spells.</li>
							<li>Game ends if your health points drops down to 0.</li>
							<li>
								There is no save game functionality for now, current version is just a tastement.
							</li>
							<li>You can encounter some minor bugs for now, for numerous reasons.</li>
						</ul>
					</div>
					<div>
						<h3 class="updates">Potantial Updates</h3>
						<ul>
							<li>Game balance will be improved, level system will be added.</li>
							<li>Armors-pendants-amulets-elixirs to be added.</li>
							<li>
								Other worlds to be added rather than just medieval world. For example; cyberpunk,
								magical world, post-apocalyptic, zombie survival etc.
							</li>
							<li>
								Other starting conditions to be added rather than just starting as a new adventurer.
							</li>
							<li>
								Background images will be more organized, and songs will change according to places.
							</li>
							<li class="support">
								If this project gets support, i want to add save game functionality and continue
								developing it using gpt-4 models, as all these improvements are so pricy for me.
							</li>
							<li class="support">
								You can support this project for the upper improvements from this LTC (litecoin)
								wallet address: <p class="wallet">LQpjuAKLBCpanv4PnHekpzwxJsdWyjeBJA</p>
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
		/* width: 90%; */
		background-color: #2e2e2ecc;
		backdrop-filter: blur(8px);
		border-radius: 1rem;
		z-index: 1000;

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		overflow: auto;
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
		bottom: 0.4rem;
		right: 2%;
		color: #aaa;
	}
	.text-box {
		display: flex;
		justify-content: space-around;
		margin-top: 2.2rem;
		/* padding: 0 5rem; */
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
		margin-bottom: 1.8rem;
	}
	.text-box h3::before {
		padding-right: 0.2rem;
		margin-left: -5rem;
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
		margin-bottom: 0.9rem;
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
		width: 5rem;
	}
	.map-and-places img {
		transition: 0.2s;
	}

	.song-icon {
		position: absolute;
		right: 1.5rem;
		top: 1.5rem;
		opacity: 0.5;
		transition: 0.1s;
		cursor: pointer;
	}
	.song-icon:hover {
		opacity: 0.8;
	}
	.song-icon img {
		width: 4rem;
	}
	.fullscreen-icon {
		position: absolute;
		right: 2.2rem;
		top: 6rem;
		opacity: 0.5;
		transition: 0.1s;
		cursor: pointer;
	}
	.fullscreen-icon:hover {
		opacity: 0.8;
	}
	.fullscreen-icon img {
		width: 2.5rem;
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
	.places-to-go button p {
		font-size: 0.8rem;
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
		color: palevioletred !important;

		user-select: all !important;
	}
	.support {
		color: #d6d631 !important;
	}

	/* responsive */
	@media screen and (min-aspect-ratio: 4/3) {
		.info-window {
			width: 90%;
		}
		.text-box {
			padding: 0 5rem;
		}
	}

	@media (orientation: portrait) {
		.map-and-places p {
			background-color: rgb(77, 19, 101, 0.8);
			border-radius: 0.3rem;
			color: #eee;
		}

		.game-info-button {
			display: none;
			padding: 0 0.1rem;
		}

		.fullscreen-icon {
			right: 6.5rem;
			top: 2.2rem;
		}
	}
</style>
