<template>
  <div class="h-full flex gap-6">
    <!-- 左侧：背单词区 -->
    <div class="flex-[3] bg-white border-hard shadow-hard rounded-xl flex flex-col relative overflow-hidden">
      <!-- 顶部装饰栏 -->
      <div class="h-14 border-b-3 border-black bg-brutal-yellow flex items-center justify-between px-6">
        <div class="font-black uppercase tracking-widest text-lg">{{ mockData.studySession.title }}</div>
        <div class="flex items-center gap-4">
          <span class="font-black">{{ mockData.studySession.progress.current }} / {{ mockData.studySession.progress.total }} WORDS</span>
          <div class="w-32 h-4 border-2 border-black bg-white relative">
            <div class="absolute top-0 left-0 h-full bg-black" :style="{ width: `${mockData.studySession.progress.percentage}%` }"></div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center p-12 relative">
        <!-- 大色块标签 -->
        <div class="absolute top-8 left-8 bg-brutal-pink border-hard px-4 py-2 font-black shadow-hard-sm rotate-[-3deg] uppercase">
          {{ studyState.mode === 'dictation' ? '听写模式' : '汉译模式' }}
        </div>
        
        <!-- 提示区域 (中文翻译) -->
        <div v-if="studyState.mode === 'zh_to_target' || studyState.showAnswer" class="text-3xl font-bold mb-8 text-center px-4 py-2 bg-gray-100 border-2 border-black border-dashed">
          {{ mockData.currentWord.translation }}
        </div>
        <div v-else class="text-3xl font-bold mb-8 text-center px-4 py-2 bg-gray-100 border-2 border-black border-dashed opacity-50 flex items-center gap-2 cursor-pointer hover:opacity-100" @click="playAudio">
          <Volume2 class="w-8 h-8" /> 点击听发音
        </div>

        <!-- 单词/句子显示 (如果是汉译或者听写，未显示答案时隐藏) -->
        <h1 
          class="font-black mb-6 tracking-tight text-center transition-all px-4"
          :class="[
            studyState.showAnswer ? 'text-black' : 'blur-lg select-none opacity-20',
            mockData.currentWord.word.length > 20 ? 'text-4xl md:text-5xl leading-tight' : 'text-6xl md:text-8xl'
          ]"
        >
          {{ mockData.currentWord.word }}
        </h1>
        
        <div 
          v-if="studyState.showAnswer"
          class="flex items-center justify-center text-2xl font-bold mb-12 px-6 py-2 transition-all bg-gray-100 border-hard shadow-hard-sm"
        >
          <span v-if="mockData.currentWord.phonetic">{{ mockData.currentWord.phonetic }}</span>
        </div>
        <div v-else class="h-14 mb-12"></div>
        
        <!-- 拼写输入区 (按单词分割) -->
        <div class="w-full max-w-4xl text-center space-y-4 relative mt-4">
          <form @submit.prevent="checkSpelling" class="relative">
            <div 
              class="flex flex-wrap items-center justify-center gap-y-4 font-black"
              :class="mockData.currentWord.word.length > 30 ? 'text-xl md:text-2xl gap-x-1' : (mockData.currentWord.word.length > 15 ? 'text-2xl md:text-3xl gap-x-2' : 'text-3xl md:text-4xl gap-x-3')"
            >
              <template v-for="(token, idx) in parsedSentence" :key="`${studyState.currentIndex}-${idx}`">
                <!-- 如果是单词，显示输入框 -->
                <input
                  v-if="token.type === 'word'"
                  :ref="el => { if (el) wordInputs[token.index] = el }"
                  v-model="userInputs[token.index]"
                  @keydown="e => handleInputKeydown(e, token.index, token)"
                  @input="() => { 
                    playTypingSound(); 
                    studyState.errorIndices = studyState.errorIndices.filter(i => i !== token.index);
                    studyState.showAnswer = false;
                  }"
                  type="text"
                  :style="{ width: `${Math.max(3, token.text.length, (userInputs[token.index] || '').length) * 1.5}ch`, maxWidth: '100%' }"
                  class="text-center border-b-4 border-black outline-none focus:bg-brutal-yellow/20 transition-all duration-100 disabled:bg-transparent"
                  :class="{
                    'bg-red-200 border-red-500 text-red-600 focus:bg-red-300': studyState.errorIndices.includes(token.index),
                    'border-green-500 text-green-600': studyState.isCorrect && studyState.showAnswer,
                    'bg-transparent': !studyState.errorIndices.includes(token.index)
                  }"
                />
                <!-- 如果是标点/空格，直接显示 -->
                <span v-else class="whitespace-pre text-gray-500">{{ token.text }}</span>
              </template>
            </div>
            
            <!-- 结果提示标签 -->
            <div v-if="studyState.errorIndices.length > 0" class="absolute -top-10 right-0 bg-[#FF4D4F] text-white font-black px-3 py-1 border-2 border-black rotate-3 z-10 text-sm">
              INCORRECT
            </div>
            <div v-if="studyState.isCorrect && studyState.showAnswer" class="absolute -top-12 right-0 bg-[#E2F000] text-black font-black px-3 py-1 border-2 border-black rotate-3 z-10 text-sm flex flex-col items-center">
              <span>PERFECT!</span>
              <span class="text-[10px] font-bold opacity-80 mt-1">Press ENTER for next</span>
            </div>
          </form>
          <p class="font-bold text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
            按 <kbd class="bg-gray-200 px-2 py-1 rounded text-black border border-gray-400">SPACE</kbd> 切换到下一个词，按 <kbd class="bg-gray-200 px-2 py-1 rounded text-black border border-gray-400">ENTER</kbd> 提交答案
          </p>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="h-24 border-t-3 border-black bg-white flex items-center justify-between px-8 gap-4">
        <button 
          @click="handlePrev" 
          :disabled="studyState.currentIndex === 0"
          class="px-6 py-3 bg-white border-hard shadow-hard-sm font-black text-lg hover-hard active-hard uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一题
        </button>
        <button @click="showCorrectAnswer" :disabled="studyState.showAnswer" class="px-6 py-3 bg-brutal-blue text-white border-hard shadow-hard-sm font-black text-lg hover-hard active-hard uppercase disabled:opacity-50 disabled:cursor-not-allowed">显示答案</button>
        
        <div class="flex-1 flex justify-center">
          <!-- 播放发音按钮移至中间 -->
          <button @click="playAudio" class="px-6 py-3 bg-brutal-yellow border-hard shadow-hard-sm font-black text-lg hover-hard active-hard uppercase flex items-center gap-2">
            <Volume2 class="w-6 h-6" /> 听发音
          </button>
        </div>
        
        <button @click="openSettings" class="px-6 py-3 bg-white border-hard shadow-hard-sm font-black text-lg hover-hard active-hard uppercase flex items-center gap-2">
          <Settings class="w-5 h-5" /> 设置
        </button>
        <button @click="handleNext" class="px-10 py-3 bg-brutal-green border-hard shadow-hard-sm font-black text-lg hover-hard active-hard uppercase">下一题</button>
      </div>
    </div>

    <!-- 右侧：AI 助手区 -->
    <AIChatBox 
      :current-word="mockData.currentWord.word"
      :current-translation="mockData.currentWord.translation"
      :current-language="studyState.language"
      :quick-commands="mockData.quickCommands"
    />

    <!-- 设置弹窗 -->
    <SettingsModal v-model:isOpen="showSettingsModal" />

    <!-- 学习结束结算弹窗 -->
    <div v-if="studyState.showStatsModal" @click.self="studyState.showStatsModal = false" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-white border-4 border-black shadow-[12px_12px_0_#E2F000] w-full max-w-md relative flex flex-col transform transition-all">
        <!-- 关闭按钮 -->
        <button @click="studyState.showStatsModal = false" class="absolute -top-4 -right-4 w-10 h-10 bg-brutal-pink border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors z-10 shadow-[4px_4px_0_#000]">
          <X class="w-6 h-6 font-black" />
        </button>

        <div class="p-6 border-b-4 border-black bg-brutal-blue text-white flex items-center justify-center">
          <h2 class="font-black text-3xl uppercase tracking-widest flex items-center gap-3">
            <Sparkles class="w-8 h-8" /> 学习完成!
          </h2>
        </div>
        
        <div class="p-8 space-y-6 bg-[#F4F4F0]">
          <div class="grid grid-cols-2 gap-4">
            <!-- 学习时长 -->
            <div class="bg-white border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-gray-500 uppercase mb-1">耗时 TIME</span>
              <span class="text-2xl font-black">{{ studyDuration }}</span>
            </div>
            
            <!-- 正确率 -->
            <div class="bg-white border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-gray-500 uppercase mb-1">正确率 ACCURACY</span>
              <span class="text-3xl font-black" :class="parseInt(accuracyRate) > 80 ? 'text-brutal-green' : 'text-brutal-orange'">{{ accuracyRate }}</span>
            </div>
            
            <!-- 正确数 -->
            <div class="bg-brutal-green border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-black uppercase mb-1">一遍过 CORRECT</span>
              <span class="text-3xl font-black">{{ studyState.correctCount }}</span>
            </div>
            
            <!-- 错误数 -->
            <div class="bg-brutal-pink border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-black uppercase mb-1">拼错 ERROR</span>
              <span class="text-3xl font-black">{{ studyState.errorCount }}</span>
            </div>

            <!-- 平均耗时 -->
            <div class="bg-brutal-yellow border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-black uppercase mb-1">平均每词 AVG</span>
              <span class="text-2xl font-black">{{ avgTimePerWord }}</span>
            </div>

            <!-- 最高连对 -->
            <div class="bg-brutal-blue text-white border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#000]">
              <span class="text-xs font-black text-white/80 uppercase mb-1">最高连对 STREAK</span>
              <span class="text-3xl font-black">{{ studyState.maxStreak }}</span>
            </div>
          </div>
          
          <div class="text-center font-bold text-gray-600 text-sm">
            错词已自动加入 <span class="text-black font-black">错词本</span>，记得复习哦！
          </div>
        </div>

        <div class="p-6 border-t-4 border-black bg-white flex gap-4">
          <button @click="router.push('/error-words')" class="flex-1 py-4 bg-white font-black text-lg border-4 border-black hover:bg-gray-100 transition-colors uppercase shadow-[4px_4px_0_#000]">
            去复习错词
          </button>
          <button @click="router.push('/library')" class="flex-1 py-4 bg-brutal-yellow font-black text-lg border-4 border-black hover:bg-black hover:text-white transition-colors uppercase shadow-[4px_4px_0_#000]">
            返回词库
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted, computed, onUnmounted } from 'vue'
import { Volume2, Keyboard, Check, Sparkles, Settings, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'
import { useSound } from '~/composables/useSound'
import { useSettings } from '~/composables/useSettings'
import SettingsModal from '~/components/SettingsModal.vue'
import AIChatBox from '~/components/AIChatBox.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { playTypingSound, playSuccessSound, playErrorSound } = useSound()
const { userSettings, loadSettings } = useSettings()

const studyState = reactive({
  vocabularyId: null, // 记录当前词库ID
  wordsData: [],
  currentIndex: 0,
  isLoading: true,
  mode: 'zh_to_target', // 'zh_to_target' | 'dictation'
  showAnswer: false,
  isCorrect: false,
  errorIndices: [], // 存储输入错误的单词索引
  language: 'en', // 当前词库的语言
  hasRecordedError: false, // 标记当前单词是否已经记录过生词表，防止多次记录
  
  // 学习统计数据
  startTime: null,
  correctCount: 0,
  errorCount: 0,
  currentStreak: 0, // 当前连对数
  maxStreak: 0,     // 最高连对数
  showStatsModal: false // 控制结束弹窗显示
})

// 存储每个输入框的引用和用户输入的值
const wordInputs = ref([])
const userInputs = ref([])

// 模拟 JSON 数据
const mockData = reactive({
  studySession: {
    title: 'Loading...',
    progress: {
      current: 0,
      total: 0,
      percentage: 0
    }
  },
  currentWord: {
    word: '',
    partOfSpeech: '',
    phonetic: '',
    options: []
  },
  quickCommands: [
    { label: '+ 详细释义', text: '请给出详细释义和常见搭配', colorClass: 'hover:bg-brutal-yellow' },
    { label: '+ 更多例句', text: '请提供2个真实生活场景中的双语例句', colorClass: 'hover:bg-brutal-pink' },
    { label: '+ 记忆技巧', text: '请提供词源分析、构成或相关的记忆技巧', colorClass: 'hover:bg-brutal-blue hover:text-white' }
  ]
})

// 将当前单词/句子解析为数组：包含字母部分和标点/空格部分
const parsedSentence = computed(() => {
  const text = mockData.currentWord.word
  if (!text) return []

  // 使用 Unicode 正则匹配，支持全球所有语言（包括带有声调的西语、法语，以及日韩文字）
  // \p{L} 匹配任何语言的字母/汉字/假名，\p{N} 匹配数字
  // ([\p{L}\p{N}'-]+) 匹配“单词/字”，([^\p{L}\p{N}'-]+) 匹配标点、空格等
  const tokens = text.match(/([\p{L}\p{N}'-]+)|([^\p{L}\p{N}'-]+)/gu) || []
  
  let inputIndex = 0
  return tokens.map(token => {
    // 判断该 token 是否是需要输入的“单词/字”
    const isWord = /^[\p{L}\p{N}'-]+$/u.test(token)
    if (isWord) {
      return {
        type: 'word',
        text: token,
        index: inputIndex++ // 为每个单词分配一个递增的索引，方便绑定和焦点管理
      }
    } else {
      return {
        type: 'separator',
        text: token
      }
    }
  })
})

const handleInputKeydown = (e, currentIndex, tokenObj) => {
  // 如果已经拼写正确，按回车直接进入下一题
  if (studyState.isCorrect && e.key === 'Enter') {
    e.preventDefault()
    handleNext()
    return
  }

  // 答对后，拦截其他输入，只允许按回车或通过按钮跳过
  if (studyState.isCorrect) {
    e.preventDefault()
    return
  }

  // 如果按下空格，或者输入了对应单词的最后一个字母，则跳到下一个输入框
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    if (e.key === 'Enter') {
      checkSpelling()
    } else {
      focusNextInput(currentIndex)
    }
  } else if (e.key === 'Backspace' && !userInputs.value[currentIndex]) {
    // 如果当前输入框为空，按退格键退回到上一个输入框
    e.preventDefault()
    focusPrevInput(currentIndex)
  }
}

const focusNextInput = (currentIndex) => {
  const nextIndex = currentIndex + 1
  if (wordInputs.value[nextIndex]) {
    wordInputs.value[nextIndex].focus()
  }
}

const focusPrevInput = (currentIndex) => {
  const prevIndex = currentIndex - 1
  if (wordInputs.value[prevIndex]) {
    wordInputs.value[prevIndex].focus()
  }
}

const showSettingsModal = ref(false)

// 保存当前正在播放的在线音频实例
let currentOnlineAudio = null

const openSettings = () => {
  showSettingsModal.value = true
}

// 辅助函数：将应用内的语言代码映射为Google Translate TTS支持的语言代码
const getGoogleLangCode = (lang) => {
  const map = {
    'en': 'en',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'ja': 'ja',
    'ko': 'ko',
    'it': 'it',
    'ru': 'ru',
    'pt': 'pt',
    'ar': 'ar',
    'hi': 'hi'
  }
  return map[lang] || 'en'
}

const playOnlineAudio = (text, lang) => {
  // 如果之前有在线音频正在播放，先暂停它
  if (currentOnlineAudio) {
    currentOnlineAudio.pause()
    currentOnlineAudio.currentTime = 0
  }
  
  const googleLang = getGoogleLangCode(lang)
  // 使用 Google Translate 的非公开 TTS 接口，支持几乎所有语言
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${googleLang}&client=tw-ob`
  
  currentOnlineAudio = new Audio(url)
  
  // 设置在线音频的语速
  const rate = Number(userSettings.rate) || 1.0
  currentOnlineAudio.playbackRate = rate
  currentOnlineAudio.preservesPitch = true

  currentOnlineAudio.addEventListener('loadedmetadata', () => {
    if (currentOnlineAudio) currentOnlineAudio.playbackRate = rate
  })

  currentOnlineAudio.addEventListener('canplay', () => {
    if (currentOnlineAudio) currentOnlineAudio.playbackRate = rate
  })
  
  currentOnlineAudio.play().then(() => {
    if (currentOnlineAudio) currentOnlineAudio.playbackRate = rate
  }).catch(e => {
    console.error('在线发音播放失败:', e)
    showToast('在线发音加载失败，请检查网络或切换为系统发音', 'error')
  })
}

const stopAudio = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  if (currentOnlineAudio) {
    currentOnlineAudio.pause()
    currentOnlineAudio.currentTime = 0
  }
}

const loadCurrentWord = () => {
  if (studyState.wordsData.length === 0) return

  const currentWordData = studyState.wordsData[studyState.currentIndex] || {}
  mockData.currentWord.word = currentWordData.word_text || currentWordData.word || ''
  mockData.currentWord.phonetic = currentWordData.phonetic || ''
  mockData.currentWord.translation = currentWordData.translation || ''

  // 重置状态
  studyState.showAnswer = false
  studyState.isCorrect = false
  studyState.errorIndices = []
  studyState.hasRecordedError = false
  
  // 彻底清空并重置输入数组
  userInputs.value = []
  wordInputs.value = []
  
  // 预先用空字符串填充 userInputs 数组，避免 Vue 响应式追踪出现 undefined 粘连
  const wordTokens = parsedSentence.value.filter(t => t.type === 'word')
  wordTokens.forEach(t => {
    userInputs.value[t.index] = ''
  })
  
  // 更新进度
  mockData.studySession.progress.current = studyState.currentIndex + 1
  mockData.studySession.progress.total = studyState.wordsData.length
  mockData.studySession.progress.percentage = Math.round(((studyState.currentIndex + 1) / studyState.wordsData.length) * 100)
  
  // 自动聚焦第一个输入框，并自动发音
  nextTick(() => {
    if (wordInputs.value[0]) {
      wordInputs.value[0].focus()
    }
    // 无论是汉译还是听写，切换到新单词时都直接播放发音
    playAudio()
  })
}

// 辅助函数：去除标点符号并转为小写，用于宽松对比
const normalizeForComparison = (str) => {
  if (!str) return ''
  // 移除常见的英文标点符号：句号、逗号、问号、感叹号、单引号、双引号、分号、冒号等，并转小写
  return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()""'']/g, '').replace(/\s{2,}/g, ' ').trim().toLowerCase()
}

// 辅助函数：记录错词
const recordErrorWord = async () => {
  // 防止在同一题中反复记录
  if (studyState.hasRecordedError) return
  
  studyState.hasRecordedError = true

  try {
    await useAuthFetch('/api/error-words/save', {
      method: 'POST',
      body: {
        language: studyState.language,
        word: mockData.currentWord.word,
        phonetic: mockData.currentWord.phonetic,
        translation: mockData.currentWord.translation
      }
    })
  } catch (e) {
    console.error('Failed to record error word:', e)
  }
}

// 辅助函数：拼对时，从错词本中移除该词
const removeErrorWord = async () => {
  try {
      await useAuthFetch('/api/error-words/remove', {
        method: 'POST',
        body: {
          language: studyState.language,
          word: mockData.currentWord.word
        }
      })
    } catch (e) {
    console.error('Failed to remove error word:', e)
  }
}

const checkSpelling = () => {
  if (studyState.isCorrect) {
    // 如果已经答对，再次回车则进入下一题
    handleNext()
    return
  }
  
  // 校验逻辑：将所有解析出的单词和用户输入的单词进行比对
  const wordsToType = parsedSentence.value.filter(t => t.type === 'word')
  
  let allCorrect = true
  studyState.errorIndices = [] // 每次校验前清空错误记录
  
  wordsToType.forEach(token => {
    const expected = normalizeForComparison(token.text)
    const actual = normalizeForComparison(userInputs.value[token.index] || '')
    if (expected !== actual) {
      allCorrect = false
      studyState.errorIndices.push(token.index)
    }
  })
  
  if (allCorrect) {
    studyState.isCorrect = true
    studyState.showAnswer = true
    
    // 统计正确数（如果这题没错过，才算一遍过正确）
    if (!studyState.hasRecordedError) {
      studyState.correctCount++
      studyState.currentStreak++
      if (studyState.currentStreak > studyState.maxStreak) {
        studyState.maxStreak = studyState.currentStreak
      }
      
      // 如果用户一遍拼对，尝试从错词本中移除它
      removeErrorWord()
    }
    
    playSuccessSound()
    playAudio()
    // 答对后不再自动跳下一题，等待用户确认（再次回车或点击下一题）
  } else {
    studyState.isCorrect = false
    playErrorSound()
    
    if (!studyState.hasRecordedError) {
      studyState.errorCount++ // 统计错误数
      studyState.currentStreak = 0 // 错误则断掉连对
      recordErrorWord() // 记录到错词本
    }
    
    // 自动定位光标到第一个填错的单词输入框上
    nextTick(() => {
      if (studyState.errorIndices.length > 0) {
        const firstErrorIndex = studyState.errorIndices[0]
        if (wordInputs.value[firstErrorIndex]) {
          wordInputs.value[firstErrorIndex].focus()
        }
      }
    })
  }
}

const playAudio = () => {
  if (!mockData.currentWord.word) return
  stopAudio() // 播放前先停止之前可能正在播放的语音
  
  if (userSettings.engine === 'online') {
    playOnlineAudio(mockData.currentWord.word, studyState.language)
    return
  }
  
  const utterance = new SpeechSynthesisUtterance(mockData.currentWord.word)
  
  // 映射简写到标准的 BCP 47 语言标签，帮助系统更好地匹配
  const langMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'it': 'it-IT',
    'ru': 'ru-RU',
    'pt': 'pt-PT',
    'ar': 'ar-SA',
    'hi': 'hi-IN'
  }
  const targetLang = langMap[studyState.language] || studyState.language || 'en-US'
  utterance.lang = targetLang
  
  const voices = window.speechSynthesis.getVoices()
  
  if (voices.length > 0) {
    // 根据当前词库语言，智能寻找对应的系统默认发音人
    // 优先匹配标准标签前缀 (如 'ja')，也可以匹配完整标签
    const preferredVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(studyState.language.toLowerCase()) || 
      voice.lang.toLowerCase() === targetLang.toLowerCase()
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
  }
  
  // 应用用户设置的语速
  utterance.rate = userSettings.rate
  
  window.speechSynthesis.speak(utterance)
}

// 初始化设置
onMounted(() => {
  loadSettings()
})

const showCorrectAnswer = () => {
  if (studyState.showAnswer) return
  
  studyState.showAnswer = true
  studyState.isCorrect = false
  studyState.errorIndices = []
  
  // 移除自动填充正确答案的逻辑，保留用户自己的输入
  // const wordsToType = parsedSentence.value.filter(t => t.type === 'word')
  // wordsToType.forEach(token => {
  //   userInputs.value[token.index] = token.text
  // })
  
  playAudio()
}

// 辅助函数：记录学习进度
const saveProgress = async () => {
  if (!studyState.vocabularyId) return
  if (studyState.vocabularyId === 'error_words') return // 错词本复习模式不保存常规进度 
  
  // 当前学到了第几个词 (因为可能是点击下一题、上一题或返回，我们直接保存 currentIndex)
  const learnedCount = studyState.currentIndex
  
  try {
    await useAuthFetch('/api/vocabulary/progress', {
      method: 'POST',
      body: {
        id: studyState.vocabularyId,
        learned_count: learnedCount
      }
    })
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

const handlePrev = () => {
  stopAudio()
  if (studyState.currentIndex > 0) {
    studyState.currentIndex--
    loadCurrentWord()
    saveProgress() // 返回上一题时也保存当前位置
  }
}

const handleNext = () => {
  // 不再阻拦，直接进入下一题
  goToNext()
}

const goToNext = () => {
  stopAudio()
  
  if (studyState.currentIndex < studyState.wordsData.length - 1) {
    studyState.currentIndex++
    loadCurrentWord()
    saveProgress() // 进入下一题后，保存新的进度
  } else {
    // 最后一题完成
    studyState.currentIndex = studyState.wordsData.length
    saveProgress() // 保存为满进度
    showToast('恭喜！你已完成本次学习！')
    studyState.showStatsModal = true // 弹出结算数据面板
  }
}

// 计算学习耗时
const studyDuration = computed(() => {
  if (!studyState.startTime) return '0分0秒'
  const seconds = Math.floor((Date.now() - studyState.startTime) / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s}秒`
})

