<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '@/features/transactions/composables/useTransactions'
import { useBudgets } from '@/features/budgets/composables/useBudgets'
import BudgetForm from '@/features/budgets/components/BudgetForm.vue'
import { EXPENSE_CATEGORIES } from '@/types/index'
import AppLayout from '@/components/ui/AppLayout.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { formatCurrency } from '@/utils/formatCurrency'
import { 
  Wallet, LayoutDashboard, ArrowLeftRight, PieChart, 
  Plus, Target, TrendingDown, AlertTriangle, Pencil, Trash2, X, Coins, Menu 
} from 'lucide-vue-next'

const { transactions } = useTransactions()
const { 
  budgets, 
  totalBudget, 
  totalSpent, 
  remainingBudget, 
  overBudgetCount, 
  getCategorySpent,
  getCategoryPercentage,
  saveBudget, 
  deleteBudget 
} = useBudgets(transactions)

const showModal = ref(false)
const showDeleteModal = ref(false)
const deletingCategory = ref<string | null>(null)
const isMobileMenuOpen = ref(false)
const selectedCategory = ref<string>('')
const limitAmount = ref<number | ''>('')
const isEditing = ref(false)

// Alert States
const showAlert = ref(false)
const alertMessage = ref('Budget added')

const availableCategories = computed(() => {
  if (isEditing.value) {
    return EXPENSE_CATEGORIES
  }
  const existingCategories = new Set(budgets.value.map(b => b.category))
  return EXPENSE_CATEGORIES.filter(cat => !existingCategories.has(cat))
})

const openAddModal = () => {
  isEditing.value = false
  limitAmount.value = ''
  selectedCategory.value = availableCategories.value.length > 0 ? availableCategories.value[0] : ''
  showModal.value = true
}

const openEditModal = (budget: { category: string; limitAmount: number }) => {
  isEditing.value = true
  selectedCategory.value = budget.category
  limitAmount.value = budget.limitAmount
  showModal.value = true
}

const confirmDelete = (category: string) => {
  deletingCategory.value = category
  showDeleteModal.value = true
}

const executeDelete = () => {
  if (deletingCategory.value) {
    deleteBudget(deletingCategory.value)
  }
  showDeleteModal.value = false
  deletingCategory.value = null
}

const handleSaveBudget = (data: { category: string; limitAmount: number }) => {
  const editing = isEditing.value
  saveBudget(data)
  showModal.value = false

  alertMessage.value = editing ? 'Budget updated' : 'Budget added'
  showAlert.value = true
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
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
            <router-link to="/transactions" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all">
              <ArrowLeftRight class="w-4 h-4" /> Transactions
            </router-link>
            <router-link to="/budget" class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/35 transition-all">
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
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-3 bg-pink-950 text-white rounded-2xl shadow-md flex items-center justify-center">
            <Menu class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-pink-950">Budget</h1>
            <p class="text-sm text-pink-700/70 mt-0.5 font-medium">{{ budgets.length }} budgets set</p>
          </div>
        </div>

        <BaseButton variant="primary" @click="openAddModal" class="flex items-center gap-2">
          <Plus class="w-4 h-4" /> Add budget
        </BaseButton>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Budget</span>
            <div class="p-2.5 bg-pink-50 text-pink-600 rounded-2xl"><Target class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ formatCurrency(totalBudget) }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Across {{ budgets.length }} categories</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-rose-600">{{ formatCurrency(totalSpent) }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Spent in budgeted categories</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Remaining</span>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><Wallet class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black" :class="remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'">
            {{ remainingBudget < 0 ? `-${formatCurrency(Math.abs(remainingBudget))}` : formatCurrency(remainingBudget) }}
          </div>
          <div class="text-xs text-pink-700/60 font-medium">Budget minus total spent</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Over Budget</span>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ overBudgetCount }} of {{ budgets.length }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Categories past their limit</div>
        </BaseCard>
      </div>

      <BaseCard class="p-6 space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-pink-950 text-lg">Budgets by category</h3>
            <p class="text-xs text-pink-700/60 font-medium">{{ formatCurrency(totalSpent) }} of {{ formatCurrency(totalBudget) }} used</p>
          </div>
          <div class="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-xl">
            <Coins class="w-4 h-4 text-pink-600" />
            <span class="text-xs font-bold text-pink-700">{{ budgets.length }} budgets</span>
          </div>
        </div>

        <div class="space-y-5">
          <div v-for="b in budgets" :key="b.category" class="space-y-2 p-4 bg-pink-50/40 border border-pink-100 rounded-2xl">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <span class="font-bold text-slate-800 text-sm">{{ b.category }}</span>
                <span v-if="getCategorySpent(b.category) > b.limitAmount" class="ml-2 text-xs font-bold text-rose-600">
                  Over by {{ formatCurrency(getCategorySpent(b.category) - b.limitAmount) }}
                </span>
                <span v-else class="ml-2 text-xs text-pink-700/60 font-medium">
                  {{ formatCurrency(b.limitAmount - getCategorySpent(b.category)) }} left
                </span>
              </div>
              <div class="flex items-center justify-between sm:justify-end gap-3">
                <span class="text-xs font-bold text-slate-700">
                  {{ formatCurrency(getCategorySpent(b.category)) }} / {{ formatCurrency(b.limitAmount) }} 
                  <span class="text-pink-700/60 font-normal">({{ getCategoryPercentage(getCategorySpent(b.category), b.limitAmount) }}%)</span>
                </span>
                <div class="flex items-center gap-1">
                  <button @click="openEditModal(b)" class="p-1.5 text-pink-600 hover:bg-pink-100 rounded-xl transition"><Pencil class="w-4 h-4" /></button>
                  <button @click="confirmDelete(b.category)" class="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition"><Trash2 class="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div class="w-full bg-pink-100 h-3 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500" 
                :class="getCategorySpent(b.category) > b.limitAmount ? 'bg-rose-500' : 'bg-pink-600'"
                :style="{ width: `${Math.min(getCategoryPercentage(getCategorySpent(b.category), b.limitAmount), 100)}%` }"
              ></div>
            </div>
          </div>

          <div v-if="budgets.length === 0" class="text-center py-12 space-y-3">
            <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
              <Target class="w-6 h-6" />
            </div>
            <div class="font-bold text-pink-950">No budgets yet</div>
            <p class="text-xs text-pink-700/60 max-w-xs mx-auto">Set a monthly limit to track your spending.</p>
            <BaseButton variant="primary" @click="openAddModal" class="mt-2 text-xs">
              + Add budget
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </main>

    <!-- BudgetForm wrapped in BaseModal -->
    <BaseModal :show="showModal" :title="isEditing ? 'Edit budget' : 'Add budget'" @close="showModal = false">
      <BudgetForm 
        :isEditing="isEditing"
        :initialCategory="selectedCategory"
        :initialLimit="limitAmount"
        :availableCategories="availableCategories"
        @save="handleSaveBudget"
        @cancel="showModal = false"
      />
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" title="Delete budget" @close="showDeleteModal = false">
      <div class="space-y-5">
        <p class="text-sm text-pink-800/60 font-medium">
          Delete the budget for <span class="font-bold text-slate-800">{{ deletingCategory }}</span>? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
          <BaseButton variant="danger" @click="executeDelete">Delete</BaseButton>
        </div>
      </div>
    </BaseModal>
  </AppLayout>

  <BaseAlert :show="showAlert" :message="alertMessage" @close="showAlert = false" />
</template>