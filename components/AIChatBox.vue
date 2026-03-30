<template>
  <div class="flex-1 bg-white border-hard shadow-hard rounded-xl flex flex-col overflow-hidden">
    <div class="p-5 border-b-3 border-black bg-black text-white flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Bot class="w-6 h-6 text-brutal-yellow" />
        <h3 class="font-black text-xl uppercase tracking-widest">Tutor_AI</h3>
      </div>
      <div class="text-xs font-bold bg-brutal-yellow text-black px-2 py-1 flex items-center gap-2">
        <span :class="['w-2 h-2 rounded-full', isAiThinking ? 'bg-brutal-orange' : 'bg-black']"></span>
        <span>{{ isAiThinking ? '思考中...' : '在线' }}</span>
      </div>
    </div>
    
    <div ref="chatContainer" class="flex-1 p-6 space-y-6 overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNFMkUyRTIiLz48L3N2Zz4=')] scroll-smooth">
      
      <!-- 加载历史记录中 -->
      <div v-if="isLoadingHistory" class="h-full flex flex-col items-center justify-center text-center">
        <span class="inline-block w-8 h-8 border-4 border-black border-t-brutal-yellow rounded-full animate-spin mb-4"></span>
        <p class="font-black text-lg">加载历史对话...</p>
      </div>

      <!-- 默认初始状态：展示当前词汇卡片 -->
      <div v-else-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center">
        <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0_#E2F000] max-w-sm w-full transform -rotate-2 hover:rotate-0 transition-transform">
          <Sparkles class="w-10 h-10 mb-4 mx-auto text-brutal-orange" />
          <h4 class="font-black text-3xl uppercase mb-2 line-clamp-2 break-all">{{ currentWord || '...' }}</h4>
          <p class="font-bold text-gray-500 mb-6 text-lg">{{ currentTranslation || '等待加载' }}</p>
          <div class="text-sm font-black bg-black text-white py-2 uppercase border-2 border-black">
            向我提问关于它的任何问题
          </div>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" :class="['flex mb-4 w-full']">
        <!-- 用户气泡 -->
        <div v-if="msg.role === 'user'" class="border-hard p-4 rounded-lg bg-brutal-blue text-white shadow-hard-sm relative w-full">
          <div v-if="msg.contextWord" class="text-xs bg-black text-white px-2 py-0.5 inline-block mb-2 opacity-50 uppercase">
            {{ msg.contextWord }}
          </div>
          <div class="font-bold text-lg">{{ msg.content }}</div>
        </div>
        
        <!-- AI 气泡 -->
        <div v-else-if="msg.content" class="border-hard p-4 rounded-lg bg-[#F4F4F0] shadow-hard-sm relative w-full ai-content flex flex-col gap-2">
          <!-- 正式回答区 -->
          <div v-html="renderMarkdown(msg.content)"></div>
        </div>
      </div>
      
      <!-- 正在思考时的占位符 -->
      <div v-if="isAiThinking" class="flex mb-4 w-full">
        <div class="border-hard p-4 rounded-lg bg-[#F4F4F0] shadow-hard-sm relative w-full">
           <span class="inline-block w-3 h-5 bg-black animate-pulse"></span>
        </div>
      </div>

    </div>

    <!-- 快捷指令 -->
    <div class="px-4 pb-2 pt-2 border-t-3 border-black bg-white">
      <div class="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2">
        <button 
          v-for="cmd in quickCommands" 
          :key="cmd.text"
          @click="handleQuickMessage(cmd.text)" 
          :class="[
            'shrink-0 px-3 py-1.5 bg-white border-2 border-black font-bold text-sm shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase',
            cmd.colorClass
          ]"
        >
          {{ cmd.label }}
        </button>
      </div>
    </div>
    
    <div class="p-4 bg-gray-100 border-t-2 border-dashed border-black">
      <div class="flex gap-3 h-14">
        <input 
          v-model="inputText"
          @keyup.enter="handleSend"
          type="text" 
          placeholder="输入你的问题..." 
          class="flex-1 border-hard px-4 font-bold text-lg outline-none focus:bg-brutal-yellow/20 focus:shadow-hard-sm transition-all"
        >
        <button @click="handleSend" class="bg-black text-white px-6 font-black border-hard hover-hard active-hard shadow-hard-sm">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import { Bot, Sparkles } from 'lucide-vue-next'
import { marked } from 'marked'

const props = defineProps({
  currentWord: {
    type: String,
    default: ''
  },
  currentTranslation: {
    type: String,
    default: ''
  },
  currentLanguage: {
    type: String,
    default: 'en'
  },
  quickCommands: {
    type: Array,
    default: () => [
    
    ]
  }
})

const messages = ref([])
const isAiThinking = ref(false)
const isLoadingHistory = ref(false)
const inputText = ref('')
const chatContainer = ref(null)

const fetchChatHistory = async () => {
  if (!props.currentWord) return
  
  isLoadingHistory.value = true
  try {
    const res = await useAuthFetch(`/api/ai/chat-history`, {
      params: {
        word: props.currentWord,
        language: props.currentLanguage
      }
    })
    if (res?.code === 200 && Array.isArray(res.data)) {
      messages.value = res.data
    } else {
      messages.value = [] // 没有历史记录则清空，展示默认卡片
    }
  } catch (e) {
    console.error('获取历史对话失败:', e)
    messages.value = []
  } finally {
    isLoadingHistory.value = false
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  }
}

