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

		$game.gameData.event.shopMode = null
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
	{#if $misc.started}
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
		{#if $misc.started && !$misc.death}
			<button transition:fade={{ duration: 500 }} on:click={() => (mapOn = !mapOn)}>
				<img src="images/map.svg" alt="map button" />
			</button>
		{/if}
		{#if mapOn}
			<div class="places-to-go">
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Tavern to rest.")}
					transition:fade={{ delay: 0, duration: 100 }}
					><img src="images/landscape-svgs/tavern.svg" alt="go tavern button" />
					<p transition:fade={{ delay: 0, duration: 100 }}>Tavern</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/town.svg" alt="go town button" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Town</p></button
				>

				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Woods.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/forest.svg" alt="go woods button" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Woods</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 300, duration: 100 }}
					><img src="images/landscape-svgs/dock.svg" alt="go harbor button" />
					<p transition:fade={{ delay: 300, duration: 100 }}>Harbor</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to weaponsmith.")}
					transition:fade={{ delay: 400, duration: 100 }}
					><img src="images/landscape-svgs/shop1.svg" alt="go weaponsmith button" />
					<p transition:fade={{ delay: 400, duration: 100 }}>Weaponsmith</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to spell shop.")}
					transition:fade={{ delay: 500, duration: 100 }}
					><img src="images/landscape-svgs/shop2.svg" alt="go spell shop button" />
					<p transition:fade={{ delay: 500, duration: 100 }}>Spell Shop</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
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
							<li>
								Game balance will be improved, level system will be added, classes will be added.
							</li>
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
						</ul>
					</div>
				</div>
				<span class="span1"
					>©2023 Solemensis. All rights reserved. <span style="color:aqua">|</span>
					ulassacli@outlook.com
					<span style="color:aqua">|</span> github/Solemensis
					<span style="color:aqua">|</span>
					<span>Current chatbot: gemini-pro</span>
				</span>
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
				<h2>You can encounter some bugs for now, for numerous reasons.</h2>
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
	/* Modal close buttons */
	.close-bug-window {
		position: absolute;
		right: var(--space-lg);
		top: var(--space-md);
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}
	.close-bug-window:hover {
		opacity: 1;
	}
	.close-bug-window img {
		width: 1.5rem;
	}

	/* Bug report modal */
	.bug-window {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(90%, 500px);
		max-height: 80vh;
		background: var(--color-bg-dark);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		z-index: 1001;
		overflow: auto;
		padding: var(--space-xl);
	}

	.bug-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-md);
	}

	.bug-container h2 {
		font-weight: 500;
		font-size: 1.25rem;
		color: var(--color-accent-gold);
	}

	.bug-container p {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.mail-box {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-top: var(--space-md);
	}

	.mail-box a {
		color: var(--color-accent-secondary);
		text-decoration: none;
		font-size: 1rem;
		padding: var(--space-sm) var(--space-lg);
		background: rgba(63, 207, 142, 0.1);
		border-radius: var(--radius-md);
		transition: background var(--transition-fast);
	}
	.mail-box a:hover {
		background: rgba(63, 207, 142, 0.2);
	}

	.mail-box p {
		user-select: text;
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	/* Info window modal */
	.info-window {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(95%, 800px);
		max-height: 85vh;
		background: var(--color-bg-dark);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		z-index: 1000;
		overflow: auto;
		padding: var(--space-xl);
	}

	.info-window > button {
		position: absolute;
		right: var(--space-lg);
		top: var(--space-md);
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}
	.info-window > button:hover {
		opacity: 1;
	}
	.info-window > button img {
		width: 1.5rem;
	}

	.span1 {
		display: block;
		text-align: center;
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.text-box {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-xl);
		margin-top: var(--space-lg);
	}

	.text-box h3 {
		font-weight: 500;
		font-size: 1.1rem;
		margin-bottom: var(--space-md);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.rules {
		color: var(--color-accent-gold);
	}
	.rules::before {
		content: '⚔️';
	}

	.updates {
		color: var(--color-accent-secondary);
	}
	.updates::before {
		content: '🔮';
	}

	.text-box ul {
		list-style: none;
		padding: 0;
	}

	.text-box li {
		margin-bottom: var(--space-sm);
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		padding-left: var(--space-md);
		position: relative;
	}

	.text-box li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-accent-primary);
	}

	/* Map and places - Top left UI */
	.map-and-places {
		position: fixed;
		left: var(--space-md);
		top: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 50;
	}

	.map-and-places > button {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-glass);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.map-and-places > button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-border-hover);
	}

	.map-and-places img {
		width: 24px;
		height: 24px;
		opacity: 0.8;
	}

	.places-to-go {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
	}

	.places-to-go button {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-bg-glass);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.places-to-go button:hover:not(:disabled) {
		background: rgba(124, 92, 224, 0.15);
		transform: translateX(4px);
	}

	.places-to-go button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.places-to-go button img {
		width: 20px;
		height: 20px;
	}

	.places-to-go button p {
		font-size: 0.75rem;
		color: var(--color-text-primary);
		margin: 0;
	}

	/* Music / Fullscreen - Top right */
	.song-icon,
	.fullscreen-icon {
		position: fixed;
		right: var(--space-md);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-glass);
		backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		opacity: 0.6;
		transition: all var(--transition-fast);
		z-index: 50;
	}

	.song-icon {
		top: var(--space-md);
	}
	.fullscreen-icon {
		top: calc(var(--space-md) + 48px);
	}

	.song-icon:hover,
	.fullscreen-icon:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
	}

	.song-icon img,
	.fullscreen-icon img {
		width: 20px;
		height: 20px;
	}

	/* Bottom right buttons */
	.bottom-right-buttons {
		position: fixed;
		right: var(--space-md);
		bottom: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 50;
	}

	.bug-button,
	.game-info-button {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-glass);
		backdrop-filter: blur(16px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		opacity: 0.5;
		transition: all var(--transition-fast);
	}

	.bug-button:hover,
	.game-info-button:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
	}

	.bug-button img,
	.game-info-button img {
		width: 18px;
		height: 18px;
	}

	.wallet {
		margin-top: var(--space-sm);
		color: var(--color-accent-hp) !important;
		user-select: all !important;
		font-size: 0.7rem;
	}

	.support {
		color: var(--color-accent-gold) !important;
	}

	/* Maintenance */
	.maintenance-box {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-bg-dark);
		backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
		z-index: 1000;
		max-width: 90vw;
	}

	/* Responsive */
	@media (max-width: 768px) {
		/* Hide map, music, and fullscreen buttons on mobile */
		.map-and-places > button,
		.song-icon,
		.fullscreen-icon {
			display: none !important;
		}

		.bottom-right-buttons {
			display: none;
		}
	}
</style>
