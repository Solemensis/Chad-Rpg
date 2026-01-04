<script lang="ts">
	import { game } from '../../../stores'
	import { selectedItem } from '../../../stores'
	import { ui } from '../../../stores'
	import { descWindow } from '../../../stores'
	import { misc } from '../../../stores'

	import { fade, fly } from 'svelte/transition'

	function hideWindow() {
		$misc.showDescription = 'none'
	}

	function handleBuy(prompt: any, item: any) {
		if ($game.gameData.event.shopMode) {
			$selectedItem = {}
			$selectedItem = item
			$ui.buyWarnMsg = prompt
		}
	}

	function handleMouseMove(event: any, item: any) {
		$misc.showDescription = 'block'
		$misc.x = event.clientX + 10
		$misc.y = event.clientY - 40

		$descWindow.name = item?.name ?? undefined
		$descWindow.damage = item?.damage ?? undefined
		$descWindow.type = item?.type ?? undefined
		$descWindow.healing = item?.healing ?? undefined
		$descWindow.mana = item?.mana ?? undefined
		$descWindow.point = item?.point ?? undefined
		$descWindow.armor = item?.armor ?? undefined
		$descWindow.element = item?.element ?? undefined
		$descWindow.weaponClass = item?.weaponClass ?? undefined
		$descWindow.manaCost = item?.manaCost ?? undefined
		$descWindow.price = item?.price ?? undefined
		$descWindow.amount = item?.amount ?? undefined
	}

	function getShopName(mode: string): string {
		const modeMap: Record<string, string> = {
			weaponsmith: 'Weaponsmith',
			armorsmith: 'Armorsmith',
			'spell shop': 'Spell Shop',
			'potion shop': 'Potion Shop',
			market: 'Market',
			merchant: 'Merchant'
		}
		const lowerMode = mode?.toLowerCase() || ''
		return modeMap[lowerMode] || 'Merchant'
	}
</script>

<div class="shop-panel" in:fly={{ y: 20, duration: 400 }}>
	<!-- Shop Header -->
	<div class="shop-header">
		<span class="shop-icon">🏪</span>
		<h3>
			You're at a local
			<span class="shop-name">{getShopName($game.gameData.event.shopMode)}</span>
		</h3>
	</div>

	<!-- Shop Items Grid -->
	{#if $game.gameData.shop?.length}
		<div class="shop-items">
			{#each $game.gameData.shop as buyable, i}
				<button
					class="shop-item-btn"
					on:click={() => handleBuy(`Do you wanna buy ${buyable.name}?`, buyable)}
					on:mouseenter={(e) => handleMouseMove(e, buyable)}
					on:mousemove={(e) => handleMouseMove(e, buyable)}
					on:mouseleave={hideWindow}
					in:fade={{ duration: 200, delay: i * 50 }}
				>
					{#if buyable.type === 'weapon'}
						<img class="item-icon" src="images/{buyable.weaponClass}.svg" alt={buyable.name} />
					{:else if buyable.type === 'potion'}
						<img class="item-icon" src="images/potion.svg" alt={buyable.name} />
					{:else if buyable.element}
						<img class="item-icon" src="images/{buyable.element}.svg" alt={buyable.name} />
					{:else}
						<img class="item-icon" src="images/item.svg" alt={buyable.name} />
					{/if}

					<!-- Price Tag -->
					<span class="price-tag">🪙 {buyable.price || '?'}</span>
				</button>
			{/each}
		</div>
	{:else}
		<p class="empty-shop">No items available</p>
	{/if}
</div>

<style>
	.shop-panel {
		background: var(--color-bg-card);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl) var(--space-md); /* More top/bottom padding */
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}

	.shop-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}

	.shop-icon {
		font-size: 1.2rem;
	}

	.shop-header h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 400;
		color: var(--color-text-secondary);
		text-align: center;
	}

	.shop-name {
		color: var(--color-accent-secondary);
		font-weight: 500;
	}

	.shop-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		justify-content: center;
	}

	.shop-item-btn {
		position: relative;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-md);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		overflow: visible;
	}

	.shop-item-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-accent-secondary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(63, 207, 142, 0.2);
	}

	.item-icon {
		width: 60%;
		height: 60%;
		object-fit: contain;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		pointer-events: none;
	}

	.price-tag {
		position: absolute;
		bottom: -8px;
		right: -8px;
		font-size: 0.6rem;
		background: var(--color-bg-dark);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 2px 6px;
		color: var(--color-accent-gold);
		white-space: nowrap;
	}

	.empty-shop {
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		padding: var(--space-md);
	}

	/* Responsive */
	@media (max-width: 480px) {
		.shop-item-btn {
			width: 48px;
			height: 48px;
		}

		.shop-header h3 {
			font-size: 0.85rem;
		}
	}
</style>
