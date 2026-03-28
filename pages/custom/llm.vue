<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden relative">
    <div class="h-16 border-b-3 border-black bg-brutal-pink flex items-center px-8 justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/custom" class="hover:text-white transition-colors bg-black text-white p-1 border-2 border-black rounded-full hover:bg-white hover:text-black">
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>
        <h2 class="text-3xl font-black uppercase tracking-widest">LLM GENERATOR // 大模型提取</h2>
      </div>
      <div class="flex items-center gap-2">
        <div class="font-bold text-sm bg-black text-white px-3 py-1 rounded">API: {{ helloData?.data?.message }}</div>
        <div class="font-bold text-sm bg-brutal-green text-black border-2 border-black px-3 py-1 rounded">
          LOGIN: {{ currentUser ? (currentUser?.username + ' ✓') : '未登录' }}
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 设置表单 -->
      <div class="flex-[3] p-10 overflow-y-auto border-r-3 border-black hide-scrollbar">
        <div class="max-w-2xl space-y-10">
          <p class="font-bold text-lg border-l-4 border-black pl-4">设定您的需求，AI 将为您生成专属学习数据。</p>
          <div class="mt-2 flex items-center gap-2 text-sm font-bold text-gray-600">
            <ArrowRight class="w-4 h-4" /> 完成需求后，鼠标下滑到页面底部点击“立即生成”按钮
          </div>
          
          <!-- 模块 1: 目标外语 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">01</span> 目标外语
            </h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="lang in mockData.languages"
                :key="lang.code"
                @click="formData.language = lang.code"
                :class="[
                  'px-4 py-2 border-hard font-black shadow-[2px_2px_0_#000] transition-all',
                  formData.language === lang.code
                    ? 'bg-black text-white transform -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white hover:bg-brutal-blue hover:text-white'
                ]"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>

          <!-- 模块 2: 数量 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">02</span> 生成数量
            </h3>
            <div class="grid grid-cols-4 gap-4">
              <button 
                v-for="count in mockData.counts" 
                :key="count"
                @click="formData.count = count"
                :class="[
                  'h-14 border-hard shadow-hard-sm font-black text-lg transition-all',
                  formData.count === count 
                    ? 'bg-black text-white shadow-[2px_2px_0px_#E2F000] transform -translate-x-0.5 -translate-y-0.5' 
                    : 'bg-white hover:bg-brutal-blue hover:text-white'
                ]"
              >
                {{ count === '自定义' ? count : `${count} 词` }}
              </button>
            </div>
          </div>

          <!-- 模块 3: 描述 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">03</span> 内容需求描述
            </h3>
            <textarea 
              v-model="formData.description"
              rows="4" 
              class="w-full border-hard p-4 font-bold text-lg outline-none focus:bg-brutal-yellow/20 focus:shadow-hard-sm transition-all resize-none" 
              placeholder="例如：帮我提取关于“经济学”相关的雅思核心词汇，排除基础四级词汇，重点关注动词..."
            ></textarea>
            
            <!-- 快捷输入胶囊 -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button 
                v-for="preset in mockData.presets" 
                :key="preset"
                @click="formData.description = preset"
                class="px-3 py-1 bg-gray-100 border-2 border-black text-sm font-bold hover:bg-brutal-yellow transition-colors shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                + {{ preset.substring(0, 15) }}...
              </button>
            </div>
          </div>

          

          <!-- 模块 3: 附加 -->
          <!-- <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">03</span> 包含附加信息
            </h3>
            <div class="flex flex-wrap gap-4">
              <div 
                v-for="addon in mockData.availableAddons" 
                :key="addon"
                @click="toggleAddon(addon)"
                :class="[
                  'border-hard px-4 py-2 font-black cursor-pointer transition-all flex items-center gap-2',
                  formData.addons.includes(addon)
                    ? 'bg-black text-white shadow-[2px_2px_0px_#E2F000] transform -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white hover:bg-brutal-green'
                ]"
              >
                <Check v-if="formData.addons.includes(addon)" class="w-5 h-5" />
                {{ addon }}
              </div>
            </div>
          </div> -->

          <button 
            @click="generateCustomWords" 
            :disabled="isGenerating"
            class="w-full py-5 bg-brutal-green border-hard shadow-hard font-black text-2xl hover-hard active-hard uppercase tracking-widest mt-8 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            id="generate-cta"
          >
            <Loader2 v-if="isGenerating" class="w-6 h-6 animate-spin" />
            <Wand2 v-else class="w-6 h-6" /> 
            {{ isGenerating ? 'GENERATING...' : '立即生成 GENERATE' }}
          </button>

        </div>
      </div>

      

      <!-- 右侧：生成结果区 -->
      <div class="flex-[2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNFMkUyRTIiLz48L3N2Zz4=')] relative overflow-hidden flex flex-col">
        
        <!-- 空状态 -->
        <div v-if="!showResult" class="absolute inset-y-0 left-0 right-6 flex flex-col items-center justify-center p-8 text-center z-10 bg-white/90 border-r-3 border-black">
          <div class="w-32 h-32 bg-brutal-yellow border-hard flex items-center justify-center shadow-hard-sm rotate-12 mb-8">
            <Inbox class="w-16 h-16" />
          </div>
          <h3 class="text-3xl font-black mb-4">等待生成 // WAITING</h3>
          <p class="font-bold text-lg max-w-sm border-2 border-dashed border-black p-4">在左侧配置需求，点击“立即生成”后，这里将展示为您量身打造的专属词库。</p>
        </div>

        <!-- 结果状态 -->
        <div v-else class="absolute inset-y-0 left-0 right-6 flex flex-col z-10 bg-[#F4F4F0] border-r-3 border-black">
          <div class="p-6 border-b-3 border-black bg-white flex justify-between items-center shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-brutal-green border-hard flex items-center justify-center shadow-hard-sm rotate-[-5deg]">
                <CheckCircle class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-black text-xl">生成结果</h3>
                <p class="text-sm font-bold bg-black text-white px-2 inline-block">AI CUSTOMIZED</p>
              </div>
            </div>
          </div>

          <div ref="resultContainer" class="flex-1 px-6 py-10 overflow-y-auto space-y-6 hide-scrollbar">
            <!-- 加载动画界面 -->
            <div v-if="isGenerating && mockData.words.length === 0" class="flex flex-col items-center justify-center h-full space-y-6 max-w-md mx-auto w-full px-6">
              <Loader2 class="w-12 h-12 animate-spin text-brutal-green" />
              <p class="font-black text-lg animate-pulse">正在连接 AI，生成专属词库中...</p>
              
              <!-- 进度条 -->
              <div class="w-full h-8 border-3 border-black bg-white shadow-hard relative overflow-hidden">
                <div class="absolute top-0 bottom-0 left-0 bg-brutal-green border-r-3 border-black transition-all duration-100 ease-linear" :style="{ width: `${progressValue}%` }"></div>
                <div class="absolute inset-0 flex items-center justify-center font-black text-lg z-10">
                  {{ Math.floor(progressValue) }}%
                </div>
              </div>
              <p class="font-bold text-sm text-black bg-brutal-yellow px-3 py-1 border-2 border-black rotate-[-2deg] shadow-[2px_2px_0_#000]">
                预计需要 1 分钟，请耐心等待
              </p>
            </div>

            <!-- 直接渲染单词卡片，不再嵌套章节 -->
            <div v-else-if="mockData.words.length > 0" class="space-y-6">
              <div v-for="(word, index) in mockData.words" :key="index" class="border-hard bg-white p-6 shadow-hard-sm relative hover:-translate-y-1 transition-transform ml-2 mr-2">
                <div :class="`absolute -top-3 -right-3 ${word.tagColor} text-white border-hard px-2 py-1 font-black text-xs ${word.rotate}`">{{ word.tag }}</div>
                <div class="flex items-baseline gap-3 mb-2">
                  <span class="font-black text-2xl">{{ index + 1 }}. {{ word.word }}</span>
                  <span class="font-bold text-gray-500">{{ word.phonetic }}</span>
                </div>
                <p class="font-bold mb-3 pb-2">{{ word.translation }}</p>
              </div>
            </div>
          </div>

          <div v-if="!isGenerating && mockData.words.length > 0" class="p-6 border-t-3 border-black bg-white shrink-0">
            <button 
              @click="saveVocabulary"
              :disabled="isSaving"
              class="w-full py-4 bg-black text-white font-black text-xl border-hard shadow-hard-sm hover-hard active-hard uppercase flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSaving" class="w-5 h-5 animate-spin" />
              {{ isSaving ? '保存中 SAVING...' : '保存并加入“我的词库”' }} <ArrowRight v-if="!isSaving" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全局弹窗组件由于 Nuxt 会自动引入，这里可以直接使用，或者放在 app.vue 中更好，但由于我们目前在重构，我先将局部的弹窗移除 -->
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Check, Wand2, Inbox, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'

