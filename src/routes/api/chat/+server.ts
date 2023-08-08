import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'
import Bard, { askAI } from 'bard-ai'

export const config: Config = {
	runtime: 'edge'
}

await Bard.init('Ygh0vqYnyVoN_WgC70cvnA8Ru0_qXE7Ow6KIm4BgB5c2Upnjqg65YFYrJhxiQeojHXMRCw.')

let myConversation = new Bard.Chat()

export const POST: RequestHandler = async ({ request }: any) => {
	const requestBody = await request.json()

	// console.log('chat:: ', myConversation)

	const bardResponse: any = await myConversation.ask(requestBody.prompt)

	// console.log(bardResponse)

	// return new Response(bardResponse, {
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// })
	return json(bardResponse)
}

// export async function POST({ request }) {
// 	return json(2 + 3)
// }
