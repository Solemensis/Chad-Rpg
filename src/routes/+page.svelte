<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'
	import { supabase } from '$lib/supabaseClient'

	import frpgPlaces from '$lib/gamedata/places/frpg.json';
	import frpgStarter from '$lib/gamedata/gamestarters/frpg.json';
	import weapons from '$lib/gamedata/weapons.json';

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

					console.log(answer)
console.log(event)


					//to handle token limitation of gpt
					if (chatMessages.length >= 18) {
						chatMessages.splice(1, 2)
					}

					// console.log('chatMessages: ' + JSON.stringify(chatMessages))

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
	let spells: any[] = []
	let inventory: any[] = []
	let stats: any[] = []
	let event: any[] = [{ inCombat: false, shopMode: 'none' }]
	let shop: any[] = []
	let placeAndTime: any[] = []

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
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the randomly selected one
    [items[i], items[j]] = [items[j], items[i]];
  }

  // Return the first three shuffled items
  return items.slice(0, 3);
}

let shopItems:any[] = []


function mixBuyables(category:any){
	if (category =="weaponsmith") shopItems=shuffleItems(weapons)
	console.log(shopItems)
	return;
}

	function parseText(text: string) {
		const placeAndTimeRegex: any = /@placeAndTime:\s*(\[[^\]]*\])/
		const choiceRegex: any = /@choices:\s*(\[[^\]]*\])/
		const eventRegex: any = /@event:\s*(\[[^\]]*\])/

		const placeAndTimeMatch: any = text.match(placeAndTimeRegex)
		const choiceMatch: any = text.match(choiceRegex)
		const eventMatch: any = text.match(eventRegex)

		if (placeAndTimeMatch) {
			placeAndTime = JSON.parse(placeAndTimeMatch[1])

			if (!logged) {
				fetchThisBg = checkWordsForImg(placeAndTime[0].place)
				time = placeAndTime[0].time
				fetchImg()

				logged = true
			}
		}

	
		
		if (eventMatch){
			event = JSON.parse(eventMatch[1])

			if (event[0].shopMode !="none")
			{
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

	function getHpMp(inputString: any) {
		const parts = inputString.split('/')
		return parts[0]
	}

	function isHpOrMpFull(s: any) {
		const [left, right] = s.split('/')
		return left === right
	}

	let coolDowns: any = {}

	function randomNumber1_20(damage: any) {
		let dice = Math.floor(Math.random() * 20) + 1

		console.log(damage)
		console.log(dice)
		console.log(damage * dice)
		return damage * dice
	}

	let combatChoice: { name: string; damage: any; prompt: string; combatScore: any; healing: any } =
		{ name: '', damage: '', prompt: '', combatScore: undefined, healing: '' }


	function throwDice(combatEvent: any) {
		if (!combatEvent.name) return console.log('you need to choose a weapon or spell.')

		if (coolDowns[combatEvent.name]) {
			coolDowns[combatEvent.name] = 1
		}
		//zar numarasını bi süre göstermek için 1-2 saniyelik bi timeout
		//içine alıncak giveYourAnswer
		console.log(combatEvent.prompt)
		giveYourAnswer(combatEvent.prompt)

		//empty the object after
		combatChoice.name = ''
		combatChoice.damage = undefined
		combatChoice.healing = undefined
		combatChoice.prompt = ''
		combatChoice.combatScore = undefined
	}

	function useItem(item: any) {
		const { type, name, damage, manaCost, healing, mana } = item
		const { manaPoints, healthPoints } = stats[0]
		const {inCombat} = event[0]

		if (type === 'weapon') {
			if (!inCombat) return console.log('you are not in combat.')
			combatChoice.combatScore = randomNumber1_20(damage)

			if (combatChoice.combatScore >= 1 && combatChoice.combatScore < 10) {
				combatChoice.prompt = `Attack with ${name}! (give hard times to player in @story, where player lands the worst possible attack, which leads to player taking some serious hits and lose some huge health from enemy attacks, losing combat advantage aswell. End the combat with a failure, give a scenario where player barely escapes.)`
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

		if (type === 'destruction') {
			if (!inCombat) return console.log('you are not in combat.')
			if (getHpMp(manaPoints) < manaCost) return console.log('you have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < 3) return console.log('on cooldown')
			coolDowns[name] = 3
			combatChoice.combatScore = randomNumber1_20(damage)

			if (combatChoice.combatScore >= 1 && combatChoice.combatScore < 10) {
				combatChoice.prompt = `Attack with ${name} spell! (give hard times to player in @story, where player lands the worst possible attack, which leads to player taking some serious hits and lose some huge health from enemy attacks, losing combat advantage aswell.)`
			}
			if (combatChoice.combatScore >= 10 && combatChoice.combatScore < 20) {
				combatChoice.prompt = `Attack with ${name} spell! (give a sad @story where player lands a bad attack, which leads to player takes some hits but giving some little damage back at least.)`
			}
			if (combatChoice.combatScore >= 20 && combatChoice.combatScore < 50) {
				combatChoice.prompt = `Attack with ${name} spell! (give a medi-ocre @story where player lands a decent attack, which leads to an okayish scenario in combat for now.)`
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
			console.log(combatChoice)

			return
		}

		if (type === 'healing') {
			if (isHpOrMpFull(healthPoints)) return console.log("you're at full health.")
			if (getHpMp(manaPoints) < manaCost) return console.log('you have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < 3) return console.log('on cooldown')
			if (!inCombat)
				return giveYourAnswer(
					`Heal myself with ${name} spell by ${randomNumber1_20(healing)} amount.)`
				)

			coolDowns[name] = 3
			combatChoice.combatScore = randomNumber1_20(healing)

			combatChoice.prompt = `Heal myself with ${name} spell by ${combatChoice.combatScore} amount.`
			combatChoice.name = name
			combatChoice.healing = healing
			combatChoice.damage = undefined
			console.log(combatChoice)

			return
		}

		if (type === 'potion') {
			if (healing && isHpOrMpFull(healthPoints)) return console.log("you're at full health.")
			if (inCombat) return console.log("you can't drink in combat.")

			if (healing && !isHpOrMpFull(healthPoints)) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to heal by ${healing}. (that potion must be gone from inventory after that)`
				)
			}
			if (mana && isHpOrMpFull(manaPoints)) return console.log("you're at full mana.")
			if (inCombat) return console.log("you can't drink in combat.")
			if (mana && !isHpOrMpFull(manaPoints)) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to fill up mana by ${mana}. (that potion must be gone from inventory after that)`
				)
			}
		}
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

		name = item && item.name ? item.name : undefined
		damage = item && item.damage ? item.damage : undefined
		type = item && item.type ? item.type : undefined
		healing = item && item.healing ? item.healing : undefined
		armor = item && item.armor ? item.armor : undefined
		element = item && item.element ? item.element : undefined
	}

	let name: any
	let damage: any
	let type: any
	let healing: any
	let armor: any
	let element: any

	function hideWindow() {
		displayItemWindow = 'none'
	}
</script>

<div>
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
	<!-- {#if !backgroundImg} -->
	<div
		class="main-bg"
		style="opacity:{!img1active && !img2active ? '1' : '0'}; transition:opacity 2s;"
	/>
	<!-- {/if} -->
	<div class="description-window" style="left:{x}px; top:{y}px; display:{displayItemWindow}">
		<h5 class="desc-name">{name}</h5>
		{#if type}
			<p class="desc-type">type: {type}</p>
		{/if}
		{#if element}
			<p class="desc-element">element: {element}</p>
		{/if}
		{#if damage}
			<p class="desc-damage">damage: x{damage}</p>
		{/if}
		{#if healing && type == 'healing'}
			<p class="desc-healing">healing: x{healing}</p>
		{/if}
		{#if healing && type == 'potion'}
			<p class="desc-healing">healing: {healing}</p>
		{/if}
		{#if armor}
			<p class="desc-armor">armor: {armor}</p>
		{/if}
	</div>

	<div class="whole-content">
		<div class="game-starters">
			<h5>loading: {loading}</h5>
			<!-- <button on:click={downimg}>down</button> -->

			<h5>gamestarted: {gameStarted}</h5>

			<button on:click={() => giveYourAnswer(randomize(frpgStarter))}
				>at a random place in Medieval World</button
			>
			<h2>{weapons[0].name}</h2>
			<button
				on:click={() => {
					giveYourAnswer(
						`Story starts in a peaceful town of Azeroth, and player is a fairly new adventurer. You can use World of Warcraft mmorpg as the dataset, quests and storyline.`
					)
				}}>at a tavern in Medieval World</button
			>
			<!-- <h3>stats: {stats[0]}</h3> -->
			<!-- <img src="images/dice.webp" /> -->
			<!-- <button
				on:click={() =>
					giveYourAnswer(
						`In this game with a medieval role playing game theme (like world of warcraft), the player will visit a grand library located in a city to research ancient texts. As the player, you will immerse yourself in the atmosphere of the medieval world, surrounded by the scent of old books and the quiet murmurs of fellow scholars. Your objective is to conduct research and uncover information about ancient texts that could reveal important insights into the history and culture of this fascinating time period.`
					)}>at a grand library in Medieval World</button
			>
			<button
				on:click={() =>
					giveYourAnswer(
						'In this game with a theme inspired by the Harry Potter world, the player will receive a letter via owl delivered to their window in their room. The letter is an invitation to attend Hogwarts, a magical school. As the player, you will experience the excitement of receiving this invitation and begin your journey into the world of magic and wizardry'
					)}>hari potr</button
			>
			<button
				on:click={() =>
					giveYourAnswer(
						'Player as a powerful warlock, seeks to summon a powerful demon to do his bidding, but must first gather rare ingredients and perform a dangerous ritual.'
					)}>deneysel</button
			>
			<button
				on:click={() =>
					giveYourAnswer(
						'A group of adventurers must navigate the treacherous waters of the Great Sea to find a lost island rumored to be home to a powerful artifact.'
					)}>deneysel2</button
			> -->
		</div>
		{#if gameStarted}
			<div class="main-game">
				<div transition:fade={{ duration: 1000 }} class="game-master">
					<ChatMessage type="assistant" message={story ? story : dotty} />
				</div>
				<div transition:fade={{ duration: 2000 }} class="game-controls">
					<div style="opacity:{choices.length ? '1' : '0'}; transition:1.5s;" class="ui-left">
						<!-- {#if stats[0] && stats[0].healthPoints} -->
						<div class="hp-bar">
							 70/70
						</div>
						<!-- {/if} -->
						<div in:fade={{ delay: 200, duration: 1500 }} class="inventory">
							<h3>Inventory</h3>
							{#if inventory[0]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[0])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[0])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[0].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory[1]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[1])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[1].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory[2]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[2])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[2])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[2].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory[3]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[3])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[3])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[3].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory[4]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[4])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[4])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[4].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory[5]}
								<button
									disabled={loading}
									on:click={() => useItem(inventory[5])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory[5])}
										on:mouseleave={hideWindow}
										src="/images/{inventory[5].type}.svg"
										alt=""
									/>
								</button>
							{/if}
						</div>
					</div>
					<div class="ui-mid">
						{#if event[0]&& event[0].shopMode == 'none'&& event[0] && !event[0].inCombat  }
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
							{#if choices.length >= 2}
								<div class="stats">
									<div transition:fade={{ delay: 600, duration: 700 }} class="stat">
										<img class="svg-images" src="images/gold.svg" alt="" />
										<p>20</p>
									</div>
									<div transition:fade={{ delay: 600, duration: 700 }} class="stat">
										<img class="svg-images" src="images/time.svg" alt="" />

										<p>{placeAndTime[0].time ? placeAndTime[0].time : '00:00'}</p>
									</div>
								</div>
							{/if}

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
						{:else if event[0] && event[0].inCombat}
							<!-- combat ui -->
							<div class="combat">
								<div class="combat-box">
									<h3>You are now in <span class="span-heading">Combat!</span></h3>

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
											Your fighting scenario will be calculated based on these and some element of
											surprise.
										</li>
									</ul>
									<button class="combat-button">
										<img on:click={() => throwDice(combatChoice)} src="images/dice.webp" alt="" />
									</button>
								</div>
								<button
									disabled={loading}
									transition:fade={{ ...getDelayTime(), duration: 700 }}
									class="choice choiceCombat"
									style="opacity: {choices.length ? '1' : '0'}; transition:1.5s;"
									on:click={() => giveYourAnswer('Try To Retreat! (with 60% chance')}
									>Or, just try to Retreat! [60% chance]</button
								>
							</div>
							<!-- shop ui -->
						{:else if event[0] && event[0].shopMode != 'none'}
							<div class="shop">
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
									{#if event[0].shopMode != 'none' && event[0].shopMode != 'weaponsmith' && event[0].shopMode != 'armorsmith' && event[0].shopMode != 'spell shop' && event[0].shopMode != 'potion shop'}
										<h3>You're at a local <span class="g-span">Merchant</span></h3>
									{/if}

									<ul>
										{#each shop as buyable}
										<button class="item-button" on:click={()=>console.log("anan: ", buyable.name)} >
											{#if buyable.damage}
												<li>{buyable.name} - {buyable.price} gold - {buyable.damage} damage</li>
											{/if}
											{#if buyable.healing}
												<li>{buyable.name} - {buyable.price} gold - {buyable.healing} healing</li>
											{/if}
											{#if buyable.armor}
												<li>{buyable.name} - {buyable.price} gold - {buyable.armor} armor</li>
											{/if}
											{#if buyable.mana}
												<li>{buyable.name} - {buyable.price} gold - {buyable.mana} mana</li>
											{/if}
											</button>
										{/each}
									</ul>
									<button class="buy-button">
										<img src="images/buy.svg" alt="" />
									</button>
								</div>
								<button
									disabled={loading}
									transition:fade={{ ...getDelayTime(), duration: 700 }}
									class="choice choiceCombat"
									style="opacity: {choices.length ? '1' : '0'}; transition:1.5s;"
									on:click={() => giveYourAnswer('Leave the shop')}>Leave the Shop</button
								>
							</div>
						{/if}

						<!-- {if }
						<div  class="choice">
										<form on:submit|preventDefault={() => giveYourAnswer(query)}>
											<input
												placeholder="Go to a nearby Tavern | Speak about Magic"
												type="text"
												bind:value={query}
											/>
											<button type="submit">Answer</button>
										</form>
									</div>
									{/if} -->
					</div>

					<div style="opacity:{choices.length ? '1' : '0'}; transition:1.5s;" class="ui-right">
						<!-- {#if stats[0] && stats[0].manaPoints} -->

						<div class="mp-bar">
							50/50
						</div>
						<!-- {/if} -->
						<div in:fade={{ delay: 200, duration: 1000 }} class="spells">
							<h3>Spells</h3>

							{#if spells[0]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[0])}
									in:fade={{ duration: 600 }}
									><img
										on:mousemove={(event) => handleMouseMove(event, spells[0])}
										on:mouseleave={hideWindow}
										src="/images/{spells[0].element}.svg"
										alt=""
									/></button
								>
							{/if}
							{#if spells[1]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[1])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells[1])}
										on:mouseleave={hideWindow}
										src="/images/{spells[1].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells[2]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[2])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells[2])}
										on:mouseleave={hideWindow}
										src="/images/{spells[2].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells[3]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[3])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells[3])}
										on:mouseleave={hideWindow}
										src="/images/{spells[3].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells[4]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[4])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells[4])}
										on:mouseleave={hideWindow}
										src="/images/{spells[4].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells[5]}
								<button
									disabled={loading}
									on:click={() => useItem(spells[5])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells[5])}
										on:mouseleave={hideWindow}
										src="/images/{spells[5].element}.svg"
										alt=""
									/>
								</button>
							{/if}
						</div>
					</div>
				</div>
				<!-- {:else} -->

				<!-- {#if !choices2
				 <div class="choices">
				.length && loading}
					<div in:fade={{ delay: 10000, duration: 700 }} class="choice">
						<form on:submit|preventDefault={() => giveYourAnswer(query)}>
							<input
								placeholder="No conversation generated. Please write your own action."
								type="text"
								bind:value={query}
							/>
							<button type="submit">Answer</button>
						</form>
					</div>
				-->
			</div>
		{/if}

		<!-- <div class="left-part">
			<div class="inventory">
				{#each inventory as item}
					<h5>{item.name}</h5>
					{#if item.damage}
						<p>Damage: {item.damage}</p>
					{/if}
					{#if item.armor}
						<p>Armor: {item.armor}</p>
					{/if}
					{#if item.healing}
						<p>Healing: {item.healing}</p>
					{/if}
				{/each}
			</div>
			<div class="spells">
				{#each spells as spell}
					<h5>{spell.name}</h5>
					{#if spell.damage}
						<p>Damage: {spell.damage}</p>
					{/if}
					{#if spell.healing}
						<p>Healing: {spell.healing}</p>
					{/if}
				{/each}
			</div>
			<div class="stats">
				{#each stats as stats}
					<p>Health: {stats.healthPoints}</p>
					<p>Level: {stats.level}</p>
					<p>Power Level: {stats.powerLevel}</p>
					<p>Gold: {stats.gold}</p>
				{/each}
			</div>
		</div> -->
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Signika+Negative:wght@300;400;500&display=swap');

	.desc-name {
		color: violet;
		font-size: 1rem;
	}
	.desc-type,
	.desc-damage,
	.desc-healing,
	.desc-armor,
	.desc-element {
		font-size: 0.9rem;
	}

	.description-window {
		position: absolute;
		min-width: 10rem;
		background-color: rgba(59, 35, 35, 0.381);
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
	.game-starters {
		position: absolute;
		left: 0.5rem;
		display: flex;
		flex-direction: column;
		top: 50%;
		transform: translateY(-50%);
		gap: 2rem;
	}
	.game-starters * {
		width: 8rem;
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
	.hp-bar {
		background-color: #b02863aa;
	}
	.mp-bar {
		background-color: #76399caa;
	}
	.spells h3,
	.inventory h3 {
		grid-column-start: 1;
		grid-column-end: 4;
		justify-self: center;
		font-weight: 400;
		font-size: 1.4rem;
		color: #3fcf8e;
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
		background-color: rgba(115, 115, 115, 0.267);
		border: none;
		border-radius: 0.4rem;
		width: 85%;
		height: 85%;
	}
	button {
		background-color: gray;
	}

	.choices {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
		margin-inline: auto;
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
		position: absolute;
		top: 0.9rem;
		left: 50%;
		width: 100%;
		transform: translateX(-50%);
		text-align: center;
		font-weight: 300;
		font-size: 1.5rem;
	}

	.combat-box,
	.shop-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		align-items: flex-end;
		height: 100%;
		justify-content: space-around;
		position: relative;
		padding: 0 0.2rem;
	}
	.combat-button img {
		height: 50%;
		align-self: center;
		background-color: rgba(19, 19, 19, 0.725);
		border-radius: 20rem;
		padding: 0.7rem 0.8rem 0.6rem 0.7rem;
	}
	.combat-box img:active {
		animation: button-pop 0.3s ease-out;
	}

	.combat-box ul,
	.shop-box ul {
		padding-bottom: 0.7rem;

		padding-left: 0.4rem;
		width: 60%;
		font-size: 1rem;
	}
	.combat-box ul li,
	.shop-box ul li {
		color: #bbb;
		padding-left: 0.4rem;
		margin-bottom: 0.4rem;
	}

	.combat-box ul li:nth-child(1) {
		list-style-type: '⚔️';
	}
	.combat-box ul li:nth-child(2) {
		list-style-type: '🎲';
	}
	.combat-box ul li:nth-child(3) {
		list-style-type: '🔮';
		line-height: 1.2;
		font-size: 0.8rem;
		padding-left: 0.6rem;
		margin-left: -0.15rem;
		margin-top: 0.6rem;

		color: #aaa;
	}
	.buy-button {
		border: none;
		align-self: flex-end;
		margin-bottom: 1.4rem;
		background-color: rgba(19, 19, 19, 0.525);
		border-radius: 0.6rem;
		padding: 0.5rem 0.5rem 0.1rem 0.5rem;
	}
	.buy-button img {
		width: 3.5rem;
	}
	.buy-button:active {
		animation: button-pop 0.3s ease-out;
	}
	.item-button{
		border:none;
		background-color:transparent;
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
	.choiceCombat:hover {
		background-color: #372b2b;
	}

	.choice form {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
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
</style>
