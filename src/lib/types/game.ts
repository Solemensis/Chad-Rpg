export interface GameData {
	placeAndTime: PlaceAndTime;
	story: string;
	event: GameEvent;
	choices: string[];
	enemy: Enemy;
	lootBox: LootItem[];
	shop: ShopItem[];
	heroClass?: string;
}

export interface PlaceAndTime {
	place: string;
	time: string;
}

export interface GameEvent {
	inCombat: boolean;
	shopMode: ShopMode | null;
	lootMode: boolean;
}

export type ShopMode = 'Weaponsmith' | 'Spell Shop' | 'Armorsmith' | 'Potion Shop' | 'Merchant' | 'Market' | 'Shop';

export interface Enemy {
	enemyName?: string;
	enemyHp?: number;
	enemyMaxHp?: number;
}

export interface Character {
	stats: CharacterStats[];
	gold: number;
	spells: Spell[];
	inventory: InventoryItem[];
}

export interface CharacterStats {
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
}

export interface BaseItem {
	name: string;
	type: string;
	price?: number;
	amount?: number;
}

export interface Weapon extends BaseItem {
	type: 'weapon';
	damage: number;
	weaponClass: string;
}

export interface Spell extends BaseItem {
	type: 'destruction spell' | 'healing spell' | 'unique spell';
	damage?: number;
	healing?: number;
	mana?: number;
	manaCost: number;
	element?: string;
	cooldown?: number;
}

export interface Potion extends BaseItem {
	type: 'potion';
	healing?: number;
	mana?: number;
	point?: number;
}

export interface Armor extends BaseItem {
	type: 'armor';
	armor: number;
}

export type InventoryItem = Weapon | Spell | Potion | Armor;
export type ShopItem = InventoryItem;
export type LootItem = InventoryItem;

export interface UIState {
	errorWarnMsg: string;
	buyWarnMsg: string;
	sellWarnMsg: string;
}

export interface MiscState {
	showInfoWindow: boolean;
	loading: boolean;
	showDescription: string;
	x: number;
	y: number;
	diceNumber: number;
	query: string;
	time: string;
	place: string;
	currentImg: string;
	death: boolean;
	interactivePoints: number;
	bugWindow: boolean;
	maintenanceWindow: boolean;
	started: boolean;
	heroClass: string;
}

export interface BackgroundImage {
	fetchedBg1: string;
	fetchedBg2: string;
	img1active: boolean;
	img2active: boolean;
}

export interface DescriptionWindow {
	name?: string;
	damage?: number;
	type?: string;
	healing?: number;
	mana?: number;
	point?: number;
	armor?: number;
	element?: string;
	weaponClass?: string;
	manaCost?: number;
	price?: number;
	amount?: number;
}

export interface CoolDowns {
	[key: string]: number;
}
