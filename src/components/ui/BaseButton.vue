<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button 
    :type="type || 'button'"
    :disabled="disabled"
    class="px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg cursor-pointer disabled:opacity-50"
    :class="{
      'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30': variant === 'primary' || !variant,
      'bg-pink-50 hover:bg-pink-100 text-pink-900 shadow-none': variant === 'secondary',
      'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30': variant === 'danger'
    }"
  >
    <slot />
  </button>
</template>