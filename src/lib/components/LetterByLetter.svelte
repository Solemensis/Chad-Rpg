<script lang="ts">
	import { blur } from 'svelte/transition'

	// Preferred prop name (used by `Game.svelte`).
	export let text: string | string[] | null | undefined = undefined
	// Backwards-compatible alias.
	export let message: string | string[] | null | undefined = undefined

	let isVisible = false
	let tokens: string[] = []

	$: {
		const value = text ?? message
		if (Array.isArray(value)) {
			tokens = value.map((v) => String(v))
		} else if (typeof value === 'string') {
			tokens = value.split(' ')
		} else {
			tokens = []
		}
		isVisible = true
	}
</script>

{#if isVisible}
	<p>
		{#each tokens as letter, index}
			<span transition:blur={{ duration: Math.min(index * 100, 2000) }}>
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
