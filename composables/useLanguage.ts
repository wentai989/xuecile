import { useState } from 'nuxt/app'

export const languages = [
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

export function useLanguage() {
  const language = useState<string>('language', () => 'en')
  const setLanguage = (code: string) => {
    language.value = code
  }
  return { language, languages, setLanguage }
}
