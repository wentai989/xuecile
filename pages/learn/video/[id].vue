<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden relative">
    <div class="h-16 border-b-3 border-black bg-brutal-green flex items-center px-8 justify-between shrink-0">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="hover:text-white transition-colors bg-black text-white p-1 border-2 border-black rounded-full hover:bg-white hover:text-black">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-3xl font-black uppercase tracking-widest">WATCH & LEARN // 边看边学</h2>
      </div>
      <div class="font-bold text-sm bg-black text-white px-3 py-1 border-2 border-black shadow-[2px_2px_0_#fff]">
        LEARNING MODE
      </div>
    </div>
    
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧：视频播放区 -->
      <div class="flex-[5] flex flex-col border-r-3 border-black bg-black relative group">
        <!-- 占位视频，使用一个免版权的占位视频 -->
        <video 
          ref="videoPlayer"
          class="w-full h-full object-contain"
          controls
          :src="videoSrc"
          @timeupdate="handleTimeUpdate"
        >
          Your browser does not support the video tag.
        </video>
        
        <!-- 视频上方的提示信息 -->
        <div v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#E2F000] rotate-[-2deg] text-center pointer-events-auto">
            <h3 class="text-2xl font-black mb-2">点击播放视频</h3>
            <p class="font-bold text-gray-600">右侧字幕将自动同步，点击单词可查看释义</p>
          </div>
        </div>
      </div>

      <!-- 右侧：交互学习区 -->
      <div class="flex-[3] flex flex-col bg-[#F4F4F0] relative overflow-hidden">
        
        <!-- 顶部 Tab 切换 -->
        <div class="flex border-b-3 border-black shrink-0 bg-white items-center">
          <button 
            class="flex-1 py-4 font-black text-lg border-r-3 border-black transition-colors"
            :class="activeTab === 'subtitles' ? 'bg-brutal-green text-black' : 'hover:bg-gray-100'"
            @click="activeTab = 'subtitles'"
          >
            互动字幕
          </button>
          <button 
            class="flex-1 py-4 font-black text-lg border-r-3 border-black transition-colors"
            :class="activeTab === 'ai' ? 'bg-brutal-yellow text-black' : 'hover:bg-gray-100'"
            @click="activeTab = 'ai'"
          >
            AI 导师
          </button>
          <!-- 拼写模式开关 -->
          <div class="px-6 flex items-center gap-2">
            <span class="font-bold text-sm uppercase">拼写测验</span>
            <button 
              @click="isSpellingMode = !isSpellingMode"
              class="w-12 h-6 rounded-full border-2 border-black relative transition-colors"
              :class="isSpellingMode ? 'bg-brutal-orange' : 'bg-gray-300'"
            >
              <div 
                class="w-4 h-4 bg-white border-2 border-black rounded-full absolute top-0.5 transition-all"
                :class="isSpellingMode ? 'left-6.5' : 'left-0.5'"
              ></div>
            </button>
          </div>
        </div>

        <!-- 字幕区 -->
        <div v-show="activeTab === 'subtitles'" class="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar relative scroll-smooth" ref="subtitlesContainer">
          <div 
            v-for="(sub, index) in subtitles" 
            :key="index"
            :id="`sub-${index}`"
            class="p-4 border-2 rounded-xl transition-all cursor-pointer"
            :class="[
              currentSubtitleIndex === index 
                ? 'border-black bg-white shadow-[4px_4px_0_#000] transform -translate-y-1' 
                : 'border-transparent hover:border-gray-300 hover:bg-white/50'
            ]"
            @click="seekVideo(sub.start)"
          >
            <div class="text-xs font-bold text-gray-400 mb-2 flex justify-between">
              <span>{{ formatTime(sub.start) }} - {{ formatTime(sub.end) }}</span>
              <span v-if="currentSubtitleIndex === index" class="text-brutal-green flex items-center gap-1">
                <div class="w-2 h-2 bg-brutal-green rounded-full animate-pulse"></div> 当前播放
              </span>
            </div>
            
            <p class="text-lg font-black leading-relaxed mb-2 flex flex-wrap gap-x-1.5 gap-y-1">
              <span 
                v-for="(word, wIndex) in sub.words" 
                :key="wIndex"
                @click.stop="handleWordClick(word.text, sub.en)"
                class="hover:bg-brutal-yellow hover:text-black px-1 rounded transition-colors relative group"
                :class="{'bg-brutal-yellow/30 text-black border-b-2 border-black': word.isKeyWord}"
              >
                <!-- 拼写模式下，如果单词长度大于1（过滤掉单独的标点符号等）则隐藏并显示输入框 -->
                <template v-if="isSpellingMode && word.text.replace(/[.,!?]/g, '').length > 1">
                  <input 
                    type="text" 
                    :placeholder="'_'.repeat(word.text.replace(/[.,!?]/g, '').length)"
                    class="w-16 bg-white border-2 border-black text-center font-mono outline-none focus:bg-brutal-yellow/20 mx-0.5"
                    :style="{ width: `${word.text.replace(/[.,!?]/g, '').length * 1.2 + 1}rem` }"
                    @click.stop
                    @keyup.enter="(e) => checkSpelling(e, word.text)"
                  />
                </template>
                <template v-else>
                  {{ word.text }}
                </template>
              </span>
            </p>
            <p class="text-gray-600 font-bold text-sm">{{ sub.zh }}</p>
          </div>
          
          <!-- 底部留白，方便最后一条字幕居中 -->
          <div class="h-32"></div>
        </div>

        <!-- AI 导师区 -->
        <div v-show="activeTab === 'ai'" class="flex-1 flex flex-col h-full absolute inset-0 top-[63px]">
           <AIChatBox 
             :current-word="selectedWord"
             :current-translation="selectedWordContext"
             current-language="en"
             :quick-commands="[
               { text: '详细解释这个词', label: '详细释义', colorClass: 'hover:bg-brutal-blue hover:text-white' },
               { text: '再给几个例句', label: '更多例句', colorClass: 'hover:bg-brutal-green hover:text-black' },
               { text: '帮我分析它的词根词缀', label: '词根词缀', colorClass: 'hover:bg-brutal-pink hover:text-black' }
             ]"
           />
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import AIChatBox from '~/components/AIChatBox.vue'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'

