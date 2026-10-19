<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title: string//Add Transaction or Budget ..
}>()

defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-pink-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div class="bg-white p-7 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-pink-100 animate-in fade-in zoom-in duration-200">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-black text-pink-950">{{ title }}</h3>
        <button @click="$emit('close')" class="text-pink-400 hover:text-pink-700 p-2 rounded-xl hover:bg-pink-50 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>