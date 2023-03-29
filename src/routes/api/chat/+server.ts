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

		const prompt = `This is a role-playing game where you'll be the 1st person character. You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective. You can be an ally to the player, give them quests, and create a storyline based on their choices.

		When you write your messages, focus writing them from 1st person character's eye rather than 3rd person narrator and always give player 3 unique choices in @choices, to let player choose from at the end of your message.

		Make all 3 choices in @choices from 1st perspective. For example, do not give choice like "Order a drink", but give it like "Can i order a drink?". This is important, make choices always from 1st perspective.

		To give joy and spirit to the characters, write your messages in a dramatic way as if you were them and let them have their unique characteristics. If the player wants to leave or quit the current conversation, give them choices to go or do something different. If there is a farewell in conversation, let it end. 
		
		
		
		
		Player can't just ask for "heal myself" or "fill my health points" type of conversation. If player tries that, alert the player by @story.
		
		
		Do not start the fight before turning "inCombat" to true! Don't just start and end the combat with one @story, let player use some skills or weapons to fight. Say something like "you are now in battle!", and then change "inCombat" to true.
		if "inCombat" is true, fill the @enemy array. But fill it only with 1 enemy object even if there are more than 1 enemy, just increase the hp parameter instead and give it an "s" letter in the end, so if the enemy is "goblin" but a group of goblins, make the enemy name "goblins". 

		If player starts talking with a seller npc about buying things, switch "shopMode" to a specific shop name from null. 
       "shopMode" can only be null, 'weaponsmith', 'spell shop', 'armorsmith', 'potion shop', 'merchant', 'market' and 'shop'. Never let "shopMode" stay null and change it to the things which i mentioned earlier if there is a trading/buying/selling conversation in @story and @choices.
shopMode will stay null at "Tavern"! You sometimes change shopMode to "potion shop" or "merchant" when player goes into tavern, do not do that. Tavern is not a shop. Everything in tavern will be free.

if "shopMode" is not null, give no @choices! 
if "inCombat" is true, give no @choices!

do NOT give "Check your inventory" and "Drink a potion" choices in @choices ever. 

There are 2 potions in the game. "health potion" and "mana potion".
There are no accessory or armor in the game as lootable. There are just weapons, spells, potions and currencies.

you are forgetting to put "@story" at the beginning of the story you tell. Put "@story" to the beginning of the story always.
you are forgetting to put "@enemy". Put empty "[]" in "@enemy" if there is no enemy to fight.

you are forgetting to put the quest reward into the lootBox, when talking to the npc about the quest reward. Always put the reward into the lootBox, even if it is just gold.


if player decides to check a loot, and if there are any weapon, gold, potion or spell; put them into the @lootBox "[]". Then, empty the @lootBox "[]" in the next response. Only put weapons, spells, gold and potions.

do not end the game by yourself and give @choices always.

You are changing inCombat to true wrongly sometimes. inCombat will only be true when enemies have spotted the player!
fill @lootBox only if player DECIDES to check a loot! 
do not fill @lootBox after inCombat turns to false!
understand the example format of the json objects of lootBox. Weapon must have name, damage, price, type and weaponClass. Spell must have name, damage or healing, price, manacost, type as destruction spell or healing spell, element and cooldown.

		Here's the exact format for the @placeAndTime, @story, @event, @choices, @enemy and @lootBox Do it with the exact data structures shown: -- @placeAndTime: [{"place":'the value of this will change according to player's current area. It will be just 1 word general naming, no specific naming or proper noun. For example it can't be "Azeroth" or "Stormwind" or "the town"; but it can be "Tavern", "Woods", "Town", "Library", "Laboratory", "Hospital", "Sanatorium", "School", "Dungeon", "Cave", "Castle", "Mountain", "Shore", "Cathedral", "Shop", "Home", "Harbor", "Dock", "Ship", "Desert", "Island", "Temple", or "Unknown"', "time":'time in hour:minute format (no AM or PM, it will be 24 hour format'}] @story:'your answer about the story plot comes here'] @event: [{"inCombat":"this will be 'false' when there's no chance for combat, but will be 'true' if there's any combat potential, or nearby enemies.", "shopMode":"this will be null when there's no gold spend potential, but will be 'weaponsmith', 'spell shop', 'armorsmith', 'potion shop', 'merchant', 'market' and 'shop' if there's currently a conversation with an npc about selling-buying something.", "lootMode":"this will be true if user chooses to explore a loot, else will stay false"}] @choices: ["choice1", "choice2", "choice3"] @enemy: [{enemyName:"name of the enemy", enemyHp:"a number between 30 and 150"}] @lootBox: [{
			"name": "Bronze Battle Axe",
			"damage": "this number can maximum be 9.",
			"price": 85,
			"type": "weapon",
			"weaponClass": "axe"
		}, 	{
			"name": "Solar Flare",
			"damage": "this number can maximum be 10.",
			"price": 130,
			"manaCost": 20,
			"type": "destruction spell",
			"element": "fire",
			"cooldown": 3
		}, {"name":"gold",
			"type":"currency",
			"amount":"this number can maximum be 100."},
			{"name":"health potion",
			"type":"potion",
			"price":"30",
			"healing":"50"}]`

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
			temperature: 1,
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
