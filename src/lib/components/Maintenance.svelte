<script lang="ts">
	import { misc } from '../../stores'
</script>

<div>
	<!-- <h2>Game's Open Back Again</h2> -->
	<h2 style="color:orangered;">Game's Closed Back Again.</h2>
	<ul>
		<li>
			Since the free PALM API is not as stable as the paid OpenAI models, I'm facing difficulties in
			obtaining precise JSON responses from PALM. It occasionally provides responses with a
			structure, but not consistently.
		</li>
		<li>I will investigate this further, considering prompt powerups and API parameters.</li>
		<li>
			PS: I have just gained access to the PALM API from waitlist, so I'm not very familiar with the
			personality of this LLM yet. If anyone has experience with it, I would appreciate prompt
			suggestions/pr's.
		</li>
	</ul>
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
	<span class="date">18th of august 2023</span>
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
