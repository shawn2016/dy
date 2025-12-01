<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>视频封面管理系统</h2>
        <p>欢迎登录</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
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
                class="password-icon"
                @click="togglePassword"
                style="cursor: pointer;"
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
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="login-links">
          <div class="links-container">
            <span class="link-text" @click="goToForgotPassword">忘记密码？</span>
            <span class="divider">|</span>
            <span class="link-text" @click="goToRegister">注册账号</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.password-icon {
  color: #909399;
  transition: color 0.3s;
}

.password-icon:hover {
  color: #409EFF;
}

.login-links {
  margin-top: 10px;
  margin-bottom: 0;
}

.links-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  font-size: 14px;
}

.link-text {
  color: #409EFF;
  cursor: pointer;
  transition: color 0.3s;
}

.link-text:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.divider {
  color: #dcdfe6;
}
</style>

