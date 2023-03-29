<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();

    
    function emitAnswer(answer:any) {
		dispatch('emittedAnswer', {
			answer: answer
		});
	}

    let mapOn: any
</script>

<div> 
	<!--  map and places  -->

<div class="map-and-places">
    <button on:click={() => (mapOn = !mapOn)}>
        <img src="images/map-svgs/2.svg" alt="" />
    </button>
    {#if mapOn}
        <div class="places-to-go">
            <button
                on:click={() => emitAnswer("I'll go to nearest Woods.")}
                transition:fade={{ duration: 100 }}
                ><img src="images/landscape-svgs/1.svg" alt="" />
                <p transition:fade={{ duration: 100 }}>Woods</p></button
            >

            <button
                on:click={() => emitAnswer("I'll go to nearest Harbor.")}
                transition:fade={{ delay: 100, duration: 100 }}
                ><img src="images/landscape-svgs/2.svg" alt="" />
                <p transition:fade={{ delay: 100, duration: 100 }}>Harbor</p></button
            >

            <button
                on:click={() => emitAnswer("I'll go to nearest Town.")}
                transition:fade={{ delay: 200, duration: 100 }}
                ><img src="images/landscape-svgs/3.svg" alt="" />
                <p transition:fade={{ delay: 200, duration: 100 }}>Town</p></button
            >
        </div>
    {/if}
</div>

<!--  game info button  -->

<img class="game-info-button" src="images/info.svg" alt="" />

</div>

<style>

/* map and places */
.map-and-places {
		position: absolute;
		left: 1.5rem;
		top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.map-and-places button {
		cursor: pointer;
	}
	.map-and-places img {
		width: 3.5rem;
	}
	.map-and-places button:active{
		animation: button-pop 0.3s ease-out;
	}
	

	.places-to-go {
		display: grid;
		grid-template-columns: 1fr;
		align-items: center;
		gap: 0.7rem;
	}

/* game info button */
.game-info-button {
		cursor: pointer;
		position: absolute;
		width: 3.5rem;
		right: 1.5rem;
		bottom: 1.5rem;
	}
    </style>