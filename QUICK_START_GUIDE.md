# Quick Start Guide: Refactoring Chad-RPG

This guide will help you start improving your codebase immediately with the highest-impact changes.

## 📋 Recommended Implementation Order

Follow this order for the smoothest refactoring experience:

1. **Create Constants File** (30 min) ⭐ START HERE
2. **Extract Item Tooltip Utility** (1 hour)
3. **Create Combat Service** (2 hours)
4. **Fix TypeScript `any` Types** (ongoing, file by file)
5. **Split Misc Store** (2-3 hours)
6. **Create Shared Components** (1-2 hours per component)

**Why this order?**
- Constants are easy and give immediate value
- Utilities reduce duplication without breaking things
- Services are needed before fixing types (so you know what types to use)
- Store refactoring affects many files, so do it when you're comfortable
- Shared components come last as they depend on everything else being stable

---

## 🎯 Quick Wins (1-2 hours each)

### 1. Create Constants File (30 minutes)

**Create:** `src/lib/config/constants.ts`

```typescript
export const COMBAT_TIERS = {
    POOR: { min: 1, max: 20 },
    DECENT: { min: 20, max: 50 },
    GREAT: { min: 50, max: 85 },
    EPIC: { min: 85, max: Infinity }
} as const;

export const SHOP_TYPES = {
    WEAPONSMITH: 'Weaponsmith',
    SPELL_SHOP: 'Spell Shop',
    POTION_SHOP: 'Potion Shop',
    MERCHANT: 'Merchant'
} as const;

export const DICE_SIDES = {
    WEAPON: 20,
    SPELL: 23
} as const;

export const STARTING_VALUES = {
    GOLD: 30,
    INTERACTIVE_POINTS: 50
} as const;

export const CHARACTER_CLASSES = {
    MAGE: {
        hp: 80,
        maxHp: 80,
        mp: 110,
        maxMp: 110
    },
    WARRIOR: {
        hp: 110,
        maxHp: 110,
        mp: 80,
        maxMp: 80
    }
} as const;
```

**Then find and replace all magic numbers in your code:**

```typescript
// Before
if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 20)

// After
import { COMBAT_TIERS } from '$lib/config/constants';
if ($selectedItem.combatScore >= COMBAT_TIERS.POOR.min && 
    $selectedItem.combatScore < COMBAT_TIERS.POOR.max)
```

---

### 2. Extract Item Description Utility (1 hour)

**Create:** `src/lib/utils/itemTooltip.ts`

```typescript
import type { InventoryItem, DescriptionWindow } from '$lib/types/game';
import type { Writable } from 'svelte/store';

interface TooltipState {
    showDescription: string;
    x: number;
    y: number;
}

export function showItemTooltip(
    event: MouseEvent,
    item: InventoryItem,
    descWindow: Writable<DescriptionWindow>,
    misc: Writable<TooltipState>
) {
    misc.update(state => ({
        ...state,
        showDescription: 'block',
        x: event.clientX + 10,
        y: event.clientY - 40
    }));
    
    descWindow.set({
        name: item.name,
        damage: 'damage' in item ? item.damage : undefined,
        type: item.type,
        healing: 'healing' in item ? item.healing : undefined,
        mana: 'mana' in item ? item.mana : undefined,
        point: 'point' in item ? item.point : undefined,
        armor: 'armor' in item ? item.armor : undefined,
        element: 'element' in item ? item.element : undefined,
        weaponClass: 'weaponClass' in item ? item.weaponClass : undefined,
        manaCost: 'manaCost' in item ? item.manaCost : undefined,
        price: item.price,
        amount: item.amount
    });
}

export function hideItemTooltip(misc: Writable<TooltipState>) {
    misc.update(state => ({
        ...state,
        showDescription: 'none'
    }));
}
```

**Update ActionBox.svelte and ShopUI.svelte:**

```typescript
import { showItemTooltip, hideItemTooltip } from '$lib/utils/itemTooltip';

// Replace the 44-line handleMouseMove function with:
function handleMouseMove(event: MouseEvent, item: InventoryItem) {
    showItemTooltip(event, item, descWindow, misc);
}

function hideWindow() {
    hideItemTooltip(misc);
}
```

