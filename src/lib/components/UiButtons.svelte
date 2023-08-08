<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	import { misc } from '../../stores'
	import { game } from '../../stores'
	import Maintenance from './Maintenance.svelte'

	import { supabase } from '$lib/supabaseClient'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})

		$game.event.shopMode = null
	}

	let mapOn: any

	//song (can be arranged using webAudioApi to make it loop seemlessly)
	let audioElement: any
	let audioClicked: boolean = false
	async function startSong() {
		if (!audioElement && !audioClicked) {
			audioClicked = true
			const { data: song, error } = await supabase.storage
				.from('audios/chad-rpg')
				.download('tavernLoopOne.mp3')

			audioElement = new Audio(URL.createObjectURL(song))
			audioElement.loop = true
			audioElement.play()
		} else if (audioElement) {
			audioElement.paused ? audioElement.play() : audioElement.pause()
		} else return
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
	{#if $misc.maintenanceWindow}
		<div class="maintenance-box">
			<Maintenance />
		</div>
	{/if}
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
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Tavern to rest.")}
					transition:fade={{ delay: 0, duration: 100 }}
					><img src="images/landscape-svgs/tavern.svg" alt="go tavern button" />
					<p transition:fade={{ delay: 0, duration: 100 }}>Tavern</p></button
				>
				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/town.svg" alt="go town button" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Town</p></button
				>

				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Woods.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/forest.svg" alt="go woods button" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Woods</p></button
				>
				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 300, duration: 100 }}
					><img src="images/landscape-svgs/dock.svg" alt="go harbor button" />
					<p transition:fade={{ delay: 300, duration: 100 }}>Harbor</p></button
				>
				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to weaponsmith.")}
					transition:fade={{ delay: 400, duration: 100 }}
					><img src="images/landscape-svgs/shop1.svg" alt="go weaponsmith button" />
					<p transition:fade={{ delay: 400, duration: 100 }}>Weaponsmith</p></button
				>
				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to spell shop.")}
					transition:fade={{ delay: 500, duration: 100 }}
					><img src="images/landscape-svgs/shop2.svg" alt="go spell shop button" />
					<p transition:fade={{ delay: 500, duration: 100 }}>Spell Shop</p></button
				>
				<button
					disabled={$misc.loading || $game.event.inCombat}
					on:click={() => emitAnswer("I'll go to potion shop.")}
					transition:fade={{ delay: 600, duration: 100 }}
					><img src="images/landscape-svgs/shop3.svg" alt="go potion shop button" />
					<p transition:fade={{ delay: 600, duration: 100 }}>Potion Shop</p></button
				>
			</div>
		{/if}
	</div>

	<div class="bottom-right-buttons">
		<!--  bug window button  -->
		<button class="bug-button" on:click={() => ($misc.bugWindow = !$misc.bugWindow)}>
			<img src="images/bug.svg" alt="info button" />
		</button>

		<!--  game info button  -->
		<button
			class="game-info-button"
			on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}
		>
			<img src="images/info.svg" alt="info button" />
		</button>
	</div>

	<!-- game info window -->
	{#if $misc.showInfoWindow}
		<div>
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
							<li>
								In combat, weapon score will be calculated from between 1-20, while spells are 1-23.
							</li>
							<li>Game ends if your health points drops down to 0.</li>
							<li>
								There is no save game functionality for now, current version is just a tastement.
							</li>
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
							<li class="support">
								Or, from my patreon account which is: <a
									target="_blank"
									href="https://www.patreon.com/Solemensis">patreon.com/Solemensis</a
								>
							</li>
						</ul>
					</div>
				</div>
				<span class="span1"
					>©2023 Solemensis. All rights reserved. <span style="color:aqua">|</span>
					ulassacli@outlook.com
					<span style="color:aqua">|</span> github/Solemensis <span style="color:aqua">|</span> patreon/Solemensis</span
				>
				<!-- <span class="span2">Game is currently powered by the chatGPT model: gpt-3.5-turbo.</span> -->
				<span class="span2">Current chatGPT model: gpt-3.5-turbo.</span>
			</div>
		</div>
	{/if}
	<!-- bug report window -->
	{#if $misc.bugWindow}
		<div class="bug-window">
			<button class="close-bug-window" on:click={() => ($misc.bugWindow = !$misc.bugWindow)}>
				<img src="/images/close-button.svg" alt="close bug window" />
			</button>
			<div class="bug-container">
				<h2>You can encounter some minor bugs for now, for numerous reasons.</h2>
				<p>
					Mail me the bugs you've encountered please, or your suggestions. I want to make it stable
					time to time.
				</p>
				<div class="mail-box">
					<a target="_blank" href="mailto:ulassacli@outlook.com">Press to mail me</a>
					<p>or do it by default: ulassacli@outlook.com</p>
				</div>
			</div>
		</div>
	{/if}
	<!-- bug report window -->
</div>

<style>
	.close-bug-window {
		position: absolute;
		right: 2rem;
		top: 1.5rem;
		cursor: pointer;
	}
	.close-bug-window img {
		width: 2rem;
	}
	.bug-window {
		height: 70%;
		width: 70%;
		/* width: 90%; */
		background-color: #2e2e2ecc;
		backdrop-filter: blur(8px);
		border-radius: 0.8rem;
		z-index: 1001;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		overflow: auto;
	}
	.bug-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 90%;
		width: 75%;
		margin-top: 2rem;
		margin-inline: auto;
		text-align: center;
	}
	.bug-container h2 {
		font-weight: 500;
		font-size: 2rem;
		color: #d6d631;
	}
	.mail-box {
		display: flex;
		flex-direction: column;
		margin-top: 2rem;
	}
	.mail-box a {
		color: burlywood;
		text-decoration: none;
		font-size: 1.5rem;
	}
	.mail-box p {
		user-select: text;
	}
	.bug-container p {
		font-size: 1.2rem;
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	.info-window {
		height: 80%;
		width: 80%;
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

	.span1 {
		position: absolute;
		bottom: 0.4rem;
		left: 2%;
		color: #aaa;
	}
	.span2 {
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
	.bottom-right-buttons {
		position: absolute;
		right: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.bug-button {
		transition: 0.2s;
	}
	.bug-button img {
		width: 2.5rem;
		cursor: pointer;
	}
	.bug-button:hover {
		filter: brightness(1.2);
	}
	.game-info-button img {
		width: 3.5rem;
		cursor: pointer;
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
			color: #eee;
		}
		.places-to-go button {
			background-color: rgba(57, 57, 57, 0.91);
			padding: 0.7rem 0.2rem 0.2rem 0.2rem;
			border-radius: 1rem;
			border-top-left-radius: 5rem;
			border-top-right-radius: 5rem;
		}
		.places-to-go button p {
			font-size: 0.8rem;
		}
		.bottom-right-buttons {
			display: none;
			padding: 0 0.1rem;
		}

		.fullscreen-icon {
			right: 6.5rem;
			top: 2.2rem;
		}
	}
	.maintenance-box {
		background-color: #888888a1;
		backdrop-filter: blur(8px);
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		border-radius: 0.3rem;
		padding: 1.5rem 4rem;
		text-align: center;
	}
</style>
