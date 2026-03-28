import { reactive } from 'vue'

export interface ToastAction {
  label: string
  onClick: () => void
}

const state = reactive({
  show: false,
  message: '',
  type: 'success', // 'success' | 'error'
  action: null as ToastAction | null
})

let timeout: ReturnType<typeof setTimeout> | null = null

export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' = 'success', action: ToastAction | null = null) => {
    state.message = message
    state.type = type
    state.action = action
    state.show = true
    
    if (timeout) clearTimeout(timeout)
    
    // 如果有操作按钮，可以考虑让弹窗停留时间更长一些，比如 5 秒
    const duration = action ? 5000 : 3000
    
    timeout = setTimeout(() => {
      state.show = false
    }, duration)
  }

  const hideToast = () => {
    state.show = false
    if (timeout) clearTimeout(timeout)
  }

  return {
    state,
    showToast,
    hideToast
  }
}
