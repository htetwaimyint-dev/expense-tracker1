<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useBudgets } from '@/composables/useBudgets'
import { EXPENSE_CATEGORIES } from '@/types/index'
import { 
  Wallet, LayoutDashboard, ArrowLeftRight, PieChart, 
  Plus, Target, TrendingDown, AlertTriangle, Pencil, Trash2, X 
} from 'lucide-vue-next'

const { transactions } = useTransactions()
const { 
  budgets, totalBudget, totalSpent, remainingBudget, 
  overBudgetCount, saveBudget, deleteBudget 
} = useBudgets(transactions.value)

const showModal = ref(false)
const selectedCategory = ref<string>(EXPENSE_CATEGORIES[0])
const limitAmount = ref<number | ''>('')
const isEditing = ref(false)

const openAddModal = () => {
  isEditing.value = false
  selectedCategory.value = EXPENSE_CATEGORIES[0]
  limitAmount.value = ''
  showModal.value = true
}

const openEditModal = (budget: { category: string; limitAmount: number }) => {
  isEditing.value = true
  selectedCategory.value = budget.category
  limitAmount.value = budget.limitAmount
  showModal.value = true
}

const onSubmit = () => {
  if (limitAmount.value === '' || Number(limitAmount.value) <= 0) return
  saveBudget({
    category: selectedCategory.value,
    limitAmount: Number(limitAmount.value)
  })
  showModal.value = false
}

// Calculate spent for specific category
const getCategorySpent = (category: string) => {
  return transactions.value
    .filter(t => t.type === 'Expense' && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0)
}

const getCategoryPercentage = (spent: number, limit: number) => {
  if (!limit) return 0
  return Math.round((spent / limit) * 100)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100/60 flex font-sans text-slate-800">
    <!-- Sidebar -->
    <aside class="w-64 bg-pink-950 text-pink-200 border-r border-pink-900/50 hidden md:flex flex-col justify-between p-6 shadow-2xl">
      <div class="space-y-8">
        <div class="flex items-center gap-3 px-1">
          <div class="w-10 h-10 bg-pink-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-600/40">
            <Wallet class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-bold text-white text-base tracking-wide">Expense Tracker</h2>
            <p class="text-xs text-pink-300/80">Personal finance</p>
          </div>
        </div>

        <nav class="space-y-2">
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
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-pink-950">Budget</h1>
          <p class="text-sm text-pink-700/70 mt-0.5 font-medium">{{ budgets.length }} budgets set</p>
        </div>

        <button @click="openAddModal" class="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all shadow-xl shadow-pink-600/30 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
          <Plus class="w-4 h-4" /> Add budget
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Budget</span>
            <div class="p-2.5 bg-pink-50 text-pink-600 rounded-2xl"><Target class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">MMK {{ totalBudget.toLocaleString() }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Across {{ budgets.length }} categories</div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-rose-600">MMK {{ totalSpent.toLocaleString() }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Spent in budgeted categories</div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Remaining</span>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><Wallet class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black" :class="remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'">
            {{ remainingBudget < 0 ? `-MMK ${Math.abs(remainingBudget).toLocaleString()}` : `MMK ${remainingBudget.toLocaleString()}` }}
          </div>
          <div class="text-xs text-pink-700/60 font-medium">Budget minus total spent</div>
        </div>

        <div class="bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Over Budget</span>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ overBudgetCount }} of {{ budgets.length }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Categories past their limit</div>
        </div>
      </div>

      <!-- Budgets by Category List Card -->
      <div class="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-pink-950 text-lg">Budgets by category</h3>
            <p class="text-xs text-pink-700/60 font-medium">MMK {{ totalSpent.toLocaleString() }} of MMK {{ totalBudget.toLocaleString() }} used</p>
          </div>
          <span class="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl">{{ budgets.length }} budgets</span>
        </div>

        <!-- Budget Items -->
        <div class="space-y-5">
          <div v-for="b in budgets" :key="b.category" class="space-y-2 p-4 bg-pink-50/40 border border-pink-100 rounded-2xl">
            <div class="flex justify-between items-center">
              <div>
                <span class="font-bold text-slate-800 text-sm">{{ b.category }}</span>
                <span v-if="getCategorySpent(b.category) > b.limitAmount" class="ml-2 text-xs font-bold text-rose-600">
                  Over by MMK {{ (getCategorySpent(b.category) - b.limitAmount).toLocaleString() }}
                </span>
                <span v-else class="ml-2 text-xs text-pink-700/60 font-medium">
                  MMK {{ (b.limitAmount - getCategorySpent(b.category)).toLocaleString() }} left
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-slate-700">
                  MMK {{ getCategorySpent(b.category).toLocaleString() }} / MMK {{ b.limitAmount.toLocaleString() }} 
                  <span class="text-pink-700/60 font-normal">({{ getCategoryPercentage(getCategorySpent(b.category), b.limitAmount) }}%)</span>
                </span>
                <button @click="openEditModal(b)" class="p-1.5 text-pink-600 hover:bg-pink-100 rounded-xl transition"><Pencil class="w-4 h-4" /></button>
                <button @click="deleteBudget(b.category)" class="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
            <!-- Progress Bar -->
            <div class="w-full bg-pink-100 h-3 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500" 
                :class="getCategorySpent(b.category) > b.limitAmount ? 'bg-rose-500' : 'bg-pink-600'"
                :style="{ width: `${Math.min(getCategoryPercentage(getCategorySpent(b.category), b.limitAmount), 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="budgets.length === 0" class="text-center py-12 space-y-3">
            <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
              <Target class="w-6 h-6" />
            </div>
            <div class="font-bold text-pink-950">No budgets yet</div>
            <p class="text-xs text-pink-700/60 max-w-xs mx-auto">Set a monthly limit to track your spending.</p>
            <button @click="openAddModal" class="mt-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-pink-600/30">
              + Add budget
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-pink-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-pink-100">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg text-pink-950">{{ isEditing ? 'Edit budget' : 'Add budget' }}</h3>
          <button @click="showModal = false" class="p-2 text-pink-400 hover:text-pink-600 rounded-xl"><X class="w-5 h-5" /></button>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-1.5">Category *</label>
            <select v-model="selectedCategory" :disabled="isEditing" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold outline-none focus:border-pink-600 cursor-pointer disabled:opacity-50">
              <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-1.5">Monthly limit *</label>
            <input v-model.number="limitAmount" type="number" placeholder="0.00" class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold outline-none focus:border-pink-600" />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="px-6 py-3 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-2xl text-sm font-bold transition">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-sm font-bold transition shadow-lg shadow-pink-600/30">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>