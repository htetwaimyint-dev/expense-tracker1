import { ref, computed, onMounted, watch, type Ref } from 'vue'
import type { Budget, Transaction } from '@/types/index'

export function useBudgets(transactionsRef: Ref<Transaction[]>) {
  const budgets = ref<Budget[]>([])

  onMounted(() => {
    const saved = localStorage.getItem('budgets')
    if (saved) {
      try {
        budgets.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse budgets from localStorage', e)
      }
    }
  })

  watch(
    budgets,
    (newVal) => {
      localStorage.setItem('budgets', JSON.stringify(newVal))
    },
    { deep: true }
  )

  const categorySpentMap = computed(() => {
    const map = new Map<string, number>()
    for (const tx of transactionsRef.value) {
      if (tx.type === 'Expense') {
        const current = map.get(tx.category) || 0
        map.set(tx.category, current + tx.amount)
      }
    }
    return map
  })

  const totalBudget = computed(() => {
    return budgets.value.reduce((sum, b) => sum + b.limitAmount, 0)
  })

  const totalSpent = computed(() => {
    const spentMap = categorySpentMap.value
    return budgets.value.reduce((sum, b) => sum + (spentMap.get(b.category) || 0), 0)
  })

  const remainingBudget = computed(() => {
    return totalBudget.value - totalSpent.value
  })

  const overBudgetCount = computed(() => {
    const spentMap = categorySpentMap.value
    return budgets.value.filter(b => {
      const spent = spentMap.get(b.category) || 0
      return spent > b.limitAmount
    }).length
  })

  const getCategorySpent = (category: string): number => {
    return categorySpentMap.value.get(category) || 0
  }

  const getCategoryPercentage = (spent: number, limit: number): number => {
    if (!limit || limit <= 0) return 0
    const percentage = Math.round((spent / limit) * 100)
    return Math.min(percentage, 100)
  }

  const saveBudget = (budgetData: Budget) => {
    const index = budgets.value.findIndex(b => b.category === budgetData.category)
    if (index !== -1) {
      budgets.value[index] = { ...budgetData }
    } else {
      budgets.value.push({ ...budgetData })
    }
  }

  const deleteBudget = (category: string) => {
    budgets.value = budgets.value.filter(b => b.category !== category)
  }

  return {
    budgets,
    totalBudget,
    totalSpent,
    remainingBudget,
    overBudgetCount,
    getCategorySpent,
    getCategoryPercentage,
    saveBudget,
    deleteBudget
  }
}