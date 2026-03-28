<template>
  <div class="h-screen flex p-6 gap-6 overflow-hidden selection:bg-brutal-pink selection:text-black">
    <!-- 左侧导航 -->
    <aside 
      class="flex flex-col bg-white border-hard shadow-hard rounded-xl p-6 z-20 relative transition-all duration-300"
      :class="isCollapsed ? 'w-[112px]' : 'w-64'"
    >
      <!-- 伸缩按钮 -->
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="absolute -right-4 top-12 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-hard-sm hover:bg-brutal-yellow z-30 transition-transform"
      >
        <ChevronRight v-if="isCollapsed" class="w-4 h-4" />
        <ChevronLeft v-else class="w-4 h-4" />
      </button>

      <NuxtLink to="/" class="flex items-center gap-3 mb-10 border-b-3 border-black pb-4 cursor-pointer overflow-hidden">
        <div class="w-12 h-12 bg-brutal-yellow border-hard flex items-center justify-center shadow-hard-sm shrink-0 rotate-[-5deg]">
          <Zap class="w-6 h-6" />
        </div>
        <span v-show="!isCollapsed" class="text-3xl font-black uppercase tracking-tighter whitespace-nowrap">学词乐</span>
      </NuxtLink>
      
      <nav class="space-y-4 font-bold text-xl flex-1">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link border-hard p-3 rounded-lg cursor-pointer transition-all flex items-center group bg-white hover:shadow-[8px_8px_0px_#111] hover:-translate-x-0.5 hover:-translate-y-0.5"
          :class="[`hover:bg-brutal-${item.color}`, isCollapsed ? 'justify-center' : 'gap-3']"
          active-class="!bg-black !text-white transform -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#E2F000]"
        >
          <component :is="item.icon" class="w-6 h-6 shrink-0" />
          <span v-show="!isCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
          <ArrowRight v-if="!isCollapsed" class="w-5 h-5 ml-auto transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1 shrink-0" />
        </NuxtLink>
        
        <!-- 外部链接 (如 GitHub) -->
        <a 
          v-for="item in externalLinks" 
          :key="item.url"
          :href="item.url"
          target="_blank"
          class="nav-link border-hard p-3 rounded-lg cursor-pointer transition-all flex items-center group bg-white hover:shadow-[8px_8px_0px_#111] hover:-translate-x-0.5 hover:-translate-y-0.5"
          :class="[`hover:bg-brutal-${item.color}`, isCollapsed ? 'justify-center' : 'gap-3']"
        >
          <component :is="item.icon" class="w-6 h-6 shrink-0" />
          <span v-show="!isCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
          <ArrowRight v-if="!isCollapsed" class="w-5 h-5 ml-auto transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1 shrink-0" />
        </a>
      </nav>

      <div class="mt-auto border-hard p-4 bg-brutal-green shadow-hard-sm rounded-lg overflow-hidden">
        <button @click="showProfile = true" class="w-full flex items-center text-left" :class="isCollapsed ? 'justify-center' : 'gap-3'">
          <div class="w-10 h-10 border-2 border-black rounded-full overflow-hidden bg-white shrink-0">
              <img :src="avatarUrl" alt="Avatar">
          </div>
          <span v-show="!isCollapsed" class="font-black text-sm whitespace-nowrap truncate">{{ displayName }}</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 relative min-h-0">
      <slot></slot>
    </main>
    <div v-if="isFirstLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur">
      <div class="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-if="showProfile" class="fixed inset-0 z-30">
      <div class="absolute inset-0 bg-black/50" @click="showProfile = false"></div>
      <div class="absolute inset-0 flex items-center justify-center p-6">
        <div class="w-full max-w-sm bg-white border-hard shadow-hard rounded-xl p-6 relative">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 border-2 border-black rounded-full overflow-hidden bg-white">
              <img :src="avatarUrl" alt="Avatar">
            </div>
            <div class="font-black">
              <div class="text-lg">{{ displayName }}</div>
            </div>
          </div>
          <button @click="logout" class="w-full py-3 bg-black text-white font-black border-2 border-black hover:bg-brutal-yellow hover:text-black transition-colors">
            退出登录
          </button>
          <button @click="showProfile = false" class="mt-3 w-full py-2 bg-white border-2 border-black font-black hover:bg-brutal-pink transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Zap, ArrowRight, Home, Library, BookX, Sparkles, ChevronLeft, ChevronRight, Github } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isCollapsed = ref(false)

const navItems = [
  { path: '/', label: '首页', color: 'green', icon: Home },
  { path: '/library', label: '我的词库', color: 'blue', icon: Library },
  { path: '/error-words', label: '错词本', color: 'orange', icon: BookX },
  { path: '/custom', label: '词库生成器', color: 'pink', icon: Sparkles }
]

const externalLinks = [
  { url: 'https://github.com/wentai989/xuecile', label: 'GitHub', color: 'gray', icon: Github }
]

const router = useRouter()
const displayName = ref('未登录')
const avatarUrl = ref('https://api.dicebear.com/7.x/notionists/svg?seed=Guest')
const showProfile = ref(false)
const isFirstLoading = ref(true)

onMounted(() => {
  try {
    isFirstLoading.value = true
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) {
      setTimeout(() => { isFirstLoading.value = false }, 1000)
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr || '{}')
    displayName.value = user?.name || user?.username || '用户'
    const seed = encodeURIComponent(user?.username || user?.name || 'User')
    avatarUrl.value = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`
    setTimeout(() => { isFirstLoading.value = false }, 1000)
  } catch {
    setTimeout(() => { isFirstLoading.value = false }, 1000)
    router.push('/login')
  }
})

const logout = () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch {}
  router.push('/login')
}
</script>

<style scoped>
/* 覆盖激活状态下箭头的透明度 */
.router-link-active .lucide-arrow-right {
  opacity: 1 !important;
}
</style>
