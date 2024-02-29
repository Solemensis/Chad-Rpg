<script lang="ts">
	import { game } from '../../../stores'
	import { misc } from '../../../stores'

	import { fade } from 'svelte/transition'

	function restartGame() {
		$misc.death = false
		$misc.started = false 
	}
</script>

{#if !$misc.loading}
	<div transition:fade={{ duration: 2000 }} class="death">
		<div class="death-box">
			<h3 class="you-died">You Died.</h3>
			<button on:click={() => restartGame()} class="new-game">Start a New Game!</button>
		</div>
	</div>
{/if}

<style>
	.death {
		min-height: 36.9%;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		width: 100%;
		height: 100%;
		margin-inline: auto;
		gap: 1rem;
		backdrop-filter: blur(2px);
	}
	.death-box {
		background-color: rgba(31, 31, 31, 0.841);
		border-radius: 0.5rem;
		height: 100%;
	}
	.you-died {
		position: absolute;
		top: 1.5rem;
		left: 50%;
		transform: translateX(-50%);

		font-size: 2rem;
		color: brown;
	}
	.new-game {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin-top: 2rem;
		font-size: 1.3rem;
		color: #3fcf8e;
		border: 3px solid rgba(121, 121, 121, 0.373);
		padding: 1rem;
		border-radius: 0.6rem;
		transition: 0.1s;

		cursor: pointer;
	}
	.new-game:hover {
		transform: translate(-50%, -50%) scale(0.97);
	}

	@media (orientation: portrait) {
		.death {
			min-height: 95%;
		}
		.death-box {
			display: flex;
			align-items: center;
			justify-content: space-around;
		}
		.you-died {
			position: relative;
			transform: none;
			top: 0;
			left: 0;
		}
		.new-game {
			position: relative;
			transform: none;
			top: 0;
			left: 0;
			margin: 0;
		}
	}
</style>
