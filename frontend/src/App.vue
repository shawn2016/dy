<template>
  <!-- 登录、注册、忘记密码页面独立显示，不显示菜单和头部 -->
  <router-view v-if="isAuthPage" />
  <el-container v-else class="h-screen">
    <el-header class="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white flex items-center px-20px shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="flex-between items-center w-full">
        <h1 class="m-0 text-24px font-medium">视频封面管理系统</h1>
        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗黑模式'" placement="bottom">
            <el-button
              :icon="themeStore.isDark ? Sunny : Moon"
              circle
              @click="themeStore.toggleTheme()"
              style="color: white; border: none; background: transparent;"
              class="hover:bg-white/10"
            />
          </el-tooltip>
          
          <!-- 设置按钮 -->
          <el-tooltip content="设置" placement="bottom">
            <el-button
              :icon="Setting"
              circle
              @click="settingsStore.toggleSettings()"
              style="color: white; border: none; background: transparent;"
              class="hover:bg-white/10"
            />
          </el-tooltip>
          
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="flex items-center cursor-pointer px-10px py-5px rounded-4px transition-colors duration-300 hover:bg-white/10">
              <el-avatar :size="36" :src="userAvatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="mx-8px text-14px">{{ user?.username || '用户' }}</span>
              <el-icon class="text-12px transition-transform duration-300"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="bg-[#304156] dark:bg-[#1f2937] overflow-hidden">
        <el-menu
          :default-active="activeMenu"
          class="border-r-0 h-full"
          router
          :background-color="themeStore.isDark ? '#1f2937' : '#304156'"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/cover-management">
            <el-icon><Picture /></el-icon>
            <span>封面管理</span>
          </el-menu-item>
          <el-menu-item index="/video-management">
            <el-icon><VideoPlay /></el-icon>
            <span>视频管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="bg-[#f5f7fa] dark:bg-[#1d1e1f] p-20px overflow-y-auto">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- 设置面板 -->
    <SettingsPanel />
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, VideoPlay, User, ArrowDown, SwitchButton, Sunny, Moon, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { logout } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

// 需要独立显示的认证相关页面（不显示菜单和头部）
const authPages = ['/login', '/register', '/forgot-password']
const isAuthPage = computed(() => {
  return authPages.includes(route.path)
})

const user = computed(() => authStore.user)

const userAvatar = computed(() => {
  const avatar = user.value?.avatar
  if (!avatar) return ''
  // 如果是相对路径，添加完整URL
  if (avatar.startsWith('/data/')) {
    return `http://localhost:5001${avatar}`
  }
  return avatar
})

const activeMenu = computed(() => {
  return route.path
})

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await logout()
      authStore.clearAuth()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        // 即使接口失败也清除本地信息
        authStore.clearAuth()
        router.push('/login')
      }
    }
  }
}

onMounted(() => {
  // 如果已登录，尝试获取最新用户信息
  if (authStore.isAuthenticated() && !authStore.user) {
    // 可以在这里调用获取用户信息的接口
  }
})
</script>

<style scoped>
/* 样式已迁移到 UnoCSS */
/* 保留 Element Plus 菜单项的自定义样式 */
.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

.dark .sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #374151 !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}
</style>

