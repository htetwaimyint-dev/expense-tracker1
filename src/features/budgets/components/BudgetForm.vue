<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { budgetSchema } from '../schemas/budgetSchema'
import { EXPENSE_CATEGORIES } from '@/types/index'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseDropdown from '@/components/ui/BaseDropdown.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isEditing: boolean
  initialCategory?: string
  initialLimit?: number | ''
  availableCategories: readonly string[]
}>()

const emit = defineEmits<{
  (e: 'save', data: { category: string; limitAmount: number }): void
  (e: 'cancel'): void
}>()

const validationSchema = toTypedSchema(budgetSchema)

const { handleSubmit, defineField, resetForm, errors } = useForm({
  validationSchema,
  initialValues: {
    category: props.initialCategory || '',
    limitAmount: props.initialLimit ?? ''
  }
})

const [category] = defineField('category')
const [limitAmount] = defineField('limitAmount')

watch(() => props.initialCategory, (newVal) => {
  resetForm({
    values: {
      category: newVal || '',
      limitAmount: props.initialLimit ?? ''
    }
  })
})

watch(() => props.initialLimit, (newVal) => {
  if (newVal !== undefined) {
    resetForm({
      values: {
        category: category.value,
        limitAmount: newVal
      }
    })
  }
})

const onSubmit = handleSubmit((formValues) => {
  emit('save', {
    category: formValues.category,
    limitAmount: Number(formValues.limitAmount)
  })
})
</script>

<template>
  <div class="fixed inset-0 bg-pink-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-pink-100">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-lg text-pink-950">{{ isEditing ? 'Edit budget' : 'Add budget' }}</h3>
        <button type="button" @click="$emit('cancel')" class="p-2 text-pink-400 hover:text-pink-600 rounded-xl">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div v-if="Object.keys(errors).length > 0" class="p-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
        {{ errors.category || errors.limitAmount || 'Please fill information' }}
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <BaseDropdown 
            v-model="category" 
            :disabled="isEditing" 
            :options="isEditing ? EXPENSE_CATEGORIES : availableCategories" 
            label="Category *"
          >
            <option value="" disabled>Select a category</option>
            <option v-for="cat in (isEditing ? EXPENSE_CATEGORIES : availableCategories)" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </BaseDropdown>
          <p v-if="!isEditing && availableCategories.length === 0" class="text-xs text-rose-500 mt-1 font-medium">All categories already have budgets set.</p>
        </div>

        <BaseInput v-model.number="limitAmount" type="number" placeholder="0" label="Monthly limit *" />

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" type="button" @click="$emit('cancel')">Cancel</BaseButton>
          <BaseButton variant="primary" type="submit" :disabled="!isEditing && availableCategories.length === 0">Save</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>