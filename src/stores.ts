import { writable, type Writable } from 'svelte/store'
import type {
	GameData,
	Character,
	UIState,
	MiscState,
	BackgroundImage,
	DescriptionWindow,
	CoolDowns,
	InventoryItem
} from '$lib/types/game'
import { STARTING_VALUES } from '$lib/config/constants'

// Game state store
export const game: Writable<{ gameData: GameData }> = writable({
	gameData: {
		lootBox: [],
		placeAndTime: { place: '', time: '00:00' },
		shop: [],
		choices: [],
		enemy: {},
		event: { inCombat: false, shopMode: null, lootMode: false },
		story: ''
	}
})

// Character state store
export const character: Writable<Character> = writable({
	stats: [{ hp: 0, maxHp: 0, mp: 0, maxMp: 0 }],
	gold: 0,
	spells: [],
	inventory: []
})

// UI state store
export const ui: Writable<UIState> = writable({
	errorWarnMsg: '',
	buyWarnMsg: '',
	sellWarnMsg: ''
})

// Selected item store for combat, selling, and buying
export const selectedItem: Writable<
	Partial<
		InventoryItem & {
			combatScore?: number
			prompt?: string
			showDescription?: string
		}
	>
> = writable({})

// Cooldowns store
export const coolDowns: Writable<CoolDowns> = writable({})

// Miscellaneous state store
export const misc: Writable<MiscState> = writable({
	showInfoWindow: false,
	loading: false,
	showDescription: 'none',
	x: 0,
	y: 0,
	diceNumber: 0,
	query: '',
	time: '00:00',
	place: '',
	currentImg: '',
	death: false,
	interactivePoints: STARTING_VALUES.INTERACTIVE_POINTS,
	bugWindow: false,
	maintenanceWindow: false,
	started: false,
	heroClass: ''
})

// Background image store
export const bgImage: Writable<BackgroundImage> = writable({
	fetchedBg1: '',
	fetchedBg2: '',
	img1active: false,
	img2active: false
})

// Description window store
export const descWindow: Writable<DescriptionWindow> = writable({
	name: '',
	damage: 0,
	type: '',
	healing: 0,
	mana: 0,
	point: 0,
	armor: 0,
	element: '',
	weaponClass: '',
	manaCost: 0,
	price: 0,
	amount: 0
})
