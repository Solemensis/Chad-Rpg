# An AI-driven interactive role-playing game

- Working demo: https://chad-rpg.vercel.app/
- Project video: ..

## Starting Screen

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/entry.jpg" alt="UI of the Game" width="600">

- Game planning screen can be seen on top.
- There is just 1 stable world type to play for now, but other starting conditions and world types will be added with time.

## Play Your Own Story | A simple storytelling footage from the game:

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/main.jpg" alt="UI of the Game" width="600">

- "Chad-Rpg" is an interactive role playing game, where you are the player and Artificial Intelligence is the storyteller of the game.
- You'll give your own choices to events throughout the game, and then, AI will shape the story based on your choices (and combat success).
- Possibilities are endless; player can fight with creatures, wonder around the world, or just chill and meet a great friend at the tavern without choosing combat in his/her play time.

### Interactivity At Its Finest!

- Player can write his/her own answer into input too. Input box can be seen at the top, with a placeholder.
- This only works if player got any interactive chat points left. They can be bought from potion shops or some merchants. (I changed placeholder after this implementation, so the above images do not have that.)
- Note: Game can get buggy if player writes something so out of context.

## Combat UI

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/combatui.jpg" alt="UI of the Game" width="600">

- When enemies are ahead, choice ui will change, and player will be asked to select an action item or spell from the inventory/spells.
- Then, player will throw a d20 dice (1 to 20); and combat story will be calculated based on the damage/healing of the selected item and the dice number, plus, some element of surprise sometimes.

<div style="display:flex; justify-content:space-around;">
<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/combat2.jpg" alt="UI of the Game" width="400">
<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/combat3.jpg" alt="UI of the Game" width="400">
</div>

- Player threw 9/20 on the top left image, and the response came from server (so chatGPT) in a moment, based on the damage and the dice score.
- At the picture on the right, combat outcome (server response) can be seen in story box & hp/mp differences.

## Shop UI

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/shopui.jpg" alt="UI of the Game" width="600">

- Player can buy items, spells and potions from seller npcs using earned gold.

## Loot UI

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/lootui.jpg" alt="UI of the Game" width="600">

- There can be lootables after a successful combat, an example can be seen on top.

## Technologies Used

- Sveltekit as the fullstack framework
- chatGPT api model: gpt-3.5-turbo
- Supabase as the database
- Midjourney for the background generations

## Miscellaneous

- Backgrounds are changing automatically according to characters places to give more of the ambiance.
- A tavern/medieval vibish song can be played with a click, it's now uses html5 audio so it does not seemlessly looping but it will be seemlessly looping itself with the power of the web audio api when i implement it. The song is "Tavern Loop One" from Alexander Nakarada.

## What's Next?

<img src="https://wjfywtvnvjbposklgxzj.supabase.co/storage/v1/object/public/readme/cyberpunk.jpg" alt="UI of the Game" width="600">

- An example storytelling scene from upcoming Cyberpunk world.
- Note that Cyberpunk world is not currently playable, yet it'll be on the way for sure.

## Final Thoughts

- There is no save game functionality for now, the current version is some kind of a tastement-demo.

- There are some minor bugs in the game, the gpt model i use (gpt-3.5) has 4k token limit and i'm deleting the context from the first indexes of the array if token limit is high. I really want to keep developing this project, and if i can achieve a little financial support, i want to update whole game prompt with the gpt-4 model, which has so much more context limit (enough to resolve many bugs) and much more powerful than gpt-3.5. It can be easier to save games to the database too with the huge context limit of the new model.

- I want to clean the source code, but i'm fairly new to svelte, i'll get used to it.
