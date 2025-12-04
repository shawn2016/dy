import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Language = 'zh-CN' | 'en-US'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<Language>((localStorage.getItem('language') as Language) || 'zh-CN')
  const settingsVisible = ref(false)

  const setLanguage = (lang: Language) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  const toggleSettings = () => {
    settingsVisible.value = !settingsVisible.value
  }

  const closeSettings = () => {
    settingsVisible.value = false
  }

  return {
    language,
    settingsVisible,
    setLanguage,
    toggleSettings,
    closeSettings,
  }
})

