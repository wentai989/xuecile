<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden">
    <div class="h-16 border-b-3 border-black bg-brutal-orange text-white flex items-center justify-between px-8 shrink-0">
      <h2 class="text-3xl font-black uppercase tracking-widest">ERROR WORDS // 错词本</h2>
      <button @click="openReviewModal" class="bg-white text-black border-hard px-4 py-1.5 font-black uppercase shadow-hard-sm hover-hard active-hard text-sm flex items-center gap-2">
        <PlayCircle class="w-4 h-4" /> 开始复习 REVIEW
      </button>
    </div>

    <div class="flex-1 flex overflow-hidden bg-[#F4F4F0]">
      
      <!-- 左侧语言筛选侧边栏 (可选，目前先放顶部筛选更简洁，这里先留着结构或者直接在顶部做) -->

      <!-- 错词列表 -->
      <div class="flex-1 flex flex-col bg-[#F4F4F0]">
        <div class="border-b-3 border-black bg-white px-8 py-4 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <span class="font-black text-gray-500 uppercase flex items-center gap-2">错词 <span class="text-brutal-orange text-xl">{{ vocabList.length }}</span></span>
            
            <!-- 自定义粗野主义风格语言筛选器 -->
            <div class="relative inline-block" @click.stop="showLangDropdown = !showLangDropdown">
              <div class="bg-white border-2 border-black px-4 py-1.5 font-black text-sm cursor-pointer flex items-center gap-2 hover:bg-brutal-yellow transition-colors shadow-[2px_2px_0_#000]">
                {{ selectedLang === 'all' ? '全部语言 ALL' : languages.find(l => l.code === selectedLang)?.label || '语言' }}
                <ChevronDown class="w-4 h-4 transition-transform" :class="{'rotate-180': showLangDropdown}" />
              </div>
              
              <!-- 下拉菜单 -->
              <div v-if="showLangDropdown" class="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0_#000] z-20 max-h-60 overflow-y-auto">
                <div 
                  @click="selectLang('all')"
                  class="px-4 py-2 font-bold cursor-pointer border-b-2 border-black last:border-b-0 hover:bg-black hover:text-white transition-colors"
                  :class="{'bg-black text-white': selectedLang === 'all'}"
                >
                  全部语言 ALL
                </div>
                <div 
                  v-for="lang in languages" 
                  :key="lang.code"
                  @click="selectLang(lang.code)"
                  class="px-4 py-2 font-bold cursor-pointer border-b-2 border-black last:border-b-0 hover:bg-black hover:text-white transition-colors"
                  :class="{'bg-black text-white': selectedLang === lang.code}"
                >
                  {{ lang.label }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="sortBy = 'time'; fetchErrorWords()"
              :class="['px-4 py-1.5 font-black text-sm transition-all border-2 border-black', sortBy === 'time' ? 'bg-black text-white shadow-[2px_2px_0_#E2F000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-brutal-yellow']"
            >
              按时间
            </button>
            <button 
              @click="sortBy = 'count'; fetchErrorWords()"
              :class="['px-4 py-1.5 font-black text-sm transition-all border-2 border-black', sortBy === 'count' ? 'bg-black text-white shadow-[2px_2px_0_#E2F000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-brutal-yellow']"
            >
              按错误次数
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 hide-scrollbar relative" @click="showLangDropdown = false">
          <!-- 加载中 -->
          <LoadingSpinner v-if="isLoading" text="LOADING ERRORS..." />

          <!-- 空状态 -->
          <div v-else-if="vocabList.length === 0" class="flex flex-col items-center justify-center h-full opacity-50">
            <Inbox class="w-16 h-16 mb-4" />
            <p class="font-black text-xl">暂无错词记录</p>
          </div>

          <div v-else class="max-w-7xl mx-auto space-y-4">
          
          <!-- 动态渲染单词列表 -->
          <div 
            v-for="(vocab, index) in vocabList" 
            :key="vocab.id"
            class="border-hard bg-white p-4 shadow-hard-sm flex items-center justify-between group hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-6">
              <div :class="`w-14 h-14 ${getColor(vocab.error_count)} border-hard flex flex-col items-center justify-center font-black ${index % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'}`">
                <span :class="['text-xl leading-none', getColor(vocab.error_count) === 'bg-black' ? 'text-white' : 'text-black']">{{ vocab.error_count }}</span>
                <span :class="['text-[10px] uppercase', getColor(vocab.error_count) === 'bg-black' ? 'text-white' : 'text-black']">{{ vocab.error_count > 1 ? 'TIMES' : 'TIME' }}</span>
              </div>
              <div>
                <div class="flex items-end gap-3 mb-1">
                  <span class="font-black text-2xl">{{ vocab.word }}</span>
                  <span class="font-bold text-gray-600">{{ vocab.phonetic }}</span>
                  <span class="text-xs font-bold bg-gray-200 px-2 py-0.5 rounded">{{ getLanguageLabel(vocab.language) }}</span>
                </div>
                <p class="font-bold text-lg">{{ vocab.translation }}</p>
              </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="playAudio(vocab.word, vocab.language)" class="w-12 h-12 bg-white border-hard flex items-center justify-center hover:bg-brutal-yellow active-hard shadow-hard-sm">
                <Volume2 class="w-5 h-5 font-black" />
              </button>
              <button class="w-12 h-12 bg-white border-hard flex items-center justify-center hover:bg-brutal-orange text-black hover:text-white active-hard shadow-hard-sm">
                <Trash2 class="w-5 h-5 font-black" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 开始复习弹窗 Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeReviewModal"></div>
      
      <!-- 弹窗内容 (新粗野主义风格) -->
      <div class="relative bg-white border-4 border-black shadow-[8px_8px_0_#E2F000] w-full max-w-lg flex flex-col transform transition-all">
        <!-- 弹窗头部 -->
        <div class="p-6 border-b-4 border-black bg-brutal-orange text-white flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-2xl font-black uppercase mb-1">开始复习 // REVIEW</h3>
            <p class="font-bold text-white/80 text-sm">定制你的本次复习计划</p>
          </div>
          <button @click="closeReviewModal" class="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-brutal-yellow transition-colors shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- 弹窗表单内容 -->
        <div class="p-8 bg-[#F4F4F0] space-y-8">
          
          <!-- 复习语言选择 -->
          <div class="space-y-4">
            <h4 class="font-black text-lg uppercase flex items-center gap-2">
              <span class="bg-black text-white px-2 py-1 text-sm">01</span> 复习语言
            </h4>
            <div class="grid grid-cols-3 gap-3">
              <button 
                v-for="lang in languages" 
                :key="lang.code"
                @click="reviewConfig.language = lang.code"
                :class="[
                  'py-2 border-2 font-black text-sm transition-all',
                  reviewConfig.language === lang.code
                    ? 'bg-black text-white border-black shadow-[2px_2px_0_#E2F000] transform -translate-y-0.5'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                ]"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>

          <!-- 复习策略选择 -->
          <div class="space-y-4">
            <h4 class="font-black text-lg uppercase flex items-center gap-2">
              <span class="bg-black text-white px-2 py-1 text-sm">02</span> 复习策略
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="reviewConfig.strategy = 'recent'"
                :class="[
                  'p-4 border-2 font-black transition-all flex flex-col items-start gap-1',
                  reviewConfig.strategy === 'recent'
                    ? 'bg-black text-white border-black shadow-[4px_4px_0_#E2F000] transform -translate-y-1'
                    : 'bg-white text-black border-black hover:bg-brutal-blue hover:text-white'
                ]"
              >
                <span class="text-xl">近期错词</span>
                <span class="text-xs font-bold opacity-80">优先复习最近出错的单词</span>
              </button>
              <button 
                @click="reviewConfig.strategy = 'high_error'"
                :class="[
                  'p-4 border-2 font-black transition-all flex flex-col items-start gap-1',
                  reviewConfig.strategy === 'high_error'
                    ? 'bg-black text-white border-black shadow-[4px_4px_0_#E2F000] transform -translate-y-1'
                    : 'bg-white text-black border-black hover:bg-brutal-pink hover:text-white'
                ]"
              >
                <span class="text-xl">高错误率</span>
                <span class="text-xs font-bold opacity-80">攻克历史累计错得最多的词</span>
              </button>
            </div>
          </div>

          <!-- 复习数量选择 -->
          <div class="space-y-4">
            <h4 class="font-black text-lg uppercase flex items-center gap-2">
              <span class="bg-black text-white px-2 py-1 text-sm">03</span> 复习数量
            </h4>
            <div class="grid grid-cols-4 gap-3">
              <button 
                v-for="count in [10, 20, 30, 50]" 
                :key="count"
                @click="reviewConfig.count = count"
                :class="[
                  'py-3 border-2 font-black text-lg transition-all',
                  reviewConfig.count === count
                    ? 'bg-black text-white border-black shadow-[2px_2px_0_#E2F000] transform -translate-y-0.5'
                    : 'bg-white text-black border-black hover:bg-gray-100'
                ]"
              >
                {{ count }}
              </button>
            </div>
          </div>

          <!-- 学习模式选择 -->
          <div class="space-y-4">
            <h4 class="font-black text-lg uppercase flex items-center gap-2">
              <span class="bg-black text-white px-2 py-1 text-sm">04</span> 学习模式
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="reviewConfig.mode = 'zh_to_target'"
                :class="[
                  'py-3 border-2 font-black text-sm transition-all',
                  reviewConfig.mode === 'zh_to_target'
                    ? 'bg-black text-white border-black shadow-[2px_2px_0_#E2F000] transform -translate-y-0.5'
                    : 'bg-white text-black border-black hover:bg-brutal-pink hover:text-white'
                ]"
              >
                中译
              </button>
              <button 
                @click="reviewConfig.mode = 'dictation'"
                :class="[
                  'py-3 border-2 font-black text-sm transition-all flex items-center justify-center gap-1',
                  reviewConfig.mode === 'dictation'
                    ? 'bg-black text-white border-black shadow-[2px_2px_0_#E2F000] transform -translate-y-0.5'
                    : 'bg-white text-black border-black hover:bg-brutal-orange hover:text-white'
                ]"
              >
                <Volume2 class="w-4 h-4" /> 听写模式
              </button>
            </div>
          </div>

        </div>

        <!-- 弹窗底部操作区 -->
        <div class="p-6 border-t-4 border-black bg-white">
          <button 
            @click="startReviewAction"
            class="w-full py-4 bg-brutal-green text-black border-4 border-black font-black text-xl hover:bg-brutal-yellow shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex justify-center items-center gap-2"
          >
            开始 START <PlayCircle class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { PlayCircle, Volume2, Trash2, X, Loader2, Inbox, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'
import { languages } from '~/composables/useLanguage'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

const router = useRouter()
const { showToast } = useToast()

const vocabList = ref([])
const isLoading = ref(true)
const selectedLang = ref('all')
const showLangDropdown = ref(false)
const sortBy = ref('time') // 'time' 或 'count'

const selectLang = (code) => {
  selectedLang.value = code
  showLangDropdown.value = false
  fetchErrorWords()
}

// 辅助函数：将语言代码转换为完整的显示名称
const getLanguageLabel = (code) => {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.label : code.toUpperCase()
}

const getColor = (count) => {
  if (count >= 5) return 'bg-brutal-pink'
  if (count >= 3) return 'bg-brutal-orange'
  if (count >= 2) return 'bg-brutal-yellow'
  return 'bg-white'
}

const fetchErrorWords = async () => {

 

  
  isLoading.value = true
  try {
    const res = await useAuthFetch(`/api/error-words/list`, {
      params: {
        language: selectedLang.value
      }
    })
    if (res?.code === 200) {
      let data = res.data || []
      
      // 前端进行排序 (因为后端的 orderBy 只能固化一种，或者我们需要在后端动态拼接，这里前端排序更灵活)
      if (sortBy.value === 'time') {
        data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      } else {
        data.sort((a, b) => b.error_count - a.error_count)
      }
      
      vocabList.value = data
    } else {
      showToast('获取错词本失败', 'error')
    }
  } catch (e) {
    showToast('网络错误', 'error')
  } finally {
    isLoading.value = false
  }
}

// 简单的发音调用 (借用系统自带的 SpeechSynthesis，如果需要更复杂的可以引入 useSettings)
const playAudio = (word, lang) => {
  const utterance = new SpeechSynthesisUtterance(word)
  // 简易映射，后续可复用 study.vue 的逻辑
  const map = { 'en': 'en-US', 'ja': 'ja-JP', 'fr': 'fr-FR' }
  utterance.lang = map[lang] || lang
  window.speechSynthesis.speak(utterance)
}

onMounted(() => {

  fetchErrorWords()
})

// 复习弹窗状态与配置
const showReviewModal = ref(false)
const reviewConfig = reactive({
  language: 'en',
  strategy: 'recent', // 'recent' 或 'high_error'
  count: 20,
  mode: 'zh_to_target' // 默认中译: 'zh_to_target' (中译), 'dictation' (听写)
})

const openReviewModal = () => {
  if (selectedLang.value !== 'all') {
    reviewConfig.language = selectedLang.value
  }
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
}

const startReviewAction = () => {
  closeReviewModal()
  
  if (!reviewConfig.language) {
    showToast('请选择复习语言', 'error')
    return
  }
  
  // 跳转到学习页面，带有特殊标识 id=error_words 以及筛选参数
  router.push({
    path: '/study',
    query: {
      id: 'error_words',
      language: reviewConfig.language,
      strategy: reviewConfig.strategy,
      count: reviewConfig.count,
      mode: reviewConfig.mode
    }
  })
}
</script>