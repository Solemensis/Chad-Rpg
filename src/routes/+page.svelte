<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import GameStartWindow from '$lib/components/GameStartWindow.svelte'
	import DescriptionWindow from '$lib/components/ItemDescWindow.svelte'
	import MessageWindows from '$lib/components/InGameWarnMsgs.svelte'
	import ActionBox from '$lib/components/ActionBox.svelte'
	import Choices from '$lib/components/Choices.svelte'
	import BackgroundImgs from '$lib/components/BackgroundImgs.svelte'
	// import StaticPrompts from '$lib/components/StaticPrompts.svelte'

	import { game } from '../stores.js'
	import { character } from '../stores.js'
	import { selectedItem } from '../stores.js'
	import { misc } from '../stores.js'
	import { coolDowns } from '../stores.js'
	import { bgImage } from '../stores.js'

	import { supabase } from '$lib/supabaseClient'

	// import frpgPlaces from '$lib/gamedata/places/frpg.json'
	// import frpgStarter from '$lib/gamedata/gamestarters/frpg.json'

	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'

	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'
	import staticPlaces from '$lib/gamedata/places.json'

	import medievalStarterInventory from '$lib/gamedata/gamestarters/medievalInventory.json'
	import medievalStarterSpells from '$lib/gamedata/gamestarters/medievalSpells.json'

	// import buyArmors from '$lib/gamedata/armors.json'

	let answer: string = ''
	let story: string = ''
	let chatMessages: ChatCompletionRequestMessage[] = []

	const handleSubmit = async () => {
		if ($misc.query === '') {
			return
		}

		$game.choices = []

		$misc.loading = true
		chatMessages = [...chatMessages, { role: 'user', content: $misc.query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			try {
				parseText(answer)
				story = extractStory(answer)
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					$misc.loading = false
					logged = false

					//if combat is over, reset the cooldowns of spells
					if (!$game.event[0].inCombat) {
						for (let key in $coolDowns) {
							$coolDowns[key] = 50
						}
					}
					console.log(answer)

					//to handle a possible noLoot bug
					if ($game.event[0].lootMode && !$game.lootBox.length) {
						$game.lootBox.push({ name: 'gold', type: 'currency', amount: 15 })
					}

					//to handle token limitation of gpt, delete the first 2 messages from array
					//and do not exceed the limit of context tokens with this way.
					if (chatMessages.length >= 16) {
						chatMessages.splice(1, 2)
					}

					//heal player if currently at Tavern or Inn or Town
					if (
						$misc.place.includes('Inn') ||
						$misc.place.includes('Tavern') ||
						$misc.place == 'Town' ||
						$misc.place.includes('City')
					) {
						if ($character.stats[0].hp < $character.stats[0].maxHp) {
							$character.stats[0].hp += 25

							if ($character.stats[0].hp > $character.stats[0].maxHp || !$character.stats[0].hp) {
								$character.stats[0].hp = $character.stats[0].maxHp
							}
						}
						if ($character.stats[0].mp < $character.stats[0].maxMp) {
							$character.stats[0].mp += 20

							if ($character.stats[0].mp > $character.stats[0].maxMp || !$character.stats[0].mp) {
								$character.stats[0].mp = $character.stats[0].maxMp
							}
						}
					}

					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				handleError(err)
			}
		})
		eventSource.stream()
	}

	let handleErr: boolean = false
	function handleError<T>(err: T) {
		console.error('error from client: ' + err)

		handleErr = true
	}

	//logic to shuffle shop items at shop
	function shuffleItems(items: any) {
		// start at the end of the array and work backwards
		for (let i = items.length - 1; i > 0; i--) {
			// pick a random index between 0 and i (inclusive)
			const j = Math.floor(Math.random() * (i + 1))

			// swap the current element with the randomly selected one
			;[items[i], items[j]] = [items[j], items[i]]
		}

		// return the first six shuffled items
		return items.slice(0, 4)
	}

	function mixBuyables(category: any) {
		if (category == 'Weaponsmith' || category == 'Armorsmith' || category == 'Blacksmith')
			return ($game.shop = shuffleItems(buyWeapons))
		if (
			category == 'SpellShop' ||
			category == 'Spell Shop' ||
			category == 'Shop' ||
			category == 'Marketplace'
		)
			return ($game.shop = shuffleItems(buySpells))
		if (
			category == 'PotionShop' ||
			category == 'Potion Shop' ||
			category == 'Market' ||
			category == 'Merchant'
		)
			return ($game.shop = shuffleItems(buyPotions))
	}

	//a function to take the chatgpt response and give it a structure to use it on frontend
	function parseText(text: string) {
		const placeAndTimeRegex: any = /@placeAndTime:\s*(\[[^\]]*\])/
		const choiceRegex: any = /@choices:\s*(\[[^\]]*\])/
		const eventRegex: any = /@event:\s*(\[[^\]]*\])/
		const enemyRegex: any = /@enemy:\s*(\[[^\]]*\])/
		const lootBoxRegex: any = /@lootBox:\s*(\[[^\]]*\])/

		const placeAndTimeMatch: any = text.match(placeAndTimeRegex)
		const choiceMatch: any = text.match(choiceRegex)
		const eventMatch: any = text.match(eventRegex)
		const enemyMatch: any = text.match(enemyRegex)
		const lootBoxMatch: any = text.match(lootBoxRegex)

		if (placeAndTimeMatch) {
			$game.placeAndTime = JSON.parse(placeAndTimeMatch[1])

			if (!logged) {
				$misc.place = $game.placeAndTime[0].place
				$misc.time = $game.placeAndTime[0].time
				fetchImg()

				logged = true
			}
		}

		if (enemyMatch) {
			$game.enemy = JSON.parse(enemyMatch[1])
		}

		if (lootBoxMatch) {
			$game.lootBox = JSON.parse(lootBoxMatch[1])
		}

		if (eventMatch) {
			$game.event = JSON.parse(eventMatch[1])
			if ($game.event[0].shopMode && $game.shop.length != 4) {
				mixBuyables($game.event[0].shopMode)
			}
		}
		if (choiceMatch) {
			$game.choices = JSON.parse(choiceMatch[1])
		}
		return
	}

	//pull the story from chat response, to show it on UI
	function extractStory(str: any) {
		const storyIndex = str.indexOf('@story')
		if (storyIndex === -1) {
			return ''
		}
		const startIndex = storyIndex + '@story'.length + 1
		let endIndex = str.indexOf('@', startIndex)
		if (endIndex === -1) {
			endIndex = str.length
		}
		return str.slice(startIndex, endIndex).trim()
	}

	//this is the function to canalize player's answer to chatGPT
	function giveYourAnswer(choice: any) {
		if (!choice || choice.includes('sex') || choice.includes('kill')) {
			return
		}
		story = ''

		//increase all the $coolDowns by 1 with every choice
		for (const key in $coolDowns) {
			if ($coolDowns.hasOwnProperty(key)) {
				$coolDowns[key] += 1
			}
		}

		$selectedItem.showDescription = 'none'

		$game.choices = []
		$game.shop = []

		$misc.query = choice
		answer = ''

		try {
			handleSubmit()
			$misc.query = ''
		} catch (error) {
			handleError(error)
		}

		if ($game.started == false) {
			$game.started = true
		}
	}

	//message loading animation logic
	let dotty: any = '.'
	setInterval(() => {
		if (dotty == '...') {
			dotty = ''
		}
		dotty += '.'
	}, 400)

	//function to handle emittedAnswers
	function handleEmittedAnswer(event: any) {
		giveYourAnswer(event.detail.answer)
	}

	//function to start the game in "medieval starter" conditions
	function startMedievalGame(event: any) {
		chatMessages = []
		$game.lootBox = []
		$game.placeAndTime = []

		$game.shop = []
		$game.choices = []
		$game.enemy = []
		$game.event = []
		$selectedItem = {}
		$character.stats = [{ hp: 110, maxHp: 110, mp: 90, maxMp: 90 }]
		$character.gold = 1900
		$character.spells = [...medievalStarterSpells]
		$character.inventory = [...medievalStarterInventory]

		giveYourAnswer(event.detail.answer)
	}

	function getRandomNumber(num: any) {
		return Math.floor(Math.random() * num) + 1
	}

	//extract game hour from chatGPT response
	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	//fetch img according to player's current place from database
	async function fetchImg() {
		// check if place is the same
		if ($game.placeAndTime[0].place == $misc.curentImg) return

		const places: any = [...staticPlaces]

		// check current place of player
		function checkPlace(str: any) {
			let matchingPlaces: any = places.filter((place) => str.includes(place))

			if (matchingPlaces == 'Town Inn' || matchingPlaces == 'Town Tavern') {
				matchingPlaces = 'Inn'
			} else if (matchingPlaces.includes('Outskirts')) {
				matchingPlaces = 'Forest'
			}

			return matchingPlaces.length > 0 ? matchingPlaces[0] : null
		}

		//list images to get the image amount
		const { data: imgs } = await supabase.storage.from('imgs').list(checkPlace($misc.place), {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch images based on time and place
		let finalImg: any
		if (imgs) {
			if (
				(checkPlace($misc.place) == 'Town' ||
					checkPlace($misc.place) == 'City' ||
					checkPlace($misc.place) == 'Forest' ||
					checkPlace($misc.place) == 'Woods') &&
				(extractHours($misc.time) >= 18 || extractHours($misc.time) <= 6)
			) {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${checkPlace($misc.place)}-night/${getRandomNumber(imgs.length - 1)}.webp`)
				finalImg = img
			} else {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${checkPlace($misc.place)}/${getRandomNumber(imgs.length - 1)}.webp`)
				finalImg = img
			}
		}

		const reader = new FileReader()

		if (finalImg) {
			reader.readAsDataURL(finalImg)
		} else {
			console.log('no image')
			return
		}

		//fade in and out across the fetched images
		reader.onload = () => {
			if (!$bgImage.img1active) {
				$bgImage.fetchedBg1 = reader.result
				$bgImage.img1active = !$bgImage.img1active
				$bgImage.img2active = !$bgImage.img1active
			} else if (!$bgImage.img2active) {
				$bgImage.fetchedBg2 = reader.result
				$bgImage.img2active = !$bgImage.img2active
				$bgImage.img1active = !$bgImage.img2active
			}
		}

		$misc.curentImg = $misc.place
	}

	let logged: boolean = false
</script>

<div>
	<BackgroundImgs />

	{#if !$game.started}
		<GameStartWindow on:emittedAnswer={startMedievalGame} />
	{/if}

	<MessageWindows />

	<!-- item description window (out of ui) -->
	<DescriptionWindow />
	<!-- item description window  -->

	<!-- game ui starts here -->
	{#if $game.started}
		<div class="main-game">
			<!-- chatGPT answer box starts here -->
			<div transition:fade={{ duration: 1000 }} class="game-master">
				<ChatMessage type="assistant" message={story ? story : dotty} />
			</div>
			<!-- chatGPT answer box ends here -->

			<!-- game controls ui starts here-->
			<div transition:fade={{ duration: 2000 }} class="game-controls">
				<ActionBox
					title={'Inventory'}
					actions={$character.inventory}
					on:emittedAnswer={handleEmittedAnswer}
				/>

				<div class="choices">
					<Choices on:emittedAnswer={handleEmittedAnswer} />
				</div>

				<ActionBox
					title={'Spells'}
					actions={$character.spells}
					on:emittedAnswer={handleEmittedAnswer}
				/>
			</div>
			<!-- game controls ui ends here-->
		</div>

		<!-- Static tavern prompts -->
		<!-- {#if (!$misc.loading && $game.placeAndTime[0] && $game.placeAndTime[0].place.includes('Tavern')) || ($game.placeAndTime[0] && $game.placeAndTime[0].place.includes('Inn'))}
			<div transition:fade={{ duration: 3000 }}>
				<StaticPrompts on:emittedAnswer={handleEmittedAnswer} />
			</div>
		{/if} -->
	{/if}
	<!-- game ui ends here -->

	<UiButtons on:emittedAnswer={handleEmittedAnswer} />
</div>

<style>
	.main-game {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 3rem;
		height: 95vh;
	}
	.game-master {
		width: 70%;
		height: 25%;
		line-height: 1.8;
		background-color: #0d0d0db3;
		backdrop-filter: blur(24px);
		margin-inline: auto;
		padding: 0.5rem 0.9rem;
		border-radius: 1rem;
		font-size: 1.4rem;
		color: #eee;
		overflow: auto;
	}

	.game-controls {
		display: flex;
		width: 70%;
		margin-inline: auto;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.choices {
		width: 100%;
		height: 100%;
	}
	/* responsive */
	@media (orientation: portrait) {
		.game-master {
			width: 85%;
		}
		.main-game {
			height: 100vh;
		}
		.game-controls {
			display: grid;
			grid-template-columns: 1fr 1fr;
			width: 85%;
		}
		.choices {
			grid-column-start: 1;
			grid-column-end: 3;
			grid-row-end: 1;
			grid-row-end: 2;
			padding-bottom: 2rem;
		}
	}
</style>
