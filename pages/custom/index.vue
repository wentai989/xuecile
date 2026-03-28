<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden relative">
    <div class="h-16 border-b-3 border-black bg-brutal-pink flex items-center px-8 justify-between">
      <h2 class="text-3xl font-black uppercase tracking-widest">VOCABULARY GENERATOR // 词库生成器</h2>
    </div>
    
    <div class="flex-1 p-10 overflow-y-auto bg-[#F4F4F0]">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16 mt-8">
          <h3 class="text-5xl font-black mb-6">选择生成方式</h3>
          <p class="font-bold text-xl text-gray-600 bg-white inline-block px-6 py-2 border-2 border-black shadow-[4px_4px_0_#000] rotate-[-1deg]">多种方式，快速构建您的专属学习词库</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- 1. 大模型提取 -->
          <NuxtLink to="/custom/llm" class="group bg-white border-hard shadow-hard p-8 rounded-xl hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0_#000] transition-all flex flex-col items-center text-center cursor-pointer">
            <div class="w-28 h-28 bg-brutal-blue border-3 border-black rounded-full flex items-center justify-center mb-8 shadow-[4px_4px_0_#000] group-hover:rotate-12 transition-transform">
              <MessageSquare class="w-12 h-12 text-white" />
            </div>
            <h4 class="text-2xl font-black mb-4 bg-brutal-yellow px-4 py-1 border-2 border-black shadow-[2px_2px_0_#000]">大模型提取</h4>
            <p class="font-bold text-gray-600 flex-1 mt-4">通过输入文本或描述，让 AI 为您精准提取专属词库</p>
            <div class="mt-8 font-black bg-black text-white px-6 py-3 border-2 border-black w-full group-hover:bg-brutal-green group-hover:text-black transition-colors text-lg flex justify-center items-center gap-2">
              立即使用 <ArrowRight class="w-5 h-5" />
            </div>
          </NuxtLink>

          <!-- 2. 图片上传识别 -->
          <NuxtLink to="/custom/image" class="group bg-white border-hard shadow-hard p-8 rounded-xl hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0_#000] transition-all flex flex-col items-center text-center cursor-pointer">
            <div class="w-28 h-28 bg-brutal-orange border-3 border-black rounded-full flex items-center justify-center mb-8 shadow-[4px_4px_0_#000] group-hover:rotate-12 transition-transform">
              <Camera class="w-12 h-12 text-white" />
            </div>
            <h4 class="text-2xl font-black mb-4 bg-brutal-yellow px-4 py-1 border-2 border-black shadow-[2px_2px_0_#000]">图片上传识别</h4>
            <p class="font-bold text-gray-600 flex-1 mt-4">上传包含文字的图片或文档截图，自动识别并提取词库</p>
            <div class="mt-8 font-black bg-black text-white px-6 py-3 border-2 border-black w-full group-hover:bg-brutal-orange group-hover:text-black transition-colors text-lg flex justify-center items-center gap-2">
              立即使用 <ArrowRight class="w-5 h-5" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, Camera, ArrowRight } from 'lucide-vue-next'
</script>
