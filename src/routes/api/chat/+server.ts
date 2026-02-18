import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

if (!GOOGLE_AI_API_KEY) {
	throw new Error('GOOGLE_AI_API_KEY environment variable is required')
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

// System instruction to enforce JSON output format for the RPG game
const systemInstruction = `You are an RPG game master. You MUST ALWAYS respond with ONLY a valid JSON object, no markdown, no code blocks, no explanations outside the JSON.

Your response must be a JSON object with this EXACT structure:
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "The narrative text describing what happens...",
    "event": { "inCombat": false, "shopMode": null, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

Rules:
- Always include at least 3 choices
- story should be immersive 3rd person narrative
- When in combat, set inCombat to true and populate enemy with {name, enemyHp, enemyMaxHp}
- When in shop, set shopMode to shop type like "Weaponsmith" or "PotionShop"
- NEVER include markdown code blocks or any text outside the JSON`

// Store chat history for conversation context
const chatHistory: { role: string; parts: { text: string }[] }[] = []

export const POST: RequestHandler = async ({ request }) => {
	try {
		const requestBody = await request.json()

		if (!requestBody.prompt) {
			return json({ error: 'Prompt is required' }, { status: 400 })
		}

		// Add user message to history
		chatHistory.push({
			role: 'user',
			parts: [{ text: requestBody.prompt }]
		})

		const response = await ai.models.generateContent({
			model: 'gemini-3-flash-preview',
			contents: chatHistory,
			config: {
				systemInstruction: systemInstruction,
				responseMimeType: 'application/json'
			}
		})

		const responseText = response.text || ''

		// Add assistant response to history
		chatHistory.push({
			role: 'model',
			parts: [{ text: responseText }]
		})

		console.log('Gemini API response received')

		// Return in format expected by frontend
		return json({
			candidates: [
				{
					content: {
						parts: [{ text: responseText }]
					}
				}
			]
		})
	} catch (error: unknown) {
		console.error('Error in chat API:', error)

		// Check if it's an API error with a status code
		if (error && typeof error === 'object' && 'status' in error) {
			const status = (error as { status: number }).status
			if (status === 429) {
				return json(
					{
						error: 'quota_exceeded',
						message: 'API quota exceeded. Please try again later.'
					},
					{ status: 429 }
				)
			}
			if (status === 503) {
				return json(
					{
						error: 'high_demand',
						message: 'The AI model is currently experiencing high demand. Please try again in a few moments.'
					},
					{ status: 503 }
				)
			}
		}

		return json({ error: 'Failed to process request' }, { status: 500 })
	}
}
