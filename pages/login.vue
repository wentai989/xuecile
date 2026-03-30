<template>
  <div class="h-screen w-full flex bg-white overflow-hidden selection:bg-brutal-pink selection:text-black">
    
    <!-- 左侧：品牌信息展示 (占据剩余空间，充满高度) -->
    <div class="flex-1 bg-brutal-orange text-black p-12 border-r-4 border-black flex flex-col justify-between relative overflow-hidden">
      <div class="absolute -left-10 -bottom-10 opacity-20 pointer-events-none">
        <Zap class="w-96 h-96 rotate-12" />
      </div>

      <div class="relative z-10 mt-10">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-16 h-16 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0_#fff] rotate-[-5deg]">
            <Zap class="w-10 h-10 text-brutal-yellow" />
          </div>
          <span class="text-5xl font-black uppercase tracking-tighter text-white">学词乐</span>
        </div>
        
        <h1 class="text-6xl font-black uppercase leading-[1.1] mb-8 text-white drop-shadow-[4px_4px_0_#000]">
          Supercharge <br>
          Your <span class="bg-black text-white px-2 shadow-[4px_4px_0_#fff]">Memory</span> <br>
          With AI.-v.0.01
        </h1>
        
        <p class="font-bold text-xl border-l-4 border-black pl-4 max-w-lg">
          智能多语种背词助手。
        </p>
      </div>

      <div class="mb-10 relative z-10 space-y-4">
        <div class="flex items-center gap-3 bg-white/20 p-4 border-4 border-black shadow-[4px_4px_0_#000] w-max">
          <CheckCircle2 class="w-6 h-6 shrink-0" />
          <span class="font-black text-lg">AI 定制词库，告别无效背诵</span>
        </div>
        <!-- <div class="flex items-center gap-3 bg-white/20 p-4 border-4 border-black shadow-[4px_4px_0_#000] w-max">
          <CheckCircle2 class="w-6 h-6 shrink-0" />
          <span class="font-black text-lg">极简沉浸，专注核心记忆路径</span>
        </div> -->
      </div>
    </div>

    <!-- 右侧：登录表单 (固定宽度 500px，充满高度) -->
    <div class="w-[500px] bg-[#F4F4F0] flex flex-col justify-center px-12 relative shrink-0">
      
      <!-- 装饰性角标 -->
      <div class="absolute top-0 right-0 w-16 h-16 bg-brutal-yellow border-l-4 border-b-4 border-black flex items-center justify-center">
        <Sparkles class="w-8 h-8" />
      </div>

      <div class="mb-12 flex justify-between items-end">
        <div>
          <h2 class="text-4xl font-black uppercase mb-3">{{ isLoginMode ? '登录 // LOGIN' : '注册 // REGISTER' }}</h2>
          <p class="font-bold text-gray-500">{{ isLoginMode ? '欢迎回来，请输入您的账号和密码' : '使用手机号创建一个新账号' }}</p>
        </div>
        <button 
          type="button" 
          @click="toggleMode"
          class="font-black text-sm underline decoration-2 hover:text-brutal-blue transition-colors"
        >
          {{ isLoginMode ? '去注册' : '去登录' }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- 登录模式：手机号输入 -->
        <div v-if="isLoginMode" class="space-y-2">
          <label class="font-black uppercase text-sm flex items-center gap-2">
            <Phone class="w-4 h-4" /> 手机号码
          </label>
          <div class="flex border-4 border-black bg-white focus-within:bg-brutal-yellow/20 focus-within:shadow-[4px_4px_0_#000] transition-all">
            <input 
              v-model="loginForm.phone" 
              type="tel" 
              placeholder="请输入 11 位手机号"
              class="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400"
              maxlength="11"
            >
          </div>
        </div>

        <!-- 注册模式：手机号输入 -->
        <div v-else class="space-y-2">
          <label class="font-black uppercase text-sm flex items-center gap-2">
            <Phone class="w-4 h-4" /> 手机号码
          </label>
          <div class="flex border-4 border-black bg-white focus-within:bg-brutal-yellow/20 focus-within:shadow-[4px_4px_0_#000] transition-all">
            <div class="px-4 py-4 border-r-4 border-black font-black bg-gray-100 flex items-center justify-center text-lg">
              +86
            </div>
            <input 
              v-model="registerForm.phone" 
              type="tel" 
              placeholder="请输入 11 位手机号"
              class="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400"
              maxlength="11"
            >
          </div>
        </div>


        <!-- 密码输入 (登录和注册共用) -->
        <div class="space-y-2">
          <label class="font-black uppercase text-sm flex items-center gap-2">
            <KeyRound class="w-4 h-4" /> {{ isLoginMode ? '密码' : '设置密码' }}
          </label>
          <div class="flex border-4 border-black bg-white focus-within:bg-brutal-blue/10 focus-within:shadow-[4px_4px_0_#000] transition-all">
            <input 
              v-if="isLoginMode"
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              class="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400 w-full min-w-0"
            >
            <input 
              v-else
              v-model="registerForm.password" 
              type="password" 
              placeholder="请设置 6-16 位密码"
              class="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-gray-400 w-full min-w-0"
            >
          </div>
        </div>

        <!-- 协议勾选 (仅注册时需要) -->
        <div v-if="!isLoginMode" class="flex items-start gap-3 pt-4">
          <button 
            type="button"
            @click="registerForm.agreed = !registerForm.agreed"
            :class="[
              'w-6 h-6 shrink-0 border-4 border-black flex items-center justify-center transition-colors mt-0.5',
              registerForm.agreed ? 'bg-black text-white' : 'bg-white'
            ]"
          >
            <Check v-if="registerForm.agreed" class="w-4 h-4 stroke-[4]" />
          </button>
          <span class="text-sm font-bold text-gray-600 leading-relaxed">
            我已阅读并同意 
            <a href="#" class="text-black underline decoration-2 hover:text-brutal-blue">《用户服务协议》</a> 
            和 
            <a href="#" class="text-black underline decoration-2 hover:text-brutal-blue">《隐私政策》</a>
          </span>
        </div>

        <!-- 提交按钮 -->
        <button 
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="w-full py-5 mt-6 bg-brutal-green text-black border-4 border-black font-black text-xl hover:bg-brutal-yellow shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brutal-green disabled:hover:shadow-[6px_6px_0_#000]"
        >
          <Loader2 v-if="isSubmitting" class="w-6 h-6 animate-spin" />
          <template v-else>
            {{ isLoginMode ? '登 录' : '注 册' }} <ArrowRight class="w-6 h-6" />
          </template>
        </button>
        <div v-if="errorMessage" class="mt-4 px-4 py-3 border-4 border-black bg-white text-red-600 font-bold shadow-[4px_4px_0_#000]">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mt-4 px-4 py-3 border-4 border-black bg-brutal-green text-black font-black shadow-[4px_4px_0_#000]">
          {{ successMessage }}
        </div>

      </form>
      
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Zap, Sparkles, User, KeyRound, Check, ArrowRight, Loader2, CheckCircle2, Phone } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// 使用空白布局，不显示左侧边栏
definePageMeta({
  layout: 'blank'
})

