/**
 * Game Configuration Constants
 * 
 * This file contains all magic numbers and strings used throughout the game.
 * Centralizing these values makes the game easier to balance and maintain.
 */

// Combat tier thresholds for damage calculation
export const COMBAT_TIERS = {
	POOR: { min: 1, max: 20 },
	DECENT: { min: 20, max: 50 },
	GREAT: { min: 50, max: 85 },
	EPIC: { min: 85, max: Infinity }
} as const;

// Shop type names (normalized)
export const SHOP_TYPES = {
	WEAPONSMITH: 'Weaponsmith',
	ARMORSMITH: 'Armorsmith',
	SPELL_SHOP: 'Spell Shop',
	POTION_SHOP: 'Potion Shop',
	MERCHANT: 'Merchant',
	MARKET: 'Market',
	SHOP: 'Shop'
} as const;

// Dice configuration for combat
export const DICE_SIDES = {
	WEAPON: 20,
	SPELL: 23
} as const;

// Character class starting stats
export const CHARACTER_CLASSES = {
	MAGE: {
		name: 'mage',
		stats: {
			hp: 80,
			maxHp: 80,
			mp: 110,
			maxMp: 110
		}
	},
	WARRIOR: {
		name: 'warrior',
		stats: {
			hp: 110,
			maxHp: 110,
			mp: 80,
			maxMp: 80
		}
	}
} as const;

// Starting game values
export const STARTING_VALUES = {
	GOLD: 30,
	INTERACTIVE_POINTS: 50
} as const;

// Shop item display count
export const SHOP_CONFIG = {
	ITEMS_PER_SHOP: 4
} as const;

// Combat prompts for different tiers
export const COMBAT_PROMPTS = {
	DEATH: 'give a sad gameData.story, because player dies in the last combat event.',
	
	VICTORY: (weaponName: string) => 
		`Attack with ${weaponName}! (this blow destroys the enemy and ends the combat successfully!)`,
	
	POOR: (weaponName: string) => 
		`Attack with ${weaponName}! (give hard times to player in gameData.story, where player lands the worst possible attack, which leads to player receiving damage but giving a little damage back at least. Combat goes on.)`,
	
	DECENT: (weaponName: string) => 
		`Attack with ${weaponName}! (give a mediocre gameData.story, where player lands a decent attack, which leads to player giving some damage to enemy but taking some damage back. Combat goes on.)`,
	
	GREAT: (weaponName: string) => 
		`Attack with ${weaponName}! (give a great gameData.story where player lands a powerful attack, giving great damage but receiving some little damage back. Combat goes on.)`,
	
	EPIC: (weaponName: string) => 
		`Attack with ${weaponName}! (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy and winning the combat.)`
} as const;
