<template>
  <div class="h-full flex flex-col bg-[#F4F4F0] overflow-hidden items-center justify-center relative">
    
    <!-- 背景装饰 -->
    <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
      <h1 class="text-[300px] font-black uppercase tracking-tighter whitespace-nowrap">学词乐</h1>
    </div>

    <!-- 核心内容 -->
    <div class="relative z-10 flex flex-col items-center text-center">
      <div class="w-32 h-32 bg-brutal-yellow border-4 border-black flex items-center justify-center shadow-[8px_8px_0_#000] rotate-12 mb-10">
        <Zap class="w-16 h-16" />
      </div>
      
      <h1 class="text-6xl font-black mb-6 uppercase tracking-tight">
        硬核背词 // <span class="bg-black text-white px-4 py-1 inline-block rotate-[-2deg]">学词乐</span>
      </h1>
      
      <p class="text-xl font-bold text-gray-600 mb-12 max-w-lg border-2 border-dashed border-gray-400 p-4">
          智能多语种背词助手。<br>输入你的需求，一键生成学习词库。
        </p>
      
      <div class="flex gap-6">
        <NuxtLink 
          to="/custom" 
          class="px-12 py-6 bg-black text-white font-black text-3xl border-4 border-black shadow-[8px_8px_0_#E2F000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0_#E2F000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-4"
        >
          <Wand2 class="w-8 h-8 text-brutal-yellow" /> 立即开始体验
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Zap, Target, Wand2 } from 'lucide-vue-next'
</script>