const router = useRouter()

const isLoginMode = ref(true)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}
const loginForm = reactive({
  phone: '',
  password: ''
})

const registerForm = reactive({
  phone: '',
  password: '',
  agreed: false
})
const errorMessage = ref('')
const successMessage = ref('')

const isSubmitting = ref(false)

// 简单的手机号验证规则 (11位数字，1开头)
const isValidPhone = computed(() => {
  return /^1\d{10}$/.test(registerForm.phone)
})

// 目前不需要短信验证码逻辑

// 表单整体是否有效
const isFormValid = computed(() => {
  if (isLoginMode.value) {
    return loginForm.phone.length === 11 && loginForm.password.length > 0
  } else {
    return isValidPhone.value && 
           registerForm.password.length >= 6 && 
           registerForm.agreed
  }
})
const handleSubmit = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  if (isLoginMode.value) {
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { phone: loginForm.phone, password: loginForm.password }
      })
      if (res?.code === 200) {
        try {
          localStorage.setItem('token', res.data?.token)
          localStorage.setItem('user', JSON.stringify(res.data?.user))
        } catch {}
        successMessage.value = '登录成功'
        router.push('/')
      } else {
        errorMessage.value = res?.error || '登录失败'
      }
    } catch {
      errorMessage.value = '网络错误，请稍后再试'
    } finally {
      isSubmitting.value = false
    }
  } else {
    try {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { phone: registerForm.phone, password: registerForm.password }
      })
      if (res?.code === 200) {
        try {
          localStorage.setItem('token', res.data?.token)
          localStorage.setItem('user', JSON.stringify(res.data?.user))
        } catch {}
        successMessage.value = '注册成功'
        router.push('/')
      } else {
        errorMessage.value = res?.error || '注册失败'
      }
    } catch {
      errorMessage.value = '网络错误，请稍后再试'
    } finally {
      isSubmitting.value = false
    }
  }
}
</script>
