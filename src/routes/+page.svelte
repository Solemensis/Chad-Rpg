<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'

	let query: string = ''
	let answer: string = ''
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
				loading = false
				parseText(answer)
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]

					console.log(answer)
					choiceDelay = 0

					query = ''
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
		console.error(err)
		handleSubmit()
		// query = ''
		// answer = ''
	}

	// from here, my code starts

	let choices2: string[] = []
	let spells2: string[] = []
	let inventory2: string[] = []
	let stats2: string[] = []

	let result = {
		choices: choices2,
		spells: spells2,
		inventory: inventory2,
		stats: stats2
	}

	function parseText(
		text: string,
		result: {
			choices?: string[]
			stats?: string[]
			inventory?: string[]
			spells?: string[]
		} = {}
	): {
		choices?: string[]
		stats?: string[]
		inventory?: string[]
		spells?: string[]
	} {
		const choiceRegex = /@choices:\s*(\[[^\]]*\])/
		const statsRegex = /@stats:\s*(\[[^\]]*\])/
		const inventoryRegex = /@inventory:\s*(\[[^\]]*\])/
		const spellsRegex = /@spells:\s*(\[[^\]]*\])/

		const choiceMatch = text.match(choiceRegex)
		const statsMatch = text.match(statsRegex)
		const inventoryMatch = text.match(inventoryRegex)
		const spellsMatch = text.match(spellsRegex)

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

	function extractStory(str: string): string {
		if (str.includes('@choices')) {
			const index = str.indexOf('@choices')
			return str.substring(0, index)
		} else {
			return str
		}
	}

	function giveYourAnswer(choice) {
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
	let choiceDelay = 0
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
</script>

<div>
	<div class="background-img" />
	<div class="whole-content">
		<div class="game-starters">
			<h3>Start the game</h3>
			<button on:click={() => giveYourAnswer(randomize(medievalStarter))}
				>at a random place in Medieval World</button
			>
			<button
				on:click={() => {
					giveYourAnswer(
						`Player in a medieval RPG game (such as World of Warcraft) goes into a tavern and begins to converse with the person who runs the establishment, known as the innkeeper.`
					)
				}}>at a tavern in Medieval World</button
			>
			<button
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
		</div>
		{#if gameStarted}
			<div class="main-game">
				<div in:fade={{ duration: 1000 }} class="game-master">
					{#if answer}
						<ChatMessage type="assistant" message={extractStory(answer)} />
					{/if}
					{#if loading}
						<ChatMessage type="assistant" message={dotty} />
					{/if}
				</div>
				{#if choices2.length}
					<div class="choices">
						{#each choices2 as choice}
							<button
								in:fade={{ ...getDelayTime(), duration: 700 }}
								class="choice"
								on:click={() => giveYourAnswer(choice)}>{choice}</button
							>
						{/each}
						<div in:fade={{ ...getDelayTime(), duration: 700 }} class="choice">
							<form on:submit|preventDefault={() => giveYourAnswer(query)}>
								<input
									placeholder="You can write your own action!"
									type="text"
									bind:value={query}
								/>
								<button type="submit">Answer</button>
							</form>
						</div>
					</div>
				{:else}
					<div class="choices">
						{#if !loading}
							<p
								in:fade={{ duration: 1000 }}
								style="background-color:transparent; padding-left:1rem;"
							>
								{dotty}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
		<div class="left-part">
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
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Signika+Negative:wght@300;400;500&display=swap');

	.left-part {
		position: absolute;
		left: 0;
		top: 50%;
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
		min-height: 20%;
		max-height: 50%;
		line-height: 1.8;
		background-color: #1a1a1a69;
		backdrop-filter: blur(8px);
		margin-inline: auto;
		padding: 1rem 1.3rem;
		border-radius: 1rem;
		font-size: 1.4rem;
		color: #ccc;
		overflow: auto;
		transition: 0.2s;
	}
	.game-starters {
		position: absolute;
		left: 2rem;
	}
	.choices {
		min-height: 36.9%;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		width: 70%;
		margin-inline: auto;
	}
	.choice {
		background-color: rgb(54, 37, 37);
		border-radius: 0.5rem;
		font-size: 1.4rem;
		color: #ddd;
		padding: 0.4rem 0.6rem;
		border: none;
		position: relative;
		text-align: start;
	}
	.choice form input {
		background-color: #1f1f1f;
		border: none;
		border-radius: 0.2rem;
		width: 70%;
		height: 70%;
		font-size: 1.4rem;
		outline: none;
		padding: 0.1rem 0.3rem;
		position: absolute;
		left: 0.5rem;
		/* transform: translateX(-50%); */
	}
	.choice form {
		display: flex;
		align-items: center;
		justify-content: flex-end;
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
	button {
		background-color: black;
		padding: 0.3rem 0.7rem;
		border-radius: 0.5rem;
		border: none;
	}

	.background-img {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -999;
		height: 100vh;
		background-image: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.4)), url(/images/16.jpg);
		width: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
	}
</style>
