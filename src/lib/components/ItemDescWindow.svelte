<script lang="ts">
	import { descWindow } from '../../stores'
	import { misc } from '../../stores'
</script>

{#if $misc.showDescription === 'block'}
	<div class="tooltip" style="left: {$misc.x}px; top: {$misc.y}px;">
		<h5 class="tooltip-name">{$descWindow.name}</h5>

		<div class="tooltip-stats">
			{#if $descWindow.damage}
				<p class="stat damage">⚔️ Damage: x{$descWindow.damage}</p>
			{/if}
			{#if $descWindow.healing && $descWindow.type === 'healing spell'}
				<p class="stat healing">💚 Healing: x{$descWindow.healing}</p>
			{/if}
			{#if $descWindow.healing && $descWindow.type === 'potion'}
				<p class="stat healing">💚 Healing: +{$descWindow.healing}</p>
			{/if}
			{#if $descWindow.mana && $descWindow.type === 'potion'}
				<p class="stat mana">💙 Mana: +{$descWindow.mana}</p>
			{/if}
			{#if $descWindow.point && $descWindow.type === 'potion'}
				<p class="stat">⭐ Points: {$descWindow.point}</p>
			{/if}
			{#if $descWindow.armor}
				<p class="stat">🛡️ Armor: x{$descWindow.armor}</p>
			{/if}
			{#if $descWindow.element}
				<p class="stat element">✨ Element: {$descWindow.element}</p>
			{/if}
			{#if $descWindow.weaponClass}
				<p class="stat">🗡️ Class: {$descWindow.weaponClass}</p>
			{/if}
			{#if $descWindow.manaCost}
				<p class="stat mana-cost">💧 Mana Cost: -{$descWindow.manaCost}</p>
			{/if}
		</div>

		<div class="tooltip-footer">
			{#if $descWindow.type}
				<span class="type-badge">{$descWindow.type}</span>
			{/if}
			{#if $descWindow.price}
				<span class="price">🪙 {$descWindow.price}</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.tooltip {
		position: fixed;
		min-width: 160px;
		max-width: 240px;
		background: var(--color-bg-card); /* Updated to match glass theme */
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		z-index: 9999;
		pointer-events: none;
		box-shadow: var(--shadow-lg);
	}

	.tooltip-name {
		margin: 0 0 var(--space-xs) 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-accent-gold);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--space-xs);
	}

	.tooltip-stats {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.stat.damage {
		color: var(--color-accent-hp);
	}
	.stat.healing {
		color: var(--color-accent-secondary);
	}
	.stat.mana {
		color: var(--color-accent-mp);
	}
	.stat.mana-cost {
		color: #8eb4ff;
	}
	.stat.element {
		color: var(--color-accent-primary);
	}

	.tooltip-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--space-xs);
		padding-top: var(--space-xs);
		border-top: 1px solid var(--color-border);
		gap: var(--space-sm);
	}

	.type-badge {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		background: rgba(255, 255, 255, 0.05);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.price {
		font-size: 0.75rem;
		color: var(--color-accent-gold);
		font-weight: 500;
	}
</style>
