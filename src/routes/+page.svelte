<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'

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

		query = ''

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			try {
				loading = false

				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]

					parseText(answer)

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
		loading = false
		query = ''
		answer = ''
		console.error(err)
	}

	// from here, my code starts

	// getter-setter mantığı
	let choices2: string[] = []
	let spells2: string[] = []
	let inventory2: string[] = []
	// let stats2: { [key: string]: number } = {}
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
			// stats?: { [key: string]: number }
			stats?: string[]
			inventory?: string[]
			spells?: string[]
		} = {}
	): {
		choices?: string[]
		// stats?: { [key: string]: number }
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
		query = choice
		answer = ''

		handleSubmit()
		query = ''
		gameStarted = true
	}

	let gameStarted = false
</script>

<div>
	<div class="background-img" />
	<div class="whole-content">
		<div class="game-starters">
			<button
				on:click={() =>
					giveYourAnswer('player enters a tavern, and starts to chat with the innkeeper')}
				>Medieval</button
			>
		</div>
		{#if gameStarted}
			<div class="main-game">
				<div class="game-master">
					{#if answer}
						<ChatMessage type="assistant" message={extractStory(answer)} />
					{/if}
					{#if loading}
						<ChatMessage type="assistant" message="Loading.." />
					{/if}
				</div>

				<div class="choices">
					{#each choices2 as choice}
						<button class="choice" on:click={() => giveYourAnswer(choice)}>{choice}</button>
					{/each}
					{#if choices2.length}
						<div class="choice">
							<form on:submit|preventDefault={() => giveYourAnswer(query)}>
								<input type="text" bind:value={query} />
								<button type="submit">Answer</button>
							</form>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<div class="left-part">
			<div class="inventory">
				{#each inventory2 as item}
					<h4>{item.name}</h4>
					<h4>Damage: {item.damage}</h4>
				{/each}
			</div>
			<div class="spells">
				{#each spells2 as spell}
					<h4>{spell.name}</h4>
					<h4>Damage: {spell.damage}</h4>
				{/each}
			</div>
			<div class="stats">
				{#each stats2 as stats}
					<h4>Level: {stats.level}</h4>
					<h4>Power Level: {stats.powerLevel}</h4>
					<h4>Gold: {stats.gold}</h4>
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
		max-height: 60%;
		line-height: 1.8;
		background-color: #1a1a1a69;
		backdrop-filter: blur(8px);
		margin-inline: auto;
		padding: 1rem 1rem;
		border-radius: 1rem;
		font-size: 1.4rem;
		color: #ccc;
		overflow: auto;
	}
	.game-starters {
		position: absolute;
		left: 2rem;
	}
	.choices {
		display: grid;
		grid-gap: 0.3rem;
		grid-template-columns: 1fr;
		width: 70%;
		margin-inline: auto;
	}
	.choice {
		background-color: rgb(54, 37, 37);
		border-radius: 0.5rem;
		font-size: 1.4rem;
		color: #ddd;
		padding: 0.3rem 0.5rem;
		border: none;
		position: relative;
		text-align: start;
	}
	.choice form input {
		background-color: #1f1f1f;
		border: none;
		border-radius: 0.2rem;
		width: 70%;
		height: 1.3rem;
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
	.choice form button {
	}
	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		font-family: 'Signika Negative';
		color: #eee;
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
