// src/composables/useTransactions.ts
import { ref, computed, onMounted, watch } from 'vue'
import type { Transaction, TransactionType } from '@/types/index'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/index'

export function useTransactions() {
  const transactions = ref<Transaction[]>([])

  // Filter States
  const searchQuery = ref('')
  const selectedType = ref('All types')
  const selectedCategory = ref('All categories')
  const fromDate = ref('')
  const toDate = ref('')

  // Pagination & Selection States
  const itemsPerPage = ref(5)
  const currentPage = ref(1)
  const selectedIds = ref<(string | number)[]>([])
  const selectAll = ref(false)

  onMounted(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      transactions.value = JSON.parse(saved)
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

  watch(transactions, (newVal) => {
    localStorage.setItem('transactions', JSON.stringify(newVal))
  }, { deep: true })

  // When Type changes in filter, reset selectedCategory to 'All categories'
  watch(selectedType, () => {
    selectedCategory.value = 'All categories'
  })

  const totalIncome = computed(() => {
    return transactions.value.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0)
  })

  const totalExpenses = computed(() => {
    return transactions.value.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0)
  })

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  // Dynamic Categories for Filter Dropdown in TransactionsView
  const filteredCategories = computed(() => {
    if (selectedType.value === 'Expense') {
      return [...EXPENSE_CATEGORIES]
    } else if (selectedType.value === 'Income') {
      return [...INCOME_CATEGORIES]
    }
    return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
  })

  // Filtered Transactions Logic
  const filteredTransactions = computed(() => {
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

  // Pagination Computed Logic
  const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value) || 1)
  
  const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredTransactions.value.slice(start, start + itemsPerPage.value)//end 
  })

  const clearFilters = () => {
    searchQuery.value = ''
    selectedType.value = 'All types'
    selectedCategory.value = 'All categories'
    fromDate.value = ''
    toDate.value = ''
  }

  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedIds.value = paginatedTransactions.value.map(t => t.id)
    } else {
      selectedIds.value = []
    }
  }
  //Add Transaction
  const addTransaction = (txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }) => {
    const newTx: Transaction = {
      id: Date.now(),
      ...txData
    }
    transactions.value.unshift(newTx)
  }

  const updateTransaction = (id: string | number, txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }) => {
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
  ) => {
    if (editingId !== null) {
      updateTransaction(editingId, txData)
    } else {
      addTransaction(txData)
    }
  }

  const deleteTransaction = (id: string | number) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const bulkDeleteTransactions = () => {
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