// 监听当前单词变化，自动拉取历史记录
watch(() => props.currentWord, (newWord) => {
  if (newWord) {
    fetchChatHistory()
  } else {
    messages.value = []
  }
}, { immediate: true })

const handleSend = () => {
  if (inputText.value.trim()) {
    handleUserMessage(inputText.value)
    inputText.value = ''
  }
}

const addMessage = (role, content, contextWord = '') => {
  messages.value.push({ role, content, contextWord })
}

const renderMarkdown = (text) => {
  if (!text) return ''
  return marked.parse(text)
}

const saveAiChatHistory = async (userMessage, aiResponse) => {
  try {
    const data = await useAuthFetch('/api/ai/save-chat', {
      method: 'POST',
      body: {
        word: props.currentWord,
        language: props.currentLanguage,
        user_message: userMessage,
        ai_response: aiResponse
      }
    })
    console.log('AI对话保存结果:', data)
  } catch (e) {
    console.error('保存 AI 对话失败:', e)
  }
}

const simulateAiResponse = async (userText) => {
  isAiThinking.value = true
  
  const aiMessage = reactive({ role: 'ai', content: '' })
  messages.value.push(aiMessage)
  
  try {
    const token = localStorage.getItem('token') || ''
    const response = await fetch('/api/ai/chat.stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: messages.value
          .filter(m => m.content && m !== aiMessage)
          .map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
          })),
        context: {
          word: props.currentWord,
          translation: props.currentTranslation,
          language: props.currentLanguage
        }
      })
    })

    if (!response.ok) {
      throw new Error('网络请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    // 只有当真正接收到数据并且有内容时，才取消思考状态，这里先不立刻取消
    
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim()
         
          if (dataStr === '[DONE]') {
            continue // 拦截 [DONE] 标记，防止它进入 JSON.parse 或者作为纯文本拼接到页面上
          }

          try {
            const data = JSON.parse(dataStr)
            
            if (data.error) {
              // 只要收到任何有效的首次返回数据，就关闭占位动画
              if (isAiThinking.value) isAiThinking.value = false
              aiMessage.content += `<div class="text-red-500 font-bold">错误: ${data.error}</div>`
            } else {
              if (typeof data === 'object' && data !== null) {
                if (data.content) {
                  if (isAiThinking.value) isAiThinking.value = false
                  aiMessage.content += data.content
                }
              } else if (data) {
                if (isAiThinking.value) isAiThinking.value = false
                aiMessage.content += data
              }
            }
            
            nextTick(() => {
              if (chatContainer.value) {
                chatContainer.value.scrollTop = chatContainer.value.scrollHeight
              }
            })
          } catch (e) {
            // ignore
          }
        }
      }
    }
    
    // 当流式读取完全结束后，执行保存
    if (aiMessage.content) {
      saveAiChatHistory(userText, aiMessage.content)
    }
    
  } catch (error) {
    aiMessage.content = `<div class="text-red-500 font-bold">连接 AI 失败，请稍后再试。</div>`
    isAiThinking.value = false
  }
}

const handleUserMessage = (text) => {
  addMessage('user', text, props.currentWord)
  simulateAiResponse(text)
}

const handleQuickMessage = (text) => {
  addMessage('user', text, props.currentWord)
  simulateAiResponse(text)
}

watch(() => messages.value.length, async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
})
</script>

<style scoped>
/* 针对 AI 返回的 Markdown 渲染做一些基础排版样式 */
:deep(.ai-content) {
  line-height: 1.7;
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
}
:deep(.ai-content h1),
:deep(.ai-content h2),
:deep(.ai-content h3),
:deep(.ai-content h4) {
  font-weight: 900;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  color: #000;
}
:deep(.ai-content h1) { font-size: 1.5em; border-bottom: 3px solid #000; padding-bottom: 0.2em; }
:deep(.ai-content h2) { font-size: 1.3em; }
:deep(.ai-content h3) { font-size: 1.1em; }

:deep(.ai-content p) {
  margin-bottom: 0.8em;
}
:deep(.ai-content p:last-child) {
  margin-bottom: 0;
}
:deep(.ai-content ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 0.8em;
}
:deep(.ai-content ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin-bottom: 0.8em;
}
:deep(.ai-content li) {
  margin-bottom: 0.3em;
}
:deep(.ai-content strong) {
  font-weight: 900;
  color: #000;
  background-color: rgba(226, 240, 0, 0.3); /* 轻微的黄色高亮，类似记号笔 */
  padding: 0 0.2em;
  border-radius: 0.2em;
}
:deep(.ai-content blockquote) {
  border-left: 4px solid #000;
  padding-left: 1em;
  margin-left: 0;
  margin-right: 0;
  background-color: rgba(0, 0, 0, 0.03);
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  font-style: italic;
}
:deep(.ai-content code) {
  background-color: #e5e7eb;
  padding: 0.1em 0.3em;
  border-radius: 0.2em;
  font-family: monospace;
  font-weight: bold;
}
:deep(.ai-content pre) {
  background-color: #1a1a1a;
  color: #fff;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin-bottom: 1em;
}
:deep(.ai-content pre code) {
  background-color: transparent;
  color: inherit;
  padding: 0;
}
</style>