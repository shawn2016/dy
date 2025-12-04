import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'light')
  const isDark = ref(false)

  // 应用主题
  const applyTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem('theme', mode)

    if (mode === 'auto') {
      // 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = mode === 'dark'
    }

    // 更新 HTML class
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    applyTheme(newTheme)
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme.value === 'auto') {
        isDark.value = e.matches
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  }

  // 初始化主题（延迟执行，确保 DOM 已加载）
  if (typeof window !== 'undefined') {
    applyTheme(theme.value)
  }

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
  }
})

