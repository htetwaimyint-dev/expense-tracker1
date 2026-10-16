import { ref, computed, onMounted, watch } from 'vue'
import type { Transaction, TransactionType } from '@/types/index'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/index'

export function useTransactions() {
  const transactions = ref<Transaction[]>([])

  const searchQuery = ref('')
  const selectedType = ref('All types')
  const selectedCategory = ref('All categories')
  const fromDate = ref('')
  const toDate = ref('')

  const itemsPerPage = ref(5)
  const currentPage = ref(1)
  const selectedIds = ref<(string | number)[]>([])
  const selectAll = ref(false)

  onMounted(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          transactions.value = parsed
        }
      } catch (error) {
        console.error('Failed to parse transactions from localStorage:', error)
      }
    } else {
      transactions.value = [
        { id: 1, type: 'Expense', amount: 5000, category: 'Food', date: '2026-09-30', note: 'gym' },
        { id: 2, type: 'Income', amount: 400000, category: 'Investment', date: '2026-09-30', note: 'dividend' },
        { id: 3, type: 'Expense', amount: 5000, category: 'Transport', date: '2026-09-30', note: 'taxi' },
        { id: 4, type: 'Expense', amount: 130000, category: 'Shopping', date: '2026-09-30', note: 'groceries' },
        { id: 5, type: 'Income', amount: 200000, category: 'Freelance', date: '2026-09-30', note: 'project' }
      ]
    }
  })

  watch(
    transactions,
    (newVal) => {
      try {
        localStorage.setItem('transactions', JSON.stringify(newVal))
      } catch (error) {
        console.error('Failed to persist transactions:', error)
      }
    },
    { deep: true }
  )

  watch([selectedType, searchQuery, selectedCategory, fromDate, toDate, itemsPerPage], () => {
    if (selectedType.value === 'Expense' && !EXPENSE_CATEGORIES.includes(selectedCategory.value as any)) {
      selectedCategory.value = 'All categories'
    } else if (selectedType.value === 'Income' && !INCOME_CATEGORIES.includes(selectedCategory.value as any)) {
      selectedCategory.value = 'All categories'
    }
    currentPage.value = 1
  })

  const totalIncome = computed<number>(() => {
    return transactions.value.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0)
  })

  const totalExpenses = computed<number>(() => {
    return transactions.value.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0)
  })

  const balance = computed<number>(() => totalIncome.value - totalExpenses.value)

  const filteredCategories = computed<string[]>(() => {
    if (selectedType.value === 'Expense') {
      return [...EXPENSE_CATEGORIES]
    } else if (selectedType.value === 'Income') {
      return [...INCOME_CATEGORIES]
    }
    return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  })

  const filteredTransactions = computed<Transaction[]>(() => {
    return transactions.value.filter(tx => {
      const matchesSearch = 
        tx.note?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        tx.date.includes(searchQuery.value)

      const matchesType = selectedType.value === 'All types' || tx.type === selectedType.value
      const matchesCategory = selectedCategory.value === 'All categories' || tx.category === selectedCategory.value

      let matchesDate = true
      if (fromDate.value && tx.date < fromDate.value) matchesDate = false
      if (toDate.value && tx.date > toDate.value) matchesDate = false

      return matchesSearch && matchesType && matchesCategory && matchesDate
    })
  })

  const totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(filteredTransactions.value.length / itemsPerPage.value))
  })

  watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages) {
      currentPage.value = newTotalPages
    }
  })

  const paginatedTransactions = computed<Transaction[]>(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredTransactions.value.slice(start, start + itemsPerPage.value)
  })

  const clearFilters = (): void => {
    searchQuery.value = ''
    selectedType.value = 'All types'
    selectedCategory.value = 'All categories'
    fromDate.value = ''
    toDate.value = ''
    currentPage.value = 1
  }

  const toggleSelectAll = (): void => {
    if (selectAll.value) {
      selectedIds.value = paginatedTransactions.value.map(t => t.id)
    } else {
      selectedIds.value = []
    }
  }

  const addTransaction = (txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }): void => {
    const newTx: Transaction = {
      id: Date.now(),
      ...txData
    }
    transactions.value.unshift(newTx)
  }

  const updateTransaction = (id: string | number, txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }): void => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = {
        id,
        ...txData
      }
    }
  }

  const handleSaveTransaction = (
    editingId: string | number | null, 
    txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }
  ): void => {
    if (editingId !== null) {
      updateTransaction(editingId, txData)
    } else {
      addTransaction(txData)
    }
  }

  const deleteTransaction = (id: string | number): void => {
    transactions.value = transactions.value.filter(t => t.id !== id)
    selectedIds.value = selectedIds.value.filter(selectedId => selectedId !== id)
  }

  const bulkDeleteTransactions = (): void => {
    transactions.value = transactions.value.filter(t => !selectedIds.value.includes(t.id))
    selectedIds.value = []
    selectAll.value = false
  }

  return {
    transactions,
    totalIncome,
    totalExpenses,
    balance,
    searchQuery,
    selectedType,
    selectedCategory,
    fromDate,
    toDate,
    itemsPerPage,
    currentPage,
    selectedIds,
    selectAll,
    filteredTransactions,
    filteredCategories,
    totalPages,
    paginatedTransactions,
    clearFilters,
    toggleSelectAll,
    addTransaction,
    updateTransaction,
    handleSaveTransaction,
    deleteTransaction,
    bulkDeleteTransactions
  }
}