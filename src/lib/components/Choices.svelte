<script lang="ts">
import { game } from '../../stores.js';
	import { character } from '../../stores.js';
    import { ui } from '../../stores.js';
	import { selectedItem} from '../../stores.js';
	import { misc } from '../../stores.js';
	import { coolDowns } from '../../stores.js';
	import { descWindow } from '../../stores.js';

	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();



    function extractHours(timeString: any) {
		const hour = parseInt(timeString.split(':')[0], 10)
		return hour
	}

    function capitalizeFirstLetter(str: any) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}


    
	//transition delay logic
	let delay: any = -300
	
    function getDelayTime() {
		delay += 300

		return { delay }
	}

    

    function calculateRetreat() {
		let number = Math.floor(Math.random() * 6) + 1

		if (number <= 3) {
			emitAnswer("You got hit while trying to escape, couldn't escape and lost 20 health.")
			//lose 20 health here
		} else {
			emitAnswer('You have escaped succesfully!')
		}
	}

    
	function throwDice(combatEvent: any) {
		if (!combatEvent.name) return ($ui.errorWarnMsg = 'You need to choose a weapon or spell.')

		if ($coolDowns[combatEvent.name]) {
			$coolDowns[combatEvent.name] = 0
		}

		//zar numarasını bi süre göstermek için 1-2 saniyelik bi timeout
		//içine alıncak giveYourAnswer
		console.log(combatEvent.prompt)
		emitAnswer(combatEvent.prompt)

		if (combatEvent.manaCost) {
			$character.stats[0].mp -= combatEvent.manaCost
		}

		$character.stats[0].hp -= $misc.diceNumber
		$misc.diceNumber = 0

		// $game.event[0].inCombat = !$game.event[0].inCombat

		//empty the object after
		$selectedItem.name = ''
		$selectedItem.damage = undefined
		$selectedItem.healing = undefined
		$selectedItem.prompt = ''
		$selectedItem.combatScore = undefined
		$selectedItem.manaCost = 0
	}

    function handleMouseMove(event: any, item: any) {
    $misc.showDescription = 'block'
    $misc.x = event.clientX + 10
    $misc.y = event.clientY - 40


    // for (let key in $descWindow) {
    //     $descWindow[key] = undefined
	// 					}


            $descWindow.name = item && item.name ? item.name : undefined
            $descWindow.damage = item && item.damage ? item.damage : undefined
            $descWindow.type = item && item.type ? item.type : undefined
            $descWindow.healing = item && item.healing ? item.healing : undefined
            $descWindow.armor = item && item.armor ? item.armor : undefined
         $descWindow.element = item && item.element ? item.element : undefined
            $descWindow.weaponClass = item && item.weaponClass ? item.weaponClass : undefined
             $descWindow.manaCost = item && item.manaCost ? item.manaCost : undefined
            $descWindow.price = item && item.price ? item.price : undefined
             $descWindow.amount = item && item.amount ? item.amount : undefined
}

function hideWindow() {
		$selectedItem.showDescription = 'none'
	}

    function handleBuy(prompt: any, item: any) {
		if ($game.event[0].shopMode) {
			$selectedItem.item = item
			$ui.buyWarnMsg = prompt
		} else return
	}

    function lootItem(item: any) {
		if (item.type == 'weapon' || item.type == 'potion') {
			$character.inventory.push(item)
			$character.inventory = $character.inventory
		} else if (
			item.type == 'destruction spell' ||
			item.type == 'healing spell' ||
			item.type == 'unique spell'
		) {
			$character.spells.push(item)
			$character.spells = $character.spells
		} else if (item.type == 'currency') {
			$character.gold += parseInt(item.amount)
		}

		let newArray: any = $game.lootBox.filter((lootItem:any) => lootItem.name !== item.name)
		$game.lootBox = newArray

		if (!$game.lootBox.length) {
			emitAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			$game.event[0].lootMode = false
		}
	}
	function lootAll() {
		$game.lootBox.forEach((item:any) => {
			if (item.type == 'weapon' || item.type == 'potion') {
				$character.inventory.push(item)
				$character.inventory = $character.inventory
			} else if (
				item.type == 'destruction spell' ||
				item.type == 'healing spell' ||
				item.type == 'unique spell'
			) {
				$character.spells.push(item)
				$character.spells = $character.spells
			} else if (item.type == 'currency') {
				$character.gold += parseInt(item.amount)
			}
		})

		$game.lootBox = []

		if (!$game.lootBox.length) {
			emitAnswer("I'm gonna loot it all. (clear the @lootBox array in the next response)")
			$game.event[0].lootMode = false
		}
	}


	function emitAnswer(answer:any) {
		dispatch('emittedAnswer', {
			answer: answer
		});

					//choice transition delay reset for every new conversation

        delay=-300
	}
    </script>


