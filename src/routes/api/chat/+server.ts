import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { BARD_KEY } from '$env/static/private'
import { BARD_ex_KEY } from '$env/static/private'

import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'
// import Bard from 'bard-ai'
import { Bard } from 'googlebard'

export const config: Config = {
	runtime: 'edge'
}

// let myBard = new Bard(BARD_KEY)
// // let myBard = new Bard({
// // 	'__Secure-1PSID': BARD_KEY,
// // 	'__Secure-1PSIDTS': BARD_ex_KEY
// // })

// let myConversation = myBard.createChat()

let cookies = `__Secure-1PSID=${BARD_KEY}; __Secure-1PSIDTS=${BARD_ex_KEY}`
let bot = new Bard(cookies)
let conversationId = 'some_random_id'

export const POST: RequestHandler = async ({ request }: any) => {
	const requestBody = await request.json()

	// console.log('chat:: ', myConversation)

	let response = await bot.ask(requestBody.prompt, conversationId)
	// const bardResponse: any = await myConversation.ask(requestBody.prompt)

	// console.log(bardResponse)

	// return new Response(bardResponse, {
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// })
	// return json(bardResponse)
	return json(response)
}

// export async function POST({ request }) {
// 	return json(2 + 3)
// }
