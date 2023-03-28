<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'
	import { supabase } from '$lib/supabaseClient'

	import frpgPlaces from '$lib/gamedata/places/frpg.json'
	import frpgStarter from '$lib/gamedata/gamestarters/frpg.json'
	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'

	// import buyArmors from '$lib/gamedata/armors.json'

	let query: string = ''
	let answer: string = ''
	let story: string = ''
	let loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []

	const handleSubmit = async () => {
		if (query === '') {
			return
		}

		choices = []

		loading = true
		chatMessages = [...chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			try {
				// loading = false
				parseText(answer)
				story = extractStory(answer)
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					loading = false
					logged = false

					//if combat is over, reset the cooldowns of spells
					if (!event[0].inCombat) {
						for (let key in coolDowns) {
							coolDowns[key] = 50
						}
					}
					console.log(answer)
					console.log(event)

					// 	if (lootBox[0]){
					// 	lootBox[0].forEach(loot:any=> inventory.push(loot))
					// }

					// 					if (!event[0].inCombat){
					// enemy =[]
					// 					}

					//to handle token limitation of gpt
					if (chatMessages.length >= 16) {
						chatMessages.splice(1, 2)
					}

					//choice transition delay reset for every new conversation
					delay = -300

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
		// loading = false
		console.error('error from client: ' + JSON.stringify(err))

		handleErr = true

		// query = ''
		// answer = ''
	}

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

	let choices: any[] = []
	let shop: any[] = []
	let placeAndTime: any[] = []

	let event: any[] = [{ inCombat: false, shopMode: null }]

	let enemy: any[] = []
	let lootBox: any[] = []

	let stats: any[] = [{ hp: 110, maxHp: 110, mp: 90, maxMp: 90 }]
	let spells: any[] = [
		{
			name: 'Fireball',
			damage: 4,
			price: 15,
			manaCost: 12,
			type: 'destruction spell',
			element: 'fire',
			cooldown: 2
		},
		{
			name: 'Light Heal',
			healing: 2,
			price: 10,
			manaCost: 12,
			type: 'healing spell',
			element: 'light',
			cooldown: 2
		}
	]
	let inventory: any[] = [
		{
			name: 'Wooden Sword',
			damage: 3,
			price: 10,
			type: 'weapon',
			weaponClass: 'sword'
		}
	]
	let gold: number = 1500

	// function to get a random number from imgs.length
	function getRandomNumber(num: any) {
		return Math.floor(Math.random() * num) + 1
	}

	let fetchedBg1: any = ''
	let fetchedBg2: any = ''
	let img1active: boolean = false
	let img2active: boolean = false

	let time: string = ''
	async function fetchImg() {
		//list imgs
		const { data: imgs } = await supabase.storage.from('imgs').list(`${fetchThisBg}`, {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch img based on time and place
		let finalImg: any
		if (imgs) {
			if (fetchThisBg == 'Town' && extractHours(time) >= 18 && extractHours(time) <= 6) {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${fetchThisBg}_night/${getRandomNumber(imgs.length - 1)}.png`)
				finalImg = img
			} else {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${fetchThisBg}/${getRandomNumber(imgs.length - 1)}.png`)
				finalImg = img
			}
		}

		const reader = new FileReader()
		reader.readAsDataURL(finalImg ? finalImg : console.log('no img'))
		reader.onload = () => {
			if (!img1active) {
				fetchedBg1 = reader.result
				img1active = !img1active
				img2active = !img1active
			} else if (!img2active) {
				fetchedBg2 = reader.result
				img2active = !img2active
				img1active = !img2active
			}
		}
	}

	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	let logged: boolean = false
	let fetchThisBg: string = ''

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
		if (category == 'weaponsmith') return (shop = shuffleItems(buyWeapons))
		if (category == 'spell shop') return (shop = shuffleItems(buySpells))
		if (category == 'potion shop') return (shop = shuffleItems(buyPotions))
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
			placeAndTime = JSON.parse(placeAndTimeMatch[1])

			if (!logged) {
				fetchThisBg = checkWordsForImg(placeAndTime[0].place)
				time = placeAndTime[0].time
				fetchImg()

				logged = true
			}
		}

		if (enemyMatch) {
			// if(enemy) return;
			enemy = JSON.parse(enemyMatch[1])
		}

		if (lootBoxMatch) {
			lootBox = JSON.parse(lootBoxMatch[1])
		}

		if (eventMatch) {
			event = JSON.parse(eventMatch[1])
			if (event[0].shopMode && shop.length != 4) {
				mixBuyables(event[0].shopMode)
			}
		}
		if (choiceMatch) {
			//bunlar çat çat çat yazılıyo galiba. tek 1 kere yazılcak şekilde optimize et

			choices = JSON.parse(choiceMatch[1])
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

	let coolDowns: any = {}

	function randomNumber1_20(damage: any) {
		let dice = Math.floor(Math.random() * 20) + 1

		console.log(damage)
		console.log(dice)
		console.log(damage * dice)
		return damage * dice
	}

	// let combatChoice: { name: string; damage: any; prompt: string; combatScore: any; healing: any } =
	// 	{ name: '', damage: '', prompt: '', combatScore: undefined, healing: '' }
	const combatChoice: any = {}

	function throwDice(combatEvent: any) {
		if (!combatEvent.name) return (ingameErrorMessage = 'You need to choose a weapon or spell.')

		if (coolDowns[combatEvent.name]) {
			coolDowns[combatEvent.name] = 0
		}

		//zar numarasını bi süre göstermek için 1-2 saniyelik bi timeout
		//içine alıncak giveYourAnswer
		console.log(combatEvent.prompt)
		giveYourAnswer(combatEvent.prompt)

		if (combatEvent.manaCost) {
			stats[0].mp -= combatEvent.manaCost
		}

		// event[0].inCombat = !event[0].inCombat

		//empty the object after
		combatChoice.name = ''
		combatChoice.damage = undefined
		combatChoice.healing = undefined
		combatChoice.prompt = ''
		combatChoice.combatScore = undefined
		combatChoice.manaCost = 0
	}

	function useItem(item: any) {
		const { type, name, damage, manaCost, healing, mana, cooldown } = item
		const { mp, maxMp, hp, maxHp } = stats[0]
		const { inCombat, shopMode } = event[0]

		if (type === 'weapon') {
			if (shopMode) return
			if (!inCombat) return (ingameErrorMessage = 'You are not in a combat.')
			combatChoice.combatScore = randomNumber1_20(damage)

			if (combatChoice.combatScore >= 1 && combatChoice.combatScore < 10) {
				combatChoice.prompt = `Attack with ${name}! (give hard times to player in @story, where player lands the worst possible attack, which leads to player taking some serious hits and lose some huge health from enemy attacks, losing combat advantage aswell. End the combat with a failure, give a scenario where player barely escapes.)`
				stats[0].hp -= 20
			}
			if (combatChoice.combatScore >= 10 && combatChoice.combatScore < 20) {
				combatChoice.prompt = `Attack with ${name}! (give a sad @story where player lands a bad attack, which leads to player takes some hits but giving some little damage back at least.)`
			}
			if (combatChoice.combatScore >= 20 && combatChoice.combatScore < 50) {
				combatChoice.prompt = `Attack with ${name}! (give a medi-ocre @story where player lands a decent attack, which leads to an okayish scenario in combat for now.)`
			}
			if (combatChoice.combatScore >= 50 && combatChoice.combatScore < 80) {
				combatChoice.prompt = `Attack with ${name}! (Tell a thrilling @story where player lands a great attack, dealing significant damage to the enemy and gaining an advantage in combat.)`
			}
			if (combatChoice.combatScore >= 80 && combatChoice.combatScore < 100) {
				combatChoice.prompt = `Attack with ${name}! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy or causing massive damage.)`
			}

			if (combatChoice.combatScore >= 100) {
				combatChoice.prompt = `Attack with ${name}! (Craft a legendary @story where player uses the most powerful spell, unleashing an unstoppable force that annihilates the enemy and wins the battle.)`
			}

			combatChoice.name = name
			combatChoice.damage = damage
			combatChoice.healing = undefined
			console.log(combatChoice)
			return
		}

		if (type === 'destruction spell') {
			if (shopMode) return

			if (!inCombat) return (ingameErrorMessage = 'You are not in a combat.')
			if (mp < manaCost) return (ingameErrorMessage = 'You have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < cooldown)
				return (ingameErrorMessage =
					'This skill is on cooldown. ' + coolDowns[name] + '/' + cooldown)
			coolDowns[name] = cooldown
			combatChoice.combatScore = randomNumber1_20(damage)

			if (combatChoice.combatScore >= 1 && combatChoice.combatScore < 10) {
				combatChoice.prompt = `Attack with ${name} spell! (give hard times to player in @story, where player lands the worst possible attack, which leads to player taking some serious hits and lose some huge health from enemy attacks, losing combat advantage aswell.)`
			}
			if (combatChoice.combatScore >= 10 && combatChoice.combatScore < 20) {
				combatChoice.prompt = `Attack with ${name} spell! (give a sad @story where player lands a bad attack, which leads to player takes some hits but giving some little damage back at least.)`
			}
			if (combatChoice.combatScore >= 20 && combatChoice.combatScore < 50) {
				// combatChoice.prompt = `Attack with ${name} spell! (give a medi-ocre @story where player lands a decent attack, which leads to an okayish scenario in combat for now.)`
				// combatChoice.prompt = `Attack with ${name} spell! (give an okay scenario which gives 20 damage to enemy)`
				combatChoice.prompt = `Give a fascinating scenario where player defeats the enemy with ease. (then, change 'inCombat' to false and clear the @enemy array.)`
				// enemy[0].enemyHp -=20 (burda verilmez bu)
			}
			if (combatChoice.combatScore >= 50 && combatChoice.combatScore < 80) {
				combatChoice.prompt = `Attack with ${name} spell! (Tell a thrilling @story where player lands a great attack, dealing significant damage to the enemy and gaining an advantage in combat.)`
			}
			if (combatChoice.combatScore >= 80 && combatChoice.combatScore < 100) {
				combatChoice.prompt = `Attack with ${name} spell! (Create an epic @story where player unleashes a devastating attack, wiping out the enemy or causing massive damage.)`
			}

			if (combatChoice.combatScore >= 100) {
				combatChoice.prompt = `Attack with ${name} spell! (Craft a legendary @story where player uses the most powerful spell, unleashing an unstoppable force that annihilates the enemy and wins the battle.)`
			}

			combatChoice.name = name
			combatChoice.damage = damage
			combatChoice.healing = undefined
			combatChoice.manaCost = manaCost
			console.log(combatChoice)

			return
		}

		if (type === 'healing spell') {
			if (shopMode) return

			if (hp >= maxHp) return (ingameErrorMessage = "You're at full health.")
			if (mp < manaCost) return (ingameErrorMessage = 'You have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < cooldown) return (ingameErrorMessage = 'On cooldown')
			if (!inCombat)
				return giveYourAnswer(
					`Heal myself with ${name} spell by ${randomNumber1_20(healing)} amount.)`
				)

			coolDowns[name] = cooldown
			combatChoice.combatScore = randomNumber1_20(healing)

			combatChoice.prompt = `Heal myself with ${name} spell by ${combatChoice.combatScore} amount.`
			combatChoice.name = name
			combatChoice.healing = healing
			combatChoice.damage = undefined
			combatChoice.manaCost = manaCost
			console.log(combatChoice)

			return
		}
		if (type === 'unique spell') {
			if (shopMode) return
		}

		if (type === 'potion') {
			if (shopMode) return

			if (healing && hp >= maxHp) return (ingameErrorMessage = "You're at full health.")
			if (inCombat) return (ingameErrorMessage = "You can't drink in combat.")

			if (healing && hp < maxHp) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to heal by ${healing}. (that potion must be gone from inventory after that)`
				)
			}
			if (mp && mp >= maxMp) return (ingameErrorMessage = "You're at full mana.")
			if (inCombat) return (ingameErrorMessage = "You can't drink in combat.")
			if (mp && mp < maxMp) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to fill up mana by ${mana}. (that potion must be gone from inventory after that)`
				)
			}
		}
	}

	function buyItem(item: any) {
		if (gold < item.price) return (ingameErrorMessage = 'Not enough gold.')

		gold -= item.price
		if (item.type == 'weapon' || item.type == 'potion') {
			inventory.push(item)
			inventory = inventory

			let newArray: any = shop.filter((shopItem) => shopItem != item)
			shop = newArray
			// return ingameErrorMessage='Buyout succesful!'
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			spells.push(item)
			spells = spells

			let newArray: any = shop.filter((shopItem) => shopItem != item)
			shop = newArray
			// return ingameErrorMessage='Buyout succesful!'
		}
	}
	function lootItem(item: any) {
		if (item.type == 'weapon' || item.type == 'potion') {
			inventory.push(item)
			inventory = inventory
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			spells.push(item)
			spells = spells
		} else if (item.type == 'currency') {
			gold += parseInt(item.amount)
		}

		let newArray: any = lootBox.filter((lootItem) => lootItem.name !== item.name)
		lootBox = newArray

		if (!lootBox.length) {
			giveYourAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			event[0].lootMode = false
		}
	}
	function lootAll() {
		lootBox.forEach((item) => {
			if (item.type == 'weapon' || item.type == 'potion') {
				inventory.push(item)
				inventory = inventory
			} else if (
				item.type == 'destruction spell' ||
				item.type == 'healing spell' ||
				item.type == 'unique spell'
			) {
				spells.push(item)
				spells = spells
			} else if (item.type == 'currency') {
				gold += parseInt(item.amount)
			}
		})
		
		lootBox =[]

		if (!lootBox.length) {
			giveYourAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			event[0].lootMode = false
		}
	}

	function sellItem(item: any) {
		if (!event[0].shopMode) return

		gold += item.price

		if (!item.element) {
			let newArray: any = inventory.filter((obj) => obj.name !== item.name)
			inventory = newArray
		} else {
			let newArray: any = spells.filter((obj) => obj.name !== item.name)
			spells = newArray
		}

		hideWindow()
	}

	function giveYourAnswer(choice: any) {
		if (!choice) {
			return
		}
		story = ''

		//increase all the cooldowns by 1 with every choice
		for (const key in coolDowns) {
			if (coolDowns.hasOwnProperty(key)) {
				coolDowns[key] += 1
			}
		}

		displayItemWindow = 'none'

		choices = []
		shop = []

		query = choice
		answer = ''

		try {
			handleSubmit()
			query = ''
		} catch (error) {
			handleError(error)
		}

		if (gameStarted == false) {
			gameStarted = true
		}
	}

	let gameStarted: boolean = false

	//transition delay logic
	let delay: any = -300
	function getDelayTime() {
		delay += 300

		return { delay }
	}

	// capitalize first letter
	function capitalizeFirstLetter(str: any) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

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

	//description window
	let x: any = 0
	let y: any = 0
	let displayItemWindow: any = 'none'

	function handleMouseMove(event: any, item: any) {
		displayItemWindow = 'block'
		x = event.clientX + 10
		y = event.clientY - 40

		name = undefined
		damage = undefined
		type = undefined
		healing = undefined
		armor = undefined
		element = undefined
		weaponClass = undefined
		manaCost = undefined
		price = undefined
		amount = undefined

		name = item && item.name ? item.name : undefined
		damage = item && item.damage ? item.damage : undefined
		type = item && item.type ? item.type : undefined
		healing = item && item.healing ? item.healing : undefined
		armor = item && item.armor ? item.armor : undefined
		element = item && item.element ? item.element : undefined
		weaponClass = item && item.weaponClass ? item.weaponClass : undefined
		manaCost = item && item.manaCost ? item.manaCost : undefined
		price = item && item.price ? item.price : undefined
		amount = item && item.amount ? item.amount : undefined
	}

	let name: any
	let damage: any
	let type: any
	let healing: any
	let armor: any
	let element: any
	let weaponClass: any
	let manaCost: any
	let price: any
	let amount: any

	function hideWindow() {
		displayItemWindow = 'none'
	}

	let ingameErrorMessage: string = ''
	let askBuy: string = ''
	let askSell: string = ''

	let eventfulItem: any = {}

	function handleBuy(prompt: any, item: any) {
		if (event[0].shopMode) {
			eventfulItem = item
			askBuy = prompt
		} else return
	}

	function handleSell(prompt: any, item: any) {
		if (event[0].shopMode) {
			eventfulItem = item
			askSell = prompt
		} else return
	}

	let mapOn: any

	$: hpPercentage = (stats[0].hp / stats[0].maxHp) * 100
	$: mpPercentage = (stats[0].mp / stats[0].maxMp) * 100
	// $: enemyHpPercentage =  (stats[0].mp / stats[0].maxMp) * 100

	function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			giveYourAnswer("You got hit while trying to escape, couldn't escape and lost 20 health.")
			//lose 20 health here
		} else {
			giveYourAnswer('You have escaped succesfully!')
		}
	}
</script>

<div>
	<!-- background images (out of ui)-->
	<img
		class="fetched-bg"
		src={fetchedBg1}
		style="opacity:{img1active ? '1' : '0'}; transition:opacity 2s;"
		alt=""
	/>
	<img
		class="fetched-bg"
		src={fetchedBg2}
		style="opacity:{img2active ? '1' : '0'}; transition:opacity 2s;"
		alt=""
	/>
	<div
		class="main-bg"
		style="opacity:{!img1active && !img2active ? '1' : '0'}; transition:opacity 2s;"
	/>
	<!-- background images -->

	<!-- başlangıç ekranı (out of ui) -->
	{#if !gameStarted}
		<div transition:fade={{ duration: 1000 }} class="starting-screen">
			<div class="heading-box">
				<h1>Welcome to <span class="g-span">Chad-Rpg!</span></h1>
				<button>What is That?</button>
			</div>
			<div class="game-starters">
				<div class="game-starter">
					<img src="images/game-starter.svg" alt="" />
					<div class="game-explanation">
						<h3>FRPG Starter</h3>
						<p>
							Start as a fairly new adventurer at a town center in a fantasy role playing world.
						</p>
						<button
							on:click={() => {
								giveYourAnswer(
									`Story starts in a peaceful town, and player is a fairly new adventurer. You can use World of Warcraft mmorpg as the dataset; so quests, items, spells, mobs, npcs and storyline.`
								)
							}}>Play</button
						>
					</div>
				</div>
				<div class="game-starter">
					<img src="images/game-starter.svg" alt="" />

					<div class="game-explanation">
						<h3>Cyberpunk Starter</h3>
						<p>Start as a capable human being at a neon city in a Cyberpunk world.</p>
						<button>Play</button>
					</div>
				</div>

				<div class="game-starter">
					<img src="images/game-starter.svg" alt="" />

					<div class="game-explanation">
						<h3>Random Starter</h3>
						<p>Start the game at a random place, in a random world, while on a random event.</p>
						<button>Play</button>
					</div>
				</div>
				<div class="game-starter">
					<img src="images/game-starter.svg" alt="" />

					<div class="game-explanation">
						<h3>Custom Starter</h3>
						<p>Start your own unique adventure as your own character, in your own world!</p>
						<button>Configure game settings</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
	<!-- başlangıç ekranı: -->

	<div
		style="position:absolute;
	left:5%;
	top:50%;
	display:flex;
	flex-direction:column;
	transform:translate(-50%,-50%);"
	>
		<button on:click={() => giveYourAnswer('go woods, find some goblins to hunt')}
			>kill goblins</button
		>
		<button on:click={() => giveYourAnswer('go to a weaponsmith')}>go weaponsmith</button>
	</div>

	<!-- ingame notification window (out of ui) -->
	{#if ingameErrorMessage}
		<div transition:fade={{ duration: 300 }} class="notification-window">
			<p>
				{ingameErrorMessage}
			</p>
			<button on:click={() => (ingameErrorMessage = '')}>Got it</button>
		</div>
	{/if}
	<!-- ingame notification window ends here -->

	<!-- askbuy window (out of ui) -->
	{#if askBuy}
		<div transition:fade={{ duration: 300 }} class="notification-window">
			<p>
				{askBuy}
			</p>
			<div class="dual-button">
				<button
					on:click={() => {
						buyItem(eventfulItem)
						askBuy = ''
					}}>Yes</button
				>
				<button on:click={() => (askBuy = '')}>Cancel</button>
			</div>
		</div>
	{/if}
	<!-- askbuy window -->

	<!-- asksell window (out of ui) -->
	{#if askSell}
		<div transition:fade={{ duration: 300 }} class="notification-window">
			<p>
				{askSell}
			</p>
			<div class="dual-button">
				<button
					on:click={() => {
						sellItem(eventfulItem)
						askSell = ''
					}}>Yes</button
				>
				<button on:click={() => (askSell = '')}>Cancel</button>
			</div>
		</div>
	{/if}
	<!-- asksell window -->

	<!-- item description window (out of ui) -->
	<div class="description-window" style="left:{x}px; top:{y}px; display:{displayItemWindow}">
		<h5 class="desc-name">{name}</h5>
		{#if damage}
			<p class="desc-all">damage: x{damage}</p>
		{/if}
		{#if healing && type == 'healing spell'}
			<p class="desc-all">healing: x{healing}</p>
		{/if}
		{#if healing && type == 'potion'}
			<p class="desc-all">healing: +{healing}</p>
		{/if}

		{#if armor}
			<p class="desc-all">armor: x{armor}</p>
		{/if}
		{#if element}
			<p class="desc-all">element: {element}</p>
		{/if}
		{#if weaponClass}
			<p class="desc-all">class: {weaponClass}</p>
		{/if}
		{#if type}
			<p class="desc-all">type: {type}</p>
		{/if}

		{#if price}
			<p class="desc-all">price: {price}</p>
		{/if}
		{#if amount}
			<p class="desc-all">amount: {amount}</p>
		{/if}
		{#if manaCost}
			<p class="desc-all">mana cost: -{manaCost}</p>
		{/if}
	</div>
	<!-- item description window  -->

	<!-- map and places buttons (out of ui) -->
	<div class="map-and-places">
		<button on:click={() => (mapOn = !mapOn)}>
			<img src="images/map-svgs/2.svg" alt="" />
		</button>
		{#if mapOn}
			<div class="places-to-go">
				<button
					on:click={() => giveYourAnswer("I'll go to nearest Woods.")}
					transition:fade={{ duration: 100 }}
					><img src="images/landscape-svgs/1.svg" alt="" />
					<p transition:fade={{ duration: 100 }}>Woods</p></button
				>

				<button
					on:click={() => giveYourAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/2.svg" alt="" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Harbor</p></button
				>

				<button
					on:click={() => giveYourAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/3.svg" alt="" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Town</p></button
				>
			</div>
		{/if}
	</div>
	<!-- map and places buttons -->

	<!-- game info button (out of ui) -->
	<img class="game-info-button" src="images/info.svg" alt="" />
	<!-- game info button -->

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
				<!-- ui left -->
				<div style="opacity:{choices.length ? '1' : '0'}; transition:opacity 1.5s;" class="ui-left">
					<div
						class="hp-bar"
						style="background-image: linear-gradient(to right, #b02863aa {hpPercentage}%, #1f1f1fc8);"
					>
						{stats[0].hp}/{stats[0].maxHp}
					</div>
					<div in:fade={{ delay: 200, duration: 1500 }} class="inventory">
						<h3>Inventory</h3>
						{#each inventory as item}
							<button
								disabled={loading}
								on:click={() => {
									useItem(item)
									handleSell(`You sure to sell ${item.name}?`, item)
								}}
								in:fade={{ duration: 600 }}
							>
								{#if item.type == 'weapon'}
									<img
										on:mousemove={(event) => handleMouseMove(event, item)}
										on:mouseleave={hideWindow}
										src="/images/{item.weaponClass}.svg"
										alt=""
									/>
								{:else if item.type == 'potion'}
									<img
										on:mousemove={(event) => handleMouseMove(event, item)}
										on:mouseleave={hideWindow}
										src="/images/{item.type}.svg"
										alt=""
									/>
								{/if}
							</button>
						{/each}
					</div>
				</div>
				<!-- ui left ends here -->

				<!-- ui bottom mid starts here -->
				<div class="ui-mid">
					{#if event[0] && !event[0].shopMode && !event[0].inCombat && !event[0].lootMode}
						<!-- choices ui starts here -->
						<div class="choices">
							{#each choices as choice}
								<button
									disabled={loading}
									transition:fade={{ ...getDelayTime(), duration: 700 }}
									class="choice"
									on:click={() => giveYourAnswer(choice)}>{choice}</button
								>
							{/each}
							{#if choices.length >= 2}
								<div
									transition:fade={{ ...getDelayTime(), duration: 400 }}
									class="choice choiceInput"
								>
									<input
										placeholder="Go to local Inn, find someone to talk to"
										type="text"
										bind:value={query}
									/>
									<button disabled={!query} on:click={() => giveYourAnswer(query)}>Answer</button>
								</div>
							{/if}
						</div>
						<!-- choices ui ends here -->

						<!-- client side error handling -->
						{#if handleErr}
							<div transition:fade={{ duration: 700 }} class="choice choiceInput">
								<input
									placeholder="Please input your answer again."
									type="text"
									bind:value={query}
								/>
								<button
									disabled={!query}
									on:click={() => {
										giveYourAnswer(query)
										handleErr = !handleErr
									}}>Answer</button
								>
							</div>
						{/if}
						<!-- client side error handling -->

						<!-- combat ui -->
					{:else if event[0] && event[0].inCombat}
						<div transition:fade={{ duration: 1000 }} class="combat">
							<div class="combat-box">
								<div class="heading-and-enemy">
									<h3>You are now in <span class="span-heading">Combat</span> against:</h3>
									{#if enemy[0]}
										<div
											style="background-image: linear-gradient(to right, #E1683Caa {mpPercentage}%, #1f1f1fc8);"
											class="enemy"
										>
											<h5>{capitalizeFirstLetter(enemy[0].enemyName)}</h5>
											<p>
												{enemy[0].enemyHp} <span class="hp-mp-text">HP</span>
											</p>
										</div>
									{/if}
								</div>
								<div class="combat-but-and-info">
									<ul>
										{#if !combatChoice.name}
											<li>
												Choose an <span class="g-span">item</span> or a
												<span class="g-span">spell.</span>
											</li>
										{:else if combatChoice.damage}
											<li>
												You chose <span class="g-span">{combatChoice.name}</span> with
												<span class="g-span">x{combatChoice.damage}</span> damage!
											</li>
										{:else if combatChoice.healing}
											<li>
												You chose <span class="g-span">{combatChoice.name}</span> with
												<span class="g-span">x{combatChoice.healing}</span> heal power!
											</li>
										{/if}

										<li>Then, press the <span class="g-span">dice</span> to learn your fate!</li>
										<li>
											<!-- Your fighting scenario will be calculated based on these and some element of
											surprise. -->
											Or, just try to <span class="red-span">Retreat!</span>
										</li>
									</ul>
									<button on:click={() => throwDice(combatChoice)} class="combat-button">
										<img src="images/dice.webp" alt="" />
									</button>
								</div>
							</div>
						</div>
						<!-- combat ui ends here-->

						<!-- shop ui -->
					{:else if event[0] && event[0].shopMode}
						<div transition:fade={{ duration: 1000 }} class="shop">
							<div class="shop-box">
								{#if event[0].shopMode == 'weaponsmith'}
									<h3>You're at a local <span class="g-span">Weaponsmith</span></h3>
								{/if}
								{#if event[0].shopMode == 'armorsmith'}
									<h3>You're at a local <span class="g-span">Armorsmith</span></h3>
								{/if}
								{#if event[0].shopMode == 'spell shop'}
									<h3>You're at a local <span class="g-span">Spell Shop</span></h3>
								{/if}
								{#if event[0].shopMode == 'potion shop'}
									<h3>You're at a local <span class="g-span">Potion Shop</span></h3>
								{/if}
								{#if event[0].shopMode != 'weaponsmith' && event[0].shopMode != 'armorsmith' && event[0].shopMode != 'spell shop' && event[0].shopMode != 'potion shop'}
									<h3>You're at a local <span class="g-span">Merchant</span></h3>
								{/if}

								<div class="buyables-box">
									{#each shop as buyable}
										<button
											class="item-button"
											on:click={() => handleBuy(`Do you wanna buy ${buyable.name}?`, buyable)}
											on:mousemove={(event) => handleMouseMove(event, buyable)}
											on:mouseleave={hideWindow}
										>
											{#if buyable.type == 'weapon'}
												<img class="buyable-img" src="images/{buyable.weaponClass}.svg" alt="" />
											{:else if buyable.type == 'potion'}
												<img class="buyable-img" src="images/{buyable.type}.svg" alt="" />
											{/if}
											{#if buyable.element}
												<img class="buyable-img" src="images/{buyable.element}.svg" alt="" />
											{/if}
										</button>
									{/each}
								</div>
							</div>
						</div>

						<!-- shop ui ends here -->

						<!-- loot ui-->
					{:else if event[0].lootMode}
						<div transition:fade={{ duration: 1000 }} class="shop">
							<div class="shop-box">
								<h3>You're <span class="g-span">looting.</span></h3>

								<div class="buyables-box">
									{#if !lootBox.length}
										<p>loading...</p>
									{:else}
										{#each lootBox as item}
											<button
												class="item-button"
												on:click={() => lootItem(item)}
												on:mousemove={(event) => handleMouseMove(event, item)}
												on:mouseleave={hideWindow}
											>
												{#if item.type == 'weapon'}
													<img class="buyable-img" src="images/{item.weaponClass}.svg" alt="" />
												{/if}
												{#if item.element}
													<img class="buyable-img" src="images/{item.element}.svg" alt="" />
												{/if}
												{#if item.type == 'potion' || item.type == 'currency'}
													<img class="buyable-img" src="images/{item.type}.svg" alt="" />
												{/if}
											</button>
										{/each}
										<button on:click={()=>lootAll()}>Loot All</button>
									{/if}
								</div>
							</div>
						</div>
					{/if}
					<!-- loot ui ends here -->

					<!-- gold&time and reject choices -->
					{#if choices.length >= 2 || event[0].inCombat || event[0].shopMode}
						<div transition:fade={{ duration: 700 }} class="stats">
							<div class="stat">
								<img class="svg-images" src="images/gold.svg" alt="" />
								<p>{gold}</p>
							</div>
							{#if event[0].inCombat}
								<button
									disabled={loading}
									class="leave-button"
									style="opacity: {choices.length ? '1' : '0'};"
									on:click={() => calculateRetreat()}>Retreat.</button
								>
							{:else if event[0].shopMode}
								<button
									disabled={loading}
									class="leave-button"
									style="opacity: {event[0].shopMode ? '1' : '0'};"
									on:click={() => {
										giveYourAnswer('Leave the shop')
										event[0].shopMode = null
									}}>Leave the Shop</button
								>
							{:else if lootBox.length}
								<button
									disabled={loading}
									class="leave-button"
									style="opacity: {lootBox.length ? '1' : '0'};"
									on:click={() => giveYourAnswer('Leave the loot.')}>Leave it.</button
								>
							{/if}
							<div class="stat">
								<img class="svg-images" src="images/time.svg" alt="" />

								<p>{placeAndTime[0].time ? placeAndTime[0].time : '00:00'}</p>
							</div>
						</div>
					{/if}
					<!-- gold&time and reject choices ends here -->
				</div>
				<!-- ui bottom mid ends here -->
				<!-- ui right starts here -->
				<div
					style="opacity:{choices.length ? '1' : '0'}; transition:opacity 1.5s;"
					class="ui-right"
				>
					<div
						class="mp-bar"
						style="background-image: linear-gradient(to right, #76399caa {mpPercentage}%, #1f1f1fc8);"
					>
						{stats[0].mp}/{stats[0].maxMp}
					</div>
					<div in:fade={{ delay: 200, duration: 1000 }} class="spells">
						<h3>Spells</h3>
						{#each spells as spell}
							<button
								disabled={loading}
								on:click={() => {
									useItem(spell)
									handleSell(`You sure to sell ${spell.name}?`, spell)
								}}
								in:fade={{ duration: 600 }}
								><img
									on:mousemove={(event) => handleMouseMove(event, spell)}
									on:mouseleave={hideWindow}
									src="/images/{spell.element}.svg"
									alt=""
								/></button
							>
						{/each}
					</div>
				</div>
				<!-- ui right ends here -->
			</div>
			<!-- bottom game ui ends here-->
		</div>
	{/if}
	<!-- game ui ends here -->
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Signika+Negative:wght@300;400;500&display=swap');

	/* @font-face {
    font-family: 'medieval';
    src: url('/fonts/medieval.ttf') format('ttf');
  } */

	.desc-name {
		color: orange;
		font-size: 1rem;
		font-weight: 500;
	}
	.desc-all {
		font-size: 0.9rem;
	}

	.description-window {
		position: absolute;
		min-width: 10rem;
		background-color: rgba(56, 40, 112, 0.766);
		padding: 0.4rem;
		border-radius: 0.5rem;
		z-index: 100;
	}

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

	.ui-left,
	.ui-right {
		width: 25%;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.hp-bar,
	.mp-bar {
		text-align: center;
		font-size: 1.2rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding: 0.2rem 0;
	}
	.spells,
	.inventory {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		background-color: #362525bc;

		border-radius: 0.2rem;
		min-height: 25vh;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.spells h3,
	.inventory h3 {
		grid-column-start: 1;
		grid-column-end: 4;
		justify-self: center;
		font-weight: 400;
		font-size: 1.4rem;
		color: #3fcf8e;
		/* font-family:"medieval" !important; */
	}
	.spells img,
	.inventory img {
		width: 85%;
		margin-inline: auto;
		padding: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.spells img:active,
	.inventory img:active {
		animation: button-pop 0.3s ease-out;
	}
	.spells button,
	.inventory button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		border-radius: 0.4rem;
		width: 85%;
		height: 85%;
	}
	button {
		background-color: transparent;
		border: none;
	}

	.choices {
		/* min-height: 36.9%; */
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
		margin-inline: auto;
		padding: 0;
	}
	.combat,
	.shop {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		height: 100%;
		margin-inline: auto;
		gap: 1rem;
	}

	.combat-box h3,
	.shop-box h3 {
		text-align: center;
		font-weight: 300;
		font-size: 1.3rem;
	}

	.combat-box,
	.shop-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-around;
		padding: 0 0.5rem;
	}
	.shop-box {
		align-items: center;
		padding-bottom: 1rem;
	}

	.combat-but-and-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
	}

	.combat-box img:active {
		animation: button-pop 0.3s ease-out;
	}

	.combat-box ul {
		font-size: 1rem;
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 0.4rem;
	}

	.combat-box ul {
		width: 60%;
	}

	.leave-button {
		border: none;
		background-color: rgba(49, 49, 49, 0.73);
		padding: 0.3rem 2rem;
		border-radius: 0.3rem;
		font-size: 1rem;
		transition: background-color 0.3s, opacity 1.5s;
		backdrop-filter: blur(3px);
	}

	.leave-button:hover {
		background-color: rgba(49, 49, 49, 0.83);
	}

	.combat-button {
		border: none;
		background-color: rgba(19, 19, 19, 0.525);
		border-radius: 0.6rem;
		padding: 0.5rem 0.5rem 0.1rem 0.5rem;
	}

	.combat-button img {
		width: 3.5rem;
	}

	.combat-box ul li,
	.shop-box ul li {
		color: #bbb;
		padding-left: 0.4rem;
		text-align: start;
		transition: 0.2s;
		line-height: 1.2;
	}
	.shop-box ul li:hover {
		cursor: pointer;
		color: #3fcf8e;
	}

	.combat-box ul li:nth-child(1) {
		list-style-type: '⚔️';
	}
	.combat-box ul li:nth-child(2) {
		list-style-type: '🎲';
	}
	.combat-box ul li:nth-child(3) {
		list-style-type: '🔮';
		font-size: 0.9rem;
		padding-left: 0.5rem;
		margin-left: -0.08rem;

		color: #aaa;
	}

	.item-button {
		border: none;
		background-color: transparent;
	}

	.shop-box ul li {
		list-style-type: '\1F7E3';
	}
	.span-heading {
		color: rgb(228, 55, 55);
		font-weight: 400;
	}
	.g-span {
		color: #3fcf8e;
	}
	.red-span {
		color: rgb(228, 55, 55);
	}
	.stats {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(64, 64, 64, 0.8);
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
	}
	.svg-images {
		width: 1.1rem;
		height: 1.1rem;
	}

	.stat p {
		font-size: 1.2rem;
	}
	.ui-mid {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.8rem;
	}

	.choice {
		/* background-color: rgba(49, 49, 49, 0.83); */

		background-color: #362525;
		border-radius: 0.5rem;
		font-size: 1.4rem;
		color: #ddd;
		padding: 0.4rem 0.6rem;
		border: none;
		position: relative;
		text-align: center;
		transition: 0.2s;
	}
	.choiceInput {
		background-color: #1f1f1fc8;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
	}

	.choiceInput input {
		background-color: transparent;
		border: none;
		width: 85%;
		height: 100%;
		font-size: 1.2rem;
		outline: none;
		padding: 0.1rem 0.3rem;
		text-align: start;
	}
	.choiceInput button {
		border: none;
		color: #ddd;
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
		background-color: #9018c486;
	}
	.choiceInput button:active {
		animation: button-pop 0.3s ease-out;
	}
	.choiceInput button:hover {
		background-color: #a61ce186;
	}
	::placeholder {
		color: #aaa;
	}
	.choice:hover:not(:last-child) {
		background-color: #372b2b;
	}

	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		font-family: 'Signika Negative';
		color: #eee;
	}

	.fetched-bg {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -999;
		height: 100vh;
		width: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
	}

	.main-bg {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -999;
		height: 100vh;
		background-image: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.767)),
			url(/images/main-bg.jpg);
		width: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
	}

	/* scrollbar */
	::-webkit-scrollbar {
		width: 0.5rem;
		border-radius: 0.5rem;
		background-color: hsl(22, 8%, 10%);
	}
	::-webkit-scrollbar-thumb {
		border-radius: 0.5rem;
		background-color: hsl(22, 8%, 15%);
	}
	::-webkit-scrollbar-thumb:hover {
		background-color: hsl(22, 8%, 20%);
	}

	/* button pop animation */
	@keyframes button-pop {
		0% {
			transform: scale(0.93);
		}
		40% {
			transform: scale(1.02);
		}
		100% {
			transform: scale(1);
		}
	}

	/* başlangıç ekranı: */

	.starting-screen {
		background-color: #333333aa;
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

		display: flex;
		flex-direction: column;
	}
	h1 {
		font-size: 2.3rem;
	}
	.heading-box button {
		margin-top: 0.8rem;
		align-self: end;
		border: none;
		background-color: rgba(239, 102, 52, 0.349);
		color: #eee;
		padding: 0.2rem 0.5rem;
		border-radius: 0.3rem;
		transition: 0.2s;
	}
	.heading-box button:hover {
		background-color: rgba(239, 102, 52, 0.549);

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
		height: 60%;
		align-items: start;

		position: absolute;
		bottom: 1rem;
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

	/* ingame error window */
	/* .dark-overlay{
		width:100vw;
		height:100vh;
		background-color:rgba(23, 23, 23, 0.688);

		position:absolute;
		left:0;
		top:0;

		z-index:999;
		
	} */
	.notification-window {
		background-color: rgb(33, 33, 33, 0.7);
		backdrop-filter: blur(4px);
		padding: 2rem 4rem;
		border-radius: 1rem;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;

		z-index: 999;
	}

	.notification-window button {
		border: 2px solid rgb(65, 124, 65);
		background-color: transparent;
		border-radius: 2px;
		border-radius: 0.5rem;
		padding: 0.4rem 1rem;
		transition: 0.2s;

		display: flex;
		justify-content: center;
	}
	.notification-window button:hover {
		transform: translateY(-3%);
	}
	.dual-button {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
	.dual-button button:nth-child(1) {
		border: 2px solid green;
	}
	.dual-button button:nth-child(2) {
		border: 2px solid rgb(111, 30, 0);
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
	.map-and-places button:active,
	.game-info-button:active {
		animation: button-pop 0.3s ease-out;
	}
	.game-info-button {
		cursor: pointer;
		position: absolute;
		width: 3.5rem;
		right: 1.5rem;
		bottom: 1.5rem;
	}

	.places-to-go {
		display: grid;
		grid-template-columns: 1fr;
		align-items: center;
		gap: 0.7rem;
	}

	.heading-and-enemy {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
	}

	.enemy {
		display: flex;

		gap: 0.05rem;
		align-items: center;
		justify-content: space-around;
		width: 8rem;
		height: 1rem;
		border-radius: 0.3rem;

		padding: 0.7rem 0;
	}

	.enemy h5 {
		font-weight: 400;
		font-size: 0.9rem;
		color: #ccc;
	}
	.enemy p {
		font-size: 0.9rem;
		text-align: center;
		color: #ccc;
	}
	.enemy span {
		font-size: 0.9rem;

		color: #ccc;
	}

	.buyables-box {
		display: flex;
		gap: 1rem;
	}
	.shop-box button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.4rem;

		display: flex;
		align-items: center;
		justify-content: center;
	}
	.buyable-img {
		width: 65%;
		height: 65%;
	}
</style>
