<template>
  <div class="h-full flex flex-col bg-white border-hard shadow-hard rounded-xl overflow-hidden relative">
    <div class="h-16 border-b-3 border-black bg-brutal-orange flex items-center px-8 justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/custom" class="hover:text-white transition-colors bg-black text-white p-1 border-2 border-black rounded-full hover:bg-white hover:text-black">
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>
        <h2 class="text-3xl font-black uppercase tracking-widest">IMAGE RECOGNITION // 图片上传识别</h2>
      </div>
    </div>
    
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 设置表单 -->
      <div class="flex-[3] p-10 overflow-y-auto border-r-3 border-black hide-scrollbar">
        <div class="max-w-2xl space-y-10">
          <p class="font-bold text-lg border-l-4 border-black pl-4">上传包含文字的图片，AI 将自动为您提取专属词库。</p>
          
          <!-- 模块 1: 目标外语 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">01</span> 目标外语
            </h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="formData.language = lang.code"
                :class="[
                  'px-4 py-2 border-hard font-black shadow-[2px_2px_0_#000] transition-all',
                  formData.language === lang.code
                    ? 'bg-black text-white transform -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white hover:bg-brutal-orange hover:text-white'
                ]"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>

          <!-- 模块 2: 上传图片 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">02</span> 上传图片
            </h3>
            
            <div 
              class="border-4 border-dashed border-black bg-[#F4F4F0] rounded-xl p-8 text-center cursor-pointer hover:bg-brutal-yellow/20 transition-colors relative"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="{ 'bg-brutal-yellow/30 border-brutal-orange': isDragging }"
            >
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*"
                @change="handleFileChange"
              />
              
              <div v-if="!previewUrl" class="flex flex-col items-center justify-center pointer-events-none py-4">
                <div class="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-hard-sm mb-4">
                  <Image class="w-8 h-8 text-black" />
                </div>
                <p class="font-black text-xl mb-2">点击或拖拽图片到此处</p>
                <p class="font-bold text-gray-500">支持 JPG, PNG 等格式，最大 5MB</p>
              </div>
              
              <div v-else class="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-black bg-white">
                <img :src="previewUrl" class="w-full h-full object-contain" />
                <button 
                  @click.stop="clearImage" 
                  class="absolute top-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-brutal-orange transition-colors z-10"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 模块 3: 描述 -->
          <div class="space-y-4">
            <h3 class="text-2xl font-black flex items-center gap-3">
              <span class="bg-black text-white px-2 py-1">03</span> 内容需求描述 (可选)
            </h3>
            <textarea 
              v-model="formData.description"
              rows="3" 
              class="w-full border-hard p-4 font-bold text-lg outline-none focus:bg-brutal-yellow/20 focus:shadow-hard-sm transition-all resize-none" 
              placeholder="例如：只提取图片中的动词，或者只提取考研相关的词汇..."
            ></textarea>
            
            <!-- 快捷输入胶囊 -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button 
                v-for="preset in presets" 
                :key="preset"
                @click="formData.description = preset"
                class="px-3 py-1 bg-gray-100 border-2 border-black text-sm font-bold hover:bg-brutal-orange hover:text-white transition-colors shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                + {{ preset.length > 15 ? preset.substring(0, 15) + '...' : preset }}
              </button>
            </div>
          </div>

          <button 
            @click="generateWords" 
            :disabled="isGenerating || !previewUrl"
            class="w-full py-5 bg-brutal-orange border-hard shadow-hard font-black text-2xl hover-hard active-hard uppercase tracking-widest mt-8 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isGenerating" class="w-6 h-6 animate-spin" />
            <ScanText v-else class="w-6 h-6" /> 
            {{ isGenerating ? 'RECOGNIZING...' : '开始识别 EXTRACT' }}
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
          <h3 class="text-3xl font-black mb-4">等待提取 // WAITING</h3>
          <p class="font-bold text-lg max-w-sm border-2 border-dashed border-black p-4">在左侧上传图片，点击“开始识别”后，这里将展示提取出的词库。</p>
        </div>

        <!-- 结果状态 -->
        <div v-else class="absolute inset-y-0 left-0 right-6 flex flex-col z-10 bg-[#F4F4F0] border-r-3 border-black">
          <div class="p-6 border-b-3 border-black bg-white flex justify-between items-center shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-brutal-orange border-hard flex items-center justify-center shadow-hard-sm rotate-[-5deg]">
                <CheckCircle class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="font-black text-xl">识别结果</h3>
                <p class="text-sm font-bold bg-black text-white px-2 inline-block">VISION AI</p>
              </div>
            </div>
          </div>

          <div ref="resultContainer" class="flex-1 px-6 py-10 overflow-y-auto space-y-6 hide-scrollbar">
            <!-- 加载动画界面 -->
            <div v-if="isGenerating && extractedWords.length === 0" class="flex flex-col items-center justify-center h-full space-y-6 max-w-md mx-auto w-full px-6">
              <div class="relative w-24 h-24 mb-4">
                <ScanText class="w-24 h-24 text-brutal-orange absolute inset-0 animate-pulse" />
                <div class="absolute inset-0 border-t-4 border-black animate-[spin_2s_linear_infinite] rounded-full"></div>
              </div>
              <p class="font-black text-xl animate-pulse">AI 正在努力看图识字中...</p>
              <p class="font-bold text-sm text-black bg-brutal-yellow px-3 py-1 border-2 border-black rotate-[-2deg] shadow-[2px_2px_0_#000]">
                预计需要 10-20 秒
              </p>
            </div>

            <!-- 单词卡片 -->
            <div v-else-if="extractedWords.length > 0" class="space-y-6">
              <div v-for="(word, index) in extractedWords" :key="index" class="border-hard bg-white p-6 shadow-hard-sm relative hover:-translate-y-1 transition-transform ml-2 mr-2">
                <div :class="`absolute -top-3 -right-3 ${word.tagColor} text-white border-hard px-2 py-1 font-black text-xs ${word.rotate}`">EXTRACTED</div>
                <div class="flex items-baseline gap-3 mb-2">
                  <span class="font-black text-2xl">{{ index + 1 }}. {{ word.word }}</span>
                  <span class="font-bold text-gray-500">{{ word.phonetic }}</span>
                </div>
                <p class="font-bold mb-3 pb-2">{{ word.translation }}</p>
              </div>
            </div>

            <div v-else-if="!isGenerating" class="flex flex-col items-center justify-center h-full">
              <p class="font-black text-xl text-gray-500">未提取到任何外语单词</p>
            </div>
          </div>

          <div v-if="!isGenerating && extractedWords.length > 0" class="p-6 border-t-3 border-black bg-white shrink-0">
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowLeft, Inbox, CheckCircle, ArrowRight, Loader2, Image, X, ScanText } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'
import { useAuthFetch } from '~/composables/useAuthFetch'

