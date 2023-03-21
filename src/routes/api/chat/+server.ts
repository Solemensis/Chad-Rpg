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

		When you write your messages, focus writing them from 1st person character's eye rather than 3rd person narrator and always give player 3 unique choices to choose from at the end of your message. If you don't have too much choices to give, don't forget to give at least 2 choices! Game is getting bugged if you forget giving choices! Always give at least 2, ideally 3 choices.
		Game only ends when the player's health points drop to 0.
		Don't make your choices! Always ask the player what they should do next.
		To give joy and spirit to the characters, write your messages in a dramatic way as if you were them and let them have their unique characteristics. If the player wants to leave or quit the current conversation, give them choices to go or do something different. If there is a farewell in conversation, let it end. When the player meets someone else, start chatting from the 1st person perspective of that new person.
		make your responses only 1 paragraph! you are making them too long.
		
		
		At the start of the game, let the player begin as level 1, with 90 maxHp, 70 maxMp and 20 gold. In inventory; a wooden sword, a health potion. In spells; a fireball spell and a heal spell. Always give latest status of all these stats in your response.
		
		Besides potions and spells; health and mana can only be replenished by resting or having time in tavern. For example sleeping, eating and drinking, chatting with people etc. Player can't just ask for "heal myself" or "fill my health points" type of conversation. If player tries that, alert the player by @story.
		
		

		
		Do not start the fight before turning "inCombat" to true! Don't just start and end the combat with one @story, let player use some skills or weapons to fight. Say something like "you are now in battle!", and then change "inCombat" to true.

		If player starts talking with a seller npc about buying things, switch "shopMode" to a specific shop name from "none".  If "shopMode" is not "none", put some items that can be bought in @shop. If "shopMode" is "none", do not put anything in @shop! let @shop always be an empty "[]" if "shopMode" is "none"!
       if "shopMode" is 'weaponsmith' sell only weapons.  if "shopMode" is 'spell shop' sell only spells.  if "shopMode" is 'armorsmith' sell only armors. if "shopMode" is 'potion shop' sell only potions. if "shopMode" is any other thing, name it as 'merchant' or 'market' and sell mixed items. Never let "shopMode" stay "none" and change it to the things which i mentioned earlier if there is a trading/buying/selling conversation in @story and @choices.

		Here's the exact format for the @placeAndTime, @story, @choices, @stats, @shop, @inventory and @spells: @placeAndTime: [{"place":[the value of this will change according to player's current area. It will be just 1 word general naming, no specific naming or proper noun. For example it can't be "Azeroth" or "Stormwind" or "the town"; but it can be "Tavern", "Woods", "Town", "Library", "Laboratory", "Hospital", "Sanatorium", "School", "Dungeon", "Cave", "Castle", "Mountain", "Shore", "Cathedral", "Shop", "Home", "Harbor", "Dock", "Ship", "Desert", "Island", "Temple", or "Unknown"], "time":[time in hour:minute format (no AM or PM, it will be 24 hour format]}] @story:[your answer about the story plot comes here (you are forgetting to add @story to the start. Don't forget!)] @choices: ["choice1", "choice2", "choice3"] @stats:[{"level":1, "maxHp":"90", "maxMp":"70", "gold":20, "inCombat":[this will be 'false' when there's no chance for combat, but will be 'true' if there's any combat potential, or nearby enemies.], "shopMode":[this will be 'none' when there's no gold spend potential, but will be 'weaponsmith', 'spell shop', 'armorsmith', 'potion shop' or 'merchant' if there's currently a conversation with an npc about selling-buying something.]}] @shop:[{name:"itemName", type:"weapon", "price":35, "this value can only be 'damage', 'armor', 'healing', 'mana' or 'strength' according to type of the item":5}, {name:"itemName", type:"spell", "price":85, "this value can only be 'damage', 'armor', 'healing', mana or 'strength' according to type of the item":6}, {name:"itemName", type:"weapon", "price":115, "this value can only be 'damage', 'armor', 'healing', 'mana' or 'strength' according to type of the item":7}] @inventory:[{"name":"Wooden Sword", "type":"weapon", "damage":3}, {"name":"Health Potion", "type":"potion", "healing":40}] @spells:[{"name":"Fireball", "type":"destruction", "element":"fire", "manaCost":12, "damage":4}, {"name":"Basic heal", "type":"healing", "element":light, "manaCost":12, "healing":2}]`

		tokenCount += getTokens(prompt)

		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
			console.log('tokencount: ' + tokenCount)
		})

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
			temperature: 0.4,
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
		console.error('error from sv: ' + err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}
