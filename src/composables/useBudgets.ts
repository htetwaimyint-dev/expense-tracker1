import { ref, computed, onMounted, watch } from 'vue'
import type { Budget } from '@/types/index'
import { EXPENSE_CATEGORIES } from '@/types/index'

export function useBudgets(transactions: any[]) {
  const budgets = ref<Budget[]>([])

  // Load from LocalStorage
  onMounted(() => {
    const saved = localStorage.getItem('budgets')
    if (saved) {
      budgets.value = JSON.parse(saved)
    }
  })

  // Save to LocalStorage
  watch(budgets, (newVal) => {
    localStorage.setItem('budgets', JSON.stringify(newVal))
  }, { deep: true })

  // Total Budget Amount
  const totalBudget = computed(() => {
    return budgets.value.reduce((sum, b) => sum + b.limitAmount, 0)
  })

  // Total Spent across budgeted categories
  const totalSpent = computed(() => {
    const budgetedCategories = budgets.value.map(b => b.category)
    return transactions
      .filter(t => t.type === 'Expense' && budgetedCategories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Remaining Budget
  const remainingBudget = computed(() => {
    return totalBudget.value - totalSpent.value
  })

  // Over-budget categories count
  const overBudgetCount = computed(() => {
    return budgets.value.filter(b => {
      const spent = transactions
        .filter(t => t.type === 'Expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0)
      return spent > b.limitAmount
    }).length
  })

  // Save or Add Budget
  const saveBudget = (budgetData: Budget) => {
    const index = budgets.value.findIndex(b => b.category === budgetData.category)
    if (index !== -1) {
      budgets.value[index] = budgetData
    } else {
      budgets.value.push(budgetData)
    }
  }

  // Delete Budget
  const deleteBudget = (category: string) => {
    budgets.value = budgets.value.filter(b => b.category !== category)
  }

  return {
    budgets,
    totalBudget,
    totalSpent,
    remainingBudget,
    overBudgetCount,
    saveBudget,
    deleteBudget
  }
}