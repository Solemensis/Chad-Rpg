<script lang="ts">
	import { descWindow } from '../../stores'
	import { misc } from '../../stores'

	// let {name,damage,type,healing,armor,element,weaponClass,manaCost,price,amount}=$descWindow
</script>

<div
	class="description-window"
	style="left:{$misc.x}px; top:{$misc.y}px; display:{$misc.showDescription}"
>
	<h5 class="desc-name">{$descWindow.name}</h5>
	{#if $descWindow.damage}
		<p class="desc-all">damage: x{$descWindow.damage}</p>
	{/if}
	{#if $descWindow.healing && $descWindow.type == 'healing spell'}
		<p class="desc-all">healing: x{$descWindow.healing}</p>
	{/if}
	{#if $descWindow.healing && $descWindow.type == 'potion'}
		<p class="desc-all">healing: +{$descWindow.healing}</p>
	{/if}
	{#if $descWindow.mana && $descWindow.type == 'potion'}
		<p class="desc-all">mana: +{$descWindow.mana}</p>
	{/if}
	{#if $descWindow.point && $descWindow.type == 'potion'}
		<p class="desc-all">point: {$descWindow.point}</p>
	{/if}

	{#if $descWindow.armor}
		<p class="desc-all">armor: x{$descWindow.armor}</p>
	{/if}
	{#if $descWindow.element}
		<p class="desc-all">element: {$descWindow.element}</p>
	{/if}
	{#if $descWindow.weaponClass}
		<p class="desc-all">class: {$descWindow.weaponClass}</p>
	{/if}
	{#if $descWindow.type}
		<p class="desc-all">type: {$descWindow.type}</p>
	{/if}

	{#if $descWindow.price}
		<p class="desc-all">price: {$descWindow.price}</p>
	{/if}
	{#if $descWindow.amount}
		<p class="desc-all">amount: {$descWindow.amount}</p>
	{/if}
	{#if $descWindow.manaCost}
		<p class="desc-all">mana cost: -{$descWindow.manaCost}</p>
	{/if}
</div>

<style>
	.desc-name {
		color: orange;
		font-size: 1rem;
		font-weight: 500;
	}
	.desc-all {
		font-size: 0.9rem;
	}

	.description-window {
		position: absolute;
		min-width: 10rem;
		background-color: rgba(47, 47, 47, 0.766);
		padding: 0.4rem;
		border-radius: 0.5rem;
		z-index: 100;
		backdrop-filter: blur(2px);
	}
</style>