<!-- ui bottom mid starts here -->
<div class="ui-mid">
    {#if $game.event[0] && !$game.event[0].shopMode && !$game.event[0].inCombat && !$game.event[0].lootMode}
        <!-- choices ui starts here -->
        <div class="choices">
            {#each $game.choices as choice}
                <button
                    disabled={$misc.loading}
                    transition:fade={{ ...getDelayTime(), duration: 700 }}
                    class="choice"
                    on:click={() => emitAnswer(choice)}>{choice}</button
                >
            {/each}
            {#if $game.choices.length >= 2}
                <div
                    transition:fade={{ ...getDelayTime(), duration: 400 }}
                    class="choice choiceInput"
                >
                    <input
                        placeholder="Go to local Inn, find someone to talk to"
                        type="text"
                        bind:value={$misc.query}
                    />
                    <button disabled={!$misc.query} on:click={() => emitAnswer($misc.query)}>Answer</button>
                </div>
            {/if}
        </div>
        <!-- choices ui ends here -->

        

        <!-- combat ui -->
    {:else if $game.event[0] && $game.event[0].inCombat}
        <div transition:fade={{ duration: 1000 }} class="combat">
            <div class="combat-box">
                <div class="heading-and-enemy">
                    <h3>You are now in <span class="span-heading">Combat</span> against:</h3>
                    {#if $game.enemy[0]}
                        <div
                            style="background-image: linear-gradient(to right, #E1683Caa {mpPercentage}%, #1f1f1fc8);"
                            class="enemy"
                        >
                            <h5>{capitalizeFirstLetter($game.enemy[0].enemyName)}</h5>
                            <p>
                                {$game.enemy[0].enemyHp} <span class="hp-mp-text">HP</span>
                            </p>
                        </div>
                    {/if}
                </div>
                <div class="combat-but-and-info">
                    <ul>
                        {#if !$selectedItem.name}
                            <li>
                                Choose an <span class="g-span">item</span> or a
                                <span class="g-span">spell.</span>
                            </li>
                        {:else if $selectedItem.damage}
                            <li>
                                You chose <span class="g-span">{$selectedItem.name}</span> with
                                <span class="g-span">x{$selectedItem.damage}</span> damage!
                            </li>
                        {:else if $selectedItem.healing}
                            <li>
                                You chose <span class="g-span">{$selectedItem.name}</span> with
                                <span class="g-span">x{$selectedItem.healing}</span> heal power!
                            </li>
                        {/if}

                        <li>Then, press the <span class="g-span">dice</span> to learn your fate!</li>
                        <li>
                            <!-- Your fighting scenario will be calculated based on these and some element of
                            surprise. -->
                            Or, just try to <span class="red-span">Retreat!</span>
                        </li>
                    </ul>
                    <button on:click={() => throwDice($selectedItem)} class="combat-button">
                        <img src="images/dice.webp" alt="" />
                    </button>
                </div>
            </div>
        </div>
        <!-- combat ui ends here-->

        <!-- shop ui -->
    {:else if $game.event[0] && $game.event[0].shopMode}
        <div transition:fade={{ duration: 1000 }} class="shop">
            <div class="shop-box">
                {#if $game.event[0].shopMode == 'weaponsmith'}
                    <h3>You're at a local <span class="g-span">Weaponsmith</span></h3>
                {/if}
                {#if $game.event[0].shopMode == 'armorsmith'}
                    <h3>You're at a local <span class="g-span">Armorsmith</span></h3>
                {/if}
                {#if $game.event[0].shopMode == 'spell shop'}
                    <h3>You're at a local <span class="g-span">Spell Shop</span></h3>
                {/if}
                {#if $game.event[0].shopMode == 'potion shop'}
                    <h3>You're at a local <span class="g-span">Potion Shop</span></h3>
                {/if}
                {#if $game.event[0].shopMode != 'weaponsmith' && $game.event[0].shopMode != 'armorsmith' && $game.event[0].shopMode != 'spell shop' && $game.event[0].shopMode != 'potion shop'}
                    <h3>You're at a local <span class="g-span">Merchant</span></h3>
                {/if}

                <div class="buyables-box">
                    {#each $game.shop as buyable}
                        <button
                            class="item-button"
                            on:click={() => handleBuy(`Do you wanna buy ${buyable.name}?`, buyable)}
                            on:mousemove={(event) => handleMouseMove(event, buyable)}
                            on:mouseleave={hideWindow}
                        >
                            {#if buyable.type == 'weapon'}
                                <img class="buyable-img" src="images/{buyable.weaponClass}.svg" alt="" />
                            {:else if buyable.type == 'potion'}
                                <img class="buyable-img" src="images/{buyable.type}.svg" alt="" />
                            {/if}
                            {#if buyable.element}
                                <img class="buyable-img" src="images/{buyable.element}.svg" alt="" />
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <!-- shop ui ends here -->

        <!-- loot ui-->
    {:else if $game.event[0].lootMode}
        <div transition:fade={{ duration: 1000 }} class="shop">
            <div class="shop-box">
                <h3>You're <span class="g-span">looting.</span></h3>

                <div class="buyables-box">
                    {#if !$game.lootBox.length}
                        <p>loading...</p>
                    {:else}
                        {#each $game.lootBox as item}
                            <button
                                class="item-button"
                                on:click={() => lootItem(item)}
                                on:mousemove={(event) => handleMouseMove(event, item)}
                                on:mouseleave={hideWindow}
                            >
                                {#if item.type == 'weapon'}
                                    <img class="buyable-img" src="images/{item.weaponClass}.svg" alt="" />
                                {/if}
                                {#if item.element}
                                    <img class="buyable-img" src="images/{item.element}.svg" alt="" />
                                {/if}
                                {#if item.type == 'potion' || item.type == 'currency'}
                                    <img class="buyable-img" src="images/{item.type}.svg" alt="" />
                                {/if}
                            </button>
                        {/each}
                        <button on:click={() => lootAll()}>Loot All</button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
    <!-- loot ui ends here -->

    <!-- gold&time and reject choices -->
    {#if $game.choices.length >= 2 || $game.event[0].inCombat || $game.event[0].shopMode}
        <div transition:fade={{ duration: 700 }} class="stats">
            <div class="stat">
                <img class="svg-images" src="images/gold.svg" alt="" />
                <p>{$character.gold}</p>
            </div>

            {#if $game.event[0].inCombat}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.choices.length ? '1' : '0'};"
                    on:click={() => calculateRetreat()}>Retreat.</button
                >
            {:else if $game.event[0].shopMode}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.event[0].shopMode ? '1' : '0'};"
                    on:click={() => {
                        emitAnswer('Leave the shop')
                        $game.event[0].shopMode = null
                    }}>Leave the Shop</button
                >
            {:else if $game.lootBox.length}
                <button
                    disabled={$misc.loading}
                    class="leave-button"
                    style="opacity: {$game.lootBox.length ? '1' : '0'};"
                    on:click={() => emitAnswer('Leave the loot.')}>Leave it.</button
                >
            {:else if extractHours($misc.time) >= 20 && $misc.place != 'Town' && $misc.place != 'Tavern' && $misc.place != 'Inn'}
                <button
                    disabled={$misc.loading}
                    class="leave-button night-time"
                    style="opacity: {extractHours($misc.time) >= 20 ? '1' : '0'}; "
                    on:click={() =>
                        emitAnswer(
                            "It's night time, i'll go back to the town before got caught to monsters."
                        )}>It's night time, go back to inn for safety.</button
                >
            {/if}
            <div class="stat">
                <img class="svg-images" src="images/time.svg" alt="" />

                <p>{$game.placeAndTime[0].time ? $game.placeAndTime[0].time : '00:00'}</p>
            </div>
        </div>
    {/if}
    <!-- gold&time and reject choices ends here -->
</div>
<!-- ui bottom mid ends here -->



<style>
.ui-left,
	.ui-right {
		width: 25%;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.hp-bar,
	.mp-bar {
		text-align: center;
		font-size: 1.2rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding: 0.2rem 0;
	}
	.spells,
	.inventory {
		display: grid;
		align-items: center;
		justify-items: center;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		background-color: #362525bc;

		border-radius: 0.2rem;
		min-height: 25vh;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.spells h3,
	.inventory h3 {
		grid-column-start: 1;
		grid-column-end: 4;
		justify-self: center;
		font-weight: 400;
		font-size: 1.4rem;
		color: #3fcf8e;
		/* font-family:"medieval" !important; */
	}
	.spells img,
	.inventory img {
		width: 85%;
		margin-inline: auto;
		padding: 0.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.spells img:active,
	.inventory img:active {
		animation: button-pop 0.3s ease-out;
	}
	.spells button,
	.inventory button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		border-radius: 0.4rem;
		width: 85%;
		height: 85%;
	}
	

	.choices {
		/* min-height: 36.9%; */
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
		margin-inline: auto;
		padding: 0;
	}
	.combat,
	.shop {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		height: 100%;
		margin-inline: auto;
		gap: 1rem;
	}

	.combat-box h3,
	.shop-box h3 {
		text-align: center;
		font-weight: 300;
		font-size: 1.3rem;
	}

	.combat-box,
	.shop-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-around;
		padding: 0 0.5rem;
	}
	.shop-box {
		align-items: center;
		padding-bottom: 1rem;
	}

	.combat-but-and-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
	}

	.combat-box img:active {
		animation: button-pop 0.3s ease-out;
	}

	.combat-box ul {
		font-size: 1rem;
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 0.4rem;
	}

	.combat-box ul {
		width: 60%;
	}

	.leave-button {
		border: none;
		background-color: rgba(49, 49, 49, 0.73);
		padding: 0.3rem 2rem;
		border-radius: 0.3rem;
		font-size: 1rem;
		transition: background-color 0.3s, opacity 1.5s;
		backdrop-filter: blur(3px);
	}

	.leave-button:hover {
		background-color: rgba(49, 49, 49, 0.83);
	}

	.night-time {
		background-color: 964B00aa;
	}

	.combat-button {
		border: none;
		background-color: rgba(19, 19, 19, 0.525);
		border-radius: 0.6rem;
		padding: 0.5rem 0.5rem 0.1rem 0.5rem;
	}

	.combat-button img {
		width: 3.5rem;
	}

	.combat-box ul li,
	.shop-box ul li {
		color: #bbb;
		padding-left: 0.4rem;
		text-align: start;
		transition: 0.2s;
		line-height: 1.2;
	}
	.shop-box ul li:hover {
		cursor: pointer;
		color: #3fcf8e;
	}

	.combat-box ul li:nth-child(1) {
		list-style-type: '⚔️';
	}
	.combat-box ul li:nth-child(2) {
		list-style-type: '🎲';
	}
	.combat-box ul li:nth-child(3) {
		list-style-type: '🔮';
		font-size: 0.9rem;
		padding-left: 0.5rem;
		margin-left: -0.08rem;

		color: #aaa;
	}

	.item-button {
		border: none;
		background-color: transparent;
	}

	.shop-box ul li {
		list-style-type: '\1F7E3';
	}
	.span-heading {
		color: rgb(228, 55, 55);
		font-weight: 400;
	}
	.g-span {
		color: #3fcf8e;
	}
	.red-span {
		color: rgb(228, 55, 55);
	}
	.stats {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(64, 64, 64, 0.8);
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
	}
	.svg-images {
		width: 1.1rem;
		height: 1.1rem;
	}

	.stat p {
		font-size: 1.2rem;
	}
	.ui-mid {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.8rem;
	}

	.choice {
		/* background-color: rgba(49, 49, 49, 0.83); */

		background-color: #362525;
		border-radius: 0.5rem;
		font-size: 1.35rem;
		color: #ccc;
		padding: 0.4rem 0.6rem;
		border: none;
		position: relative;
		text-align: center;
		transition: 0.2s;

		/* font-style:italic; */

	}
	.choiceInput {
		background-color: #1f1f1fc8;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
	}

	.choiceInput input {
		background-color: transparent;
		border: none;
		width: 85%;
		height: 100%;
		font-size: 1.2rem;
		outline: none;
		padding: 0.1rem 0.3rem;
		text-align: start;
	}
	.choiceInput button {
		border: none;
		color: #ddd;
		border-radius: 0.3rem;
		padding: 0.2rem 0.5rem;
		background-color: #9018c486;
	}
	.choiceInput button:active {
		animation: button-pop 0.3s ease-out;
	}
	.choiceInput button:hover {
		background-color: #a61ce186;
	}
	::placeholder {
		color: #aaa;
	}
	.choice:hover:not(:last-child) {
		background-color: #372b2b;
	}

	

	

	

	
	

	.heading-and-enemy {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
	}

	.enemy {
		display: flex;

		gap: 0.05rem;
		align-items: center;
		justify-content: space-around;
		width: 8rem;
		height: 1rem;
		border-radius: 0.3rem;

		padding: 0.7rem 0;
	}

	.enemy h5 {
		font-weight: 400;
		font-size: 0.9rem;
		color: #ccc;
	}
	.enemy p {
		font-size: 0.9rem;
		text-align: center;
		color: #ccc;
	}
	.enemy span {
		font-size: 0.9rem;

		color: #ccc;
	}

	.buyables-box {
		display: flex;
		gap: 1rem;
	}
	.shop-box button {
		background-color: rgb(128 128 128 / 29%);
		border: none;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.4rem;

		display: flex;
		align-items: center;
		justify-content: center;
	}
	.buyable-img {
		width: 65%;
		height: 65%;
	}
    </style>