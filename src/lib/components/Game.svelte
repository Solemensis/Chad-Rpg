<script lang="ts">
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

	import LetterByLetter from './LetterByLetter.svelte'
	import UiButtons from './UiButtons.svelte'
	import GameStartWindow from './GameStartWindow.svelte'
	import DescriptionWindow from './ItemDescWindow.svelte'
	import MessageWindows from './InGameWarnMsgs.svelte'
	import ActionBox from './ActionBox.svelte'
	import Choices from './Choices.svelte'
	import BackgroundImgs from './BackgroundImgs.svelte'

	import { game, character, selectedItem, misc, coolDowns, bgImage, ui } from '../../stores'
	import { supabase } from '$lib/supabaseClient'

	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'
	import staticPlaces from '$lib/gamedata/places.json'

	import medievalMageInventory from '$lib/gamedata/gamestarters/medievalMageInventory.json'
	import medievalMageSpells from '$lib/gamedata/gamestarters/medievalMageSpells.json'
	import medievalWarriorInventory from '$lib/gamedata/gamestarters/medievalWarriorInventory.json'
	import medievalWarriorSpells from '$lib/gamedata/gamestarters/medievalWarriorSpells.json'

	import { CHARACTER_CLASSES, STARTING_VALUES, SHOP_CONFIG } from '$lib/config/constants'

	let answer: string = ''
	let chatMessages: any[] = []
	let enemyOnFrontend: boolean = false
	let dotty: string = '.'
	let quotaExceeded: boolean = false
	let highDemand: boolean = false
	let requestTimeout: boolean = false

	// Animation for loading dots
	onMount(() => {
		const interval = setInterval(() => {
			if (dotty === '...') {
				dotty = ''
			}
			dotty += '.'
		}, 400)

		return () => clearInterval(interval)
	})

	// Game logic functions
	async function handleSubmit() {
		$misc.loading = true
		chatMessages = [...chatMessages, { role: 'user', content: $misc.query }]

		const prompt = chatMessages.length > 0 ? $misc.query : getGamePrompt()
		console.log('Sending prompt:', prompt)

		const timeoutId = setTimeout(() => {
			if ($misc.loading) {
				requestTimeout = true
				$misc.loading = false // Stop the loading spinner
			}
		}, 9000)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt })
			})

			clearTimeout(timeoutId)
			requestTimeout = false

			// Check for quota exceeded error
			if (response.status === 429) {
				const errorData = await response.json()
				if (errorData.error === 'quota_exceeded') {
					quotaExceeded = true
					$misc.loading = false
					return
				}
			}

			// Check for high demand error
			if (response.status === 503) {
				const errorData = await response.json()
				if (errorData.error === 'high_demand') {
					highDemand = true
					requestTimeout = false
					$misc.loading = false
					return
				}
			}

			// Check for gateway timeout (Vercel/Prod)
			if (response.status === 504) {
				highDemand = true
				requestTimeout = false
				$misc.loading = false
				return
			}

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`)
			}

			const responseData = await response.json()
			let gameData

			// Helper to extract JSON from text that might have extra content
			const extractJSON = (text: string): string => {
				// Remove markdown code blocks
				let cleaned = text
					.replace(/```json\s*/g, '')
					.replace(/```\s*/g, '')
					.trim()

				// Find the first { and last matching }
				const firstBrace = cleaned.indexOf('{')
				if (firstBrace === -1) return cleaned

				let braceCount = 0
				let lastBrace = firstBrace
				for (let i = firstBrace; i < cleaned.length; i++) {
					if (cleaned[i] === '{') braceCount++
					if (cleaned[i] === '}') {
						braceCount--
						if (braceCount === 0) {
							lastBrace = i
							break
						}
					}
				}
				return cleaned.substring(firstBrace, lastBrace + 1)
			}

			try {
				const rawText = responseData.candidates[0].content.parts[0].text
				const jsonString = extractJSON(rawText)
				const parsed = JSON.parse(jsonString)
				// If AI returns {gameData: {...}}, unwrap it; otherwise use as-is
				gameData = parsed.gameData || parsed
			} catch (error) {
				console.error(
					'JSON parse error, raw text:',
					responseData.candidates[0].content.parts[0].text
				)
				throw error
			}

			console.log('Parsed gameData:', gameData)

			// Preserve enemy HP
			let hpOfEnemy = 0
			if ($game.gameData.enemy?.enemyHp) {
				hpOfEnemy = $game.gameData.enemy.enemyHp
			}

			$game = { gameData }

			if (hpOfEnemy && $game.gameData.enemy?.enemyHp) {
				$game.gameData.enemy.enemyHp = hpOfEnemy
			}

			if (!$game.gameData.enemy?.enemyMaxHp && $game.gameData.enemy?.enemyHp) {
				$game.gameData.enemy.enemyMaxHp = $game.gameData.enemy.enemyHp
			}

			$misc.started = true
			$misc.place = $game.gameData.placeAndTime?.place || ''
			$misc.time = $game.gameData.placeAndTime?.time || '00:00'

			chatMessages = [...chatMessages, { role: 'assistant', content: gameData }]
		} catch (error: any) {
			console.error('Error in handleSubmit:', error)
			handleError(error)
		} finally {
			$misc.loading = false
			requestTimeout = false
		}
	}

	function getGamePrompt() {
		return `This is a role-playing game where you'll be the 1st person character and storyteller. You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective. All these 1st person and 3rd person content will be in gameData.story! Shape the storyline based on players choices.

All of your responses MUST include a valid json object, with this exact properties(keys):

"gameData": {
	"placeAndTime": { "place": "Enchanted Library", "time": "14:00" },
	"story": "As you step into the vast, towering library...",
	"event": { "inCombat": false, "shopMode": null, "lootMode": false },
	"choices": ["Approach the librarian for assistance.", "Browse the shelves for a specific book.", "Sit down and read a random tome."],
	"enemy": {},
	"lootBox": []
}

Don't forget to include at least 3 unique choices for the user to choose.`
	}

	function handleError(error: any) {
		console.error('Game error:', error)
		setTimeout(() => {
			if ($misc.query) {
				giveAnswer($misc.query)
			}
		}, 1000)
	}

	function giveAnswer(choice: string) {
		if (!choice || choice.trim().length === 0) return

		if (choice.includes('sex') || choice.includes('kill')) {
			if (!choice.includes('skill')) {
				$ui.errorWarnMsg = "There's a flawed word in your answer."
				return
			}
		}

		$game.gameData.story = ''
		$game.gameData.choices = []
		$game.gameData.shop = []

		// Increment cooldowns
		for (const key in $coolDowns) {
			if ($coolDowns.hasOwnProperty(key)) {
				$coolDowns[key] += 1
			}
		}

		$selectedItem.showDescription = 'none'
		$misc.query = choice

		handleSubmit().then(() => {
			$misc.query = ''
			answer = ''
		})

		if (!$misc.started) {
			$misc.started = true
		}
	}

	// Image count per location folder in Supabase storage
	// Update these values when you add/remove images from storage
	const locationImageCounts: Record<string, number> = {
		Academy: 2,
		Armorsmith: 7,
		Beach: 3,
		Blacksmith: 7,
		Castle: 5,
		Cathedral: 2,
		Cave: 4,
		City: 4,
		'City-night': 4,
		Dock: 4,
		Dungeon: 4,
		Forest: 3,
		'Forest-night': 3,
		Garden: 3,
		Graveyard: 3,
		Harbor: 4,
		Inn: 6,
		Library: 4,
		Mansion: 3,
		Market: 7,
		Marketplace: 7,
		Merchant: 7,
		Monastery: 3,
		Mountain: 3,
		PotionShop: 7,
		River: 3,
		Shop: 7,
		Shore: 4,
		SpellShop: 7,
		Tavern: 6,
		Town: 4,
		'Town-night': 5,
		Village: 4,
		Weaponsmith: 7,
		Woods: 3,
		'Woods-night': 3
	}

	async function fetchImg() {
		// Check if place is the same
		if ($game.gameData.placeAndTime?.place === $misc.currentImg) return

		const places = [...staticPlaces] as string[]
		const currentPlace = $game.gameData.placeAndTime?.place || ''

		// Find matching place name (places is array of strings)
		const matchedPlace =
			places.find((place) => currentPlace.toLowerCase().includes(place.toLowerCase())) || places[0]

		// Get the number of images available for this location (default to 3 if unknown)
		const imageCount = locationImageCounts[matchedPlace] || 3

		// Pick a random image number based on available count
		const randomImgNum = Math.floor(Math.random() * imageCount) + 1
		const imgPath = `${matchedPlace}/${randomImgNum}.webp`

		try {
			const { data, error } = await supabase.storage.from('imgs').download(imgPath)

			if (error) {
				// Gracefully handle missing bucket or image - just warn, don't error
				console.warn('Image not available:', imgPath, error.message || error)
				return
			}

			const url = URL.createObjectURL(data)
			updateBackgroundImage(url)
			$misc.currentImg = currentPlace
		} catch (error) {
			console.warn('Could not load background image:', error)
		}
	}

	function updateBackgroundImage(url: string) {
		// Preload the new image before triggering the crossfade
		const img = new Image()
		img.onload = () => {
			if ($bgImage.img1active) {
				$bgImage.fetchedBg2 = url
				// Small delay to ensure the new image is rendered before fading
				setTimeout(() => {
					$bgImage.img2active = true
					$bgImage.img1active = false
				}, 50)
			} else {
				$bgImage.fetchedBg1 = url
				setTimeout(() => {
					$bgImage.img1active = true
					$bgImage.img2active = false
				}, 50)
			}
		}
		img.src = url
	}

	function mixBuyables(category: string) {
		let items
		switch (category) {
			case 'Weaponsmith':
			case 'Armorsmith':
			case 'Blacksmith':
				items = buyWeapons
				break
			case 'SpellShop':
			case 'Spell Shop':
			case 'Shop':
			case 'Marketplace':
				items = buySpells
				break
			case 'PotionShop':
			case 'Potion Shop':
			case 'Market':
			case 'Merchant':
				items = buyPotions
				break
			default:
				items = buyPotions
				break
		}

		// Shuffle and take first items
		const shuffled = [...items]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}

		$game.gameData.shop = shuffled.slice(0, SHOP_CONFIG.ITEMS_PER_SHOP)
	}

	function handleEmittedAnswer(event: CustomEvent) {
		giveAnswer(event.detail.answer)
	}

	function handleMedievalGameStart(event: CustomEvent) {
		startMedievalGame(event.detail.answer)
	}

	function startMedievalGame(answer: string) {
		// Reset game state
		chatMessages = []
		$game.gameData.lootBox = []
		$game.gameData.placeAndTime = { place: '', time: '00:00' }
		$game.gameData.shop = []
		$game.gameData.choices = []
		$game.gameData.enemy = {}
		$game.gameData.event = { inCombat: false, shopMode: null, lootMode: false }
		$selectedItem = {}
		$character.gold = STARTING_VALUES.GOLD

		const heroClass = $game.gameData.heroClass
		if (heroClass === 'mage') {
			$character.stats = [CHARACTER_CLASSES.MAGE.stats]
			$character.spells = [...medievalMageSpells]
			$character.inventory = [...medievalMageInventory]
		} else if (heroClass === 'warrior') {
			$character.stats = [CHARACTER_CLASSES.WARRIOR.stats]
			$character.spells = [...medievalWarriorSpells]
			$character.inventory = [...medievalWarriorInventory]
		}

		giveAnswer(answer)
	}

	// Reactive statements
	$: if (
		$game.gameData.placeAndTime?.place &&
		$game.gameData.placeAndTime.place !== $misc.currentImg
	) {
		fetchImg()
	}

	$: if (
		$game.gameData.event?.shopMode &&
		(!$game.gameData.shop || $game.gameData.shop.length !== SHOP_CONFIG.ITEMS_PER_SHOP)
	) {
		mixBuyables($game.gameData.event.shopMode)
	}