---

### 3. Create Combat Service (2 hours)

**Create:** `src/lib/services/combatService.ts`

```typescript
import type { InventoryItem, Enemy } from '$lib/types/game';
import { COMBAT_TIERS, DICE_SIDES } from '$lib/config/constants';

export interface CombatResult {
    combatScore: number;
    prompt: string;
    playerDamage: number;
    enemyDamage: number;
}

export class CombatService {
    static calculateCombatScore(damage: number, itemType: string, diceRoll: number): number {
        const diceSides = itemType.includes('spell') ? DICE_SIDES.SPELL : DICE_SIDES.WEAPON;
        return Math.floor((damage * diceRoll) / diceSides);
    }

    static generateCombatAction(
        item: InventoryItem,
        diceRoll: number,
        enemy: Enemy
    ): CombatResult {
        const itemType = item.type;
        const damage = 'damage' in item ? item.damage : 0;
        
        const combatScore = this.calculateCombatScore(damage, itemType, diceRoll);
        const tier = this.determineTier(combatScore);
        
        const enemyDamage = combatScore;
        const playerDamage = this.calculatePlayerDamage(enemy, diceRoll);
        const isVictory = enemy.enemyHp ? enemy.enemyHp <= enemyDamage : false;
        
        return {
            combatScore,
            prompt: this.generatePrompt(item.name, tier, isVictory),
            playerDamage,
            enemyDamage
        };
    }

    private static determineTier(score: number): keyof typeof COMBAT_TIERS {
        if (score >= COMBAT_TIERS.EPIC.min) return 'EPIC';
        if (score >= COMBAT_TIERS.GREAT.min) return 'GREAT';
        if (score >= COMBAT_TIERS.DECENT.min) return 'DECENT';
        return 'POOR';
    }

    private static calculatePlayerDamage(enemy: Enemy, diceRoll: number): number {
        if (!enemy.enemyHp) return 5;
        
        const divisor = diceRoll === 1 ? 2 : diceRoll;
        return Math.floor(enemy.enemyHp / divisor);
    }

    private static generatePrompt(weaponName: string, tier: string, isVictory: boolean): string {
        if (isVictory) {
            return `Attack with ${weaponName}! (this blow destroys the enemy and ends the combat successfully!)`;
        }

        const prompts = {
            POOR: `Attack with ${weaponName}! (give hard times to player in gameData.story, where player lands the worst possible attack, which leads to player receiving damage but giving a little damage back at least. Combat goes on.)`,
            DECENT: `Attack with ${weaponName}! (give a mediocre gameData.story, where player lands a decent attack, which leads to player giving some damage to enemy but taking some damage back. Combat goes on.)`,
            GREAT: `Attack with ${weaponName}! (give a great gameData.story where player lands a powerful attack, giving great damage but receiving some little damage back. Combat goes on.)`,
            EPIC: `Attack with ${weaponName}! (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy and winning the combat.)`
        };

        return prompts[tier as keyof typeof prompts];
    }
}
```

**Update ActionBox.svelte:**

```typescript
import { CombatService } from '$lib/services/combatService';

// Replace the massive useItem function with:
function useItem(item: InventoryItem) {
    if (item.type === 'weapon' || item.type === 'destruction spell') {
        const result = CombatService.generateCombatAction(
            item,
            $misc.diceNumber,
            $game.gameData.enemy
        );
        
        $selectedItem = {
            name: item.name,
            damage: 'damage' in item ? item.damage : undefined,
            combatScore: result.combatScore,
            prompt: result.prompt
        };
    }
    // ... other item types
}
```

---

## 🔧 Type Safety Quick Fixes

### Fix 1: Replace `any` in Event Handlers

**Before:**
```typescript
function emitAnswer(answer: any) {
    dispatch('emittedAnswer', { answer });
}
```

**After:**
```typescript
function emitAnswer(answer: string) {
    dispatch('emittedAnswer', { answer });
}
```

### Fix 2: Type Component Props

**Before:**
```typescript
export let title: any;
export let actions: any;
```

**After:**
```typescript
import type { InventoryItem } from '$lib/types/game';

export let title: string;
export let actions: InventoryItem[];
```

