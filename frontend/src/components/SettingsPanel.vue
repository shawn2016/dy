<template>
  <el-drawer
    v-model="settingsVisible"
    title="设置"
    direction="rtl"
    size="320px"
    :with-header="true"
  >
    <div class="settings-content">
      <!-- 主题设置 -->
      <div class="settings-section">
        <div class="section-title">
          <el-icon><Sunny /></el-icon>
          <span>主题设置</span>
        </div>
        <div class="section-content">
          <div class="theme-options">
            <div
              class="theme-option"
              :class="{ active: themeStore.theme === 'light' }"
              @click="themeStore.applyTheme('light')"
            >
              <el-icon><Sunny /></el-icon>
              <span>亮色</span>
            </div>
            <div
              class="theme-option"
              :class="{ active: themeStore.theme === 'dark' }"
              @click="themeStore.applyTheme('dark')"
            >
              <el-icon><Moon /></el-icon>
              <span>暗黑</span>
            </div>
            <div
              class="theme-option"
              :class="{ active: themeStore.theme === 'auto' }"
              @click="themeStore.applyTheme('auto')"
            >
              <el-icon><Monitor /></el-icon>
              <span>跟随系统</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 语言设置 -->
      <div class="settings-section">
        <div class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>语言设置</span>
        </div>
        <div class="section-content">
          <el-radio-group v-model="currentLanguage" @change="handleLanguageChange">
            <el-radio label="zh-CN">简体中文</el-radio>
            <el-radio label="en-US">English</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="settings-section">
        <div class="section-title">
          <el-icon><Setting /></el-icon>
          <span>其他设置</span>
        </div>
        <div class="section-content">
          <div class="setting-item">
            <span>自动保存</span>
            <el-switch v-model="autoSave" />
          </div>
          <div class="setting-item">
            <span>消息通知</span>
            <el-switch v-model="notifications" />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Sunny, Moon, Monitor, ChatDotRound, Setting } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const settingsVisible = computed({
  get: () => settingsStore.settingsVisible,
  set: (val) => {
    if (!val) {
      settingsStore.closeSettings()
    } else {
      settingsStore.toggleSettings()
    }
  },
})

const currentLanguage = ref(settingsStore.language)
const autoSave = ref(localStorage.getItem('autoSave') === 'true')
const notifications = ref(localStorage.getItem('notifications') !== 'false')

const handleLanguageChange = (lang: string) => {
  settingsStore.setLanguage(lang as 'zh-CN' | 'en-US')
}

watch(autoSave, (val) => {
  localStorage.setItem('autoSave', String(val))
})

watch(notifications, (val) => {
  localStorage.setItem('notifications', String(val))
})
</script>

<style scoped>
.settings-content {
  @apply p-4;
}

.settings-section {
  @apply mb-6;
}

.section-title {
  @apply flex items-center gap-2 mb-3 text-16px font-semibold text-[#303133] dark:text-[#e5eaf3];
}

.section-content {
  @apply pl-6;
}

.theme-options {
  @apply flex flex-col gap-2;
}

.theme-option {
  @apply flex items-center gap-2 px-4 py-2 rounded-4px cursor-pointer transition-colors duration-200;
  @apply border border-[#dcdfe6] dark:border-[#4c4d4f];
  @apply hover:bg-[#f5f7fa] dark:hover:bg-[#2d2d2d];
}

.theme-option.active {
  @apply bg-[#ecf5ff] dark:bg-[#1d39c4] border-[#409EFF] dark:border-[#409EFF];
  @apply text-[#409EFF] dark:text-[#79bbff];
}

.setting-item {
  @apply flex items-center justify-between py-2;
  @apply text-[#606266] dark:text-[#a8abb2];
}
</style>

