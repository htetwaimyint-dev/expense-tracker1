<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TransactionType } from '@/types/index'
import TransactionForm from '@/features/transactions/components/TransactionForm.vue'
import { useTransactions } from '@/features/transactions/composables/useTransactions'
import AppLayout from '@/components/ui/AppLayout.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/dateFormatter'
import { 
  Wallet, Plus, TrendingUp, TrendingDown, Layers, X, Menu, ArrowLeftRight, PieChart 
} from 'lucide-vue-next'

const { transactions, totalIncome, totalExpenses, balance, handleSaveTransaction } = useTransactions()

const categoriesUsedCount = computed(() => {
  const cats = new Set(transactions.value.map(t => t.category))
  return cats.size
})

const expenseByCategory = computed(() => {
  const map: Record<string, number> = {}
  transactions.value.filter(t => t.type === 'Expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses.value ? Math.round((amount / totalExpenses.value) * 100) : 0
  }))
})

const incomeByCategory = computed(() => {
  const map: Record<string, number> = {}
  transactions.value.filter(t => t.type === 'Income').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalIncome.value ? Math.round((amount / totalIncome.value) * 100) : 0
  }))
})

const recentTransactions = computed(() => {
  return [...transactions.value].slice(0, 5)
})

const showAddModal = ref(false)
const isMobileMenuOpen = ref(false)

// Alert States
const showAlert = ref(false)
const alertMessage = ref('Transaction added')

const onSaveTransaction = (txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }) => {
  handleSaveTransaction(null, txData)
  closeModal()
  
  alertMessage.value = 'Transaction added'
  showAlert.value = true
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
}

const closeModal = () => {
  showAddModal.value = false
}
</script>

<template>
  <AppLayout>
    <!-- Mobile Menu Drawer -->
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
            <router-link to="/" class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-pink-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/35 transition-all">
              <LayoutDashboard class="w-4 h-4" /> Dashboard
            </router-link>
            <router-link to="/transactions" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all">
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

    <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto w-full">
      <!-- Header with Hamburger Menu beside Title -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-3 bg-pink-950 text-white rounded-2xl shadow-md flex items-center justify-center">
            <Menu class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-pink-950">Dashboard</h1>
            <p class="text-sm text-pink-700/70 mt-0.5 font-medium">{{ transactions.length }} transactions tracked</p>
          </div>
        </div>

        <BaseButton variant="primary" @click="showAddModal = true" class="flex items-center gap-2">
          <Plus class="w-4 h-4" /> Add transaction
        </BaseButton>
      </div>

      <!-- Stats & Content grids using BaseCard -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Balance</span>
            <div class="p-2.5 bg-pink-50 text-pink-600 rounded-2xl"><Wallet class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ formatCurrency(balance) }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Income minus expenses</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Income</span>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-emerald-600">{{ formatCurrency(totalIncome) }}</div>
          <div class="text-xs text-pink-700/60 font-medium">All recorded earnings</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Expense</span>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-rose-600">{{ formatCurrency(totalExpenses) }}</div>
          <div class="text-xs text-pink-700/60 font-medium">All recorded spending</div>
        </BaseCard>

        <BaseCard class="p-5 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Categories Used</span>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><Layers class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ categoriesUsedCount }} of 13</div>
          <div class="text-xs text-pink-700/60 font-medium">Active categories</div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseCard class="p-6 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-pink-950">Expense by category</h3>
              <p class="text-xs text-pink-700/60 font-medium">{{ formatCurrency(totalExpenses) }} spent in total</p>
            </div>
            <span class="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl">{{ expenseByCategory.length }} categories</span>
          </div>

          <div class="space-y-4 pt-2">
            <div v-for="item in expenseByCategory" :key="item.category" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-slate-700">{{ item.category }}</span>
                <span class="font-bold text-rose-600">{{ formatCurrency(item.amount) }} <span class="text-xs text-pink-700/60 font-normal">({{ item.percentage }}%)</span></span>
              </div>
              <div class="w-full bg-pink-50 h-2.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full transition-all duration-500" :style="{ width: `${item.percentage}%` }"></div>
              </div>
            </div>
            <div v-if="expenseByCategory.length === 0" class="text-sm text-pink-400 text-center py-6">No expenses recorded.</div>
          </div>
        </BaseCard>

        <BaseCard class="p-6 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-pink-950">Income by category</h3>
              <p class="text-xs text-pink-700/60 font-medium">{{ formatCurrency(totalIncome) }} earned in total</p>
            </div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">{{ incomeByCategory.length }} categories</span>
          </div>

          <div class="space-y-4 pt-2">
            <div v-for="item in incomeByCategory" :key="item.category" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-slate-700">{{ item.category }}</span>
                <span class="font-bold text-emerald-600">{{ formatCurrency(item.amount) }} <span class="text-xs text-pink-700/60 font-normal">({{ item.percentage }}%)</span></span>
              </div>
              <div class="w-full bg-pink-50 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="{ width: `${item.percentage}%` }"></div>
              </div>
            </div>
            <div v-if="incomeByCategory.length === 0" class="text-sm text-pink-400 text-center py-6">No income recorded.</div>
          </div>
        </BaseCard>
      </div>

      <BaseCard class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-pink-950">Recent transactions</h3>
            <p class="text-xs text-pink-700/60 font-medium">Last 5 entries</p>
          </div>
          <router-link to="/transactions" class="text-xs font-bold text-pink-600 hover:text-pink-800 transition underline">All</router-link>
        </div>

        <div class="divide-y divide-pink-100">
          <div v-for="tx in recentTransactions" :key="tx.id" class="py-3.5 flex justify-between items-center">
            <div>
              <div class="font-bold text-sm text-slate-800">{{ tx.note || tx.category }}</div>
              <div class="text-xs text-pink-700/60 font-medium">{{ tx.category }} • {{ formatDate(tx.date) }}</div>
            </div>

            <div class="font-black text-sm" :class="tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'">
              {{ tx.type === 'Income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </div>
          </div>
          <div v-if="recentTransactions.length === 0" class="py-8 text-center text-pink-400 text-sm">No recent transactions.</div>
        </div>
      </BaseCard>
    </main>

    <!-- Add Transaction Modal (Refactored with BaseModal) -->
    <BaseModal :show="showAddModal" title="Add transaction" @close="closeModal">
      <TransactionForm @add-transaction="onSaveTransaction" @cancel="closeModal" />
    </BaseModal>
  </AppLayout>

  <BaseAlert :show="showAlert" :message="alertMessage" @close="showAlert = false" />
</template>