<script lang="ts">
	import { misc } from '../../stores'
</script>

<div>
	<!-- <h2>Game's Open Back Again</h2> -->
	<h2 style="color:orangered;">Game's Closed Back Again</h2>
	<h4>
		As the free unofficial bard api is unstable. Will be opened again later for sure, and closed!?
	</h4>
	<!-- <h4>
		But free bard API is not responding stable sometimes as it is an experiment ai. I'll try to
		minimize bugs by game prompt and error handling but ultimate solution is a stable chat api. So
		don't take your games so seriously for now, as it may get stuck at the most enjoyable moment.
	</h4>

	<ul>
		<li>
			Game carried from chatgpt to bard's unofficial free api, not the best chatbot solution but
			only free solution i've found for now.
		</li>
		<li>
			Sadly, creating a save system is not possible without a stable chat api, So only <span
				style="color:pink">quick games</span
			>
			can be played for now.
		</li>
		<li>PR's - ideas are all welcome! (Especially in game prompt.)</li>
		<li>You can share me the bugs u've encountered.</li>
	</ul>
	<button on:click={() => ($misc.maintenanceWindow = false)}>Okay</button>
	<span class="date">9th of august 2023</span> -->
	<span class="date">13th of august 2023</span>
</div>

<style>
	.date {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
	}
	h2 {
		margin-bottom: 1rem;
		color: rgb(142, 255, 140);
		font-weight: 500;
		font-size: 2rem;
	}
	h4 {
		margin-bottom: 2rem;
		font-weight: 400;
		font-size: 1.3rem;
		color: #eee;
	}
	ul {
		list-style: circle;
	}
	ul li {
		margin-bottom: 1rem;
		font-size: 1.2rem;
		text-align: start;
		color: #ddd;
	}
	button {
		margin-top: 0.5rem;
		border-radius: 0.3rem;
		padding: 0.3rem 0.8rem;
		background-color: rgb(255, 82, 82);
		cursor: pointer;
	}
</style>
