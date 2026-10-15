import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import TransactionsView from '@/views/TransactionsView.vue'
import BudgetView from '@/views/BudgetView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionsView
  },
  {
    path: '/budget',
    name: 'Budget',
    component: BudgetView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router