<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden">
    <div class="h-16 border-b-3 border-black bg-brutal-yellow text-black flex items-center px-8 shrink-0">
      <h2 class="text-3xl font-black uppercase tracking-widest">SETTINGS // 系统设置</h2>
    </div>

    <div class="flex-1 flex flex-col bg-[#F4F4F0] overflow-y-auto p-8 hide-scrollbar">
      <div class="max-w-4xl space-y-8">
        
        <!-- AI 大模型设置模块 -->
        <section class="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000]">
          <h3 class="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b-4 border-black pb-4">
            <Bot class="w-8 h-8 text-brutal-pink" /> AI 大模型配置
          </h3>
          
          <div class="space-y-6">
         

            <div class="space-y-2">
              <label class="font-black uppercase text-sm flex items-center gap-2">
                API Base URL
              </label>
              <div class="flex border-4 border-black bg-[#F4F4F0] focus-within:bg-brutal-yellow/20 focus-within:shadow-[4px_4px_0_#000] transition-all">
                <input 
                  v-model="settings.apiBaseUrl" 
                  type="text" 
                  placeholder="例如: https://api.openai.com/v1"
                  class="flex-1 px-4 py-3 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-black uppercase text-sm flex items-center gap-2">
                API Key
              </label>
              <div class="flex border-4 border-black bg-[#F4F4F0] focus-within:bg-brutal-blue/10 focus-within:shadow-[4px_4px_0_#000] transition-all">
                <input 
                  v-model="settings.apiKey" 
                  :type="showApiKey ? 'text' : 'password'" 
                  placeholder="sk-..."
                  class="flex-1 px-4 py-3 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400"
                >
                <button 
                  @click="showApiKey = !showApiKey"
                  class="px-4 py-3 border-l-4 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                >
                  <Eye v-if="!showApiKey" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-black uppercase text-sm flex items-center gap-2">
                模型名称 (Model)
              </label>
              <div class="flex border-4 border-black bg-[#F4F4F0] focus-within:bg-brutal-green/20 focus-within:shadow-[4px_4px_0_#000] transition-all">
                <input 
                  v-model="settings.modelName" 
                  type="text" 
                  placeholder="例如: gpt-3.5-turbo 或 qwen-turbo"
                  class="flex-1 px-4 py-3 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400"
                >
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button 
                @click="saveLlmSettings"
                class="px-8 py-3 bg-black text-white font-black uppercase border-2 border-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#E2F000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
              >
                <Save class="w-5 h-5" /> 保存配置
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Bot, Eye, EyeOff, Save } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const showApiKey = ref(false)

const settings = reactive({
  apiBaseUrl: '',
  apiKey: '',
  modelName: ''
})

const saveLlmSettings = () => {
  // 这里可以加入保存到 localStorage 或后端的逻辑
  alert('大模型配置已保存！')
}

const handleLogout = () => {
  // 执行退出逻辑（清除 token 等）
  router.push('/login')
}
</script>