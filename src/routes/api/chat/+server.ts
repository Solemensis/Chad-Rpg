import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import { BARD_KEY } from '$env/static/private'
import { BARD_ex_KEY } from '$env/static/private'

import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'
// import { Bard } from 'googlebard'
import Bard from 'bard-ai'

export const config: Config = {
	runtime: 'edge'
}

// let cookies = `__Secure-1PSID=${BARD_KEY}; __Secure-1PSIDTS=${BARD_ex_KEY}`
// let bot = new Bard(cookies)
// let conversationId = 'some_random_id'
////////////////////////////////////////////////////////
// await Bard.init(BARD_KEY)
// let myConversation = new Bard.Chat()
let bot = new Bard({
	'__Secure-1PSID': BARD_KEY,
	'__Secure-1PSIDTS': BARD_ex_KEY
})

export const POST: RequestHandler = async ({ request }: any) => {
	const requestBody = await request.json()

	// let response = await bot.ask(requestBody.prompt, conversationId)
	const response: any = await bot.ask(requestBody.prompt)

	return json(response)
}

// export async function POST({ request }) {
// 	return json(2 + 3)
// }
