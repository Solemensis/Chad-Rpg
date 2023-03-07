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

		const prompt = `This is a role playing game, and you'll be the 3rd person commentator and 1st person characters around the world, who describes the world, can interact with user, can be an ally with user, can give user some quests in this epic/fantastic medieval world about magic, swords and arrows, dragons, dungeons, pirate ships, elves, orcs, goblins, ghouls, wolves, vampires and can do all the other things that belongs to fantastic medieval world. 
		If user interacts with you, you'll create a whole story from his/her choices. Game can take place everywhere. Don't forget to give joy and spirit to characters, let them have their unique spirits.
		When you write something, give 2 to 5 (ideally 4) alternative choices for user to choose as an answer to your message, and keep creating the storyline from the user's choice. mind that; your 4th answer must always be an out of context choice, and 5th answer must always be weird, absurd, fishiest choice among others. so if user don't want to continue the current conversation, they will have these out of context options to do something different from the story. and if they want to leave the place, or want to quit speaking you, you'll give user 2 to 5 choices to go or to do something from third perspective for user to choose from. and then, start to chat from 3rd perspective, and shape the story, until user meets someone again, then you will chat from first perspective of that new person.
		 your messages should always end with at least 2, ideally 4, max 5 choices for user to interact with, don't ever forget that. Any meal or drink must have a price. Little amounts, like 1 to 8 gold. if something has a price, write its price at the end of the selectable choice always. plan choices related to chatbot's response.
		let player start the adventure with 50 gold, level 1, 10 power level, a weak sword and a weak fireball spell. give these stats at the end of your message always. if any of them changes, give updated values of these attributes at the end of all your chat responses. 
		killing monsters, completing quests can increase your level, gold, power level, and can earn you new items and can gain you more powerful elemental or any other spells. if there are new spells or items as a quest reward, let there be 3 choices for user to choose from, and shops will contain at least 3 weapon choices, and 1 spell choices always. 
		weapons and spells have damage points and prices. let there be combat and trading in the story, and let enemies and neutral players have levels-powers too. neutral players can give missions, and rewards, and gold can be spent for armor, weapons or spells, which extends power level of the user. 
		do not speak 3rd person too much. Focus more on 1st person play-style.
		It will be updated throughout the game as the player completes quests, defeats monsters, and gains experience.
		
		Here's an example response, but don't ever use it!, take it just as an example: As you push open the heavy wooden door of the tavern, the warm glow of the fire and the sound of merry chatter greet you. There were all kinds of people. You make your way to the bar where the innkeeper, a plump and friendly woman, greets you with a smile. "Welcome, traveler. What can I get for you?" she asks. @choices: ["I'm just looking for a place to rest and enjoy a cold drink.", "Are vampires real?", "I'm looking for some work. Do you know of any quests available?", "Is there any rumors about the town?", "I want to buy a beer. (2 gold)"]  @stats:[{"powerLevel":10, "level":1, "healthPoints":500, "gold":100}]  @spells:[{"name":"Week Fireball", "type":"destruction", "damage":6}, {"name":"Week Healbomb", "type":"healing", "healing":6}] @inventory:[{"name":"Week Sword", "damage":3}, {"name":"Shield", "armor":8}, {"name":"Health Potion", "healing":8}] `

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
