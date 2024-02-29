// import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'

import type { RequestHandler } from './$types'
// import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

// import Bard from 'bard-ai'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
// import { PALM_KEY } from '$env/static/private'
// import { BARD_KEY } from '$env/static/private'
// import { DiscussServiceClient } from '@google-ai/generativelanguage'
// import { GoogleAuth } from 'google-auth-library'
import { GoogleGenerativeAI } from '@google/generative-ai'

// let myBard = new Bard(BARD_KEY)
// let myChat = myBard.createChat({})

// const MODEL_NAME = 'models/chat-bison-001'
// const API_KEY = PALM_KEY

// const client = new DiscussServiceClient({
// 	authClient: new GoogleAuth().fromAPIKey(API_KEY)
// })

// export const config: Config = {
// 	runtime: 'edge'
// }

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)

// For text-only input, use the gemini-pro model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

const chat = model.startChat({
	history: [
		// {
		// 	role: 'user',
		// 	parts: 'Hello, I have 2 dogs in my house.'
		// },
		// {
		// 	role: 'model',
		// 	parts: 'Great to meet you. What would you like to know?'
		// }
	],
	generationConfig: {
		maxOutputTokens: 2048
	}
})

export const POST: RequestHandler = async ({ request }: any) => {
	const requestBody = await request.json()

	//////////////////////////////

	const prompt = requestBody.prompt

	const result = await chat.sendMessage(prompt)
	// const result = await model.generateContent(prompt)

	const response = await result.response
	return json(response)
	//////////////////////////////
}