</script>

<div>
	<BackgroundImgs />

	{#if $misc.maintenanceWindow}
		<div class="maintenance-overlay">
			<div class="maintenance-content">
				<h2>Game Maintenance</h2>
				<p>The game is currently under maintenance. Please check back later.</p>
			</div>
		</div>
	{:else}
		<div class="game-container">
			{#if !$misc.started}
				<GameStartWindow on:emittedAnswer={handleMedievalGameStart} />
			{:else}
				<div class="game-content">
					<div class="story-section">
						{#if $misc.loading}
							<div class="loading-message">
								<LetterByLetter text={dotty} />
							</div>
						{:else if $game.gameData.story}
							<div class="story-text" transition:fade>
								<LetterByLetter text={$game.gameData.story} />
							</div>
						{/if}
					</div>

					<div class="choices-section">
						{#if $game.gameData.choices && $game.gameData.choices.length > 0}
							<Choices on:emittedAnswer={handleEmittedAnswer} />
						{/if}
					</div>

					<div class="ui-section">
						<UiButtons on:emittedAnswer={handleEmittedAnswer} />
					</div>

					<div class="action-boxes">
						{#if $character.inventory && $character.inventory.length > 0}
							<ActionBox
								title="Inventory"
								actions={$character.inventory}
								on:emittedAnswer={handleEmittedAnswer}
							/>
						{/if}

						{#if $character.spells && $character.spells.length > 0}
							<ActionBox
								title="Spells"
								actions={$character.spells}
								on:emittedAnswer={handleEmittedAnswer}
							/>
						{/if}

						{#if $game.gameData.lootBox && $game.gameData.lootBox.length > 0}
							<ActionBox
								title="Loot"
								actions={$game.gameData.lootBox}
								on:emittedAnswer={handleEmittedAnswer}
							/>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<DescriptionWindow />
		<MessageWindows />
	{/if}

	{#if quotaExceeded}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content">
				<div class="quota-icon">⚠️</div>
				<h2>API Limit Reached</h2>
				<p>
					This game is for <strong>demonstration purposes only</strong> and uses a free API quota.
				</p>
				<p class="quota-detail">
					The AI chat service has temporarily reached its limit. Please try again later or check
					back tomorrow.
				</p>
				<p class="quota-sorry">Sorry for the inconvenience!</p>
				<button class="quota-dismiss" on:click={() => (quotaExceeded = false)}> Dismiss </button>
			</div>
		</div>
	{/if}

	{#if highDemand}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content high-demand">
				<div class="quota-icon">🚀</div>
				<h2>High Traffic</h2>
				<p>
					The AI service is currently <strong>heavily overloaded</strong> or timed out.
				</p>
				<p class="quota-detail">
					Google Gemini is taking too long to respond, and the server had to stop waiting. Please try your action again in a moment.
				</p>
				<p class="quota-sorry">Thank you for your patience!</p>
				<button class="quota-dismiss" on:click={() => (highDemand = false)}> Dismiss </button>
			</div>
		</div>
	{/if}

	{#if requestTimeout}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content timeout">
				<div class="quota-icon">🤖</div>
				<h2>Request Cancelled</h2>
				<p>
					The Gemini API is <strong>currently full</strong> and couldn't respond in time.
				</p>
				<p class="quota-detail">
					To keep the game responsive, we've stopped the current request. Please try your action again.
				</p>
				<p class="quota-sorry">Thank you for your patience!</p>
				<button class="quota-dismiss" on:click={() => (requestTimeout = false)}> Try Again </button>
			</div>
		</div>
	{/if}
</div>

<style>
	.maintenance-overlay {
		position: fixed;
		inset: 0;
		background: var(--color-bg-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.maintenance-content {
		background: var(--color-bg-card);
		padding: var(--space-xl);
		border-radius: var(--radius-lg);
		text-align: center;
		border: 1px solid var(--color-border);
	}

	/* Quota Exceeded Overlay */
	.quota-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.quota-content {
		background: var(--color-bg-glass);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		text-align: center;
		border: 1px solid var(--color-border);
		max-width: 420px;
		margin: var(--space-md);
		box-shadow: var(--shadow-lg);
		transition: all 0.3s ease;
	}

	.quota-content.high-demand {
		border-color: var(--color-accent-primary, #3b82f6);
		box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
	}

	.quota-content.high-demand h2 {
		color: var(--color-accent-primary, #3b82f6);
	}

	.quota-content.timeout {
		border-color: var(--color-accent-gold, #facc15);
		box-shadow: 0 0 20px rgba(250, 204, 21, 0.2);
	}

	.quota-content.timeout h2 {
		color: var(--color-accent-gold, #facc15);
	}

	.quota-icon {
		font-size: 3rem;
		margin-bottom: var(--space-md);
	}

	.quota-content h2 {
		color: var(--color-accent-warning, #f59e0b);
		margin-bottom: var(--space-md);
		font-size: 1.5rem;
	}

	.quota-content p {
		color: var(--color-text-primary);
		margin-bottom: var(--space-sm);
		line-height: 1.6;
	}

	.quota-detail {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.quota-sorry {
		color: var(--color-text-secondary);
		font-style: italic;
		margin-top: var(--space-md);
	}

	.quota-dismiss {
		margin-top: var(--space-lg);
		padding: var(--space-sm) var(--space-xl);
		background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
		border: none;
		border-radius: var(--radius-md);
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.quota-dismiss:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.game-container {
		min-height: 100vh;
		min-height: 100dvh;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}

	.game-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: var(--space-md);
		padding-bottom: 240px;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		gap: var(--space-md);
	}

	/* Story Box - The narrative display */
	.story-section {
		position: relative;
		height: 35vh; /* Fixed height - stays consistent */
		overflow-y: auto;
		padding: var(--space-lg);
		border-radius: var(--radius-xl);
		background: var(--color-bg-glass);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		margin-top: var(--space-md);
	}

	/* Decorative top accent line */
	.story-section::before {
		content: '';
		position: absolute;
		left: 20px;
		right: 20px;
		top: 8px;
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--color-accent-primary),
			var(--color-accent-secondary),
			var(--color-accent-primary),
			transparent
		);
		opacity: 0.6;
	}

	.loading-message {
		display: flex;
		align-items: flex-start; /* Stay at top */
		justify-content: center;
		min-height: 60px;
		color: var(--color-text-secondary);
		font-size: 1.5rem;
		letter-spacing: 0.3em;
	}

	.story-text {
		line-height: 1.8;
		font-size: 0.95rem;
		color: var(--color-text-primary);
		letter-spacing: 0.01em;
	}

	.choices-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.ui-section {
		margin-top: auto;
	}

	/* Action Boxes Container */
	.action-boxes {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: var(--space-md);
		display: flex;
		justify-content: space-between; /* Spread boxes to edges */
		align-items: flex-end;
		gap: var(--space-md);
		flex-wrap: wrap;
		width: min(calc(100% - var(--space-xl)), 800px);
		z-index: 100;
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.game-content {
			padding: var(--space-sm);
			padding-bottom: 200px;
		}

		.story-section {
			height: 30vh; /* Fixed height */
			padding: var(--space-md);
			border-radius: var(--radius-lg);
		}

		.action-boxes {
			bottom: var(--space-sm);
			gap: var(--space-sm);
			width: calc(100% - var(--space-md));
		}
	}

	@media (max-width: 480px) {
		.story-section {
			height: 20vh; /* Fixed height */
		}

		.story-text {
			font-size: 0.875rem;
		}

		.game-content {
			padding-bottom: 140px;
		}

		.action-boxes {
			flex-wrap: nowrap;
			overflow-x: auto;
			justify-content: space-between; /* Inventory left, Spells right */
			padding: var(--space-xs);
			gap: var(--space-xs);
			-webkit-overflow-scrolling: touch;
		}
	}

	/* Landscape mobile */
	@media (max-height: 500px) and (orientation: landscape) {
		.story-section {
			max-height: 40vh;
		}

		.game-content {
			padding-bottom: 160px;
		}

		.action-boxes {
			bottom: var(--space-xs);
		}
	}
</style>
