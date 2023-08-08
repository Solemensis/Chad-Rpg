<script lang="ts">
	import { misc } from '../../stores'
</script>

<div>
	<h2>Game is Open</h2>
	<!-- <h4>
		But bard API is not responding stable in this current day and hour, try some more time later
		please.
	</h4> -->
	<ul>
		<li>
			Game carried from chatgpt to google bard's unofficial free api, not the best chatbot solution
			but only free solution i've found for now.
		</li>
		<li>
			Sadly, creating a save system is not possible without a stable chat api, So only <span
				style="color:pink">quick games</span
			>
			can be played for now.
		</li>
		<li>Some bugs are there. Game can get stuck. I'll handle them.</li>
		<li>PR's - ideas are welcome!</li>
		<li>You can share me the bugs u've encountered.</li>
	</ul>
	<button on:click={() => ($misc.maintenanceWindow = false)}>Okay</button>
</div>

<style>
	h2 {
		margin-bottom: 0.5rem;
		color: rgb(142, 255, 140);
		font-weight: 500;
		font-size: 2.2rem;
	}
	h4 {
		margin-bottom: 2rem;
		font-weight: 500;
		font-size: 1.3rem;
	}
	ul {
		list-style: circle;
	}
	ul li {
		margin-bottom: 1.5rem;
		font-size: 1.2rem;
		text-align: start;
	}
	button {
		margin-top: 0.5rem;
		border-radius: 0.3rem;
		padding: 0.3rem 0.8rem;
		background-color: rgb(255, 82, 82);
		cursor: pointer;
	}
</style>
