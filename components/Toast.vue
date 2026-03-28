<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="state.show" class="fixed top-8 right-8 z-[9999]">
        <div 
          class="border-4 border-black p-5 flex items-center gap-4 min-w-[320px] max-w-[450px] bg-black text-white"
          :class="state.type === 'success' ? 'shadow-[8px_8px_0_#E2F000]' : 'shadow-[8px_8px_0_#FF4D4F]'"
        >
          <div class="flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center"
               :class="state.type === 'success' ? 'bg-brutal-green text-black rotate-[-5deg]' : 'bg-brutal-red text-white rotate-[5deg]'">
            <CheckCircle v-if="state.type === 'success'" class="w-6 h-6" />
            <AlertOctagon v-else class="w-6 h-6" />
          </div>
          
          <div class="flex-1">
            <h4 class="font-black text-xl uppercase tracking-wider mb-1" :class="state.type === 'success' ? 'text-brutal-green' : 'text-brutal-red'">
              {{ state.type === 'success' ? 'SUCCESS!' : 'ERROR!' }}
            </h4>
            <p class="font-bold text-sm opacity-90 leading-tight">
              {{ state.message }}
            </p>
          </div>
          
          <div class="flex items-center gap-2 flex-shrink-0">
            <button 
              v-if="state.action"
              @click="handleAction"
              class="px-3 py-1.5 font-black text-xs uppercase border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              {{ state.action.label }}
            </button>

            <button @click="hideToast" class="p-1 border-2 border-transparent hover:border-white transition-colors text-white">
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { CheckCircle, AlertOctagon, X } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { state, hideToast } = useToast()

const handleAction = () => {
  if (state.action && state.action.onClick) {
    state.action.onClick()
  }
  hideToast()
}
</script>

<style scoped>
/* 弹窗进入和离开动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
</style>