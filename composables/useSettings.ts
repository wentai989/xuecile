import { reactive, watch, onMounted } from 'vue'

// 抽取全局状态
const userSettings = reactive({
  rate: 0.8,
  engine: 'browser' // 默认改为 'browser'（浏览器发音）
})

export const useSettings = () => {
  const loadSettings = () => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('danci_tts_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        userSettings.rate = parsed.rate || 0.8
        userSettings.engine = parsed.engine || 'browser'
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }

  const saveSettings = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('danci_tts_settings', JSON.stringify(userSettings))
  }

  return {
    userSettings,
    loadSettings,
    saveSettings
  }
}