const { showToast } = useToast()
const router = useRouter()

const languages = [
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
]

const presets = [
  '只提取图片中加粗或高亮的生词',
  '提取图片中的医学专业术语，排除普通词汇',
  '提取菜单图片中的食物和食材名称',
  '提取说明书中的操作动词',
  '提取图表中的坐标轴及图例词汇'
]

const formData = reactive({
  language: 'en',
  description: ''
})

const fileInput = ref(null)
const previewUrl = ref(null)
const base64Data = ref(null)
const isDragging = ref(false)

const isGenerating = ref(false)
const isSaving = ref(false)
const showResult = ref(false)
const extractedWords = ref([])
const resultContainer = ref(null)

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const processFile = (file) => {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showToast('请上传图片文件', 'error')
    return
  }
  
  // 大小限制 5MB
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过 5MB', 'error')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    base64Data.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  processFile(file)
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  processFile(file)
}

const clearImage = () => {
  previewUrl.value = null
  base64Data.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const generateWords = async () => {
  if (!base64Data.value) return

  extractedWords.value = []
  showResult.value = true
  isGenerating.value = true

  try {
    const payload = {
      language: formData.language,
      description: formData.description,
      imageBase64: base64Data.value
    }
    
    const token = localStorage.getItem('token') || ''
    const resp = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const result = await resp.json()
      if (result.code === 500) {
        throw new Error(result.error)
      }
    }

    if (!resp.ok || !resp.body) throw new Error('识别失败')

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

            let parseableRaw = raw
            if (!parseableRaw.endsWith(']')) {
              const lastBraceIndex = parseableRaw.lastIndexOf('}')
              if (lastBraceIndex !== -1) {
                parseableRaw = parseableRaw.substring(0, lastBraceIndex + 1) + ']'
              } else {
                parseableRaw += ']'
              }
            }

            try {
              const currentParsed = JSON.parse(parseableRaw)
              if (Array.isArray(currentParsed) && currentParsed.length > 0) {
                extractedWords.value = currentParsed.map((w, i) => ({
                  word: w.word || `Word${i + 1}`,
                  phonetic: w.phonetic || '',
                  translation: w.translation || '',
                  tagColor: i % 2 === 0 ? 'bg-brutal-orange' : 'bg-black',
                  rotate: i % 2 === 0 ? 'rotate-6' : '-rotate-6'
                }))

                nextTick(() => {
                  if (resultContainer.value) {
                    resultContainer.value.scrollTop = resultContainer.value.scrollHeight
                  }
                })
              }
            } catch (parsePartialError) {
              // 忽略解析不完整 JSON 的错误
            }

          } catch (e) {
            if (e.message && !e.message.includes('Unexpected')) {
               throw e
            }
          }
        }
      }
    }

    // 最终完整解析
    let parsed = null
    try {
      parsed = JSON.parse(raw.trim())
    } catch {
      const match = raw.match(/\[[\s\S]*\]/)
      parsed = match ? JSON.parse(match[0].trim()) : []
    }

    // 兼容可能返回 {fields: [...]} 的情况
    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray(parsed.fields)) {
         const fields = parsed.fields
         if (fields.length > 0 && typeof fields[0] === 'string') {
           parsed = []
           for (let i = 0; i < fields.length; i += 3) {
             parsed.push({
               word: fields[i] || '',
               phonetic: fields[i + 1] || '',
               translation: fields[i + 2] || ''
             })
           }
         } else {
           parsed = fields
         }
      } else {
         parsed = [parsed]
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error('返回数据格式错误')
    }

    extractedWords.value = parsed.map((w, i) => {
      if (Array.isArray(w)) {
        return {
          word: w[0] || '',
          phonetic: w[1] || '',
          translation: w[2] || '',
          tagColor: i % 2 === 0 ? 'bg-brutal-orange' : 'bg-black',
          rotate: i % 2 === 0 ? 'rotate-6' : '-rotate-6'
        }
      }
      return {
        word: w.word || '',
        phonetic: w.phonetic || '',
        translation: w.translation || '',
        tagColor: i % 2 === 0 ? 'bg-brutal-orange' : 'bg-black',
        rotate: i % 2 === 0 ? 'rotate-6' : '-rotate-6'
      }
    })

  } catch (e) {
    showToast(e.message || '识别失败，请重试', 'error')
    showResult.value = false
  } finally {
    isGenerating.value = false
  }
}

const saveVocabulary = async () => {
  isSaving.value = true
  try {
    const formattedWords = extractedWords.value.map(w => ({
      word_text: w.word,
      phonetic: w.phonetic,
      translation: w.translation,
    }))

    const payload = {
      language: formData.language,
      description: '从图片识别提取的词库',
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
      extractedWords.value = []
      showResult.value = false
      clearImage()
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
