<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <div class="forgot-password-header">
        <h2>找回密码</h2>
        <p>请选择找回方式</p>
      </div>
      
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" class="steps">
        <el-step title="验证身份" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1: 选择验证方式 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-radio-group v-model="verifyType" class="verify-type-group">
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
            <div class="code-input-group">
              <el-input
                v-model="verifyForm.code"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                size="large"
                class="code-input"
              />
              <el-button
                :disabled="codeCountdown > 0"
                @click="sendCode"
                class="code-button"
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
              class="action-button"
            >
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 重置密码 -->
      <div v-if="currentStep === 1" class="step-content">
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
                  class="password-icon"
                  @click="toggleConfirmPassword"
                  style="cursor: pointer;"
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
              class="action-button"
            >
              重置密码
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="currentStep === 2" class="step-content success-content">
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

      <div class="back-link">
        <span class="link-text" @click="goToLogin">返回登录</span>
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
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-password-box {
  width: 500px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-password-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.forgot-password-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.steps {
  margin-bottom: 30px;
}

.step-content {
  margin-top: 30px;
}

.verify-type-group {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 30px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.code-button {
  white-space: nowrap;
}

.action-button {
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

.success-content {
  padding: 20px 0;
}

.back-link {
  text-align: center;
  margin-top: 20px;
}

.link-text {
  color: #409EFF;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}

.link-text:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>

