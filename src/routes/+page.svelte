<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import LetterByLetter from '$lib/components/LetterByLetter.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import GameStartWindow from '$lib/components/GameStartWindow.svelte'
	import DescriptionWindow from '$lib/components/ItemDescWindow.svelte'
	import MessageWindows from '$lib/components/InGameWarnMsgs.svelte'
	import ActionBox from '$lib/components/ActionBox.svelte'
	import Choices from '$lib/components/Choices.svelte'
	import BackgroundImgs from '$lib/components/BackgroundImgs.svelte'
	// import StaticPrompts from '$lib/components/StaticPrompts.svelte'

	import { game } from '../stores'
	import { character } from '../stores'
	import { selectedItem } from '../stores'
	import { misc } from '../stores'
	import { coolDowns } from '../stores'
	import { bgImage } from '../stores'
	import { ui } from '../stores'

	import { supabase } from '$lib/supabaseClient'

	// import frpgPlaces from '$lib/gamedata/places/frpg.json'
	// import frpgStarter from '$lib/gamedata/gamestarters/frpg.json'

	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'
	import { fade } from 'svelte/transition'

	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'
	import staticPlaces from '$lib/gamedata/places.json'
	// import medievalStart from '$lib/gamedata/starterprompts/medievalStart.txt'

	import medievalMageInventory from '$lib/gamedata/gamestarters/medievalMageInventory.json'
	import medievalMageSpells from '$lib/gamedata/gamestarters/medievalMageSpells.json'
	import medievalWarriorInventory from '$lib/gamedata/gamestarters/medievalWarriorInventory.json'
	import medievalWarriorSpells from '$lib/gamedata/gamestarters/medievalWarriorSpells.json'
	// import buyArmors from '$lib/gamedata/armors.json'

	let answer: string = ''
	let chatMessages: any = []

	//a variable to carry the enemy into the client-side for app reliability
	let enemyOnFrontend: boolean = false

	let prompt = `This is a role-playing game where you'll be the 1st person character and storyteller. You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective. All these 1st person and 3rd person content will be in gameData.story! Shape the storyline based on players choices.

	All of your responses MUST include a valid json object, with this exact properties(keys):

	"gameData": {
                "placeAndTime": {
                    "place": "Enchanted Library",
                    "time": "14:00"
                },
                "story": "As you step into the vast, towering library, you're immediately surrounded by shelves upon shelves of ancient tomes and magical artifacts. Soft, ethereal light bathes the room, and the air seems charged with knowledge and mystique. A wise-looking librarian sits at a desk, engrossed in a book of their own.",
                "event": {
                    "inCombat": false,
                    "shopMode": null,
                    "lootMode": false
                },
                "choices": [
                    "Approach the librarian for assistance.",
                    "Browse the shelves for a specific book.",
                    "Sit down and read a random tome."
                ],
                "enemy": {},
                "lootBox": []
            }
        }

		important: shopMode, lootMode, and inCombat must be null or false if they are not in use.

    

Don't forget to include at least 3 unique choices for the user to choose.
    	You can use these rpg game worlds as reference for quests, areas, towns, monsters, races and so on: ['World of Warcraft', 'Guild Wars series', 'Elder Scrolls series']

Use these races for enemies randomly: ['bandit', 'golem', 'kobold', 'satyr', 'skritt', 'ghoul', 'goblin', 'wolf', 'ogre', 'harpy', 'gargoyle', 'gnoll', 'jinn', 'arachne', 'demon', 'giant', 'undead']
Use these races for allies randomly: ['humans', 'elves', 'dwarves', 'halflings', 'vampires', 'orcs']
Use these weapon classes for gameData.lootBox weapons: ["sword", "dagger", "bow", "mace", "sword", "spear", "axe", "flail", "mace"]
Use these spell elements for gameData.lootBox spells: ["light", "fire", "dark", "ice", "lightning", "toxic"]
Every spell in the game has manaCost.

There are 2 unique spells in this game; Teleportation and Summon spells.

    	To give joy and spirit to the characters, write your messages from 1st perspective conversation if player currently talking to someone. if the player wants to leave or quit the current conversation, give them choices to go or do something different. If there is a farewell in conversation, let it end.

    	Do not start the fight before turning "inCombat" to true! Don't just start and end the combat with one response, player will tell when the fight is over! Don't end the fight until player ends it by saying. If a fight occurs, say something like "you are now in battle!", and then change "inCombat" to true. inCombat will turn to false only after player says it.
    	if "inCombat" is true, fill the enemy object. Enemy will always be an object, not an array of objects. Fill it only with 1 enemy object even if there are more than 1 enemy at the scene. Enemy object must have only enemyName and enemyHp properties.
		
    	If player starts talking with a market character about buying things, switch "shopMode" to a specific shop name from null.
       "shopMode" can only be null, 'Weaponsmith', 'Spell Shop', 'Armorsmith', 'Potion Shop', 'Merchant', 'Market' and 'Shop'. Never let "shopMode" stay null and change it to the things which i mentioned earlier if there is a trading/buying/selling conversation happening in gameData.story.

shopMode will stay null at "Tavern" and out of the town! You sometimes change shopMode to "PotionShop" or "Merchant" when player goes into tavern, or when player is out of the town. Do not do that. Tavern is not a shop. Anywhere out of the town is not a shop aswell.
Everything in tavern will be free, so drinks, foods and a room to sleep will be free, innkeepers can't take money from player for those.




Damage points of items in gameData.lootBox can be maximum 9.
Gold in gameData.lootBox can be maximum 200.

You are forgetting to put gameData.enemy. Put empty "{}" in gameData.enemy if there is no enemy to fight.


gameData.event comes before gameData.choices, always!

put everything story and conversation related into gameData.story, no where else!


There are 3 potions in the game. "Health Potion", "Mana Potion" and "Interactive Chat Potion"
"Interactive Chat Potion" always give 1 point.


There are no accessory or armor in the game as lootable. There are just weapons, spells, potions and currencies.



if player decides to check a loot, and if there are any weapon, gold, potion or spell; put them into the gameData.lootBox. Then, empty the gameData.lootBox in the next response. Only put weapons, spells, gold and potions.

do not end the game by yourself, give gameData.choices always until player says "game over". This is so important. Game getting bugged if you leave it blank. Always put at least 3 choices.


inCombat will only be true when enemies have spotted the player.
If inCombat is true, fill the enemy object with enemyHp and enemyName. This is so important, if inCombat is true and enemy object is not there; game is getting bugged.
shopMode will only change if player starts to talk a seller npc.

There is an escape functionality in the game. If player wants to escape from a combat, do not avoid it! Let the player escape.

fill gameData.lootBox only if player only decides to check a loot.
If there are items in lootBox, turn lootMode to true always!

Enemy can leave some lootable weapons, spells, potions or gold behind if player can defeat them.

understand the example format of the items in lootBox. Weapon must have name, damage, price, type and weaponClass. Spell must have name, damage or healing, price, manacost, type as destruction spell or healing spell, element and cooldown.

When you write your messages, focus writing them from 1st person character's eye most of the time, rather than 3rd person narrator and always give player at least 3 unique choices in gameData.choices, to let player choose from at the end of your response.
You are giving short stories. Don't do that, try to give longer and contextful stories.

If an npc gives an item or gold to the player, turn the lootMode to true and put the item-gold into the gameData.lootBox.
 
Sometimes you miss json in your responses. This is so important. Game is getting bugged if you do not give a gameData json in your response. No matter what happens in story, always give a gameData JSON object in your responses!
Now, start the game. Player enters a tavern in a town, night time.

You must to what player wants in-game. If player wants to go somewhere, like forest/woods etc, just lead the story to there.

Here's an example answer for you. Do not put any other thing into your answer besides these. You'll give your answers always in this format. Do it with the shown parantheses. 

{
	gameData:{
		placeAndTime: [{"place":'the value of this will change according to player's current area. It will be just 1 word general naming, no specific naming or proper noun. For example it can't be "Azeroth" or "Stormwind" or "the town"; but it can be "Tavern", "Woods", "Town", "Library", "Laboratory", "Hospital", "Sanatorium", "School", "Dungeon", "Cave", "Castle", "Mountain", "Shore", "Cathedral", "Shop", "Home", "Harbor", "Dock", "Ship", "Desert", "Island", "Temple", or "Unknown"', "time":'time in hour:minute format (no AM or PM, it will be 24 hour format'}] 
		story:['your answer about the story plot comes here'] 
		event: [{"inCombat":"this will be 'false' when there's no chance for combat, but will be 'true' if there's any combat potential, or nearby enemies.", "shopMode":"this will be null normally, but will be 'Weaponsmith', 'Spell Shop', 'Armorsmith', 'Potion Shop', 'Merchant', 'Market' or 'Shop' if there's currently a conversation happening with a seller npc.", "lootMode":"this will be true only if user chooses a choice about exploring a loot from choices, else will stay false"}] 
		choices: ["choice1", "choice2", "choice3"] 
		enemy: {enemyName:"name of the enemy", enemyHp:"a number between 30 and 150"}
		lootBox: [{
    		"name": "Bronze Battle Axe",
    		"damage": "this number can maximum be 9.",
    		"price": 85,
    		"type": "weapon",
    		"weaponClass": "axe"
    	}, 	{
    		"name": "Solar Bomb",
    		"damage": "this number can maximum be 10.",
    		"price": 130,
    		"manaCost": 20,
    		"type": "destruction spell",
    		"element": "fire",
    		"cooldown": 3
    	}, {"name":"gold",
    		"type":"currency",
    		"amount":"this number can maximum be 100."},
    		{"name":"Health Potion",
    		"type":"potion",
    		"price":"30",
    		"healing":"50"},
    		{"name":"Interactive Chat Potion",
    		"type":"potion",
    		"price":"30",
    		"point":"1"}
    	]
	}
}
`
	// Do not give same gameData.choices! Change the gameData.choices in all of your answers, change them according to the current gameData.story!
	// Do not ever give mathematical calculations in gameData.enemy.enemyHp! Don't ever do that, just give the result.
	// You are not creating a game in python, you will just give the JSON object named "gameData", like the example below.

	// Could you please make sure not to introduce line breaks or invalid control characters in the generated content? These characters can sometimes cause issues in data formats like JSON. If you encounter a situation where a line break or control character is necessary, please use appropriate escape sequences. Thank you!
	// Do not seperate story to more than 1 paragraphs! make it only 1 paragraph, so no line breaks. This is so important, JSON.parse getting bugged because of bad characters, if there are line breaks.

	const handleSubmit = async () => {
		if ($misc.query === '') {
			return
		}

		$game.gameData.choices = []

		$misc.loading = true
		chatMessages = [...chatMessages, { role: 'user', content: $misc.query }]

		console.log('myprompt: ', prompt)

		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt })
		})

		if (response.ok) {
			const responseData = await response.json() // Extract the JSON response data
				console.log('responseData: ', responseData)
				
				

				let gameData;
				try {
					gameData =   JSON.parse(responseData.candidates[0].content.parts[0].text)
				} catch (error) {
					console.log(error)
					const jsonString = responseData.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
					gameData = JSON.parse(jsonString)
				} finally {
					let hpOfEnemy = 0

			if ($game.gameData.enemy.enemyHp) {
				hpOfEnemy = $game.gameData.enemy.enemyHp
			}
			$game = gameData
			if (hpOfEnemy && $game.gameData.enemy.enemyHp) {
				$game.gameData.enemy.enemyHp = hpOfEnemy
			}
			console.log('THIS IS $game: ', $game)

			$misc.started = true

			$misc.place = $game.gameData.placeAndTime?.place
			$misc.time = $game.gameData.placeAndTime?.time

			if (!$game.gameData.enemy?.enemyMaxHp) {
				if ($game.gameData.enemy?.enemyHp) {
					$game.gameData.enemy.enemyMaxHp = $game.gameData.enemy.enemyHp
				}
			}
			fetchImg()

			if ($game.gameData.event?.shopMode && $game.gameData.shop?.length != 4) {
				mixBuyables($game.gameData.event.shopMode)
			}

			chatMessages = [...chatMessages, { role: 'assistant', content: $game }]
			$misc.loading = false
				}
			
 
			
		} else {
			console.error('HTTP Error:', response.status, response.statusText)
		}
	}

	let handleErr: boolean = false
	function handleError<T>(err: T) {
		console.error('error from client: ', err)

		handleErr = true

		setTimeout(() => {
			giveYourAnswer(answer)
		}, 1000)
	}

	//logic to shuffle shop items at shop
	function shuffleItems(items: any) {
		// start at the end of the array and work backwards
		for (let i = items?.length - 1; i > 0; i--) {
			// pick a random index between 0 and i (inclusive)
			const j = Math.floor(Math.random() * (i + 1))

			// swap the current element with the randomly selected one
			;[items[i], items[j]] = [items[j], items[i]]
		}

		// return the first six shuffled items
		return items.slice(0, 4)
	}

	function mixBuyables(category: any) {
		let items
		switch (category) {
			case 'Weaponsmith':
			case 'Armorsmith':
			case 'Blacksmith':
				items = buyWeapons
				break
			case 'SpellShop':
			case 'Spell Shop':
			case 'Shop':
			case 'Marketplace':
				items = buySpells
				break
			case 'PotionShop':
			case 'Potion Shop':
			case 'Market':
			case 'Merchant':
				// case 'Bartender':
				// case 'Inn Keeper':
				items = buyPotions
				break
			default:
				items = buyPotions
				$game.gameData.shopMode = null
				break
		}
		$game.gameData.shop = shuffleItems(items)
	}

	//this is the function to canalize player's answer to chatGPT
	function giveYourAnswer(choice: any) {
		if (!choice) return
		if (choice.includes('sex') || choice.includes('kill')) {
			if (choice.includes('skill')) return
			$ui.errorWarnMsg = "There's a flawed word in your answer."
			return
		}
		$game.gameData.story = ''

		//increase all the $coolDowns by 1 with every choice
		for (const key in $coolDowns) {
			if ($coolDowns.hasOwnProperty(key)) {
				$coolDowns[key] += 1
			}
		}

		$selectedItem.showDescription = 'none'

		$game.gameData.choices = []
		$game.gameData.shop = []

		$misc.query = choice

		try {
			if (chatMessages?.length) {
				prompt = choice
			}
			handleSubmit()
			$misc.query = ''
			answer = ''
		} catch (error) {
			handleError(error)
		}

		if ($misc.started == false) {
			$misc.started = true
		}
	}

	//message loading animation logic
	let dotty: any = '.'
	setInterval(() => {
		if (dotty == '...') {
			dotty = ''
		}
		dotty += '.'
	}, 400)

	//function to handle emittedAnswers
	function handleEmittedAnswer(event: any) {
		giveYourAnswer(event.detail.answer)
	}

	//function to start the game in "medieval starter" conditions
	function startMedievalGame(event: any) {
		chatMessages = []
		$game.gameData.lootBox = []
		$game.gameData.placeAndTime = []

		$game.gameData.shop = []
		$game.gameData.choices = []
		$game.gameData.enemy = []
		$game.gameData.event = []
		$selectedItem = {}
		$character.gold = 30

		if ($game.gameData.heroClass == 'mage') {
			$character.stats = [{ hp: 80, maxHp: 80, mp: 110, maxMp: 110 }]
			$character.spells = [...medievalMageSpells]
			$character.inventory = [...medievalMageInventory]
		} else if ($game.gameData.heroClass == 'warrior') {
			$character.stats = [{ hp: 110, maxHp: 110, mp: 80, maxMp: 80 }]
			$character.spells = [...medievalWarriorSpells]
			$character.inventory = [...medievalWarriorInventory]
		}
		giveYourAnswer(event.detail.answer)
	}

	function getRandomNumber(num: any) {
		return Math.floor(Math.random() * num) + 1
	}

	//extract game hour from chatGPT response
	function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

	//fetch img according to player's current place from database
	async function fetchImg() {
		// check if place is the same
		if ($game.gameData.placeAndTime?.place == $misc.currentImg) return

		const places: any = [...staticPlaces]

		// check current place of player
		function checkPlace(str: any) {
			let matchingPlaces: any = places.filter((place: any) => str?.includes(place))

			if (matchingPlaces == 'Town Inn' || matchingPlaces == 'Town Tavern') {
				matchingPlaces = 'Inn'
				return matchingPlaces
			} else if (
				matchingPlaces.includes('Outskirts') ||
				matchingPlaces.includes('outskirts') ||
				matchingPlaces.includes('Road') ||
				matchingPlaces.includes('road')
			) {
				matchingPlaces = 'Forest'
				return matchingPlaces
			} else if (matchingPlaces.includes('Garden') || matchingPlaces.includes('garden')) {
				matchingPlaces = 'Garden'
				return matchingPlaces
			} else if (matchingPlaces.includes('River') || matchingPlaces.includes('river')) {
				matchingPlaces = 'River'
				return matchingPlaces
			} else if (matchingPlaces.includes('Island') || matchingPlaces.includes('island')) {
				matchingPlaces = 'Island'
				return matchingPlaces
			} else if (matchingPlaces.includes('Village') || matchingPlaces.includes('village')) {
				matchingPlaces = 'Village'
				return matchingPlaces
			} else if (matchingPlaces.includes('Mine') || matchingPlaces.includes('mine')) {
				matchingPlaces = 'Cave'
				return matchingPlaces
			}
			return matchingPlaces?.length > 0 ? matchingPlaces[0] : null
		}
		//list images to get the image amount
		const { data: imgs } = await supabase.storage.from('imgs').list(checkPlace($misc.place), {
			limit: 100,
			offset: 0,
			sortBy: { column: 'name', order: 'asc' }
		})

		//fetch images based on time and place
		let finalImg: any
		if (imgs) {
			if (
				(checkPlace($misc.place) == 'Town' ||
					checkPlace($misc.place) == 'City' ||
					checkPlace($misc.place) == 'Forest' ||
					checkPlace($misc.place) == 'Woods') &&
				(extractHours($misc.time) >= 18 || extractHours($misc.time) <= 6)
			) {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${checkPlace($misc.place)}-night/${getRandomNumber(imgs?.length - 1)}.webp`)
				finalImg = img
			} else {
				const { data: img, error } = await supabase.storage
					.from('imgs')
					.download(`${checkPlace($misc.place)}/${getRandomNumber(imgs?.length - 1)}.webp`)
				finalImg = img
			}
		}

		const reader = new FileReader()

		if (finalImg) {
			reader.readAsDataURL(finalImg)
		} else {
			return
		}

		//fade in and out across the fetched images
		reader.onload = () => {
			if (!$bgImage.img1active) {
				$bgImage.fetchedBg1 = reader.result
				$bgImage.img1active = !$bgImage.img1active
				$bgImage.img2active = !$bgImage.img1active
			} else if (!$bgImage.img2active) {
				$bgImage.fetchedBg2 = reader.result
				$bgImage.img2active = !$bgImage.img2active
				$bgImage.img1active = !$bgImage.img2active
			}
		}

		$misc.currentImg = $misc.place
	}
</script>

<div>
	<BackgroundImgs />

	{#if !$misc.started}
		<GameStartWindow on:emittedAnswer={startMedievalGame} />
	{/if}

	<MessageWindows />

	<!-- item description window (out of ui) -->
	<DescriptionWindow />
	<!-- item description window  -->

	<!-- game ui starts here -->
	{#if $misc.started}
		<div class="main-game">
			<!-- chatGPT answer box starts here -->
			<div transition:fade={{ duration: 1000 }} class="game-master">
				{#if $game.gameData.story}
					<p>
						{$game.gameData.story}
					</p>
					<!-- <LetterByLetter message={$game.gameData.story} /> -->
				{/if}
				{#if !$game.gameData.story}
					<ChatMessage message={dotty} />
				{/if}
			</div>
			<!-- chatGPT answer box ends here -->

			<!-- game controls ui starts here-->
			<div transition:fade={{ duration: 2000 }} class="game-controls">
				<ActionBox
					title={'Inventory'}
					actions={$character.inventory}
					on:emittedAnswer={handleEmittedAnswer}
				/>
				{#if $misc.started}
					<div class="choices">
						<Choices on:emittedAnswer={handleEmittedAnswer} />
					</div>
				{/if}

				<ActionBox
					title={'Spells'}
					actions={$character.spells}
					on:emittedAnswer={handleEmittedAnswer}
				/>
			</div>
			<!-- game controls ui ends here-->
		</div>

		<!-- Static tavern prompts -->
		<!-- {#if (!$misc.loading && $game.gameData.placeAndTime && $game.gameData.placeAndTime.place.includes('Tavern')) || ($game.gameData.placeAndTime && $game.gameData.placeAndTime.place.includes('Inn'))}
			<div transition:fade={{ duration: 3000 }}>
				<StaticPrompts on:emittedAnswer={handleEmittedAnswer} />
			</div>
		{/if} -->
	{/if}
	<!-- game ui ends here -->

	<UiButtons on:emittedAnswer={handleEmittedAnswer} />
</div>

<style>
	.main-game {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 3rem;
		height: 95vh;
	}
	.game-master {
		width: 70%;
		height: 25%;
		line-height: 1.8;
		background-color: #0d0d0db3;
		backdrop-filter: blur(24px);
		margin-inline: auto;
		padding: 0.5rem 0.9rem;
		border-radius: 1rem;
		font-size: 1.4rem;
		color: #eee;
		overflow: auto;
	}

	.game-controls {
		display: flex;
		width: 70%;
		margin-inline: auto;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		height: 30%;
	}

	.choices {
		width: 100%;
		height: 100%;
	}
	/* responsive */
	@media (orientation: portrait) {
		.game-master {
			width: 85%;
		}
		.main-game {
			height: 100vh;
		}
		.game-controls {
			display: grid;
			grid-template-columns: 1fr 1fr;
			width: 85%;
			height: 40%;
		}
		.choices {
			grid-column-start: 1;
			grid-column-end: 3;
			grid-row-end: 1;
			grid-row-end: 2;
			padding-bottom: 2rem;
		}
	}
</style>
