<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
	import { fade } from 'svelte/transition'
</script>

<div>
	<div transition:fade={{ duration: 1200 }}>
		{message}
	</div>
</div>
