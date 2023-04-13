<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import GameStartWindow from '$lib/components/GameStartWindow.svelte'
	import DescriptionWindow from '$lib/components/DescriptionWindow.svelte'
	import MessageWindows from '$lib/components/MessageWindows.svelte'
	import ActionBox from '$lib/components/ActionBox.svelte'
	import Choices from '$lib/components/Choices.svelte'
	import BackgroundImgs from '$lib/components/BackgroundImgs.svelte'

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

					//heal player if currently in Tavern or Inn
					if ($misc.place.includes('Inn') || $misc.place.includes('Tavern')) {
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

	function shuffleItems(items: any) {
		// Start at the end of the array and work backwards
		for (let i = items.length - 1; i > 0; i--) {
			// Pick a random index between 0 and i (inclusive)
			const j = Math.floor(Math.random() * (i + 1))

			// Swap the current element with the randomly selected one
			;[items[i], items[j]] = [items[j], items[i]]
		}

		// Return the first four shuffled items
		return items.slice(0, 4)
	}

	function mixBuyables(category: any) {
		if (category == 'Weaponsmith' || category == 'Armorsmith' || category == 'Blacksmith')
			return ($game.shop = shuffleItems(buyWeapons))
		if (category == 'SpellShop' || category == 'Shop' || category == 'Marketplace')
			return ($game.shop = shuffleItems(buySpells))
		if (category == 'PotionShop' || category == 'Market' || category == 'Merchant')
			return ($game.shop = shuffleItems(buyPotions))
	}

	// let enemyParseDone:any=false;
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
				// $misc.place = checkWordsForImg($game.placeAndTime[0].place)
				$misc.place = $game.placeAndTime[0].place
				$misc.time = $game.placeAndTime[0].time
				fetchImg()

				logged = true
			}
		}

		if (enemyMatch) {
			//  if( $game.enemy[0] && $game.enemy[0].enemyName && $game.enemy[0].enemyHp) return;

			$game.enemy = JSON.parse(enemyMatch[1])
		}

		if (lootBoxMatch) {
			$game.lootBox = JSON.parse(lootBoxMatch[1])
		}

		if (eventMatch) {
			// $game.event[0] = JSON.parse(eventMatch[1])
			$game.event = JSON.parse(eventMatch[1])
			if ($game.event[0].shopMode && $game.shop.length != 4) {
				mixBuyables($game.event[0].shopMode)
			}
		}
		if (choiceMatch) {
			//bunlar çat çat çat yazılıyo galiba. tek 1 kere yazılcak şekilde optimize et

			$game.choices = JSON.parse(choiceMatch[1])
		}

		return
	}

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

	function handleEmittedAnswer(event: any) {
		giveYourAnswer(event.detail.answer)
	}

	function getRandomNumber(num: any) {
		return Math.floor(Math.random() * num) + 1
	}

	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	async function fetchImg() {
		// check if place is the same
		if ($game.placeAndTime[0].place == $misc.curentImg) return

		const places: any = [
			'Town',
			'City',
			'Forest',
			'Woods',
			'Academy',
			'Beach',
			'Castle',
			'Cathedral',
			'Cave',
			'Dungeon',
			'Harbor',
			'Shore',
			'Dock',
			'Library',
			'Monastery',
			'Mansion',
			'Mountain',
			'Shop',
			'Weaponsmith',
			'Armorsmith',
			'Blacksmith',
			'PotionShop',
			'SpellShop',
			'Merchant',
			'Market',
			'Tavern',
			'Inn'
		]
		function checkPlace(str: any) {
			let matchingPlaces: any = places.filter((place) => str.includes(place))

			return matchingPlaces.length > 0 ? matchingPlaces[0] : null
		}

		//list imgs
		const { data: imgs } = await supabase.storage.from('imgs').list(checkPlace($misc.place), {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch img based on time and place
		let finalImg: any
		if (imgs) {
			// if ($misc.place.includes('Town') ||$misc.place.includes('Forest')&& extractHours($misc.time) >= 18 && extractHours($misc.time) <= 6) {
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
			console.log('no img')
			return
		}

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
		<GameStartWindow on:emittedAnswer={handleEmittedAnswer} />
	{/if}

	<MessageWindows />

	<!-- item description window (out of ui) -->
	<DescriptionWindow />
	<!-- item description window  -->

	<!-- game ui starts here -->
	{#if $game.started}
		<div class="main-game">
			<!-- chat ui starts here -->
			<div transition:fade={{ duration: 1000 }} class="game-master">
				<ChatMessage type="assistant" message={story ? story : dotty} />
			</div>
			<!-- chat ui ends here -->

			<!-- game controls ui starts here-->
			<div transition:fade={{ duration: 2000 }} class="game-controls">
				<ActionBox
					title={'Inventory'}
					actions={$character.inventory}
					on:emittedAnswer={handleEmittedAnswer}
				/>

				<Choices on:emittedAnswer={handleEmittedAnswer} />

				<ActionBox
					title={'Spells'}
					actions={$character.spells}
					on:emittedAnswer={handleEmittedAnswer}
				/>
			</div>
			<!-- game controls ui ends here-->
		</div>
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
</style>