// 计算平均耗时
const avgTimePerWord = computed(() => {
  if (!studyState.startTime) return '0秒'
  const seconds = (Date.now() - studyState.startTime) / 1000
  const totalWords = studyState.correctCount + studyState.errorCount
  if (totalWords === 0) return '0秒'
  return (seconds / totalWords).toFixed(1) + '秒'
})

// 计算正确率
const accuracyRate = computed(() => {
  const total = studyState.correctCount + studyState.errorCount
  if (total === 0) return '0%'
  return Math.round((studyState.correctCount / total) * 100) + '%'
})

// 监听组件销毁（比如点击了浏览器的后退或者顶部的返回按钮）
onUnmounted(() => {
  stopAudio()
  saveProgress()
})

onMounted(async () => {
  const { id, mode, language, strategy, count } = route.query
  if (mode) studyState.mode = mode

  if (!id) {
    showToast('缺少词库ID', 'error')
    router.push('/library')
    return
  }

  // 错词本复习模式
  if (id === 'error_words') {
    studyState.vocabularyId = 'error_words'
    studyState.language = language || 'en'
    mockData.studySession.title = '错词本复习 / ERROR WORDS'
    
    try {
      const res = await useAuthFetch('/api/error-words/list', {
        params: { language: studyState.language }
      })
      
      if (res?.code === 200) {
        let data = res.data || []
        
        // 根据策略排序
        if (strategy === 'time' || strategy === 'recent') {
          data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        } else if (strategy === 'count' || strategy === 'high_error') {
          data.sort((a, b) => b.error_count - a.error_count)
        }
        
        // 根据复习数量截取
        const limit = Number(count) || 20
        data = data.slice(0, limit)
        
        // 映射数据结构以匹配 study.vue 需要的格式
        studyState.wordsData = data.map(item => {
          let wordInfo = {}
          try {
            wordInfo = JSON.parse(item.word_info || '{}')
          } catch (e) {}
          
          return {
            word: item.word,
            phonetic: item.phonetic || wordInfo.phonetic || '',
            translation: item.translation || wordInfo.translation || ''
          }
        })

        if (studyState.wordsData.length > 0) {
          studyState.startTime = Date.now()
          loadCurrentWord()
        } else {
          showToast('该语言暂无错词', 'error')
          router.push('/error-words')
        }
      } else {
        showToast('获取错词本失败', 'error')
        router.push('/error-words')
      }
    } catch (e) {
      showToast('加载失败，请重试', 'error')
      router.push('/error-words')
    } finally {
      studyState.isLoading = false
    }
    return
  }

  studyState.vocabularyId = Number(id)

  try {
    // 1. 获取词库基本信息
    const vocabResult = await useAuthFetch(`/api/vocabulary/${id}`)

    if (vocabResult?.code === 200) {
      const vocab = vocabResult.data
      studyState.language = vocab.language || 'en'
      mockData.studySession.title = vocab.description || `${vocab.language.toUpperCase()} 专属词库`
      
      // 2. 获取词库关联的单词列表
      const wordsResult = await useAuthFetch(`/api/vocabulary/${id}/words`)
      
      if (wordsResult?.code === 200) {
        studyState.wordsData = wordsResult.data || []
        
        if (studyState.wordsData.length > 0) {
          // 断点续学
          if (vocab.learned_count && vocab.learned_count > 0 && vocab.learned_count < studyState.wordsData.length) {
            studyState.currentIndex = vocab.learned_count
            showToast(`已为您恢复到第 ${vocab.learned_count + 1} 个词`, 'success')
          }
          
          studyState.startTime = Date.now()
          loadCurrentWord()
        } else {
          showToast('该词库暂无数据', 'error')
        }
      } else {
        showToast('获取词汇数据失败', 'error')
      }
    } else {
      showToast(vocabResult.error || '加载词库失败', 'error')
      router.push('/library')
    }
  } catch (e) {
    showToast('加载失败，请重试', 'error')
  } finally {
    studyState.isLoading = false
  }
})
</script>

<style scoped>
</style>