const { showToast } = useToast()
const router = useRouter()

const resultContainer = ref(null)

// 模拟 JSON 数据，方便后期对接接口
const mockData = reactive({
  counts: [20, 50, 100, 300],
  availableAddons: ['音标与读音', '词根词缀', '同义词辨析'],
  presets: [
    '帮我提取《老友记》第一季的高频生活用语，排除基础词',
    '我是一名外企前端，给我一份日常开会汇报进度的动词',
    '排除基础四级词汇，只提取雅思 7 分以上的学术词'
  ],
  languages: [
    { code: 'en', label: '英语 English' },
    { code: 'es', label: '西班牙语 Spanish' },
    { code: 'fr', label: '法语 French' },
    { code: 'de', label: '德语 German' },
    { code: 'ja', label: '日语 Japanese' },
    { code: 'ko', label: '韩语 Korean' },
    { code: 'it', label: '意大利语 Italian' },
    { code: 'ru', label: '俄语 Russian' },
    { code: 'pt', label: '葡萄牙语 Portuguese' },
    { code: 'ar', label: '阿拉伯语 Arabic' },
    { code: 'hi', label: '印地语 Hindi' }
  ],
  words: [
    {
      word: 'Implement',
      phonetic: '/ˈɪm.plə.ment/',
      translation: 'v. 实施，贯彻；n. 工具',
      tag: '高频动词',
      tagColor: 'bg-brutal-blue',
      rotate: 'rotate-6'
    },
    {
      word: 'Fluctuate',
      phonetic: '/ˈflʌk.tʃu.eɪt/',
      translation: 'v. 波动，起伏',
      tag: '难点',
      tagColor: 'bg-brutal-orange',
      rotate: '-rotate-6'
    },
    {
      word: 'Paradigm',
      phonetic: '/ˈper.ə.daɪm/',
      translation: 'n. 范例，样式',
      tag: '学术',
      tagColor: 'bg-brutal-pink',
      rotate: 'rotate-6'
    }
  ]
})

