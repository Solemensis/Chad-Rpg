import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'

import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

import Bard from 'bard-ai'
import { PALM_KEY } from '$env/static/private'
import { DiscussServiceClient } from '@google-ai/generativelanguage'
import { GoogleAuth } from 'google-auth-library'

let myBard = new Bard('aAhZ-lCVXP5uk3dgberUblvnuM3wBwxPkwXkWE36puI0quS31rD3A_qOwCswExkiQeL4VA.')
let myChat = myBard.createChat({})

const MODEL_NAME = 'models/chat-bison-001'
const API_KEY = PALM_KEY

const client = new DiscussServiceClient({
	authClient: new GoogleAuth().fromAPIKey(API_KEY)
})

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }: any) => {
	const requestBody = await request.json()

	// const result = await client.generateMessage({
	// 	model: MODEL_NAME, // Required. The model to use to generate the result.
	// 	temperature: 0.5, // Optional. Value `0.0` always useas the highest-probability result.
	// 	candidateCount: 1, // Optional. The number of candidate results to generate.
	// 	prompt: {
	// 		// optional, preamble context to prime responses
	// 		context: requestBody.prompt,
	// 		// Optional. Examples for further fine-tuning of responses.
	// 		examples: [
	// 			{
	// 				input: {
	// 					content: 'Start as a new adventurer in a fantasy role-playing world, entering a tavern.'
	// 				},
	// 				output: {
	// 					content: `{
	// 						"gameData": {
	// 						"placeAndTime": {
	// 						"place": "Tavern",
	// 						"time": "20:00"
	// 						},
	// 						"story": "As you push open the heavy wooden door, the warm and inviting atmosphere of the tavern surrounds you. The flickering light of lanterns casts dancing shadows on the walls, and the murmur of conversation fills the air. A crackling fireplace crackles in one corner, bathing the room in a cozy glow.",
	// 						"event": {
	// 						"inCombat": false,
	// 						"shopMode": null,
	// 						"lootMode": false
	// 						},
	// 						"choices": [
	// 						"Approach the bar and order a drink.",
	// 						"Look around for interesting characters to talk to.",
	// 						"Find a vacant table and take a seat."
	// 						],
	// 						"enemy": {},
	// 						"lootBox": []
	// 						}
	// 						}`
	// 				}
	// 			},
	// 			{
	// 				input: {
	// 					content: 'Go the the town center of that strange town.'
	// 				},
	// 				output: {
	// 					content: `{
	// 						"gameData": {
	// 						"placeAndTime": {
	// 						"place": "Town Center",
	// 						"time": "12:00"
	// 						},
	// 						"story": "As you step into the town center, you're greeted by a bustling atmosphere. People of various races and backgrounds mill about, going about their daily business. The air is filled with a mix of different languages and the enticing aroma of food from nearby stalls. The sun shines brightly overhead, casting a warm and inviting glow over the area.",
	// 						"event": {
	// 						"inCombat": false,
	// 						"shopMode": null,
	// 						"lootMode": false
	// 						},
	// 						"choices": [
	// 						"Approach a food stall to grab a quick meal.",
	// 						"Visit the local blacksmith's shop.",
	// 						"Engage in conversation with a passerby."
	// 						],
	// 						"enemy": {},
	// 						"lootBox": []
	// 						}
	// 						}`
	// 				}
	// 			},
	// 			{
	// 				input: {
	// 					content: 'Go to the tavern.'
	// 				},
	// 				output: {
	// 					content: `{
	// 						"gameData": {
	// 						"placeAndTime": {
	// 						"place": "Tavern",
	// 						"time": "20:00"
	// 						},
	// 						"story": "As you settle into the cozy ambiance of the tavern, you notice a burly dwarf sitting at the bar, nursing a tankard of ale. The warm light of the hearth casts a flickering glow across the room. Curiosity piqued, you approach the dwarf and strike up a conversation.",
	// 						"event": {
	// 						"inCombat": false,
	// 						"shopMode": null,
	// 						"lootMode": false
	// 						},
	// 						"choices": [
	// 						"Ask about weapon shops",
	// 						"Order a drink",
	// 						"Leave the tavern"
	// 						],
	// 						"enemy": {},
	// 						"lootBox": []
	// 						}
	// 						}`
	// 				}
	// 			},
	// 			{
	// 				input: {
	// 					content: 'Embark on a journey through the dense forest path.'
	// 				},
	// 				output: {
	// 					content: `{
	// 						"gameData": {
	// 							"placeAndTime": {
	// 								"place": "Forest Path",
	// 								"time": "09:00"
	// 							},
	// 							"story": "As you step onto the forest path, the tall trees create a canopy above, casting dappled sunlight on the ground. The air is filled with the earthy scent of moss and the distant chirping of birds. The path ahead winds deeper into the woods, shrouding the surroundings in a sense of mystery and adventure.",
	// 							"event": {
	// 								"inCombat": false,
	// 								"shopMode": null,
	// 								"lootMode": false
	// 							},
	// 							"choices": [
	// 								"Follow the path deeper into the forest.",
	// 								"Inspect a peculiar-looking rock by the path.",
	// 								"Turn back and return to town."
	// 							],
	// 							"enemy": {},
	// 							"lootBox": []
	// 						}
	// 					}`
	// 				}
	// 			},
	// 			{
	// 				input: {
	// 					content: 'Enter the dark, foreboding cave that you stumbled upon.'
	// 				},
	// 				output: {
	// 					content: `{
	// 						"gameData": {
	// 							"placeAndTime": {
	// 								"place": "Mysterious Cave",
	// 								"time": "15:30"
	// 							},
	// 							"story": "As you cautiously step into the cave, the sunlight from outside fades, giving way to an eerie darkness. The walls are damp and slick, and the sound of dripping water echoes in the distance. Strange formations of rocks jut out from the walls, casting bizarre shadows. The air is heavy with a musty odor, and a feeling of both trepidation and curiosity fills your heart.",
	// 							"event": {
	// 								"inCombat": false,
	// 								"shopMode": null,
	// 								"lootMode": false
	// 							},
	// 							"choices": [
	// 								"Press further into the cave's depths.",
	// 								"Examine the walls for any signs of life.",
	// 								"Retreat and leave the cave behind."
	// 							],
	// 							"enemy": {},
	// 							"lootBox": []
	// 						}
	// 					}`
	// 				}
	// 			},
	// 			{
	// 				input: {
	// 					content: "Enter the grand enchanted library that you've heard tales about."
	// 				},
	// 				output: {
	// 					content: `{
	//         "gameData": {
	//             "placeAndTime": {
	//                 "place": "Enchanted Library",
	//                 "time": "14:00"
	//             },
	//             "story": "As you step into the vast, towering library, you're immediately surrounded by shelves upon shelves of ancient tomes and magical artifacts. Soft, ethereal light bathes the room, and the air seems charged with knowledge and mystique. A wise-looking librarian sits at a desk, engrossed in a book of their own.",
	//             "event": {
	//                 "inCombat": false,
	//                 "shopMode": null,
	//                 "lootMode": false
	//             },
	//             "choices": [
	//                 "Approach the librarian for assistance.",
	//                 "Browse the shelves for a specific book.",
	//                 "Sit down and read a random tome."
	//             ],
	//             "enemy": {},
	//             "lootBox": []
	//         }
	//     }`
	// 				}
	// 			}
	// 		],
	// 		// Required. Alternating prompt/response messages.
	// 		messages: [
	// 			{
	// 				content: 'Player enters to a Tavern in a fantasy role-playing world.'
	// 			}
	// 		]
	// 	}
	// })
	// return json(result[0]?.candidates[0]?.content)

	const result = await myChat.ask(requestBody.prompt)

	return json(result)
}

// export async function POST({ request }) {
// 	return json(2 + 3)
// }
