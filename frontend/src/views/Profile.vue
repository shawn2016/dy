<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="120" :src="userAvatar">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
            <div class="avatar-overlay" @click="showAvatarDialog = true">
              <el-icon :size="24"><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <div class="user-info">
            <h3>{{ user?.username || '用户' }}</h3>
            <p>{{ user?.email || '未设置邮箱' }}</p>
          </div>
        </div>

        <!-- 功能列表 -->
        <el-divider />
        <div class="function-list">
          <div class="function-item" @click="showChangePasswordDialog = true">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="更换头像"
      width="600px"
      :before-close="handleAvatarDialogClose"
    >
      <div class="avatar-upload-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept="image/*"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JPG、PNG 格式，建议尺寸 200x200 像素
            </div>
          </template>
        </el-upload>

        <!-- 图片裁剪区域 -->
        <div v-if="imageUrl" class="crop-container">
          <div class="crop-wrapper">
            <img
              ref="imageRef"
              :src="imageUrl"
              alt="预览"
              style="max-width: 100%; max-height: 400px;"
              @load="initCropper"
            />
            <div
              v-if="showCropBox"
              ref="cropBoxRef"
              class="crop-box"
              :style="cropBoxStyle"
              @mousedown="startDrag"
            >
              <div class="crop-handle crop-handle-nw"></div>
              <div class="crop-handle crop-handle-ne"></div>
              <div class="crop-handle crop-handle-sw"></div>
              <div class="crop-handle crop-handle-se"></div>
            </div>
          </div>
          <div class="crop-controls">
            <el-button @click="resetCrop">重置</el-button>
            <el-button type="primary" @click="cropImage" :loading="uploading">
              确认裁剪
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showChangePasswordDialog"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        :rules="changePasswordRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="changePasswordForm.oldPassword"
            :type="showOldPassword ? 'text' : 'password'"
            placeholder="请输入旧密码"
            size="large"
          >
            <template #suffix>
              <el-icon
                class="password-icon"
                @click="showOldPassword = !showOldPassword"
                style="cursor: pointer;"
              >
                <View v-if="showOldPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="changePasswordForm.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="请输入新密码（至少6位）"
            size="large"
          >
            <template #suffix>
              <el-icon
                class="password-icon"
                @click="showNewPassword = !showNewPassword"
                style="cursor: pointer;"
              >
                <View v-if="showNewPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
          <div class="password-strength">
            <div class="strength-item" :class="{ active: passwordStrength >= 1 }"></div>
            <div class="strength-item" :class="{ active: passwordStrength >= 2 }"></div>
            <div class="strength-item" :class="{ active: passwordStrength >= 3 }"></div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="changePasswordForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            size="large"
            @keyup.enter="handleChangePassword"
          >
            <template #suffix>
              <el-icon
                class="password-icon"
                @click="showConfirmPassword = !showConfirmPassword"
                style="cursor: pointer;"
              >
                <View v-if="showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Camera, ArrowRight, View, Hide, UploadFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { changePassword, uploadAvatar } from '@/api/auth'

const authStore = useAuthStore()

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

// 修改密码相关
const showChangePasswordDialog = ref(false)
const changePasswordFormRef = ref(null)
const changingPassword = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const changePasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = changePasswordForm.newPassword
  if (!password) return 0
  let strength = 0
  if (password.length >= 6) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  return Math.min(strength, 3)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  const texts = ['', '弱', '中', '强']
  return texts[strength]
})

// 自定义验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== changePasswordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const changePasswordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 头像上传相关
const showAvatarDialog = ref(false)
const uploadRef = ref(null)
const imageRef = ref(null)
const cropBoxRef = ref(null)
const imageUrl = ref('')
const uploading = ref(false)
const showCropBox = ref(false)

// 裁剪框相关
const cropBoxStyle = ref({
  left: '50%',
  top: '50%',
  width: '200px',
  height: '200px',
  transform: 'translate(-50%, -50%)'
})

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let cropBoxLeft = 0
let cropBoxTop = 0

// 文件选择
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 初始化裁剪框
const initCropper = () => {
  showCropBox.value = true
  // 重置裁剪框位置
  if (imageRef.value) {
    const imgRect = imageRef.value.getBoundingClientRect()
    const centerX = imgRect.width / 2
    const centerY = imgRect.height / 2
    cropBoxStyle.value = {
      left: `${centerX}px`,
      top: `${centerY}px`,
      width: '200px',
      height: '200px',
      transform: 'translate(-50%, -50%)'
    }
  }
}

// 开始拖拽
const startDrag = (e) => {
  if (e.target.classList.contains('crop-handle')) {
    // 缩放逻辑（简化版，实际应该更复杂）
    return
  }
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  const box = cropBoxRef.value
  if (box) {
    const rect = box.getBoundingClientRect()
    cropBoxLeft = rect.left
    cropBoxTop = rect.top
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging || !imageRef.value) return
  const imgRect = imageRef.value.getBoundingClientRect()
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  let newLeft = cropBoxLeft + deltaX - imgRect.left
  let newTop = cropBoxTop + deltaY - imgRect.top
  
  // 限制在图片范围内
  const boxWidth = 200
  const boxHeight = 200
  newLeft = Math.max(0, Math.min(newLeft, imgRect.width - boxWidth))
  newTop = Math.max(0, Math.min(newTop, imgRect.height - boxHeight))
  
  cropBoxStyle.value = {
    ...cropBoxStyle.value,
    left: `${newLeft + boxWidth / 2}px`,
    top: `${newTop + boxHeight / 2}px`
  }
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 重置裁剪
const resetCrop = () => {
  initCropper()
}

// 裁剪图片
const cropImage = async () => {
  if (!imageRef.value || !cropBoxRef.value) return
  
  uploading.value = true
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 200
    canvas.height = 200
    
    const img = imageRef.value
    const imgRect = img.getBoundingClientRect()
    const boxRect = cropBoxRef.value.getBoundingClientRect()
    
    // 计算裁剪区域
    const sourceX = boxRect.left - imgRect.left
    const sourceY = boxRect.top - imgRect.top
    const sourceWidth = 200
    const sourceHeight = 200
    
    // 获取图片原始尺寸
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    const scaleX = imgNaturalWidth / imgRect.width
    const scaleY = imgNaturalHeight / imgRect.height
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      sourceX * scaleX,
      sourceY * scaleY,
      sourceWidth * scaleX,
      sourceHeight * scaleY,
      0,
      0,
      200,
      200
    )
    
    // 转换为blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.jpg')
      
      const response = await uploadAvatar(formData)
      authStore.setUser({ ...user.value, avatar: response.data.avatar })
      ElMessage.success('头像更新成功')
      showAvatarDialog.value = false
      resetAvatarDialog()
    }, 'image/jpeg', 0.9)
  } catch (error) {
    console.error('裁剪错误:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploading.value = false
  }
}

// 重置头像对话框
const resetAvatarDialog = () => {
  imageUrl.value = ''
  showCropBox.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleAvatarDialogClose = () => {
  resetAvatarDialog()
  showAvatarDialog.value = false
}

// 修改密码
const handleChangePassword = async () => {
  if (!changePasswordFormRef.value) return
  
  try {
    await changePasswordFormRef.value.validate()
    changingPassword.value = true
    
    await changePassword({
      oldPassword: changePasswordForm.oldPassword,
      newPassword: changePasswordForm.newPassword
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    showChangePasswordDialog.value = false
    // 清空表单
    changePasswordForm.oldPassword = ''
    changePasswordForm.newPassword = ''
    changePasswordForm.confirmPassword = ''
  } catch (error) {
    console.error('修改密码错误:', error)
    if (error !== false) {
      ElMessage.error(error.message || '修改密码失败')
    }
  } finally {
    changingPassword.value = false
  }
}

// 监听对话框关闭，重置表单
watch(showChangePasswordDialog, (val) => {
  if (!val) {
    changePasswordForm.oldPassword = ''
    changePasswordForm.newPassword = ''
    changePasswordForm.confirmPassword = ''
    if (changePasswordFormRef.value) {
      changePasswordFormRef.value.clearValidate()
    }
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px 0;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 12px;
  margin-top: 5px;
}

.user-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.user-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.function-list {
  padding: 10px 0;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.function-item:hover {
  background-color: #f5f7fa;
}

.function-item .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 10px;
}

.function-item span {
  flex: 1;
  font-size: 16px;
  color: #303133;
}

.arrow-icon {
  color: #c0c4cc !important;
  margin-right: 0 !important;
}

.avatar-upload-content {
  padding: 20px 0;
}

.crop-container {
  margin-top: 20px;
}

.crop-wrapper {
  position: relative;
  display: inline-block;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.crop-box {
  position: absolute;
  border: 2px solid #409EFF;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
}

.crop-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #409EFF;
  border: 2px solid white;
  border-radius: 50%;
}

.crop-handle-nw {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.crop-handle-ne {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.crop-handle-sw {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.crop-handle-se {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

.crop-controls {
  margin-top: 20px;
  text-align: right;
}

.crop-controls .el-button {
  margin-left: 10px;
}

.password-icon {
  color: #909399;
  transition: color 0.3s;
}

.password-icon:hover {
  color: #409EFF;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.strength-item {
  width: 30px;
  height: 4px;
  background: #dcdfe6;
  border-radius: 2px;
  transition: background-color 0.3s;
}

.strength-item.active {
  background: #67c23a;
}

.strength-text {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}
</style>

