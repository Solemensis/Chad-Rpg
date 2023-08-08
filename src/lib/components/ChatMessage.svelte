<script lang="ts">
	export let message: string
	import { fade } from 'svelte/transition'
</script>

<div>
	<div class="dotty" transition:fade={{ duration: 400 }}>
		{message}
	</div>
</div>

<style>
	.dotty {
		position: absolute;
		top: 0;
	}
</style>
