<template>
  <div 
    v-if="show" 
    :class="[
      fullScreen ? 'fixed inset-0 z-[100]' : 'absolute inset-0 z-10',
      overlay ? 'bg-[#F4F4F0]/80 backdrop-blur-sm' : '',
      'flex items-center justify-center'
    ]"
  >
    <div class="flex flex-col items-center justify-center gap-3">
      <Loader2 class="w-12 h-12 animate-spin text-black" />
      <div v-if="text" class="text-black font-black tracking-widest text-sm animate-pulse">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: 'LOADING...'
  },
  fullScreen: {
    type: Boolean,
    default: false // 默认改为局部加载
  },
  overlay: {
    type: Boolean,
    default: true
  }
})
</script>
