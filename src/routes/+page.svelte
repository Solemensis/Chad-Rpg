<script lang="ts">
	import Game from '$lib/components/Game.svelte';
</script>

<svelte:head>
	<title>Chad RPG - Medieval Adventure</title>
	<meta name="description" content="An immersive text-based RPG adventure powered by AI" />
</svelte:head>

<main>
	<Game />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: #0a0a0a;
		color: #ffffff;
		overflow-x: hidden;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	main {
		min-height: 100vh;
		width: 100%;
	}
</style>
