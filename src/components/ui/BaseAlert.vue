<script setup lang="ts">
import { CheckCircle2, X } from 'lucide-vue-next'

defineProps<{
  show: boolean
  message: string
}>()

defineEmits(['close'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <div v-if="show" class="fixed top-6 right-6 z-50 flex items-center justify-between gap-4 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-600/30 min-w-[320px]">
      <div class="flex items-center gap-3">
        <CheckCircle2 class="w-6 h-6 text-white shrink-0" />
        <span class="font-bold text-sm tracking-wide">{{ message }}</span><!--Budget Saved or Transaction saved from parent-->
      </div>
      
     
        
        <!-- Close (X) Button -->
        <button @click="$emit('close')" class="text-white/80 hover:text-white p-1 rounded-xl hover:bg-emerald-700 transition cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      
    </div>
  </Transition>
</template>