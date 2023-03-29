<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();


    function emitAnswer(answer:any) {
		dispatch('emittedAnswer', {
			answer: answer
		});
	}


</script>



<div
		style="position:absolute;
	left:5%;
	top:50%;
	display:flex;
	flex-direction:column;
	transform:translate(-50%,-50%);"
	>
		<button on:click={() => emitAnswer('go woods, find some goblins to hunt')}
			>kill goblins</button
		>
		<button on:click={() => emitAnswer('go to a weaponsmith')}>go weaponsmith</button>
		<button on:click={() => emitAnswer("I'll have a drink and sit at a table in this beautiful tavern.")}>I'll have a drink and sit at a table in this beautiful tavern.</button>
	</div>