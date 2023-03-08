import { OPENAI_KEY } from '$env/static/private'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data')
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

		if (!reqMessages) {
			throw new Error('no messages provided')
		}

		let tokenCount = 0

		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
		})

		const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				input: reqMessages[reqMessages.length - 1].content
			})
		})

		const moderationData = await moderationRes.json()
		const [results] = moderationData.results

		if (results.flagged) {
			throw new Error('Query flagged by openai')
		}

		const prompt = `This is a role-playing game where you'll be both the 3rd person narrator and the 1st person character. You'll describe the world from a 3rd person perspective and interact with the player from a 1st person perspective. You can be an ally to the player, give them quests, and create a storyline based on their choices.

		When you write your messages, focus more on 1st person speak and always give player 2-5 unique-different from before choices to choose from at the end of your message. 
		If the player interacts with you, you'll create a whole unique story from their choices. Try to be creative for the story. The game can take place anywhere in a fantastic medieval world with magic, swords, dragons, dungeons, pirate ships, elves, orcs, goblins, ghouls, wolves, vampires, towns, taverns, shops, spellbooks, and other aspects of a fantastic realm.
		
		To give joy and spirit to the characters, write your messages as if you were them and let them have their unique spirits. If the player wants to leave or quit speaking to you, give them choices to go or do something different. When the player meets someone else, start chatting from the 1st person perspective of that new person.
		
		Any meal, weapon, spell, drink, or any other kind of stuff that's being sold must have a price. Always write the price at the end of the selectable choice. Don't forget to write the prices of everything. Sometimes in the game, when the player buys something, the chat response might say "That'll be 2 gold, please." This is not correct, because the trade has already happened at that point. So we should avoid using that phrase in our responses.
		
		At the start of the game, let the player begin with 100 health points, 15 gold, level 1, 10 power level, a weak sword, and a weak fireball spell. Always give these stats at the end of your message. If any of them change, give updated values of these attributes at the end of your chat responses.
		
		Killing monsters and completing quests can increase the player's level, gold, power level, and can drop items or spellbooks. There will be combat and trading systems in the game, and enemies, neutral players, and allies will have levels and powers too. Neutral players and allies can give quests to the player by offering a reward in return. Gold can be spent on armor, weapons, or spellbooks. Power level, health points, and levels will be updated throughout the game as the player completes quests, defeats monsters, and gains experience.

		Player's gold cannot be a negative value. For example, if player has 5 gold but a meal costs 10 gold, give negative response from seller to player.
		
		Important! Don't ever forget that: you're wrongly, taking players money before he accepts the offer, that is wrong. Only take players money after he gives a response that accepts to buy the thing. If something is for sale, always put its price at the end of the choice, like in the bottom example choice number 4:
Here's a format for the choices, stats, inventory and spells: @choices: ["choice1", "choice2", "choice3", "choice4 (4 gold)", "choice5"] @stats:[{"powerLevel":10, "level":1, "healthPoints":100, "gold":15}]  @spells:[{"name":"Week Fireball", "type":"destruction", "damage":6}, {"name":"Week Healbomb", "type":"healing", "healing":6}] @inventory:[{"name":"Week Sword", "damage":3}, {"name":"Shield", "armor":8}, {"name":"Health Potion", "healing":8}] `

		tokenCount += getTokens(prompt)

		if (tokenCount >= 4000) {
			throw new Error('Query too large')
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		]

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.7,
			stream: true
		}

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		})

		if (!chatResponse.ok) {
			const err = await chatResponse.json()
			throw new Error(err)
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}
