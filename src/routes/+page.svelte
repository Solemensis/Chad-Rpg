<script lang="ts">
	import { onMount } from 'svelte'
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'
	import { supabase } from '$lib/supabaseClient'

	let query: string = ''
	let answer: string = ''
	let story: string = ''
	let loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []

	const handleSubmit = async () => {
		if (query === '') {
			return
		}

		choices2 = []

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

					console.log('chatResponse: ' + answer)
					console.log('chatMessages.length: ' + chatMessages.length)

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

	function handleError<T>(err: T) {
		// loading = false
		console.error('error from client: ' + err)
		console.log('query: ' + query)
		giveYourAnswer(query)
		// query = ''
		// answer = ''
	}

	// from here, my code starts

	function checkWordsForImg(str) {
		const words = str.split(' ')
		const specificWords = [
			'Tavern',
			'Woods',
			'Town',
			'Library',
			'Laboratory',
			'Hospital',
			'Sanatorium',
			'School',
			'Dungeon',
			'Cave',
			'Castle',
			'Mountain',
			'Shore',
			'Cathedral',
			'Shop',
			'Home',
			'Harbor',
			'Dock',
			'Ship',
			'Desert',
			'Island',
			'Temple',
			'Unknown',
			'Underground',
			'City',
			'Throne',
			'Monastery',
			'Inn',
			'Garden'
		]

		for (let i = 0; i < words.length; i++) {
			const word = words[i]
			if (specificWords.includes(word)) {
				return word
			}
		}

		return null
	}

	let choices2: string[] = []
	let spells2: string[] = []
	let inventory2: string[] = []
	let stats2: string[] = [{ inCombat: false }]
	let placeAndTime2: string[] = []

	let result = {
		choices: choices2,
		spells: spells2,
		inventory: inventory2,
		stats: stats2,
		placeAndTime: placeAndTime2
	}

	// function to get a random number from imgs.length
	function getRandomNumber(num) {
		return Math.floor(Math.random() * num) + 1
	}

	let fetchedBg1 = ''
	let fetchedBg2 = ''
	let img1active = false
	let img2active = false

	let time: string = ''
	async function fetchImg() {
		//list imgs
		const { data: imgs } = await supabase.storage.from('imgs').list(`${fetchThisBg}`, {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch img based on time and place
		let finalImg
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

	function extractHours(timeString) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	let logged = false
	let fetchThisBg = ''
	function parseText(
		text: string,
		result: {
			choices?: string[]
			stats?: string[]
			inventory?: string[]
			spells?: string[]
			placeAndTime?: string[]
		} = {}
	): {
		choices?: string[]
		stats?: string[]
		inventory?: string[]
		spells?: string[]
		placeAndTime?: string[]
	} {
		const placeAndTimeRegex = /@placeAndTime:\s*(\[[^\]]*\])/
		const choiceRegex = /@choices:\s*(\[[^\]]*\])/
		const statsRegex = /@stats:\s*(\[[^\]]*\])/
		const inventoryRegex = /@inventory:\s*(\[[^\]]*\])/
		const spellsRegex = /@spells:\s*(\[[^\]]*\])/

		const placeAndTimeMatch = text.match(placeAndTimeRegex)
		const choiceMatch = text.match(choiceRegex)
		const statsMatch = text.match(statsRegex)
		const inventoryMatch = text.match(inventoryRegex)
		const spellsMatch = text.match(spellsRegex)

		if (placeAndTimeMatch) {
			placeAndTime2 = JSON.parse(placeAndTimeMatch[1])

			if (!logged) {
				fetchThisBg = checkWordsForImg(placeAndTime2[0].place)
				time = placeAndTime2[0].time
				fetchImg()

				logged = true
			}
		}

		if (choiceMatch) {
			choices2 = JSON.parse(choiceMatch[1])
		}
		if (statsMatch) {
			stats2 = JSON.parse(statsMatch[1])
		}

		if (inventoryMatch) {
			inventory2 = JSON.parse(inventoryMatch[1])
		}

		if (spellsMatch) {
			spells2 = JSON.parse(spellsMatch[1])
		}
		return result
	}

	function extractStory(str) {
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

	function getHpMp(inputString) {
		const parts = inputString.split('/')
		return parts[0]
	}

	function isHpOrMpFull(s) {
		const [left, right] = s.split('/')
		return left === right
	}

	let coolDowns = {}

	function useItem(item) {
		const { type, name, manaCost, healing, mana } = item
		const { inCombat, manaPoints, healthPoints } = stats2[0]

		if (type === 'weapon') {
			if (!inCombat) return console.log('you are not in combat.')
			return giveYourAnswer(`Attack with ${name}! (eventScore: ${119})`)
		}

		if (type === 'destruction') {
			if (!inCombat) return console.log('you are not in combat.')
			if (getHpMp(manaPoints) < manaCost) return console.log('you have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < 3) return console.log('on cooldown')
			coolDowns[name] = 1
			return giveYourAnswer(
				`Attack with ${name}! (dice: 2/20 - give a @story where player couldn't deal a succesful ${name} damage.)`
			)
		}

		if (type === 'healing') {
			if (isHpOrMpFull(healthPoints)) return console.log("you're at full health.")
			if (getHpMp(manaPoints) < manaCost) return console.log('you have not enough mana.')
			if (coolDowns[name] && coolDowns[name] < 3) return console.log('on cooldown')
			coolDowns[name] = 1
			return giveYourAnswer(`Heal player with ${name}.`)
		}

		if (type === 'potion') {
			if (healing && isHpOrMpFull(healthPoints)) return console.log("you're at full health.")
			if (healing && !isHpOrMpFull(healthPoints)) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to heal by ${healing}. (that potion must be gone from inventory after that)`
				)
			}
			if (mana && isHpOrMpFull(manaPoints)) return console.log("you're at full mana.")
			if (mana && !isHpOrMpFull(manaPoints)) {
				return giveYourAnswer(
					`Drink a ${name} from your inventory to fill up mana by ${mana}. (that potion must be gone from inventory after that)`
				)
			}
		}
	}

	function giveYourAnswer(choice) {
		if (!choice) {
			return
		}
		story = ''
		query = ''

		//increase all the cooldowns by 1 with every choice
		for (const key in coolDowns) {
			if (coolDowns.hasOwnProperty(key)) {
				coolDowns[key] += 1
			}
		}

		displayItemWindow = 'none'

		choices2 = []

		query = choice
		answer = ''

		handleSubmit()
		query = ''

		if (gameStarted == false) {
			gameStarted = true
		}
	}

	let gameStarted = false

	//transition delay logic
	let delay = -300
	function getDelayTime() {
		delay += 300

		return { delay }
	}

	//message loading animation logic
	let dotty = '.'
	setInterval(() => {
		if (dotty == '...') {
			dotty = ''
		}
		dotty += '.'
	}, 400)

	const medievalStarter = [
		'Player enters a tavern and starts to chat with the innkeeper. (game-theme:medieval)',
		'Player is looking for spellbooks at a library in a town. (game-theme:medieval)',
		'Player arrives at a small village and meets with the local blacksmith. (game-theme:medieval)',
		"Player visits a healer's hut to seek treatment for a wound. (game-theme:medieval)",
		"Player explores the town's market and meets with various vendors. (game-theme:medieval)",
		'Player meets with a nobleman in his castle to discuss a quest. (game-theme:medieval)',
		'Player seeks refuge in a church from a storm or danger outside. (game-theme:medieval)',
		'Player participates in a festival or celebration in a town square. (game-theme:medieval)',
		'Player visits a wise old sage in his hidden cottage in the woods. (game-theme:medieval)',
		'Player trains with a knight in a castle courtyard. (game-theme:medieval)',
		'Player joins a group of travelers on a caravan to a nearby city. (game-theme:medieval)',
		'Player attends a performance at a theater in a grand city. (game-theme:medieval)',
		'Player enters a secluded monastery to seek guidance from the monks. (game-theme:medieval)',
		'Player discovers a hidden cave and meets with a hermit who lives there. (game-theme:medieval)',
		'Player investigates a mysterious castle in the middle of a forest. (game-theme:medieval)',
		'Player explores a deserted island and meets with a castaway. (game-theme:medieval)',
		'Player enters a mystical garden and meets with a fairy queen. (game-theme:medieval)',
		"Player seeks shelter in a wizard's tower during a dangerous quest. (game-theme:medieval)",
		'Player participates in a tournament of knights in a grand arena. (game-theme:medieval)',
		'Player seeks an audience with a powerful king in his throne room. (game-theme:medieval)',
		'Player visits a grand library in a city to research ancient texts. (game-theme:medieval)',
		'Player discovers a hidden underground city and meets with its inhabitants. (game-theme:medieval)'
	]

	function randomize(gameStarter) {
		const randomIndex = Math.floor(Math.random() * gameStarter.length)
		const randomlySelectedElement = gameStarter[randomIndex]

		chatMessages = [{ role: 'user', content: randomlySelectedElement }]
		return randomlySelectedElement
	}

	//description window
	let x = 0
	let y = 0
	let displayItemWindow = 'none'

	function handleMouseMove(event, item) {
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
	let name
	let damage
	let type
	let healing
	let armor
	let element

	function hideWindow() {
		displayItemWindow = 'none'
	}
</script>

<div>
	<img
		class="fetched-bg"
		src={fetchedBg1}
		style="opacity:{img1active ? '1' : '0'}; transition:opacity 2s;"
	/>
	<img
		class="fetched-bg"
		src={fetchedBg2}
		style="opacity:{img2active ? '1' : '0'}; transition:opacity 2s;"
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
			<p class="desc-damage">damage: {damage}</p>
		{/if}
		{#if healing}
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

			<button on:click={() => giveYourAnswer(randomize(medievalStarter))}
				>at a random place in Medieval World</button
			>
			<button
				on:click={() => {
					giveYourAnswer(
						`Story starts in a peaceful town of Azeroth, and player is a fairly new adventurer. You can use World of Warcraft mmorpg as the dataset, quests and storyline.`
					)
				}}>at a tavern in Medieval World</button
			>
			<!-- <h3>stats: {stats2[0]}</h3> -->
			<h3>hour: {time}</h3>
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
					<div style="opacity:{choices2.length ? '1' : '0'}; transition:1.5s;" class="ui-left">
						<!-- {#if stats2[0] && stats2[0].healthPoints} -->
						<div class="hp-bar">
							{stats2[0] && stats2[0].healthPoints ? stats2[0].healthPoints : '70/70'}
						</div>
						<!-- {/if} -->
						<div in:fade={{ delay: 200, duration: 1500 }} class="inventory">
							<h3>Inventory</h3>
							{#if inventory2[0]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[0])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[0])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[0].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory2[1]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[1])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[1].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory2[2]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[2])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[2].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory2[3]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[3])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[3].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory2[4]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[4])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[4].type}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if inventory2[5]}
								<button
									disabled={loading}
									on:click={useItem(inventory2[5])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, inventory2[1])}
										on:mouseleave={hideWindow}
										src="/images/{inventory2[5].type}.svg"
										alt=""
									/>
								</button>
							{/if}
						</div>
					</div>
					<div class="ui-mid">
						{#if stats2[0] && !stats2[0].inCombat}
							<div class="choices">
								{#each choices2 as choice}
									<button
										disabled={loading}
										transition:fade={{ ...getDelayTime(), duration: 700 }}
										class="choice"
										on:click={() => giveYourAnswer(choice)}>{choice}</button
									>
								{/each}
								{#if choices2.length >= 3}
									<div transition:fade={{ ...getDelayTime(), duration: 400 }} class="choice">
										<form on:submit|preventDefault={() => giveYourAnswer(query)}>
											<input
												placeholder="Go to a nearby Tavern | Speak about Magic"
												type="text"
												bind:value={query}
											/>
											<button disabled={!query} type="submit">Answer</button>
										</form>
									</div>
								{/if}
							</div>
							{#if story.length && !choices2.length}
								<div>
									<p
										in:fade={{ duration: 1000 }}
										style="background-color:transparent; padding-left:1rem;"
									>
										{dotty}
									</p>
									<div in:fade={{ delay: 10000, duration: 700 }} class="choice">
										<form on:submit|preventDefault={() => giveYourAnswer(query)}>
											<input
												placeholder="Go to a nearby Tavern | Speak about Magic"
												type="text"
												bind:value={query}
											/>
											<button type="submit">Answer</button>
										</form>
									</div>
								</div>
							{/if}
						{:else if choices2.length && stats2[0] && stats2[0].inCombat}
							<div class="choices">
								<button
									disabled={loading}
									transition:fade={{ ...getDelayTime(), duration: 700 }}
									class="choice choiceCombat"
									on:click={() => giveYourAnswer('Try To Retreat! (70% chance')}
									>Try To Retreat! (70%)</button
								>
							</div>
						{/if}
					</div>

					<div style="opacity:{choices2.length ? '1' : '0'}; transition:1.5s;" class="ui-right">
						<!-- {#if stats2[0] && stats2[0].manaPoints} -->

						<div class="mp-bar">
							{stats2[0] && stats2[0].manaPoints ? stats2[0].manaPoints : '50/50'}
						</div>
						<!-- {/if} -->
						<div in:fade={{ delay: 200, duration: 1000 }} class="spells">
							<h3>Spells</h3>

							{#if spells2[0]}
								<button
									disabled={loading}
									on:click={useItem(spells2[0])}
									in:fade={{ duration: 600 }}
									><img
										on:mousemove={(event) => handleMouseMove(event, spells2[0])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[0].element}.svg"
										alt=""
									/></button
								>
							{/if}
							{#if spells2[1]}
								<button
									disabled={loading}
									on:click={useItem(spells2[1])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells2[1])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[1].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells2[2]}
								<button
									disabled={loading}
									on:click={useItem(spells2[2])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells2[2])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[2].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells2[3]}
								<button
									disabled={loading}
									on:click={useItem(spells2[3])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells2[3])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[3].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells2[4]}
								<button
									disabled={loading}
									on:click={useItem(spells2[4])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells2[4])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[4].element}.svg"
										alt=""
									/>
								</button>
							{/if}
							{#if spells2[5]}
								<button
									disabled={loading}
									on:click={useItem(spells2[5])}
									in:fade={{ duration: 600 }}
								>
									<img
										on:mousemove={(event) => handleMouseMove(event, spells2[5])}
										on:mouseleave={hideWindow}
										src="/images/{spells2[5].element}.svg"
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
				{#each inventory2 as item}
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
				{#each spells2 as spell}
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
				{#each stats2 as stats}
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
		width: 15%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		justify-content: flex-end;
	}

	.hp-bar,
	.mp-bar {
		text-align: center;
		font-size: 1.2rem;
		border-radius: 0.3rem;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	.spells,
	.inventory {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		background-color: #362525bc;
		border-radius: 0.3rem;
		min-height: 30vh;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
	.hp-bar {
		background-color: #ba3232;
	}
	.mp-bar {
		background-color: #38389f;
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
		width: 100%;
		padding: 0.2rem;
	}
	.spells button,
	.inventory button {
		background-color: rgba(115, 115, 115, 0.267);
		border: none;
		border-radius: 0.5rem;
		width: 3rem;
		height: 3rem;
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

	.choice {
		background-color: #362525;
		border-radius: 0.5rem;
		font-size: 1.4rem;
		color: #ddd;
		padding: 0.7rem 0.6rem;
		border: none;
		position: relative;
		text-align: center;
		transition: 0.2s;
	}
	.choice:hover:not(:last-child) {
		background-color: #372b2b;
	}
	.choiceCombat:hover {
		background-color: #372b2b;
	}
	.choice form input {
		background-color: #1f1f1f;
		border: none;
		border-radius: 0.2rem;
		width: 85%;
		height: 100%;
		font-size: 1.2rem;
		outline: none;
		padding: 0.1rem 0.3rem;
		text-align: start;
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
	html {
		font-size: 32.5% !important;
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
</style>
