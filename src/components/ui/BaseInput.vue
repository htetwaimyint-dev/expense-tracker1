<script setup lang="ts">
defineProps<{
  modelValue?: string | number | null //input text
  type?: string //text ,number
  placeholder?: string
  label?: string //title e.g Amount ,Description
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label v-if="label" class="block text-xs font-bold text-pink-800/60 uppercase tracking-wider mb-1.5">{{ label }}</label>
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="type || 'text'" 
      :placeholder="placeholder"
      class="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-2xl text-sm font-semibold outline-none focus:border-pink-600 focus:bg-white transition-all"
    />
  </div>
</template>