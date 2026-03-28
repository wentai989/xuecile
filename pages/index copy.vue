<template>
  <div class="h-full flex flex-col bg-[#F4F4F0] overflow-hidden">
    <!-- 顶部欢迎栏 -->
    <div class="h-24 border-b-4 border-black bg-brutal-yellow flex items-center justify-between px-10 shrink-0">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0_#000] rotate-[-5deg]">
          <span class="text-2xl">👋</span>
        </div>
        <div>
          <h1 class="text-3xl font-black uppercase tracking-tight">Welcome Back, 用户1024</h1>
          <p class="font-bold text-sm">今天也要坚持硬核背词哦！</p>
        </div>
      </div>
      <div class="bg-black text-white px-4 py-2 border-2 border-black shadow-[4px_4px_0_#fff] font-black flex items-center gap-2 rotate-[2deg]">
        <Calendar class="w-5 h-5 text-brutal-green" /> 连续打卡 <span class="text-brutal-green text-xl">12</span> 天
      </div>
    </div>

    <!-- 核心数据面板区 -->
    <div class="flex-1 overflow-y-auto p-10 hide-scrollbar space-y-8">
      
      <!-- 顶部数据卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 今日任务 -->
        <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#000] relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div class="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target class="w-40 h-40" />
          </div>
          <div class="relative z-10">
            <h3 class="font-black text-xl mb-1 uppercase bg-black text-white inline-block px-2 py-1">今日任务 // TODAY</h3>
            <div class="mt-6 flex items-end gap-2">
              <span class="text-6xl font-black text-brutal-orange leading-none">45</span>
              <span class="font-bold text-gray-500 mb-1">待学/复习词汇</span>
            </div>
            <div class="mt-6">
              <NuxtLink to="/study" class="w-full py-3 bg-brutal-orange text-white border-2 border-black font-black uppercase flex justify-center items-center gap-2 hover:bg-black transition-colors shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                开始学习 <ArrowRight class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- 累计掌握 -->
        <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#000] relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div class="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy class="w-40 h-40" />
          </div>
          <div class="relative z-10">
            <h3 class="font-black text-xl mb-1 uppercase bg-black text-white inline-block px-2 py-1">累计掌握 // TOTAL</h3>
            <div class="mt-6 flex items-end gap-2">
              <span class="text-6xl font-black text-brutal-green leading-none">1,208</span>
              <span class="font-bold text-gray-500 mb-1">个词汇</span>
            </div>
            <div class="mt-6">
              <NuxtLink to="/library" class="w-full py-3 bg-white text-black border-2 border-black font-black uppercase flex justify-center items-center gap-2 hover:bg-brutal-green transition-colors shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                查看词库 <BookOpen class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- 顽固生词 -->
        <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#000] relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div class="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame class="w-40 h-40" />
          </div>
          <div class="relative z-10">
            <h3 class="font-black text-xl mb-1 uppercase bg-black text-white inline-block px-2 py-1">顽固生词 // ERRORS</h3>
            <div class="mt-6 flex items-end gap-2">
              <span class="text-6xl font-black text-brutal-pink leading-none">42</span>
              <span class="font-bold text-gray-500 mb-1">个高频错词</span>
            </div>
            <div class="mt-6">
              <NuxtLink to="/errors" class="w-full py-3 bg-white text-black border-2 border-black font-black uppercase flex justify-center items-center gap-2 hover:bg-brutal-pink transition-colors shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                生词本攻坚 <Swords class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部学习动态和入口 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 学习图表 (占位) -->
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-black text-2xl uppercase flex items-center gap-2">
              <Activity class="w-6 h-6 text-brutal-blue" /> 近期学习活跃度
            </h3>
            <span class="text-sm font-bold bg-gray-100 border-2 border-black px-2 py-1">近 7 天</span>
          </div>
          <div class="flex-1 border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[200px]">
            <div class="text-center text-gray-400 font-bold flex flex-col items-center gap-2">
              <BarChart2 class="w-12 h-12" />
              <p>学习数据图表加载区</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 / 动态 -->
        <div class="bg-brutal-blue border-4 border-black shadow-[8px_8px_0_#000] p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div class="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-1/4 translate-y-1/4">
            <Sparkles class="w-64 h-64" />
          </div>
          <div class="relative z-10">
            <h3 class="font-black text-3xl uppercase mb-2">需要针对性提升？</h3>
            <p class="font-bold text-white/80 mb-8 max-w-md">通过 AI 深度定制你的专属词库，只学你需要用到的核心词汇，拒绝低效浪费时间。</p>
            
            <NuxtLink to="/custom" class="inline-flex py-4 px-8 bg-black text-white border-2 border-white font-black text-xl uppercase items-center gap-3 hover:bg-brutal-yellow hover:text-black hover:border-black transition-all shadow-[6px_6px_0_#fff] hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
              <Wand2 class="w-6 h-6" /> 去定制专属词书
            </NuxtLink>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { 
  Calendar, Target, ArrowRight, Trophy, BookOpen, 
  Flame, Swords, Activity, BarChart2, Sparkles, Wand2 
} from 'lucide-vue-next'
</script>