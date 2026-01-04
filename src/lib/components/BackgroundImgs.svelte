<script lang="ts">
	import { bgImage } from '../../stores'
</script>

<!-- Background Images Layer -->
<div class="bg-container">
	<!-- Default fallback background - always render, just behind -->
	<div class="bg-fallback" />

	<!-- Fetched backgrounds with crossfade -->
	{#if $bgImage.fetchedBg1}
		<img
			class="bg-image"
			src={$bgImage.fetchedBg1}
			style="opacity: {$bgImage.img1active ? '1' : '0'};"
			alt=""
		/>
	{/if}

	{#if $bgImage.fetchedBg2}
		<img
			class="bg-image"
			src={$bgImage.fetchedBg2}
			style="opacity: {$bgImage.img2active ? '1' : '0'};"
			alt=""
		/>
	{/if}

	<!-- Overlay gradient for better text readability -->
	<div class="bg-overlay" />
</div>

<style>
	.bg-container {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		background-color: #0a0a12;
	}

	.bg-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transition: opacity 2s ease;
	}

	.bg-fallback {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #0a0a12;
		background-image: url('/images/main-bg.webp');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.bg-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			180deg,
			rgba(0, 0, 0, 0.3) 0%,
			rgba(0, 0, 0, 0.1) 30%,
			rgba(0, 0, 0, 0.1) 70%,
			rgba(0, 0, 0, 0.5) 100%
		);
		pointer-events: none;
	}
</style>