### Fix 3: Type Event Handlers

**Create:** `src/lib/types/events.ts`

```typescript
export interface EmittedAnswerEvent {
    detail: {
        answer: string;
    };
}
```

**Use in components:**
```typescript
import type { EmittedAnswerEvent } from '$lib/types/events';

function handleEmittedAnswer(event: EmittedAnswerEvent) {
    giveAnswer(event.detail.answer);
}
```

---

## 📦 File Organization Improvements

### Current Problems
- `Game.svelte` is 442 lines
- `ActionBox.svelte` is 550 lines
- Logic mixed with UI

### Solution: Extract Sub-Components

**Create:** `src/lib/components/Game/GameController.svelte`

Move all game logic from `Game.svelte`:

```typescript
<script lang="ts">
    import { game, character, misc } from '$lib/stores';
    import { GameService } from '$lib/services/gameService';
    
    export let onGameUpdate: (data: any) => void;
    
    async function handleSubmit(query: string) {
        misc.update(state => ({ ...state, loading: true }));
        
        try {
            const gameData = await GameService.sendGameRequest(query);
            onGameUpdate(gameData);
        } catch (error) {
            console.error('Game error:', error);
        } finally {
            misc.update(state => ({ ...state, loading: false }));
        }
    }
</script>

<slot {handleSubmit} />
```

---

## ✅ Testing Your Refactoring

After each change, verify:

1. **Game still works** - Play through a combat
2. **No TypeScript errors** - Run `npm run check`
3. **No console errors** - Check browser console
4. **State persists** - Make sure stores still work

---

## 📝 Checklist for Each Refactoring Session

- [ ] Create a git branch (`git checkout -b refactor/combat-service`)
- [ ] Make ONE type of change at a time
- [ ] Test after each file change
- [ ] Commit frequently (`git commit -m "Extract combat service"`)
- [ ] Run `npm run check` before committing
- [ ] Merge to main when working

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This
```typescript
// Changing too much at once
- Refactor all components
- Remove all stores
- Rewrite entire architecture
```

### ✅ Do This Instead
```typescript
// One small change at a time
1. Extract ONE utility function
2. Test it works
3. Use it in ONE component
4. Test that component
5. Gradually replace in other components
```

---

## 🎯 Your First Task (Start Here!)

1. **Create `src/lib/config/constants.ts`** (copy from above)
2. **Import in `ActionBox.svelte`**:
   ```typescript
   import { COMBAT_TIERS } from '$lib/config/constants';
   ```
3. **Replace ONE magic number**:
   ```typescript
   // Line 379 in ActionBox.svelte
   // Before:
   if ($selectedItem.combatScore >= 1 && $selectedItem.combatScore < 20)
   
   // After:
   if ($selectedItem.combatScore >= COMBAT_TIERS.POOR.min && 
       $selectedItem.combatScore < COMBAT_TIERS.POOR.max)
   ```
4. **Test the game**
5. **Replace the next magic number**
6. **Repeat until all numbers use constants**

---

## 📊 Progress Tracker

Track your refactoring progress:

```markdown
## Completed ✅
- [ ] Created constants file
- [ ] Extracted item tooltip utility
- [ ] Created combat service
- [ ] Removed `any` from ActionBox
- [ ] Removed `any` from Game
- [ ] Split misc store
- [ ] Added unit tests

## In Progress 🚧
- [ ] 

## Blocked ⛔
- [ ] 
```

---

## 🆘 Need Help?

If you get stuck:

1. **Check TypeScript errors**: Run `npm run check`
2. **Check browser console**: Look for runtime errors
3. **Read error messages**: They usually tell you what's wrong
4. **Revert if needed**: `git checkout -- <filename>`
5. **Ask for help**: Include the error message and what you tried

---

## 🎓 Learning Resources

- **TypeScript Generics**: Understanding `Writable<T>`
- **Svelte Stores**: How to update stores properly
- **Service Layer Pattern**: Why we separate logic
- **DRY Principle**: Don't Repeat Yourself

---

Good luck with your refactoring! Start small, test often, and commit frequently. 🚀
