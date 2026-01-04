// Simple types for now to avoid dependency issues
type GameData = any
type InventoryItem = any
type ShopMode = string

export class GameService {
	private static readonly GAME_PROMPT = `You are an RPG game master. Respond ONLY with valid JSON.

CRITICAL RULES:
- At game start: shopMode=null, inCombat=false, lootMode=false
- Taverns are NOT shops. shopMode stays null in taverns
- Only set shopMode when player explicitly enters a shop or talks to a merchant about buying/selling
- shopMode values: null, "Weaponsmith", "Spell Shop", "Armorsmith", "Potion Shop", "Merchant", "Market"

JSON FORMAT (always use this exact structure):
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "3rd person narrative. Use 1st person only for NPC dialogue.",
    "event": { "inCombat": false, "shopMode": null, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

COMBAT RULES:
- Set inCombat=true when battle starts, announce "You are now in battle!"
- enemy format: { "enemyName": "Name", "enemyHp": 100 } (single enemy only)
- Keep inCombat=true until player says fight is over

WORLD BUILDING:
- Inspired by: World of Warcraft, Elder Scrolls, Guild Wars
- Enemies: bandit, goblin, wolf, ogre, ghoul, demon, undead, harpy, gnoll
- Allies: humans, elves, dwarves, orcs, halflings
- Weapon types: sword, dagger, bow, axe, mace, spear
- Spell elements: fire, ice, lightning, dark, light, toxic (all spells cost mana)

Always provide 3+ unique choices.`

	static getGamePrompt(): string {
		return this.GAME_PROMPT
	}

	static async sendGameRequest(prompt: string): Promise<GameData> {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt })
		})

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
		}

		const responseData = await response.json()
		console.log('API Response:', responseData)

		return this.parseGameResponse(responseData)
	}

	private static parseGameResponse(responseData: any): GameData {
		try {
			return JSON.parse(responseData.candidates[0].content.parts[0].text)
		} catch (error) {
			console.log('Initial parse failed, trying to clean JSON:', error)
			const jsonString = responseData.candidates[0].content.parts[0].text
				.replace(/```json/g, '')
				.replace(/```/g, '')
				.trim()
			return JSON.parse(jsonString)
		}
	}

	static shuffleItems<T>(items: T[], count: number = 4): T[] {
		const shuffled = [...items]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled.slice(0, count)
	}

	static getShopItems(
		category: ShopMode,
		weapons: InventoryItem[],
		spells: InventoryItem[],
		potions: InventoryItem[]
	): InventoryItem[] {
		switch (category) {
			case 'Weaponsmith':
			case 'Armorsmith':
				return weapons
			case 'Spell Shop':
				return spells
			case 'Potion Shop':
			case 'Market':
			case 'Merchant':
				return potions
			default:
				return potions
		}
	}

	static validateUserInput(input: string): { isValid: boolean; error?: string } {
		if (!input || input.trim().length === 0) {
			return { isValid: false, error: 'Input cannot be empty' }
		}

		const forbiddenWords = ['sex', 'kill']
		const lowerInput = input.toLowerCase()

		for (const word of forbiddenWords) {
			if (lowerInput.includes(word) && !lowerInput.includes('skill')) {
				return { isValid: false, error: "There's a flawed word in your answer." }
			}
		}

		return { isValid: true }
	}

	static calculateCombatScore(damage: number, type: string, diceNumber: number = 1): number {
		if (type === 'weapon') {
			const dice = Math.max(1, diceNumber)
			return Math.floor(damage / dice)
		}
		return damage
	}
}
