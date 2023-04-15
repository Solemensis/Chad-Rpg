import { writable } from 'svelte/store'

export const game = writable({
	lootBox: [],
	placeAndTime: [],
	shop: [],
	choices: [],
	enemy: [],
	event: [{ inCombat: false, shopMode: null }],
	started: false
})

export const character = writable({
	stats: [{ hp: 0, maxHp: 0, mp: 0, maxMp: 0 }],
	gold: 0,
	spells: [],
	inventory: []
})

export const ui = writable({ errorWarnMsg: '', buyWarnMsg: '', sellWarnMsg: '' })

//hem combat, hem sell, hem de (emin olduktan sonra) buy için kullanılabilir galiba
export const selectedItem = writable({})

export const coolDowns = writable({})

export const misc = writable({
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
	death: false
})

export const bgImage = writable({
	fetchedBg1: '',
	fetchedBg2: '',
	img1active: false,
	img2active: false
})

export const descWindow = writable({
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
	amount: undefined
})
