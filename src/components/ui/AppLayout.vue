<script setup lang="ts">
import { ref } from 'vue'
import { Wallet, LayoutDashboard, ArrowLeftRight, PieChart, X } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Budget', path: '/budget', icon: PieChart },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100/60 flex font-sans text-slate-800">
    <!-- Desktop Sidebar -->
    <aside class="w-64 bg-pink-950 text-pink-200 border-r border-pink-900/50 hidden md:flex flex-col justify-between p-6 shadow-2xl">
      <div class="space-y-8">
        <div class="flex items-center gap-3 px-1">
          <div class="w-10 h-10 bg-pink-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-600/40">
            <Wallet class="w-5 h-5" />
          </div>
          <!--Logo-->
          <div>
            <h2 class="font-bold text-white text-base tracking-wide">Expense Tracker</h2>
            <p class="text-xs text-pink-300/80">Personal finance</p>
          </div>
        </div>

        <!-- Desktop Navigation using v-for -->
        <nav class="space-y-2">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path" 
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all" 
            exact-active-class="bg-pink-600 text-white font-semibold shadow-lg shadow-pink-600/35"
          >
            <component :is="item.icon" class="w-4 h-4" /> {{ item.name }}
          </router-link>
        </nav>
      </div>

      <div class="text-xs text-pink-400/60 border-t border-pink-900/60 pt-4 px-1">
        Data is stored locally in your browser.
      </div>
    </aside>

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

          <!-- Mobile Navigation using v-for -->
          <nav class="space-y-2" @click="isMobileMenuOpen = false">
            <router-link 
              v-for="item in menuItems" 
              :key="item.path" 
              :to="item.path" 
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-pink-300 hover:text-white hover:bg-pink-900/50 font-medium text-sm transition-all" 
              exact-active-class="bg-pink-600 text-white font-semibold shadow-lg shadow-pink-600/35"
            >
            <!--icon-->
              <component :is="item.icon" class="w-4 h-4" /> {{ item.name }}
            </router-link>
          </nav>
        </div>
        <div class="text-xs text-pink-400/60 border-t border-pink-900/60 pt-4 px-1">
          Data is stored locally in your browser.
        </div>
      </div>
      <div class="flex-1" @click="isMobileMenuOpen = false"></div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-y-auto">
      <slot />
    </div>
  </div>
</template>