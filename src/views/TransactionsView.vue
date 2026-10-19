<script setup lang="ts">
import { ref } from 'vue'
import type { Transaction, TransactionType } from '@/types/index'
import TransactionForm from '@/features/transactions/components/TransactionForm.vue'
import { useTransactions } from '@/features/transactions/composables/useTransactions'
import AppLayout from '@/components/ui/AppLayout.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/dateFormatter'
import { 
  Wallet, LayoutDashboard, ArrowLeftRight, PieChart, 
  Plus, Search, Trash2, Edit3, X, ChevronDown, Menu 
} from 'lucide-vue-next'

const { 
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
  handleSaveTransaction,
  deleteTransaction,
  bulkDeleteTransactions
} = useTransactions()

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isMobileMenuOpen = ref(false)
const editingId = ref<string | number | null>(null)
const editingTransaction = ref<Transaction | null>(null)
const deletingId = ref<string | number | null>(null)

// Alert States
const showAlert = ref(false)
const alertMessage = ref('Transaction added')

const onSaveTransaction = (txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }) => {
  const isEditing = editingId.value !== null
  handleSaveTransaction(editingId.value, txData)
  closeModal()
  //Set Time
  alertMessage.value = isEditing ? 'Transaction updated' : 'Transaction added'
  showAlert.value = true
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
}

const openEdit = (tx: Transaction) => {
  editingId.value = tx.id
  editingTransaction.value = tx
  showAddModal.value = true
}

const confirmDelete = (id: string | number) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const executeDelete = () => {
  if (deletingId.value !== null) {
    deleteTransaction(deletingId.value)
  }
  showDeleteModal.value = false
  deletingId.value = null
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  editingTransaction.value = null
}
</script>

