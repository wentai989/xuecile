<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="close">
    <div class="bg-white border-4 border-black shadow-[8px_8px_0_#E2F000] w-full max-w-md relative flex flex-col transform transition-all">
      <!-- 关闭按钮 -->
      <button @click="close" class="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-black flex items-center justify-center hover:bg-brutal-pink hover:text-white transition-colors z-10 shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
        <X class="w-6 h-6 font-black" />
      </button>

      <!-- 头部 -->
      <div class="p-6 border-b-4 border-black bg-[#FF4D4F] text-white flex items-center gap-3">
        <AlertTriangle class="w-8 h-8" />
        <h3 class="text-2xl font-black uppercase tracking-widest">{{ title }}</h3>
      </div>

      <!-- 内容区 -->
      <div class="p-8 bg-[#F4F4F0] font-bold text-lg text-center leading-relaxed">
        {{ message }}
      </div>

      <!-- 底部操作区 -->
      <div class="p-6 border-t-4 border-black bg-white flex gap-4">
        <button 
          @click="close" 
          class="flex-1 py-3 bg-white font-black text-lg border-4 border-black hover:bg-gray-100 transition-colors uppercase shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="confirm" 
          class="flex-1 py-3 bg-[#FF4D4F] font-black text-lg text-white border-4 border-black hover:bg-black transition-colors uppercase shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'CONFIRM // 确认'
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['update:isOpen', 'confirm', 'cancel'])

const close = () => {
  emit('update:isOpen', false)
  emit('cancel')
}

const confirm = () => {
  emit('update:isOpen', false)
  emit('confirm')
}
</script>