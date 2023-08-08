<script lang="ts">
	export let message: any
	import { fade, blur } from 'svelte/transition'
	import { onMount } from 'svelte'

	let isVisible = false
	// console.log('letterbyletter: ', message)
	// Function to split the text into individual letters
	function splitText() {
		message = message.split(' ').map((letter: any) => letter)
		// console.log(message)
	}

	onMount(() => {
		splitText()
		isVisible = true

		// console.log(message)
	})
</script>

{#if isVisible}
	<p>
		{#each message as letter, index}
			<span transition:blur={{ duration: index * 100 < 2000 ? index + '00' : 2000 }}>
				{letter + ' '}
			</span>
		{/each}
	</p>
{/if}

<style>
	p {
		opacity: 0;
		animation: fadeIn 2s forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
