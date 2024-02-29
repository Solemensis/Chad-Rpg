import { writable } from 'svelte/store'

export const game: any = writable({
	gameData: {
		lootBox: [],
		placeAndTime: {},
		shop: [],
		choices: [],
		enemy: {},
		event: { inCombat: false, shopMode: null, lootMode: false }
	}
})

export const character: any = writable({
	stats: [{ hp: 0, maxHp: 0, mp: 0, maxMp: 0 }],
	gold: 0,
	spells: [],
	inventory: []
})

export const ui: any = writable({ errorWarnMsg: '', buyWarnMsg: '', sellWarnMsg: '' })

//hem combat, hem sell, hem de (emin olduktan sonra) buy için kullanılabilir galiba
export const selectedItem: any = writable({})

export const coolDowns: any = writable({})

export const misc: any = writable({
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
	interactivePoints: 10,
	bugWindow: false,
	maintenanceWindow: true,
	started: false,
	heroClass: ''
})

export const bgImage: any = writable({
	fetchedBg1: '',
	fetchedBg2: '',
	img1active: false,
	img2active: false
})

export const descWindow: any = writable({
	name: undefined,
	damage: undefined,
	type: undefined,
	healing: undefined,
	mana: undefined,
	armor: undefined,
	element: undefined,
	weaponClass: undefined,
	manaCost: undefined,
	price: undefined,
	amount: undefined,
	point: undefined
})