<template>
  <AppLayout>
    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-pink-950/40 backdrop-blur-sm flex z-50 md:hidden">
      <div class="w-72 bg-pink-950 text-pink-200 p-6 flex flex-col justify-between shadow-2xl h-full">
        <div class="space-y-8">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-pink-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-600/40">
                <Wallet class="w-5 h-5" />
              </div>
              <div>
                <h2 class="font-bold text-white text-base tracking-wide">Expense Tracker</h2>
                <p class="text-xs text-pink-300/80">Personal finance</p>
              </div>
            </div>
            <button @click="isMobileMenuOpen = false" class="p-2 text-pink-400 hover:text-white rounded-xl">
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="space-y-2" @click="isMobileMenuOpen = false">
            <router-link to="/" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all">
              <LayoutDashboard class="w-4 h-4" /> Dashboard
            </router-link>
            <router-link to="/transactions" class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/35 transition-all">
              <ArrowLeftRight class="w-4 h-4" /> Transactions
            </router-link>
            <router-link to="/budget" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all">
              <PieChart class="w-4 h-4" /> Budget
            </router-link>
          </nav>
        </div>
        <div class="text-xs text-pink-400/60 border-t border-pink-900/60 pt-4 px-1">
          Data is stored locally in your browser.
        </div>
      </div>
      <div class="flex-1" @click="isMobileMenuOpen = false"></div>
    </div>

    <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-6 w-full">
      <!-- Header with Hamburger Menu beside Title -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-3 bg-pink-950 text-white rounded-2xl shadow-md flex items-center justify-center">
            <Menu class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-pink-950">Transactions</h1>
            <p class="text-sm text-pink-700/70 mt-0.5 font-medium">{{ filteredTransactions.length }} of {{ transactions.length }} entries</p>
          </div>
        </div>

        <BaseButton variant="primary" @click="showAddModal = true" class="flex items-center gap-2">
          <Plus class="w-4 h-4" /> Add transaction
        </BaseButton>
      </div>

      <!-- Filters Section using BaseCard & BaseInput -->
      <BaseCard class="p-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-2">Search</label>
            <BaseInput v-model="searchQuery" type="text" placeholder="Search notes..." />
          </div>

          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-2">Type</label>
            <div class="relative">
              <select v-model="selectedType" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-500/15 focus:border-pink-500 outline-none text-sm font-medium transition-all appearance-none pr-10 cursor-pointer">
                <option value="All types">All types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <ChevronDown class="w-4 h-4 text-pink-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-2">Category</label>
            <div class="relative">
              <select v-model="selectedCategory" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-500/15 focus:border-pink-500 outline-none text-sm font-medium transition-all appearance-none pr-10 cursor-pointer">
                <option value="All categories">All categories</option>
                <option v-for="cat in filteredCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <ChevronDown class="w-4 h-4 text-pink-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-2">From Date</label>
            <input v-model="fromDate" type="date" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-500/15 focus:border-pink-500 outline-none text-sm font-medium transition-all cursor-pointer" />
          </div>

          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-2">To Date</label>
            <input v-model="toDate" type="date" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-pink-500/15 focus:border-pink-500 outline-none text-sm font-medium transition-all cursor-pointer" />
          </div>
        </div>

        <div class="pt-4 border-t border-pink-100 flex flex-wrap items-center justify-between gap-6 text-sm font-medium">
          <div class="flex items-center gap-6">
            <div>Income <span class="text-emerald-600 font-bold">{{ formatCurrency(totalIncome) }}</span></div>
            <div>Expenses <span class="text-rose-600 font-bold">{{ formatCurrency(totalExpenses) }}</span></div>
            <div>Balance <span class="text-pink-950 font-bold">{{ formatCurrency(balance) }}</span></div>
          </div>
          <button v-if="searchQuery || selectedType !== 'All types' || selectedCategory !== 'All categories' || fromDate || toDate" @click="clearFilters" class="text-xs text-pink-600 hover:text-pink-800 font-bold transition">Clear filters</button>
        </div>
      </BaseCard>

      <div v-if="selectedIds.length > 0" class="bg-pink-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-pink-600/20">
        <div class="flex items-center gap-3 text-sm font-semibold">
          <span class="bg-white/20 px-2.5 py-0.5 rounded-full text-xs">{{ selectedIds.length }} selected</span>
          <button @click="selectedIds = []; selectAll = false" class="text-xs text-pink-100 hover:text-white underline">Clear</button>
        </div>
        <BaseButton variant="danger" @click="bulkDeleteTransactions" class="bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition">
          <Trash2 class="w-3.5 h-3.5" /> Delete selected
        </BaseButton>
      </div>

      <!-- Transactions Table Section using BaseCard -->
      <BaseCard class="overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-pink-100 text-xs font-bold text-pink-800/50 uppercase tracking-wider bg-pink-50/40">
                <th class="p-4.5 w-12 text-center">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-pink-300 text-pink-600 focus:ring-pink-500 cursor-pointer w-4 h-4" />
                </th>
                <th class="p-4.5">Transaction</th>
                <th class="p-4.5">Category</th>
                <th class="p-4.5">Date</th>
                <th class="p-4.5">Note</th>
                <th class="p-4.5 text-right">Amount</th>
                <th class="p-4.5 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-pink-100 text-sm font-medium">
              <tr v-if="paginatedTransactions.length === 0">
                <td colspan="7" class="p-16 text-center text-pink-400 font-normal">No transactions found.</td>
              </tr>
              <tr v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-pink-50/60 transition-colors">
                <td class="p-4.5 text-center">
                  <input type="checkbox" :value="tx.id" v-model="selectedIds" class="rounded border-pink-300 text-pink-600 focus:ring-pink-500 cursor-pointer w-4 h-4" />
                </td>
                <td class="p-4.5 font-bold" :class="tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ tx.type }}
                </td>
                <td class="p-4.5 text-slate-700">{{ tx.category }}</td>
                <td class="p-4.5 text-slate-500">{{ formatDate(tx.date) }}</td>
                <td class="p-4.5 text-slate-500">{{ tx.note }}</td>
                <td class="p-4.5 text-right font-bold" :class="tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ tx.type === 'Income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </td>
                <td class="p-4.5 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="openEdit(tx)" class="p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition">
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button @click="confirmDelete(tx.id)" class="p-2 text-pink-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-5 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-pink-900/60 bg-pink-50/30">
          <div class="font-medium">
            Showing {{ paginatedTransactions.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }} - {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }}
          </div>

          <div class="flex items-center gap-4">
            <select v-model="itemsPerPage" class="bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer">
              <option :value="5">5 per page</option>
              <option :value="10">10 per page</option>
            </select>

            <div class="flex items-center gap-1.5">
              <BaseButton variant="secondary" @click="currentPage--" :disabled="currentPage === 1" class="px-3.5 py-1.5 text-xs">Prev</BaseButton>
              <span class="px-2.5 text-xs font-bold text-pink-950">{{ currentPage }} / {{ totalPages }}</span>
              <BaseButton variant="secondary" @click="currentPage++" :disabled="currentPage >= totalPages" class="px-3.5 py-1.5 text-xs">Next</BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </main>

    <!-- Add/Edit Modal (Refactored with BaseModal) -->
    <BaseModal :show="showAddModal" :title="editingId ? 'Edit transaction' : 'Add transaction'" @close="closeModal">
      <TransactionForm :initialData="editingTransaction" @add-transaction="onSaveTransaction" @cancel="closeModal" />
    </BaseModal>

    <!-- Delete Confirmation Modal (Refactored with BaseModal & BaseButton) -->
    <BaseModal :show="showDeleteModal" title="Delete transaction" @close="showDeleteModal = false">
      <div class="space-y-5">
        <p class="text-sm text-pink-800/60 font-medium">Delete this item? This action cannot be undone.</p>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
          <BaseButton variant="danger" @click="executeDelete">Delete</BaseButton>
        </div>
      </div>
    </BaseModal>
  </AppLayout>

  <BaseAlert :show="showAlert" :message="alertMessage" @close="showAlert = false" />
</template>