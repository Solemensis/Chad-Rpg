<script lang="ts">
	import { bgImage } from '../../stores.js'

	// function to get a random number from imgs.length

	// let time: string = ''
</script>

<!-- background images (out of ui)-->
<img
	class="fetched-bg"
	src={$bgImage.fetchedBg1}
	style="opacity:{$bgImage.img1active ? '1' : '0'}; transition:opacity 2s;"
	alt="view of the current place"
/>
<img
	class="fetched-bg"
	src={$bgImage.fetchedBg2}
	style="opacity:{$bgImage.img2active ? '1' : '0'}; transition:opacity 2s;"
	alt="view of the current place"
/>
<div
	class="main-bg"
	style="opacity:{!$bgImage.img1active && !$bgImage.img2active ? '1' : '0'}; transition:opacity 2s;"
/>

<!-- background images -->
<style>
	.main-bg {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -999;
		height: 100vh;
		background-image: url(/images/main-bg.webp);
		width: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
	}
	.fetched-bg {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -999;
		height: 100vh;
		width: 100%;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: cover;
		overflow: hidden;
	}
</style>