const { showToast } = useToast()
const router = useRouter()

const activeTab = ref('subtitles')
const videoPlayer = ref(null)
const videoSrc = ref('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
const subtitlesContainer = ref(null)
const isPlaying = ref(false)
const currentSubtitleIndex = ref(-1)
const isSpellingMode = ref(false)

const selectedWord = ref('Bunny')
const selectedWordContext = ref('兔子 (点击字幕中的单词查看解释)')

// 模拟的字幕 JSON 数据，包含时间戳、原文、翻译、分词信息
const subtitles = ref([])

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const handleTimeUpdate = () => {
  if (!videoPlayer.value) return
  
  const currentTime = videoPlayer.value.currentTime
  
  // 查找当前时间对应的字幕索引
  const index = subtitles.value.findIndex(sub => currentTime >= sub.start && currentTime <= sub.end)
  
  if (index !== currentSubtitleIndex.value) {
    currentSubtitleIndex.value = index
    
    // 如果找到了对应的字幕，并且当前不在手动滚动，自动滚动到该字幕
    if (index !== -1 && subtitlesContainer.value) {
      const el = document.getElementById(`sub-${index}`)
      if (el) {
        // 使用原生 API 滚动，保持元素在容器中间
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
}

const seekVideo = (time) => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = time
    videoPlayer.value.play()
  }
}

const handleWordClick = (wordText, contextSentence) => {
  if (isSpellingMode.value) return // 拼写模式下点击不查词
  // 清除标点符号
  const cleanWord = wordText.replace(/[.,!?]/g, '')
  selectedWord.value = cleanWord
  selectedWordContext.value = `上下文: "${contextSentence}"`
  activeTab.value = 'ai' // 自动切换到 AI 标签页
}

const checkSpelling = (e, correctWord) => {
  const inputVal = e.target.value.trim().toLowerCase()
  const targetVal = correctWord.replace(/[.,!?]/g, '').toLowerCase()
  
  if (inputVal === targetVal) {
    showToast('拼写正确！', 'success')
    e.target.classList.remove('border-black', 'border-red-500', 'bg-white')
    e.target.classList.add('border-brutal-green', 'bg-brutal-green/20', 'text-brutal-green')
    // 稍微延迟后可以自动切回显示单词，或者保持正确状态
  } else {
    showToast('拼写错误，请重试', 'error')
    e.target.classList.add('border-red-500', 'animate-shake')
    setTimeout(() => e.target.classList.remove('animate-shake'), 500)
  }
}

onMounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.addEventListener('play', () => isPlaying.value = true)
    videoPlayer.value.addEventListener('pause', () => isPlaying.value = false)
  }
  
  // 尝试从 localStorage 读取千问生成的字幕
  try {
    const saved = localStorage.getItem('temp_video_subtitles')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 给生成的字幕附加上模拟时间戳
        let currentTime = 0
        subtitles.value = parsed.map((sub, index) => {
          const start = currentTime
          const end = currentTime + 5 // 每句 5 秒
          currentTime += 5
          return {
            start,
            end,
            en: sub.en || '',
            zh: sub.zh || '',
            words: sub.words || []
          }
        })
      }
    }
  } catch(e) {}
  
  if (subtitles.value.length === 0) {
    subtitles.value = [
      {
        start: 0,
        end: 10,
        en: "Welcome to the Big Buck Bunny short film.",
        zh: "欢迎观看《大雄兔》动画短片。",
        words: [
          { text: "Welcome", isKeyWord: false },
          { text: "to", isKeyWord: false },
          { text: "the", isKeyWord: false },
          { text: "Big", isKeyWord: false },
          { text: "Buck", isKeyWord: false },
          { text: "Bunny", isKeyWord: true },
          { text: "short", isKeyWord: false },
          { text: "film.", isKeyWord: false }
        ]
      }
    ]
  }
})
</script>