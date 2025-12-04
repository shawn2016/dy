<template>
  <div class="flex-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-20px">
    <div class="w-500px p-40px bg-white rounded-10px shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <div class="text-center mb-30px">
        <h2 class="m-0 mb-10px text-[#303133] text-28px font-semibold">找回密码</h2>
        <p class="m-0 text-[#909399] text-14px">请选择找回方式</p>
      </div>
      
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" class="mb-30px">
        <el-step title="验证身份" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1: 选择验证方式 -->
      <div v-if="currentStep === 0" class="mt-30px">
        <el-radio-group v-model="verifyType" class="w-full mb-20px flex-center gap-30px">
          <el-radio label="phone">手机号验证</el-radio>
          <el-radio label="email">邮箱验证</el-radio>
        </el-radio-group>
        
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          class="verify-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="verifyForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item v-if="verifyType === 'phone'" prop="phone">
            <el-input
              v-model="verifyForm.phone"
              placeholder="请输入手机号"
              :prefix-icon="Phone"
              size="large"
            />
          </el-form-item>
          <el-form-item v-else prop="email">
            <el-input
              v-model="verifyForm.email"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="code">
            <div class="flex gap-10px">
              <el-input
                v-model="verifyForm.code"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                size="large"
                class="flex-1"
              />
              <el-button
                :disabled="codeCountdown > 0"
                @click="sendCode"
                class="whitespace-nowrap"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}秒后重试` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleVerify"
              class="w-full mt-10px"
            >
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 重置密码 -->
      <div v-if="currentStep === 1" class="mt-30px">
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          class="reset-form"
        >
          <el-form-item prop="newPassword">
            <el-input
              v-model="resetForm.newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入新密码（至少6位）"
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
              v-model="resetForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请确认新密码"
              :prefix-icon="Lock"
              size="large"
              @keyup.enter="handleReset"
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
              @click="handleReset"
              class="w-full mt-10px"
            >
              重置密码
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="currentStep === 2" class="mt-30px py-20px">
        <el-result
          icon="success"
          title="密码重置成功"
          sub-title="您的密码已成功重置，请使用新密码登录"
        >
          <template #extra>
            <el-button type="primary" @click="goToLogin">返回登录</el-button>
          </template>
        </el-result>
      </div>

      <div class="text-center mt-20px">
        <span class="text-[#409EFF] cursor-pointer text-14px transition-colors duration-300 hover:text-[#66b1ff] hover:underline" @click="goToLogin">返回登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide, Phone, Message, Key } from '@element-plus/icons-vue'
import { sendVerifyCode, verifyCode, resetPassword } from '@/api/auth'

const router = useRouter()
const verifyFormRef = ref(null)
const resetFormRef = ref(null)
const loading = ref(false)
const currentStep = ref(0)
const verifyType = ref('phone')
const codeCountdown = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const verifyForm = reactive({
  username: '',
  phone: '',
  email: '',
  code: ''
})

const resetForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 验证规则
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

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const verifyRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
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

// 发送验证码
const sendCode = async () => {
  if (verifyType.value === 'phone') {
    if (!verifyForm.phone) {
      ElMessage.warning('请先输入手机号')
      return
    }
  } else {
    if (!verifyForm.email) {
      ElMessage.warning('请先输入邮箱')
      return
    }
  }

  try {
    await sendVerifyCode({
      type: verifyType.value,
      phone: verifyType.value === 'phone' ? verifyForm.phone : undefined,
      email: verifyType.value === 'email' ? verifyForm.email : undefined
    })
    ElMessage.success('验证码已发送')
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error(error.message || '发送验证码失败')
  }
}

// 验证身份
const handleVerify = async () => {
  if (!verifyFormRef.value) return
  
  try {
    await verifyFormRef.value.validate()
    loading.value = true
    
    await verifyCode({
      username: verifyForm.username,
      type: verifyType.value,
      phone: verifyType.value === 'phone' ? verifyForm.phone : undefined,
      email: verifyType.value === 'email' ? verifyForm.email : undefined,
      code: verifyForm.code
    })
    
    ElMessage.success('验证成功')
    currentStep.value = 1
  } catch (error) {
    console.error('验证错误:', error)
    if (error !== false) {
      ElMessage.error(error.message || '验证失败，请检查验证码')
    }
  } finally {
    loading.value = false
  }
}

// 重置密码
const handleReset = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    await resetPassword({
      username: verifyForm.username,
      newPassword: resetForm.newPassword
    })
    
    ElMessage.success('密码重置成功')
    currentStep.value = 2
  } catch (error) {
    console.error('重置密码错误:', error)
    if (error !== false) {
      ElMessage.error(error.message || '重置密码失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 样式已迁移到 UnoCSS */
</style>


