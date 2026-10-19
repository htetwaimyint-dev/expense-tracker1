<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  modelValue?: string | number | null //food or transaport
  options?: readonly string[] | string[] //category list
  label?: string// over input box title(category or type)
  disabled?: boolean
}>()

defineEmits(['update:modelValue'])//Used v-model
</script>

<template>
  <div>
    <label v-if="label" class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-1.5">{{ label }}</label>
    <div class="relative">
      <select 
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :disabled="disabled"
        class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold outline-none focus:border-pink-600 focus:bg-white transition-all cursor-pointer appearance-none pr-10 disabled:opacity-50"
      >
        <slot>
          <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
        </slot>
      </select>
      <ChevronDown class="w-4 h-4 text-pink-400 absolute right-3.5 top-3.5 pointer-events-none" />
    </div>
  </div>
</template>