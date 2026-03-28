<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-md relative flex flex-col max-h-[90vh]">
      <div class="p-6 border-b-4 border-black flex justify-between items-center bg-brutal-yellow">
        <h2 class="font-black text-2xl uppercase tracking-widest flex items-center gap-2">
          <Settings class="w-6 h-6" /> 发音设置
        </h2>
        <button @click="close" class="w-10 h-10 bg-white border-2 border-black flex items-center justify-center hover:bg-brutal-red hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <div class="p-6 space-y-8 overflow-y-auto flex-1">
        <!-- 引擎选择 -->
        <div class="space-y-4">
          <label class="font-black text-xl uppercase block">发音引擎 ENGINE</label>
          <div class="flex gap-4">
            <label class="flex-1 border-2 border-black p-4 cursor-pointer flex items-center gap-3" :class="userSettings.engine === 'online' ? 'bg-brutal-yellow shadow-[4px_4px_0_#000]' : 'bg-gray-100 opacity-50'">
              <input type="radio" v-model="userSettings.engine" value="online" class="hidden">
              <div class="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center">
                <div v-if="userSettings.engine === 'online'" class="w-2 h-2 bg-black rounded-full"></div>
              </div>
              <div>
                <div class="font-black">云端高音质</div>
                <div class="text-xs font-bold text-gray-600 mt-1">发音自然，解决卡顿</div>
              </div>
            </label>
            <label class="flex-1 border-2 border-black p-4 cursor-pointer flex items-center gap-3" :class="userSettings.engine === 'browser' ? 'bg-brutal-yellow shadow-[4px_4px_0_#000]' : 'bg-gray-100 opacity-50'">
              <input type="radio" v-model="userSettings.engine" value="browser" class="hidden">
              <div class="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center">
                <div v-if="userSettings.engine === 'browser'" class="w-2 h-2 bg-black rounded-full"></div>
              </div>
              <div>
                <div class="font-black">浏览器发音 (默认)</div>
                <div class="text-xs font-bold text-gray-600 mt-1">无需网络，基于浏览器</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 语速调节 -->
        <div class="space-y-4">
          <div class="flex justify-between items-end">
            <label class="font-black text-xl uppercase">语速 RATE</label>
            <span class="font-bold text-xl bg-black text-white px-2 py-1">{{ userSettings.rate.toFixed(1) }}x</span>
          </div>
          <input 
            type="range" 
            v-model.number="userSettings.rate" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            class="w-full h-4 bg-gray-200 border-2 border-black appearance-none cursor-pointer accent-black"
          >
          <div class="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>慢 (Slow)</span>
            <span>正常 (Normal)</span>
            <span>快 (Fast)</span>
          </div>
        </div>
      </div>

      <div class="p-6 border-t-4 border-black bg-gray-50">
        <button @click="handleSave" class="w-full py-4 bg-brutal-green font-black text-xl border-2 border-black hover:bg-brutal-yellow transition-colors uppercase shadow-[4px_4px_0_#000]">
          保存 SAVE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Settings, X } from 'lucide-vue-next'
import { useSettings } from '~/composables/useSettings'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:isOpen'])

const { userSettings, saveSettings } = useSettings()
const { showToast } = useToast()

const close = () => {
  emit('update:isOpen', false)
}

const handleSave = () => {
  saveSettings()
  showToast('设置已保存', 'success')
  close()
}
</script>
