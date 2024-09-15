<script lang="ts">
	import { misc } from '../../stores'
</script>

<div>
	<h2>Game's Open Back :)</h2>
	<!-- <h2 style="color:orangered;">Game's Closed Back Again.</h2>
	<ul>
		<li>
			Since the free PALM API is not as stable as the paid OpenAI models, I'm facing difficulties in
			obtaining precise JSON responses from PALM. It occasionally provides responses with a
			structure, but not consistently.
		</li>
		<li>I will investigate this further, considering prompt powerups and API parameters.</li>
		<li>
			PS: I have just gained access to the PALM API from waitlist, so I'm not very familiar with the
			personality of this LLM yet. It looks worse than unf. bard api. If anyone has experience with
			it, I would appreciate prompt suggestions/pr's.
		</li>
	</ul> -->

	<ul>
		<li>Current gemini model: gemini-1.5-flash</li>
	</ul>
	<button on:click={() => ($misc.maintenanceWindow = false)}>Okay</button>
	<span class="date">9th of september 2024</span>
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
		color: #aaa;
	}
	button {
		margin-top: 0.5rem;
		border-radius: 0.3rem;
		padding: 0.3rem 0.8rem;
		background-color: rgb(200, 82, 82);
		font-size: 0.9rem;
		cursor: pointer;
	}
</style>
