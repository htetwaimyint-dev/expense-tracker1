<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TransactionType } from '@/types/index'
import TransactionForm from '@/components/TransactionForm.vue'
import { useTransactions } from '@/composables/useTransactions'
import { 
  Wallet, LayoutDashboard, ArrowLeftRight, PieChart, 
  Plus, TrendingUp, TrendingDown, Layers, X 
} from 'lucide-vue-next'

const { transactions, totalIncome, totalExpenses, balance, handleSaveTransaction } = useTransactions()

const categoriesUsedCount = computed(() => {
  const cats = new Set(transactions.value.map(t => t.category))
  return cats.size
})

const expenseByCategory = computed(() => {//e.g amount added for food 
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
  return [...transactions.value].slice(0, 5)//Spread Operator
})

const showAddModal = ref(false)

const onSaveTransaction = (txData: { type: TransactionType; amount: number; category: string; date: string; note: string | null }) => {
  handleSaveTransaction(null, txData)
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100/60 flex font-sans text-slate-800">
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
    </aside>

    <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-6 overflow-y-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-pink-950">Dashboard</h1>
          <p class="text-sm text-pink-700/70 mt-0.5 font-medium">{{ transactions.length }} transactions tracked</p>
        </div>

        <button @click="showAddModal = true" class="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all shadow-xl shadow-pink-600/30 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
          <Plus class="w-4 h-4" /> Add transaction
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Balance</span>
            <div class="p-2.5 bg-pink-50 text-pink-600 rounded-2xl"><Wallet class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">MMK {{ balance.toLocaleString() }}</div>
          <div class="text-xs text-pink-700/60 font-medium">Income minus expenses</div>
        </div>

        <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Income</span>
            <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-emerald-600">MMK {{ totalIncome.toLocaleString() }}</div>
          <div class="text-xs text-pink-700/60 font-medium">All recorded earnings</div>
        </div>

        <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Total Expense</span>
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-rose-600">MMK {{ totalExpenses.toLocaleString() }}</div>
          <div class="text-xs text-pink-700/60 font-medium">All recorded spending</div>
        </div>

        <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-2">
          <div class="flex items-center justify-between text-pink-400">
            <span class="text-xs font-bold uppercase tracking-wider">Categories Used</span>
            <div class="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><Layers class="w-4 h-4" /></div>
          </div>
          <div class="text-xl font-black text-pink-950">{{ categoriesUsedCount }} of 13</div>
          <div class="text-xs text-pink-700/60 font-medium">Active categories</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-pink-950">Expense by category</h3>
              <p class="text-xs text-pink-700/60 font-medium">MMK {{ totalExpenses.toLocaleString() }} spent in total</p>
            </div>
            <span class="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl">{{ expenseByCategory.length }} categories</span>
          </div>

          <div class="space-y-4 pt-2">
            <div v-for="item in expenseByCategory" :key="item.category" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-slate-700">{{ item.category }}</span>
                <span class="font-bold text-slate-900">MMK {{ item.amount.toLocaleString() }} <span class="text-xs text-pink-700/60 font-normal">({{ item.percentage }}%)</span></span>
              </div>
              <div class="w-full bg-pink-50 h-2.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full transition-all duration-500" :style="{ width: `${item.percentage}%` }"></div>
              </div>
            </div>
            <div v-if="expenseByCategory.length === 0" class="text-sm text-pink-400 text-center py-6">No expenses recorded.</div>
          </div>
        </div>

        <div class="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-pink-950">Income by category</h3>
              <p class="text-xs text-pink-700/60 font-medium">MMK {{ totalIncome.toLocaleString() }} earned in total</p>
            </div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">{{ incomeByCategory.length }} categories</span>
          </div>

          <div class="space-y-4 pt-2">
            <div v-for="item in incomeByCategory" :key="item.category" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-slate-700">{{ item.category }}</span>
                <span class="font-bold text-slate-900">MMK {{ item.amount.toLocaleString() }} <span class="text-xs text-pink-700/60 font-normal">({{ item.percentage }}%)</span></span>
              </div>
              <div class="w-full bg-pink-50 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="{ width: `${item.percentage}%` }"></div>
              </div>
            </div>
            <div v-if="incomeByCategory.length === 0" class="text-sm text-pink-400 text-center py-6">No income recorded.</div>
          </div>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-pink-200/40 border border-pink-200/60 space-y-4">
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
              <div class="text-xs text-pink-700/60 font-medium">{{ tx.category }} • {{ tx.date }}</div>
            </div>
            <div class="font-black text-sm" :class="tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'">
              {{ tx.type === 'Income' ? '+' : '-' }}MMK {{ tx.amount.toLocaleString() }}
            </div>
          </div>
          <div v-if="recentTransactions.length === 0" class="py-8 text-center text-pink-400 text-sm">No recent transactions.</div>
        </div>
      </div>
    </main>

    <!-- Add Transaction Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-pink-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-white p-7 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-pink-100">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-black text-pink-950">Add transaction</h3>
          <button @click="closeModal" class="text-pink-400 hover:text-pink-700 p-2 rounded-xl hover:bg-pink-50 transition"><X class="w-5 h-5" /></button>
        </div>

        <TransactionForm @add-transaction="onSaveTransaction" @cancel="closeModal" />
      </div>
    </div>
  </div>
</template>