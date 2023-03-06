<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
</script>

<div class="chat {type === 'user' ? 'ok' : 'chat-start'} justify-end">
	<div class="chat-bubble ">
		{message}
	</div>
</div>
