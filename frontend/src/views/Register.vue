<template>
  <div class="flex-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
    <div class="w-450px p-40px bg-white rounded-10px shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <div class="text-center mb-30px">
        <h2 class="m-0 mb-10px text-[#303133] text-28px font-semibold">注册账号</h2>
        <p class="m-0 text-[#909399] text-14px">创建您的账号</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="mt-30px"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            :prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱（可选）"
            :prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码（至少6位）"
            :prefix-icon="Lock"
            size="large"
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
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请确认密码"
            :prefix-icon="Lock"
            size="large"
            @keyup.enter="handleRegister"
          >
            <template #suffix>
              <el-icon
                class="text-[#909399] transition-colors duration-300 cursor-pointer hover:text-[#409EFF]"
                @click="toggleConfirmPassword"
              >
                <View v-if="showConfirmPassword" />
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
            @click="handleRegister"
            class="w-full mt-10px"
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="mt-10px mb-0">
          <div class="flex-center w-full text-14px">
            <span class="text-[#409EFF] cursor-pointer transition-colors duration-300 hover:text-[#66b1ff] hover:underline" @click="goToLogin">已有账号？立即登录</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide, Phone, Message } from '@element-plus/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const registerForm = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 手机号验证
const validatePhone = (rule, value, callback) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const goToLogin = () => {
  router.push('/login')
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    const response = await register({
      username: registerForm.username,
      phone: registerForm.phone,
      email: registerForm.email || undefined,
      password: registerForm.password
    })
    
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册错误:', error)
    if (error !== false) {
      ElMessage.error(error.message || '注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 样式已迁移到 UnoCSS */
</style>


