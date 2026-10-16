export type TransactionType = 'Expense' | 'Income'

export interface Transaction {
  id: string | number
  type: TransactionType
  amount: number
  category: string
  date: string
  note?: string | null
}

export interface Budget {
  category: string
  limitAmount: number
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Groceries',
  'Utilities',
  'Others'
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Investment',
  'Freelance',
  'Others'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
export type IncomeCategory = typeof INCOME_CATEGORIES[number]