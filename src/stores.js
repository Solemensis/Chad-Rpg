import { writable } from 'svelte/store';


export const game = writable({
    lootBox: [],
    placeAndTime:[],
    shop:[],
    choices: [],
    enemy: [],
    event: [{ inCombat: false, shopMode: null }],
});


export const character = writable({
    stats: [{ hp: 110, maxHp: 110, mp: 90, maxMp: 90 }],
    gold: 31,
    spells:[
		{
			name: 'Fireball',
			damage: 4,
			price: 15,
			manaCost: 12,
			type: 'destruction spell',
			element: 'fire',
			cooldown: 2
		},
		{
			name: 'Light Heal',
			healing: 2,
			price: 10,
			manaCost: 12,
			type: 'healing spell',
			element: 'light',
			cooldown: 2
		}
    ],
    inventory:[
		{
			name: 'Wooden Sword',
			damage: 3,
			price: 10,
			type: 'weapon',
			weaponClass: 'sword'
		}
	]
});
    
export const ui = writable({ errorWarnMsg: "", buyWarnMsg: "", sellWarnMsg: "", })


//hem combat, hem sell, hem de (emin olduktan sonra) buy için kullanılabilir galiba
export const selectedItem = writable({})


export const misc = writable({
	loading: false, showDescription:"none", x:0, y:0
})

export const descWindow = writable({
name: undefined,
damage: undefined,
type: undefined,
healing: undefined,
armor: undefined,
element: undefined,
weaponClass: undefined,
manaCost: undefined,
price: undefined,
amount: undefined
})