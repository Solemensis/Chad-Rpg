<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import MapAndPlaces from '$lib/components/MapAndPlaces.svelte'
	import GameStartWindow from '$lib/components/GameStartWindow.svelte'
	import DescriptionWindow from '$lib/components/DescriptionWindow.svelte'
	import MessageWindows from '$lib/components/MessageWindows.svelte'
	import GonnaDeleteThis from '$lib/components/GonnaDeleteThis.svelte'
	import ActionBox from '$lib/components/ActionBox.svelte'
	import Choices from '$lib/components/Choices.svelte'
	import BackgroundImgs from '$lib/components/BackgroundImgs.svelte'


	import { game } from '../stores.js';
	import { character } from '../stores.js';
    import { ui } from '../stores.js';
	import { selectedItem} from '../stores.js';
	import { misc } from '../stores.js';
	import { coolDowns } from '../stores.js';
	import { bgImage } from '../stores.js';

	import { supabase } from '$lib/supabaseClient'

import frpgPlaces from '$lib/gamedata/places/frpg.json'
import frpgStarter from '$lib/gamedata/gamestarters/frpg.json'



	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'
	
	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'

	// import buyArmors from '$lib/gamedata/armors.json'

	// let query: string = ''
	let answer: string = ''
	let story: string = ''
	// let loading: boolean = false
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
				// $misc.loading = false
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
					

					// 					if (!$game.event[0].inCombat){
					// enemy =[]
					// 					}

					if ($game.event[0].lootMode && !$game.lootBox.length) {
						$game.lootBox.push({ name: 'gold', type: 'currency', amount: 15 })
					}

					//to handle token limitation of gpt
					if (chatMessages.length >= 16) {
						chatMessages.splice(1, 2)
					}

					//heal player if currently in Tavern or Inn
					if ($misc.place == 'Inn' || $misc.place == 'Tavern') {
						if ($character.stats[0].hp < $character.stats[0].maxHp) {
							$character.stats[0].hp += 25
						}
						if ($character.stats[0].mp < $character.stats[0].maxMp) {
							$character.stats[0].mp += 20
						}
					}

					// delay = -300

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
		// $misc.loading = false
		console.error('error from client: ' + JSON.stringify(err))

		handleErr = true


// $misc.loading=false

		// query = ''
		// answer = ''
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
		if (category == 'weaponsmith') return ($game.shop = shuffleItems(buyWeapons))
		if (category == 'spell shop') return ($game.shop = shuffleItems(buySpells))
		if (category == 'potion shop') return ($game.shop = shuffleItems(buyPotions))
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
				$misc.place = checkWordsForImg($game.placeAndTime[0].place)
				$misc.time = $game.placeAndTime[0].time
				fetchImg()

				logged = true
			}
		}

		
		if (enemyMatch) {
			// if(enemy) return;
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
		if (!choice) {
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

		if (gameStarted == false) {
			gameStarted = true
		}
	}

	let gameStarted: boolean = false


	
	//message loading animation logic
	let dotty: any = '.'
	setInterval(() => {
		if (dotty == '...') {
			dotty = ''
		}
		dotty += '.'
	}, 400)

	function randomize(gameStarter: any) {
		const randomIndex = Math.floor(Math.random() * gameStarter.length)
		const randomlySelectedElement = gameStarter[randomIndex]

		chatMessages = [...chatMessages, { role: 'user', content: randomlySelectedElement }]
		return randomlySelectedElement
	}

	


	function handleSell(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
			$selectedItem.item = item
			$ui.sellWarnMsg = prompt
		} else return
	}

	//description window
	
	// let displayItemWindow: any = 'none'

	
	function hideWindow() {
		$selectedItem.showDescription = 'none'
	}

	// let ingameErrorMessage: string = ''
	// let askBuy: string = ''
	// let askSell: string = ''

	// let eventfulItem: any = {}

	


	$: hpPercentage = ($character.stats[0].hp / $character.stats[0].maxHp) * 100
	$: mpPercentage = ($character.stats[0].mp / $character.stats[0].maxMp) * 100
	// $: enemyHpPercentage =  ($character.stats[0].mp / $character.stats[0].maxMp) * 100

	



	function handleEmittedAnswer(event:any){
giveYourAnswer(event.detail.answer)
	}


	

	// $count.name = 32

	// console.log($count.name)


	function checkWordsForImg(str: any) {
		const words = str.split(' ')

		for (let i = 0; i < words.length; i++) {
			const word = words[i]
			if (frpgPlaces.includes(word)) {
				return word
			}
		}

		return null
	}


	function getRandomNumber(num: any) {
		return Math.floor(Math.random() * num) + 1
	}

	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}
	
	async function fetchImg() {
		if($game.placeAndTime[0].place==$misc.curentImg) return;
		// check if place is the same


		//list imgs
		const { data: imgs } = await supabase.storage.from('imgs').list(`${$misc.place}`, {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch img based on time and place
		let finalImg: any
		if (imgs) {
			if ($misc.place == 'Town' && extractHours($misc.time) >= 18 && extractHours($misc.time) <= 6) {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${$misc.place}_night/${getRandomNumber(imgs.length - 1)}.png`)
				finalImg = img
			} else {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${$misc.place}/${getRandomNumber(imgs.length - 1)}.png`)
				finalImg = img
			}
		}

		const reader = new FileReader()
		reader.readAsDataURL(finalImg ? finalImg : console.log('no img'))
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

		$misc.curentImg=$misc.place
	}
	let logged: boolean = false
</script>

<div>

	<BackgroundImgs/>
	
	
	{#if !gameStarted}
		<GameStartWindow on:emittedAnswer={handleEmittedAnswer}/>
	{/if}
	

	<GonnaDeleteThis on:emittedAnswer={handleEmittedAnswer} />
	<MessageWindows/>

	

	<!-- item description window (out of ui) -->
	<DescriptionWindow/>
	<!-- item description window  -->


	<MapAndPlaces on:emittedAnswer={handleEmittedAnswer}/>
	


	<!-- game ui starts here -->
	{#if gameStarted}
		<div class="main-game">
			<!-- top game ui -->
			<div transition:fade={{ duration: 1000 }} class="game-master">
				<ChatMessage type="assistant" message={story ? story : dotty} />
			</div>
			<!-- top game ui ends-->

			<!-- bottom game ui starts here-->
			<div transition:fade={{ duration: 2000 }} class="game-controls">
				
				<ActionBox title={"Inventory"} actions={$character.inventory} on:emittedAnswer={handleEmittedAnswer}/>

				<Choices on:emittedAnswer={handleEmittedAnswer}/>
				
				<ActionBox title={"Spells"} actions={$character.spells} on:emittedAnswer={handleEmittedAnswer}/>

			</div>
			<!-- bottom game ui ends here-->
		</div>
	{/if}
	<!-- game ui ends here -->
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
