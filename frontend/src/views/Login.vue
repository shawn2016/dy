<template>
  <div class="flex-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] dark:from-[#1a1a2e] dark:to-[#16213e] relative">
    <!-- 登录页面也显示主题和设置按钮 -->
    <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
      <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗黑模式'" placement="bottom">
        <el-button
          :icon="themeStore.isDark ? Sunny : Moon"
          circle
          @click="themeStore.toggleTheme()"
          style="color: white; border: none; background: rgba(255,255,255,0.2);"
          class="hover:bg-white/30"
        />
      </el-tooltip>
      <el-tooltip content="设置" placement="bottom">
        <el-button
          :icon="Setting"
          circle
          @click="settingsStore.toggleSettings()"
          style="color: white; border: none; background: rgba(255,255,255,0.2);"
          class="hover:bg-white/30"
        />
      </el-tooltip>
    </div>
    
    <div class="w-400px p-40px bg-white dark:bg-[#2d2d2d] rounded-10px shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <div class="text-center mb-30px">
        <h2 class="m-0 mb-10px text-[#303133] dark:text-[#e5eaf3] text-28px font-semibold">视频封面管理系统</h2>
        <p class="m-0 text-[#909399] dark:text-[#a8abb2] text-14px">欢迎登录</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="mt-30px"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon
                class="text-[#909399] transition-colors duration-300 cursor-pointer hover:text-[#409EFF]"
                @click="togglePassword"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="w-full mt-10px"
          >
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="mt-10px mb-0">
          <div class="flex-center gap-10px w-full text-14px">
            <span class="text-[#409EFF] cursor-pointer transition-colors duration-300 hover:text-[#66b1ff] hover:underline" @click="goToForgotPassword">忘记密码？</span>
            <span class="text-[#dcdfe6]">|</span>
            <span class="text-[#409EFF] cursor-pointer transition-colors duration-300 hover:text-[#66b1ff] hover:underline" @click="goToRegister">注册账号</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 设置面板 -->
    <SettingsPanel />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await login(loginForm)
    console.log('登录响应:', response)
    
    // 从响应中获取数据
    const data = response.data || response
    const { token, user } = data

    if (!token) {
      throw new Error('登录失败：未获取到token')
    }
    
    // 保存token和用户信息
    authStore.setToken(token)
    authStore.setUser(user)
    
    console.log('Token已保存:', authStore.token)
    console.log('用户信息已保存:', authStore.user)
    console.log('认证状态:', authStore.isAuthenticated())
    
    ElMessage.success('登录成功')
    
    // 等待下一个 tick 确保状态更新
    await nextTick()
    
    // 跳转到首页
    router.push('/cover-management').then(() => {
      console.log('跳转成功')
    }).catch(err => {
      console.error('跳转失败:', err)
      // 如果路由跳转失败，使用 window.location 强制跳转
      window.location.href = '/cover-management'
    })
  } catch (error) {
    console.error('登录错误:', error)
    if (error !== false) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 样式已迁移到 UnoCSS */
</style>

