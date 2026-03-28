<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden">
    <div class="h-16 border-b-3 border-black bg-brutal-blue text-white flex items-center justify-between px-8 shrink-0">
      <h2 class="text-3xl font-black uppercase tracking-widest">MY LIBRARY // 我的词书</h2>
      <button @click="router.push('/custom')" class="bg-white text-black border-hard px-4 py-1.5 font-black uppercase shadow-hard-sm hover-hard active-hard text-sm flex items-center gap-2">
        <Plus class="w-4 h-4" /> 导入词书
      </button>
    </div>
    
    <div class="flex-1 flex flex-col bg-[#F4F4F0] overflow-hidden">
      <!-- 过滤器区域 -->
      <div class="border-b-3 border-black bg-white px-8 py-4 flex items-center gap-4 shrink-0">
        <span class="font-black text-gray-500 uppercase flex items-center gap-2"><Search class="w-5 h-5"/> 筛选状态:</span>
        <div class="flex gap-2">
          <button 
            v-for="filter in filters" 
            :key="filter"
            @click="currentFilter = filter"
            :class="[
              'px-4 py-1.5 font-black text-sm transition-all border-2',
              currentFilter === filter 
                ? 'bg-black text-white border-black shadow-[2px_2px_0_#E2F000] translate-x-[-2px] translate-y-[-2px]' 
                : 'bg-white text-black border-black hover:bg-brutal-yellow'
            ]"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- 统一的卡片网格列表 -->
      <div class="flex-1 p-8 overflow-y-auto hide-scrollbar">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          <template v-for="book in filteredBooks" :key="book.id">
            
            <div class="relative group">
              <!-- 悬浮删除按钮 (移出卡片，位于右上角) -->
              <button 
                @click.stop="openDeleteConfirm(book)" 
                class="absolute -top-3 -right-3 z-30 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-brutal-red hover:text-white transition-all shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="删除词库"
              >
                <X class="w-4 h-4 font-black" />
              </button>

              <!-- 统一卡片结构，通过 status 区分细节样式 -->
              <div 
                class="border-hard bg-white shadow-hard flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden h-full"
                :class="{
                  'opacity-80': book.status === 'PENDING',
                  'grayscale opacity-70 hover:grayscale-0 hover:opacity-100': book.status === 'COMPLETED'
                }"
              >
                <div :class="`absolute -right-10 -bottom-10 w-40 h-40 ${book.color} rounded-full border-hard opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 -z-0`"></div>
                
                <div class="p-6 relative z-10 bg-transparent flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-6">
                  <div :class="`w-16 h-16 bg-black text-white border-hard flex items-center justify-center ${book.rotate} shadow-hard-sm font-black text-xl`">
                    <component v-if="!book.isTextIcon" :is="book.icon" class="w-8 h-8" />
                    <template v-else>{{ book.iconText }}</template>
                  </div>
                  
                  <span v-if="book.status === 'ACTIVE'" class="bg-brutal-green border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0_#000]">学习中</span>
                  <span v-else-if="book.status === 'PENDING'" class="bg-white border-2 border-black px-2 py-1 font-bold text-xs uppercase">未开始</span>
                  <span v-else-if="book.status === 'COMPLETED'" class="bg-brutal-yellow border-2 border-black px-2 py-1 font-bold text-xs uppercase text-black shadow-[2px_2px_0_#000]">已完成 100%</span>
                </div>
                
                <div class="flex-1 flex flex-col">
                  <!-- <h3 class="text-xl font-black uppercase mb-1 line-clamp-1" :class="{'line-through decoration-2 decoration-gray-400': book.status === 'COMPLETED'}" :title="book.title">{{ book.title }}</h3> -->
                  <p class="font-bold text-gray-500 text-xs mb-6 border-b-2 border-dashed border-black pb-4 line-clamp-2">
                    {{ book.description }}
                    <template v-if="book.status === 'COMPLETED' && book.completedDate"><br/>{{ book.completedDate }} 完成</template>
                  </p>
                  
                  <div class="mt-auto">
                    <!-- 进度条区域，无论状态都显示，PENDING 为 0% -->
                    <div class="flex justify-between items-end text-xs font-black mb-2 uppercase">
                      <span>已学 {{ book.learned }} / {{ book.total }} 词</span>
                      <span class="text-xl leading-none" :class="book.percentage === 100 ? 'text-black' : book.textColor">{{ book.percentage }}%</span>
                    </div>
                    <div class="h-4 border-hard w-full bg-gray-100 relative mb-4 overflow-hidden">
                      <div :class="`absolute top-0 left-0 h-full ${book.progressColor} border-r-2 border-black transition-all duration-500`" :style="{ width: `${book.percentage}%` }"></div>
                    </div>
                    
                    <!-- 按钮区域 -->
                    <div class="flex flex-col gap-2">
                      <div class="flex gap-2">
                        <button 
                          v-if="book.status === 'ACTIVE'"
                          @click="openStudyConfigModal(book)"
                          class="flex-1 py-2.5 bg-black text-white font-black text-sm border-hard hover-hard active-hard uppercase flex justify-center items-center gap-2"
                        >
                          继续学习 <ArrowRight class="w-4 h-4" />
                        </button>
                        
                        <button 
                          v-else-if="book.status === 'PENDING'"
                          @click="openStudyConfigModal(book)"
                          class="flex-1 py-2.5 bg-white border-hard font-black text-sm hover-hard active-hard uppercase shadow-[2px_2px_0_#000]"
                        >
                          开始学习
                        </button>

                        <button 
                          v-else-if="book.status === 'COMPLETED'"
                          @click="openStudyConfigModal(book)"
                          class="flex-1 py-2.5 bg-white border-2 border-black font-black text-black text-sm hover:bg-black hover:text-white uppercase transition-colors"
                        >
                          复习 REVIEW
                        </button>

                        <!-- 重置进度按钮 (仅在有进度时显示) -->
                        <button 
                          v-if="book.learned > 0"
                          @click="resetProgress(book)"
                          class="w-10 h-10 shrink-0 bg-white border-2 border-black flex items-center justify-center hover:bg-brutal-red hover:text-white transition-colors"
                          title="重置学习进度"
                        >
                          <RotateCcw class="w-4 h-4" />
                        </button>
                      </div>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

          </template>
          
          <!-- 仅在整个书库没有任何书籍时，才显示去生成的空状态 -->
          <div v-if="mockData.allBooks.length === 0 && !isLoading" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Inbox class="w-16 h-16 mb-4 opacity-50" />
            <p class="font-black text-xl uppercase mb-6">NO BOOKS FOUND</p>
            <button 
              @click="router.push('/custom')"
              class="px-8 py-4 bg-brutal-green text-black border-3 border-black font-black text-lg hover:bg-brutal-yellow shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex justify-center items-center gap-2"
            >
              <Wand2 class="w-5 h-5" /> 去生成专属词书
            </button>
          </div>
          
          <!-- 当有书，但在当前筛选条件下为空时，显示简单的提示 -->
          <div v-else-if="filteredBooks.length === 0 && !isLoading" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Inbox class="w-16 h-16 mb-4 opacity-50" />
            <p class="font-black text-xl uppercase mb-2">暂无该状态下的词书</p>
            <p class="font-bold text-sm">请切换其他状态查看</p>
          </div>

          <!-- 加载中状态 -->
          <div v-if="isLoading" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 class="w-12 h-12 mb-4 animate-spin text-brutal-blue" />
            <p class="font-black text-xl uppercase animate-pulse">LOADING...</p>
          </div>

        </div>
      </div>
    </div>

    <!-- 学习模式选择弹窗 (Modal) -->
    <div v-if="showStudyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeStudyModal"></div>
      
      <div class="relative bg-white border-4 border-black shadow-[8px_8px_0_#E2F000] w-full max-w-md flex flex-col transform transition-all">
        <div class="p-6 border-b-4 border-black bg-brutal-blue text-white flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-2xl font-black uppercase mb-1">开始学习 // START</h3>
            <p class="font-bold text-white/80 text-sm line-clamp-1">{{ selectedBook?.title }}</p>
          </div>
          <button @click="closeStudyModal" class="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-brutal-pink hover:text-white transition-colors shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-8 bg-[#F4F4F0] space-y-6">
          <!-- 学习模式选择 -->
          <div class="space-y-4">
            <h4 class="font-black text-lg uppercase flex items-center gap-2">
              <span class="bg-black text-white px-2 py-1 text-sm">MODE</span> 学习模式
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="studyConfig.mode = 'zh_to_en'"
                :class="[
                  'py-4 border-2 font-black transition-all flex flex-col items-center justify-center gap-2',
                  studyConfig.mode === 'zh_to_en'
                    ? 'bg-black text-white border-black shadow-[4px_4px_0_#E2F000] transform -translate-y-1'
                    : 'bg-white text-black border-black hover:bg-brutal-blue hover:text-white'
                ]"
              >
                <span class="text-xl">汉译</span>
                <span class="text-xs font-bold opacity-80">看中文拼写外语</span>
              </button>
              
              <button 
                @click="studyConfig.mode = 'dictation'"
                :class="[
                  'py-4 border-2 font-black transition-all flex flex-col items-center justify-center gap-2',
                  studyConfig.mode === 'dictation'
                    ? 'bg-black text-white border-black shadow-[4px_4px_0_#E2F000] transform -translate-y-1'
                    : 'bg-white text-black border-black hover:bg-brutal-orange hover:text-white'
                ]"
              >
                <span class="text-xl">听写</span>
                <span class="text-xs font-bold opacity-80">听发音拼写外语</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 弹窗底部操作区 -->
        <div class="p-6 border-t-4 border-black bg-white">
          <button 
            @click="confirmStartStudy"
            class="w-full py-4 bg-brutal-green text-black border-4 border-black font-black text-xl hover:bg-brutal-yellow shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex justify-center items-center gap-2"
          >
            进入学习 <ArrowRight class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义确认弹窗 -->
    <ConfirmModal 
      v-model:isOpen="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="重置进度"
      cancelText="取消"
      @confirm="executeReset"
    />

    <!-- 删除确认弹窗 -->
    <ConfirmModal 
      v-model:isOpen="deleteConfirmModal.isOpen"
      :title="deleteConfirmModal.title"
      :message="deleteConfirmModal.message"
      confirmText="确认删除"
      cancelText="取消"
      @confirm="executeDelete"
    />

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { Plus, BookOpenCheck, GraduationCap, ArrowRight, Briefcase, Inbox, Terminal, X, CheckCircle, Search, Wand2, Loader2, RotateCcw, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'
import ConfirmModal from '~/components/ConfirmModal.vue'

const router = useRouter()
const { showToast } = useToast()

let currentUser = null

// 过滤器状态
const currentFilter = ref('全部')
const filters = ['全部', '学习中', '待学习', '已完成']

// 学习弹窗状态管理
const showStudyModal = ref(false)
const selectedBook = ref(null)
const isLoading = ref(true)
const studyConfig = reactive({
  mode: 'zh_to_en' // 'zh_to_en' (汉译英) 或 'dictation' (听写)
})

const openStudyConfigModal = (book) => {
  selectedBook.value = book
  showStudyModal.value = true
}

const closeStudyModal = () => {
  showStudyModal.value = false
  selectedBook.value = null
}

const confirmStartStudy = () => {
  if (!selectedBook.value) return
  
  const id = selectedBook.value.id
  const mode = studyConfig.mode
  
  closeStudyModal()
  router.push({
    path: '/study',
    query: { id, mode }
  })
}

// 确认弹窗状态
const confirmModal = reactive({
  isOpen: false,
  title: 'RESET PROGRESS // 重置进度',
  message: '',
  targetBook: null
})

// 点击重置按钮，打开弹窗
const resetProgress = (book) => {
  if (!currentUser || !currentUser.id) return
  
  confirmModal.targetBook = book
  confirmModal.message = `确定要重置《${book.title}》的学习进度吗？将从头开始学习。`
  confirmModal.isOpen = true
}

// 执行重置进度操作
const executeReset = async () => {
  const book = confirmModal.targetBook
  if (!book || !currentUser || !currentUser.id) return

  try {
    const result = await useAuthFetch('/api/vocabulary/progress', {
      method: 'POST',
      body: {
        id: book.id,
        learned_count: 0,
        status: 'not_started'
      }
    })
    if (result?.code === 200) {
      // 局部更新前端状态
      book.learned = 0
      book.percentage = 0
      book.status = 'PENDING'
      showToast('进度已重置', 'success')
    } else {
      showToast('重置失败', 'error')
    }
  } catch (e) {
    showToast('网络错误', 'error')
  }
}

// 删除确认弹窗状态
const deleteConfirmModal = reactive({
  isOpen: false,
  title: 'DELETE // 删除词库',
  message: '',
  targetBook: null
})

// 点击删除按钮，打开弹窗
const openDeleteConfirm = (book) => {
  if (!currentUser || !currentUser.id) return
  
  deleteConfirmModal.targetBook = book
  deleteConfirmModal.message = `确定要永久删除《${book.title || '当前词库'}》吗？此操作无法恢复。`
  deleteConfirmModal.isOpen = true
}

// 执行删除词库操作
const executeDelete = async () => {
  const book = deleteConfirmModal.targetBook
  if (!book || !currentUser || !currentUser.id) return

  try {
    // 假设删除接口为 /api/vocabulary/delete，如有不同请自行修改
    const result = await useAuthFetch('/api/vocabulary/delete', {
      method: 'POST',
      body: { id: book.id }
    })
    if (result?.code === 200) {
      // 局部更新前端状态：从列表中移除该词库
      mockData.allBooks = mockData.allBooks.filter(b => b.id !== book.id)
      showToast('词库已成功删除', 'success')
    } else {
      showToast(result?.error || '删除失败', 'error')
    }
  } catch (e) {
    showToast('网络错误', 'error')
  }
}

// 模拟 JSON 数据 (合并为一个数组，使用 status 区分)
const mockData = reactive({
  allBooks: []
})

// 根据过滤器计算要显示的词书
const filteredBooks = computed(() => {
  if (currentFilter.value === '全部') {
    return mockData.allBooks
  }
  
  // 将中文过滤器映射回数据的 status
  const statusMap = {
    '学习中': 'ACTIVE',
    '待学习': 'PENDING',
    '已完成': 'COMPLETED'
  }
  const targetStatus = statusMap[currentFilter.value]
  
  return mockData.allBooks.filter(book => book.status === targetStatus)
})

onMounted(async () => {
  try {
    const s = localStorage.getItem('user')
    currentUser = s ? JSON.parse(s) : null
  } catch {}

  if (!currentUser || !currentUser.id) {
    isLoading.value = false
    return
  }

  try {
    const result = await useAuthFetch('/api/vocabulary/list')
    if (result?.code === 200) {
      // Map API data to our frontend format
      const colors = ['bg-brutal-yellow', 'bg-brutal-pink', 'bg-brutal-blue', 'bg-brutal-green', 'bg-brutal-orange']
      
      const langMap = {
        'en': '英语',
        'es': '西语',
        'fr': '法语',
        'de': '德语',
        'ja': '日语',
        'ko': '韩语',
        'it': '意语',
        'ru': '俄语',
        'pt': '葡语',
        'ar': '阿语',
        'hi': '印地语'
      }

      mockData.allBooks = result.data.map((item, index) => {
        const colorClass = colors[index % colors.length]
        const langName = langMap[item.language] || item.language.toUpperCase()
        
        // 尝试从描述中提取标题，如果没有则使用默认格式
        let displayTitle = item.description 
          ? (item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description)
          : `${langName}专属词库`
          
        const learned = item.learned_count || 0
        const total = item.count || 0
        const percentage = total > 0 ? Math.round((learned / total) * 100) : 0
        
        // 映射后端 status 到前端需要的状态大写
        let frontendStatus = 'PENDING'
        if (item.status === 'completed' || percentage === 100) {
          frontendStatus = 'COMPLETED'
        } else if (item.status === 'in_progress' || learned > 0) {
          frontendStatus = 'ACTIVE'
        }

        return {
          id: item.id,
          title: displayTitle,
          description: item.description || `AI 定制 · 共 ${item.count} 词`,
          iconText: langName,
          isTextIcon: true,
          color: colorClass,
          progressColor: colorClass,
          textColor: `text-${colorClass.split('-')[1]}-${colorClass.split('-')[2]}`,
          rotate: index % 2 === 0 ? 'rotate-[3deg]' : 'rotate-[-3deg]',
          learned: learned,
          total: total,
          percentage: percentage,
          hasChapters: false,
          status: frontendStatus,
          created_at: new Date(item.created_at).toLocaleDateString(),
        }
      })
    } else {
      showToast(result.error || '获取词库失败', 'error')
    }
  } catch (e) {
    showToast('获取词库失败，请稍后重试', 'error')
  } finally {
    isLoading.value = false
  }
})
</script>