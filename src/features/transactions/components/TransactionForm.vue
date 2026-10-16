<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { transactionSchema } from '../schemas/transactionSchema'
import type { Transaction, TransactionType } from '@/types/index'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/index'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'

const props = defineProps<{
  initialData?: Transaction | null
}>()

const emit = defineEmits<{
  (e: 'add-transaction', transaction: { type: TransactionType; amount: number; category: string; date: string; note: string | null }): void
  (e: 'cancel'): void
}>()

const validationSchema = toTypedSchema(transactionSchema)

const { handleSubmit, defineField, resetForm, errors, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    type: props.initialData?.type || 'Expense',
    amount: props.initialData?.amount ?? (''),
    category: props.initialData?.category || '',
    date: props.initialData?.date || new Date().toISOString().split('T')[0],
    note: props.initialData?.note || ''
  }
})

const [type] = defineField('type')
const [amount] = defineField('amount')
const [category] = defineField('category')
const [date] = defineField('date')
const [note] = defineField('note')

const availableCategories = computed(() => {
  return type.value === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
})

watch(type, (newType) => {
  const currentCat = category.value
  const validCats = newType === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  if (!validCats.includes(currentCat as any)) {
    setFieldValue('category', '')
  }
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    resetForm({
      values: {
        type: newVal.type,
        amount: newVal.amount,
        category: newVal.category,
        date: newVal.date,
        note: newVal.note || ''
      }
    })
  } else {
    resetForm({
      values: {
        type: 'Expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      }
    })
  }
})

const onSubmit = handleSubmit((formValues) => {
  emit('add-transaction', {
    type: formValues.type as TransactionType,
    amount: Number(formValues.amount),
    category: formValues.category,
    date: String(formValues.date),
    note: formValues.note && formValues.note.trim() ? formValues.note : null
  })
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="Object.keys(errors).length > 0" class="p-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
      {{ errors.amount || errors.category || 'Please fill Information' }}
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="grid grid-cols-2 gap-2 bg-pink-50 p-1.5 rounded-2xl">
        <button type="button" @click="type = 'Expense'" :class="type === 'Expense' ? 'bg-white shadow-md font-bold text-rose-600' : 'text-pink-700/60 hover:text-pink-900 font-semibold'" class="py-2.5 rounded-xl text-xs transition-all cursor-pointer">Expenses</button>
        <button type="button" @click="type = 'Income'" :class="type === 'Income' ? 'bg-white shadow-md font-bold text-emerald-600' : 'text-pink-700/60 hover:text-pink-900 font-semibold'" class="py-2.5 rounded-xl text-xs transition-all cursor-pointer">Income</button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model.number="amount" type="number" placeholder="0.00" label="Amount *" />
        <BaseInput v-model="date" type="date" label="Date *" />
      </div>

      <BaseDropdown v-model="category" :options="availableCategories" label="Category *">
        <option value="" disabled>Select a category</option>
        <option v-for="cat in availableCategories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </BaseDropdown>

      <BaseInput v-model="note" type="text" placeholder="What was this for?" label="Note (optional)" />

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" @click="$emit('cancel')">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">Save</BaseButton>
      </div>
    </form>
  </div>
</template>