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
	import { getTokens } from '$lib/tokenizer'

	import { game } from '../stores'
	import { character } from '../stores'
	import { selectedItem } from '../stores'
	import { misc } from '../stores'
	import { coolDowns } from '../stores'
	import { bgImage } from '../stores'
	import { ui } from '../stores'

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

	import medievalMageInventory from '$lib/gamedata/gamestarters/medievalMageInventory.json'
	import medievalMageSpells from '$lib/gamedata/gamestarters/medievalMageSpells.json'
	import medievalWarriorInventory from '$lib/gamedata/gamestarters/medievalWarriorInventory.json'
	import medievalWarriorSpells from '$lib/gamedata/gamestarters/medievalWarriorSpells.json'
	// import buyArmors from '$lib/gamedata/armors.json'

	let answer: string = ''
	let story: string = ''
	let chatMessages: ChatCompletionRequestMessage[] = []

	//a variable to carry the enemy into the client-side for app reliability
	let enemyOnFrontend: boolean = false

	let tokenCount = 0
	const handleSubmit = async () => {
		if ($misc.query === '') {
			return
		}

		$game.gameData.choices = []

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

					// console.log('answer: ' + answer)

					tokenCount = 2400
					chatMessages.forEach((msg) => {
						const tokens = getTokens(msg.content)
						tokenCount += tokens
					})

					// console.log(tokenCount)

					//if combat is over, reset the cooldowns of spells
					if (!$game.gameData.event.inCombat) {
						for (let key in $coolDowns) {
							$coolDowns[key] = 50
						}
					}

					// reset selectedItem with new sv response, if there was any
					$selectedItem = {}

					// if enemy dies, clear it from frontend
					if ($game.gameData.event && $game.gameData.event.inCombat && $game.gameData.enemy && $game.gameData.enemy.enemyHp) {
						if ($game.gameData.enemy.enemyHp <= 0) {
							enemyOnFrontend = false
						}
					} else {
						enemyOnFrontend = false
					}

					//to handle a possible combat bug
					if ($game.gameData.event.inCombat && $game.gameData.enemy) {
						enemyOnFrontend = true
					}
					if ($game.gameData.event.inCombat && !$game.gameData.enemy) {
						$game.gameData.event.inCombat = false
						$game.gameData.enemy = []
						enemyOnFrontend = false
					}
					if (!$game.gameData.event.inCombat && $game.gameData.enemy) {
						$game.gameData.event.inCombat = false
						$game.gameData.enemy = []
						enemyOnFrontend = false
					}
					if ($game.gameData.enemy && $game.gameData.enemy.enemyHp <= 0) {
						$game.gameData.event.inCombat = false
						$game.gameData.enemy = []
						enemyOnFrontend = false
					}

					//to handle a possible noLoot bug
					if ($game.gameData.event.lootMode && !$game.gameData.lootBox.length) {
						// $game.gameData.lootBox.push({ name: 'gold', type: 'currency', amount: 15 })
						$game.gameData.event.lootMode = false
						$game.gameData.lootBox = []
					}

					//to handle token limitation of gpt, delete the first 2 messages from array
					//if tokenCount is beyond 3800.
					if (tokenCount >= 3800) {
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
		console.error('error from client: ', err)

		handleErr = true

		setTimeout(() => {
			giveYourAnswer(answer)
		}, 1000)
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
				return
		}
		$game.gameData.shop = shuffleItems(items)
	}

	//a function to take the chatgpt response and give it a structure to use it on frontend
	function parseText(text: string) {
		const placeAndTimeRegex: any = /@placeAndTime:\s*(\[[^\]]*\])/
		const choiceRegex: any = /@choices:\s*(\[[^\]]*\])/
		const eventRegex: any = /@event:\s*(\[[^\]]*\])/
		const enemyRegex: any = /@enemy:\s*(\[[^\]]*\])/
		const lootBoxRegex: any = /gameData.lootBox:\s*(\[[^\]]*\])/

		const placeAndTimeMatch: any = text.match(placeAndTimeRegex)
		const choiceMatch: any = text.match(choiceRegex)
		const eventMatch: any = text.match(eventRegex)
		const enemyMatch: any = text.match(enemyRegex)
		const lootBoxMatch: any = text.match(lootBoxRegex)

		if (placeAndTimeMatch) {
			$game.gameData.placeAndTime = JSON.parse(placeAndTimeMatch[1])

			if (!logged) {
				$misc.place = $game.gameData.placeAndTime.place
				$misc.time = $game.gameData.placeAndTime.time
				fetchImg()

				logged = true
			}
		}

		if (enemyMatch) {
			if (enemyOnFrontend == false) {
				$game.gameData.enemy = JSON.parse(enemyMatch[1])

				//
				if ($game.gameData.enemy && $game.gameData.enemy.enemyHp) {
					$game.gameData.enemy.enemyMaxHp = $game.gameData.enemy.enemyHp
				}
				//
			}
		}

		if (lootBoxMatch) {
			$game.gameData.lootBox = JSON.parse(lootBoxMatch[1])
		}

		if (eventMatch) {
			$game.gameData.event = JSON.parse(eventMatch[1])
			if ($game.gameData.event.shopMode && $game.gameData.shop.length != 4) {
				mixBuyables($game.gameData.event.shopMode)
			}
		}
		if (choiceMatch) {
			$game.gameData.choices = JSON.parse(choiceMatch[1])
		}
		return
	}

	//pull the story from chat response, to show it on UI
	function extractStory(str: any) {
		const storyIndex = str.indexOf('gameData.story')
		if (storyIndex === -1) {
			return ''
		}
		const startIndex = storyIndex + 'gameData.story'.length + 1
		let endIndex = str.indexOf('@', startIndex)
		if (endIndex === -1) {
			endIndex = str.length
		}
		return str.slice(startIndex, endIndex).trim()
	}

	//this is the function to canalize player's answer to chatGPT
	function giveYourAnswer(choice: any) {
		if (!choice) return
		if (choice.includes('sex') || choice.includes('kill')) {
			if (choice.includes('skill')) return
			$ui.errorWarnMsg = "There's a flawed word in your answer."
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

		$game.gameData.choices = []
		$game.gameData.shop = []

		$misc.query = choice

		try {
			handleSubmit()
			$misc.query = ''
			answer = ''
		} catch (error) {
			handleError(error)
		}

		if ($game.gameData.started == false) {
			$game.gameData.started = true
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
		$game.gameData.lootBox = []
		$game.gameData.placeAndTime = []

		$game.gameData.shop = []
		$game.gameData.choices = []
		$game.gameData.enemy = []
		$game.gameData.event = []
		$selectedItem = {}
		$character.gold = 30

		if ($game.gameData.heroClass == 'mage') {
			$character.stats = [{ hp: 80, maxHp: 80, mp: 110, maxMp: 110 }]
			$character.spells = [...medievalMageSpells]
			$character.inventory = [...medievalMageInventory]
		} else if ($game.gameData.heroClass == 'warrior') {
			$character.stats = [{ hp: 110, maxHp: 110, mp: 80, maxMp: 80 }]
			$character.spells = [...medievalWarriorSpells]
			$character.inventory = [...medievalWarriorInventory]
		}
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
		if ($game.gameData.placeAndTime.place == $misc.currentImg) return

		const places: any = [...staticPlaces]

		// check current place of player
		function checkPlace(str: any) {
			let matchingPlaces: any = places.filter((place) => str.includes(place))

			if (matchingPlaces == 'Town Inn' || matchingPlaces == 'Town Tavern') {
				matchingPlaces = 'Inn'
				return matchingPlaces
			} else if (
				matchingPlaces.includes('Outskirts') ||
				matchingPlaces.includes('outskirts') ||
				matchingPlaces.includes('Road') ||
				matchingPlaces.includes('road')
			) {
				matchingPlaces = 'Forest'
				return matchingPlaces
			} else if (matchingPlaces.includes('Garden') || matchingPlaces.includes('garden')) {
				matchingPlaces = 'Garden'
				return matchingPlaces
			} else if (matchingPlaces.includes('River') || matchingPlaces.includes('river')) {
				matchingPlaces = 'River'
				return matchingPlaces
			} else if (matchingPlaces.includes('Island') || matchingPlaces.includes('island')) {
				matchingPlaces = 'Island'
				return matchingPlaces
			} else if (matchingPlaces.includes('Village') || matchingPlaces.includes('village')) {
				matchingPlaces = 'Village'
				return matchingPlaces
			} else if (matchingPlaces.includes('Mine') || matchingPlaces.includes('mine')) {
				matchingPlaces = 'Cave'
				return matchingPlaces
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

		$misc.currentImg = $misc.place
	}

	let logged: boolean = false
</script>

<div>
	<BackgroundImgs />

    {#if !$game.gameData.started}
    	<GameStartWindow on:emittedAnswer={startMedievalGame} />
    {/if}

    <MessageWindows />

    <!-- item description window (out of ui) -->
    <DescriptionWindow />
    <!-- item description window  -->

    <!-- game ui starts here -->
    {#if $game.gameData.started}
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
    			{#if $game.gameData.started}
    				<div class="choices">
    					<Choices on:emittedAnswer={handleEmittedAnswer} />
    				</div>
    			{/if}

    			<ActionBox
    				title={'Spells'}
    				actions={$character.spells}
    				on:emittedAnswer={handleEmittedAnswer}
    			/>
    		</div>
    		<!-- game controls ui ends here-->
    	</div>

    	<!-- Static tavern prompts -->
    	<!-- {#if (!$misc.loading && $game.gameData.placeAndTime && $game.gameData.placeAndTime.place.includes('Tavern')) || ($game.gameData.placeAndTime && $game.gameData.placeAndTime.place.includes('Inn'))}
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
		height: 30%;
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
			height: 40%;
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
