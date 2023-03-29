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
    