const formData = reactive({
  count: 50,
  description: '',
  addons: ['音标与读音'],
  language: 'en'
})

const { data: helloData } = await useFetch('/api/examples/hello')
let currentUser = null
try {
  const s = localStorage.getItem('user')
  currentUser = s ? JSON.parse(s) : null
} catch {}
const scrollToGenerate = () => {
  const el = document.querySelector('#generate-cta')
  el && el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const toggleAddon = (addon) => {
  const index = formData.addons.indexOf(addon)
  if (index > -1) {
    formData.addons.splice(index, 1)
  } else {
    formData.addons.push(addon)
  }
}

const isGenerating = ref(false)
const isSaving = ref(false)
const showResult = ref(false)
const progressValue = ref(0)
let progressInterval = null
 
const generateCustomWords = async () => {
  // 每次开始前，先清除旧的错误信息和右侧的数据展示
  mockData.words = []
  showResult.value = false

  isGenerating.value = true
  showResult.value = true
  progressValue.value = 0

  const startTime = Date.now()
  const duration = 60000 // 默认 1 分钟
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    let p = (elapsed / duration) * 100
    if (p > 99) p = 99 // 停留在 99% 等待真实完成
    progressValue.value = p
  }, 100)
  
  try {
    const payload = {
      form: {
        count: formData.count,
        language: formData.language,
        description: formData.description,
        addons: formData.addons
      }
    }
    const token = localStorage.getItem('token') || ''
    const resp = await fetch('/api/ai/generate.stream', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    // 如果返回的不是流，而是一个普通的 JSON 错误对象（即 HTTP 200，但有 {code: 500, error: '...'}）
    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const result = await resp.json()
      if (result.code === 500) {
        throw new Error(result.error)
      }
    }

    if (!resp.ok || !resp.body) throw new Error('生成失败')
    
    const reader = resp.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let raw = ''
    let buffer = ''
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim()
          if (!dataStr || dataStr === '"[DONE]"' || dataStr === '[DONE]') continue
          
          try {
            const parsedChunk = JSON.parse(dataStr)
            if (parsedChunk.error) throw new Error(parsedChunk.error)
            raw += parsedChunk
            
            // 尝试在流式过程中不断解析目前拼凑出的 JSON 字符串
            // 因为 raw 可能是截断的 JSON 数组（例如 "[{\"word\":\"apple\""），我们需要把它补全成合法的 JSON 来解析
            let parseableRaw = raw
            if (!parseableRaw.endsWith(']')) {
              // 找到最后一个完整的对象
              const lastBraceIndex = parseableRaw.lastIndexOf('}')
              if (lastBraceIndex !== -1) {
                parseableRaw = parseableRaw.substring(0, lastBraceIndex + 1) + ']'
              } else {
                parseableRaw += ']' // 可能还没生成第一个完整的对象
              }
            }
            
            try {
              const currentParsed = JSON.parse(parseableRaw)
              if (Array.isArray(currentParsed) && currentParsed.length > 0) {
                // 实时更新到 mockData.words 中，页面会自动响应式渲染
                mockData.words = currentParsed.map((w, i) => ({
                  word: w.word || `Word${i + 1}`,
                  phonetic: w.phonetic || '',
                  translation: w.translation || '',
                  rotate: i % 2 === 0 ? 'rotate-6' : '-rotate-6'
                }))
                
                // 自动往下滑动
                nextTick(() => {
                  if (resultContainer.value) {
                    resultContainer.value.scrollTop = resultContainer.value.scrollHeight
                  }
                })
              }
            } catch (parsePartialError) {
              // 如果补全后依然不是合法的 JSON，忽略并等待下一个 chunk
            }
            
          } catch (e) {
            if (e.message && !e.message.includes('Unexpected')) {
               throw e
            }
          }
        }
      }
    }
    
    // 生成结束后，确保解析最终完整的 JSON
    let parsed = null
    try {
      parsed = JSON.parse(raw.trim())
    } catch {
      const match = raw.match(/\[[\s\S]*\]/)
      parsed = match ? JSON.parse(match[0].trim()) : []
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('未解析到词条数据')
    }
    mockData.words = parsed.map((w, i) => ({
      word: w.word || `Word${i + 1}`,
      phonetic: w.phonetic || '',
      translation: w.translation || '',
      tag: 'AI',
      tagColor: 'bg-brutal-blue',
      rotate: i % 2 === 0 ? 'rotate-6' : '-rotate-6'
    }))
  } catch (e) {
    showToast(e?.message || '生成失败', 'error')
    showResult.value = false
  } finally {
    if (progressInterval) clearInterval(progressInterval)
    progressValue.value = 100
    isGenerating.value = false
  }
}

const saveVocabulary = async () => {
  if (!currentUser || !currentUser.id) {
    showToast('请先登录后再保存词库', 'error')
    return
  }

  isSaving.value = true
  try {
    const formattedWords = mockData.words.map(w => ({
      word_text: w.word,
      phonetic: w.phonetic,
      translation: w.translation,
    }))

    const payload = {
      language: formData.language,
      description: formData.description,
      count: formattedWords.length,
      words_data: formattedWords
    }

    const result = await useAuthFetch('/api/vocabulary/save', {
      method: 'POST',
      body: payload
    })

    if (result?.code === 200) {
      showToast('保存成功！已加入“我的词库”', 'success', {
        label: '前往查看',
        onClick: () => {
          router.push('/library')
        }
      })
      // 保存成功后清空右侧生成的数据
      mockData.words = []
      showResult.value = false
    } else {
      throw new Error(result.error || '保存失败')
    }
  } catch (e) {
    showToast(e.message || '保存失败，请稍后重试', 'error')
  } finally {
    isSaving.value = false
  }
}

</script>
