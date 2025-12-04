<template>
  <div class="h-full">
    <el-card class="min-h-[calc(100vh-120px)]">
      <template #header>
        <div class="flex-between items-center">
          <span class="text-20px font-semibold text-[#303133] dark:text-[#e5eaf3]">封面管理</span>
          <el-button 
            type="primary" 
            :icon="Plus" 
            @click="handleAdd"
            class="ml-auto"
          >
            新增
          </el-button>
        </div>
      </template>

      <!-- 查询条件栏 -->
      <div class="mb-20px">
        <el-form :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="封面名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入封面名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar">
          <el-button-group>
            <el-button 
              :type="viewMode === 'card' ? 'primary' : ''" 
              :icon="Grid" 
              @click="viewMode = 'card'"
            >
              卡片视图
            </el-button>
            <el-button 
              :type="viewMode === 'list' ? 'primary' : ''" 
              :icon="List" 
              @click="viewMode = 'list'"
            >
              列表视图
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 封面列表 -->
      <div class="min-h-400px" v-loading="loading">
        <el-empty v-if="coverList.length === 0 && !loading" description="暂无封面数据" />
        
        <!-- 卡片视图 -->
        <div v-else-if="viewMode === 'card'" class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-20px">
          <el-card
            v-for="cover in coverList"
            :key="cover.id"
            class="transition-transform duration-300 cursor-pointer hover:translate-y--5px"
            :body-style="{ padding: '10px' }"
            shadow="hover"
          >
            <div class="w-full h-200px overflow-hidden rounded-4px bg-[#f5f7fa] mb-10px" @click="handlePreview(cover)">
              <img 
                :src="getImageUrl(cover.cropped_image_path || cover.image_url)" 
                :alt="cover.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-if="cover.video_path" class="video-badge">
                <el-icon><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="mb-10px">
              <div class="text-16px font-medium text-[#303133] mb-5px overflow-hidden text-ellipsis whitespace-nowrap">{{ cover.name }}</div>
              <div class="text-12px text-[#909399]">
                <span class="cover-date">{{ formatDate(cover.created_at) }}</span>
                <el-tag :type="cover.status === 1 ? 'success' : 'info'" size="small" style="margin-left: 8px">
                  {{ cover.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </div>
            <div class="flex gap-10px justify-end">
              <el-button 
                type="primary" 
                :icon="Edit" 
                size="small"
                @click="handleEdit(cover)"
              >
                编辑
              </el-button>
              <el-button 
                type="info" 
                :icon="VideoPlay" 
                size="small"
                @click="handlePreview(cover)"
                v-if="cover.video_path"
              >
                预览
              </el-button>
              <el-button 
                type="danger" 
                :icon="Delete" 
                size="small"
                @click="handleDelete(cover)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </div>
        
        <!-- 列表视图 -->
        <el-table v-else :data="coverList" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="缩略图" width="120">
            <template #default="{ row }">
              <img 
                :src="getImageUrl(row.cropped_image_path || row.image_url)" 
                :alt="row.name"
                class="table-thumbnail"
                @error="handleImageError"
                @click="handlePreview(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="封面名称" min-width="150" />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                :icon="Edit" 
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="info" 
                :icon="VideoPlay" 
                size="small"
                @click="handlePreview(row)"
                v-if="row.video_path"
              >
                预览
              </el-button>
              <el-button 
                type="danger" 
                :icon="Delete" 
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="handleDialogClose"
    >
      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 30px">
        <el-step title="上传图片" />
        <el-step title="裁剪图片" />
        <el-step title="编辑标题" />
        <el-step title="生成视频" />
        <el-step title="保存提交" />
      </el-steps>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 步骤1: 上传图片 -->
        <div v-show="currentStep === 0">
          <el-form-item label="封面图片" prop="cropped_image_path">
          <!-- 上传和裁剪功能（新增和编辑都可用） -->
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept="image/*"
            drag
            class="cover-upload"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 JPG、PNG 格式，将裁剪为 9:16 比例
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
                class="crop-image"
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
              <el-button type="primary" @click="cropAndUpload" :loading="uploading">
                确认裁剪并上传
              </el-button>
            </div>
          </div>

          <!-- 已上传的图片预览 -->
          <div v-if="formData.image_url && !imageUrl" class="image-preview">
            <img :src="getImageUrl(formData.image_url)" alt="预览" @error="handleImageError" />
            <div class="image-preview-actions">
              <el-button size="small" @click="showCropDialog">重新裁剪</el-button>
            </div>
          </div>
        </el-form-item>
        </div>
        
        <!-- 步骤2: 裁剪图片 -->
        <div v-show="currentStep === 1">
          <el-form-item label="裁剪预览">
            <div class="crop-preview-container">
              <div class="crop-preview-wrapper">
                <img
                  v-if="croppedPreviewUrl"
                  :src="croppedPreviewUrl"
                  alt="裁剪预览"
                  class="crop-preview-image"
                />
                <div v-else class="crop-preview-placeholder">
                  请先完成图片裁剪
                </div>
              </div>
            </div>
          </el-form-item>
        </div>
        
        <!-- 步骤3: 编辑标题 -->
        <div v-show="currentStep === 2">
          <el-form-item label="标题文本">
            <el-input 
              v-model="titleConfig.text" 
              placeholder="请输入标题（最多30字）"
              maxlength="30"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="titleConfig.font" style="width: 200px">
              <el-option label="Arial" value="Arial" />
              <el-option label="黑体" value="SimHei" />
              <el-option label="宋体" value="SimSun" />
              <el-option label="楷体" value="KaiTi" />
            </el-select>
          </el-form-item>
          <el-form-item label="字体大小">
            <el-slider 
              v-model="titleConfig.font_size" 
              :min="12" 
              :max="48" 
              show-input
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="字体颜色">
            <el-color-picker v-model="titleConfig.color" />
          </el-form-item>
          <el-form-item label="字体样式">
            <el-checkbox v-model="titleConfig.bold">粗体</el-checkbox>
            <el-checkbox v-model="titleConfig.italic" style="margin-left: 20px">斜体</el-checkbox>
          </el-form-item>
          <el-form-item label="标题位置">
            <div class="title-position-editor">
              <div class="position-preview" ref="positionPreviewRef">
                <img
                  v-if="croppedPreviewUrl"
                  :src="croppedPreviewUrl"
                  alt="位置预览"
                  class="position-preview-image"
                />
                <div
                  v-if="titleConfig.text"
                  class="title-text-overlay"
                  :style="{
                    left: titleConfig.position_x + 'px',
                    top: titleConfig.position_y + 'px',
                    fontSize: titleConfig.font_size + 'px',
                    color: titleConfig.color,
                    fontFamily: titleConfig.font,
                    fontWeight: titleConfig.bold ? 'bold' : 'normal',
                    fontStyle: titleConfig.italic ? 'italic' : 'normal'
                  }"
                  @mousedown="startTitleDrag"
                >
                  {{ titleConfig.text }}
                </div>
              </div>
              <div class="position-controls">
                <el-button @click="resetTitlePosition">重置位置</el-button>
                <span class="position-hint">拖拽标题文字可调整位置</span>
              </div>
            </div>
          </el-form-item>
        </div>
        
        <!-- 步骤4: 生成视频 -->
        <div v-show="currentStep === 3">
          <el-form-item label="视频预览">
            <div class="video-preview-container">
              <video
                v-if="videoPreviewUrl"
                ref="videoPreviewRef"
                :src="videoPreviewUrl"
                controls
                class="video-preview"
              ></video>
              <div v-else class="video-preview-placeholder">
                <el-icon :size="48"><VideoPlay /></el-icon>
                <p>点击下方按钮生成视频</p>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              :icon="VideoPlay" 
              @click="handleGenerateVideo"
              :loading="generatingVideo"
            >
              生成3秒封面视频
            </el-button>
          </el-form-item>
        </div>
        
        <!-- 步骤5: 保存提交 -->
        <div v-show="currentStep === 4">
          <el-form-item label="封面名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入封面名称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入描述"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button 
          v-if="currentStep < 4" 
          type="primary" 
          @click="handleNextStep"
          :loading="submitting"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 4" 
          type="primary" 
          @click="handleSubmit" 
          :loading="submitting"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 视频预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="视频预览" width="600px">
      <video
        v-if="previewVideoUrl"
        :src="previewVideoUrl"
        controls
        autoplay
        style="width: 100%"
      ></video>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCoverList } from '@/composables/useCoverList'
import { 
  Plus, Edit, Delete, Search, UploadFilled, Refresh, Grid, List, VideoPlay 
} from '@element-plus/icons-vue'
import { 
  getCovers, createCover, updateCover, deleteCover, uploadCoverImage, 
  generateVideo, getCoverVideoUrl 
} from '@/api/cover'

const router = useRouter()

// 使用 composable
const {
  loading,
  coverList,
  total,
  queryParams,
  pagination,
  dateRange,
  loadCovers,
  handleQuery,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleDelete,
} = useCoverList()

const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const viewMode = ref<'card' | 'list'>('card') // 'card' | 'list'
const currentStep = ref(0) // 步骤：0-上传, 1-裁剪, 2-标题, 3-视频, 4-保存
const generatingVideo = ref(false)
const previewDialogVisible = ref(false)
const previewVideoUrl = ref('')

// 表单数据
const formData = ref({
  id: null,
  name: '',
  original_image_path: '',
  cropped_image_path: '',
  video_path: '',
  status: 1,
  description: ''
})

// 标题配置
const titleConfig = ref({
  text: '',
  font: 'Arial',
  font_size: 24,
  color: '#FFFFFF',
  position_x: 0,
  position_y: 0,
  bold: false,
  italic: false
})

// 裁剪预览
const croppedPreviewUrl = ref('')
const videoPreviewUrl = ref('')
const videoPreviewRef = ref(null)
const positionPreviewRef = ref(null)
let isTitleDragging = false
let titleDragStartX = 0
let titleDragStartY = 0

// 图片上传和裁剪相关
const uploadRef = ref(null)
const imageRef = ref(null)
const cropBoxRef = ref(null)
const imageUrl = ref('')
const uploading = ref(false)
const showCropBox = ref(false)

// 裁剪框相关 - 9:16 比例
const cropAspectRatio = 9 / 16 // 9:16 比例
const cropBoxWidth = 270 // 默认宽度
const cropBoxHeight = cropBoxWidth / cropAspectRatio // 根据比例计算高度

const cropBoxStyle = ref({
  left: '50%',
  top: '50%',
  width: `${cropBoxWidth}px`,
  height: `${cropBoxHeight}px`,
  transform: 'translate(-50%, -50%)'
})

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let cropBoxLeft = 0
let cropBoxTop = 0
let imageContainerRect = null

const formRules = {
  name: [
    { required: true, message: '请输入封面名称', trigger: 'blur' }
  ],
  cropped_image_path: [
    { 
      required: true, 
      message: '请上传并裁剪封面图片', 
      trigger: 'blur'
    }
  ]
}

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑封面' : '新增封面'
})

// 函数已从 useCoverList composable 中导入

// 新增 - 跳转到封面设置页面
const handleAdd = () => {
  router.push('/cover-setting')
}

// 编辑
const handleEdit = (cover) => {
  isEdit.value = true
  currentStep.value = 0
  formData.value = {
    id: cover.id,
    name: cover.name,
    original_image_path: cover.original_image_path || '',
    cropped_image_path: cover.cropped_image_path || cover.image_url || '',
    video_path: cover.video_path || '',
    status: cover.status !== undefined ? cover.status : 1,
    description: cover.description || ''
  }
  titleConfig.value = {
    text: cover.title_text || '',
    font: cover.title_font || 'Arial',
    font_size: cover.title_font_size || 24,
    color: cover.title_color || '#FFFFFF',
    position_x: cover.title_position_x || 0,
    position_y: cover.title_position_y || 0,
    bold: cover.title_bold || false,
    italic: cover.title_italic || false
  }
  if (formData.value.cropped_image_path) {
    croppedPreviewUrl.value = getImageUrl(formData.value.cropped_image_path)
  }
  if (formData.value.video_path) {
    videoPreviewUrl.value = getImageUrl(formData.value.video_path)
  }
  resetCropState()
  dialogVisible.value = true
}

// 预览视频
const handlePreview = (cover) => {
  if (cover.video_path) {
    previewVideoUrl.value = getCoverVideoUrl(cover.id)
    previewDialogVisible.value = true
  } else {
    ElMessage.warning('该封面尚未生成视频')
  }
}

// 下一步
const handleNextStep = async () => {
  if (currentStep.value === 0) {
    // 验证是否已上传图片
    if (!formData.value.cropped_image_path && !imageUrl.value) {
      ElMessage.warning('请先上传并裁剪图片')
      return
    }
    if (imageUrl.value && !formData.value.cropped_image_path) {
      ElMessage.warning('请先完成图片裁剪')
      return
    }
    currentStep.value = 1
    nextTick(() => {
      if (formData.value.cropped_image_path) {
        croppedPreviewUrl.value = getImageUrl(formData.value.cropped_image_path)
      }
    })
  } else if (currentStep.value === 1) {
    // 验证是否已裁剪
    if (!formData.value.cropped_image_path) {
      ElMessage.warning('请先完成图片裁剪')
      return
    }
    currentStep.value = 2
    // 初始化标题位置（居中）
    nextTick(() => {
      if (positionPreviewRef.value) {
        const rect = positionPreviewRef.value.getBoundingClientRect()
        titleConfig.value.position_x = rect.width / 2
        titleConfig.value.position_y = rect.height / 2
      }
    })
  } else if (currentStep.value === 2) {
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    // 验证是否已生成视频
    if (!formData.value.video_path) {
      ElMessage.warning('请先生成视频')
      return
    }
    currentStep.value = 4
  }
}

// 生成视频
const handleGenerateVideo = async () => {
  if (!formData.value.cropped_image_path) {
    ElMessage.warning('请先完成图片裁剪')
    return
  }
  
  generatingVideo.value = true
  try {
    const response = await generateVideo({
      cropped_image_path: formData.value.cropped_image_path,
      title_config: titleConfig.value
    })
    
    if (response.data && response.data.video_path) {
      formData.value.video_path = response.data.video_path
      videoPreviewUrl.value = getImageUrl(response.data.video_path)
      ElMessage.success('视频生成成功')
    }
  } catch (error) {
    ElMessage.error('视频生成失败：' + (error.message || '未知错误'))
    console.error(error)
  } finally {
    generatingVideo.value = false
  }
}

// 标题拖拽
const startTitleDrag = (e) => {
  isTitleDragging = true
  titleDragStartX = e.clientX
  titleDragStartY = e.clientY
  document.addEventListener('mousemove', onTitleDrag)
  document.addEventListener('mouseup', stopTitleDrag)
}

const onTitleDrag = (e) => {
  if (!isTitleDragging || !positionPreviewRef.value) return
  
  const deltaX = e.clientX - titleDragStartX
  const deltaY = e.clientY - titleDragStartY
  
  const rect = positionPreviewRef.value.getBoundingClientRect()
  titleConfig.value.position_x = Math.max(0, Math.min(
    titleConfig.value.position_x + deltaX,
    rect.width
  ))
  titleConfig.value.position_y = Math.max(0, Math.min(
    titleConfig.value.position_y + deltaY,
    rect.height
  ))
  
  titleDragStartX = e.clientX
  titleDragStartY = e.clientY
}

const stopTitleDrag = () => {
  isTitleDragging = false
  document.removeEventListener('mousemove', onTitleDrag)
  document.removeEventListener('mouseup', stopTitleDrag)
}

const resetTitlePosition = () => {
  if (positionPreviewRef.value) {
    const rect = positionPreviewRef.value.getBoundingClientRect()
    titleConfig.value.position_x = rect.width / 2
    titleConfig.value.position_y = rect.height / 2
  }
}

// 删除函数已从 useCoverList composable 中导入

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 合并标题配置到表单数据
    const submitData = {
      ...formData.value,
      title_text: titleConfig.value.text,
      title_font: titleConfig.value.font,
      title_font_size: titleConfig.value.font_size,
      title_color: titleConfig.value.color,
      title_position_x: titleConfig.value.position_x,
      title_position_y: titleConfig.value.position_y,
      title_bold: titleConfig.value.bold,
      title_italic: titleConfig.value.italic
    }
    
    if (isEdit.value) {
      await updateCover(formData.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createCover(submitData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    currentStep.value = 0
    loadCovers() // 从 composable 导入
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetCropState()
}

// 文件选择
const handleFileChange = (file) => {
  // 验证文件大小（10MB）
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过10MB')
    return
  }
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.raw.type)) {
    ElMessage.error('只支持JPG、PNG格式的图片')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
    formData.value.cropped_image_path = '' // 清空URL，等待裁剪上传
    showCropBox.value = false
  }
  reader.readAsDataURL(file.raw)
}

// 显示裁剪对话框（重新裁剪）
const showCropDialog = () => {
  if (formData.value.cropped_image_path) {
    // 如果是相对路径，转换为完整URL
    imageUrl.value = getImageUrl(formData.value.cropped_image_path)
    showCropBox.value = false
    nextTick(() => {
      initCropper()
    })
  }
}

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return ''
  // 如果是相对路径，添加完整URL
  if (url.startsWith('/data/')) {
    return `http://localhost:5001${url}`
  }
  return url
}

// 初始化裁剪框
const initCropper = () => {
  showCropBox.value = true
  nextTick(() => {
    if (imageRef.value) {
      // 等待图片完全加载
      if (imageRef.value.complete) {
        setupCropBox()
      } else {
        imageRef.value.onload = setupCropBox
      }
    }
  })
}

// 设置裁剪框
const setupCropBox = () => {
  if (!imageRef.value) return
  
  const imgRect = imageRef.value.getBoundingClientRect()
  const containerRect = imageRef.value.parentElement.getBoundingClientRect()
  imageContainerRect = {
    left: containerRect.left,
    top: containerRect.top,
    width: containerRect.width,
    height: containerRect.height
  }
  
  // 计算裁剪框初始位置（居中）
  const centerX = imgRect.width / 2
  const centerY = imgRect.height / 2
  
  // 确保裁剪框不超出图片范围，保持9:16比例
  const maxWidth = Math.min(cropBoxWidth, imgRect.width)
  const maxHeight = maxWidth / cropAspectRatio
  const finalHeight = Math.min(maxHeight, imgRect.height)
  const finalWidth = finalHeight * cropAspectRatio
  
  cropBoxStyle.value = {
    left: `${centerX}px`,
    top: `${centerY}px`,
    width: `${finalWidth}px`,
    height: `${finalHeight}px`,
    transform: 'translate(-50%, -50%)'
  }
}

// 开始拖拽
const startDrag = (e) => {
  if (e.target.classList.contains('crop-handle')) {
    // 缩放逻辑（保持9:16比例）
    e.preventDefault()
    e.stopPropagation()
    // 缩放功能可以后续完善，这里先只支持拖动
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

// 拖拽移动
const onDrag = (e) => {
  if (!isDragging || !imageRef.value || !imageContainerRect || !cropBoxRef.value) return
  
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  const imgRect = imageRef.value.getBoundingClientRect()
  const boxRect = cropBoxRef.value.getBoundingClientRect()
  const boxWidth = boxRect.width
  const boxHeight = boxRect.height
  
  // 计算新位置（相对于图片容器）
  let newLeft = cropBoxLeft + deltaX - imageContainerRect.left
  let newTop = cropBoxTop + deltaY - imageContainerRect.top
  
  // 转换为相对于图片的位置
  const relativeLeft = newLeft - (imgRect.left - imageContainerRect.left)
  const relativeTop = newTop - (imgRect.top - imageContainerRect.top)
  
  // 限制在图片范围内
  const finalLeft = Math.max(0, Math.min(relativeLeft, imgRect.width - boxWidth))
  const finalTop = Math.max(0, Math.min(relativeTop, imgRect.height - boxHeight))
  
  // 更新裁剪框位置（使用相对于图片的位置）
  cropBoxStyle.value = {
    ...cropBoxStyle.value,
    left: `${finalLeft + boxWidth / 2}px`,
    top: `${finalTop + boxHeight / 2}px`
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

// 重置裁剪状态
const resetCropState = () => {
  imageUrl.value = ''
  showCropBox.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 裁剪并上传
const cropAndUpload = async () => {
  if (!imageRef.value || !cropBoxRef.value) return
  
  uploading.value = true
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 9:16 比例的输出尺寸（可以根据需要调整）
    const outputWidth = 540
    const outputHeight = 960
    
    canvas.width = outputWidth
    canvas.height = outputHeight
    
    const img = imageRef.value
    const imgRect = img.getBoundingClientRect()
    const boxRect = cropBoxRef.value.getBoundingClientRect()
    
    // 计算裁剪区域（相对于图片的位置）
    const sourceX = boxRect.left - imgRect.left
    const sourceY = boxRect.top - imgRect.top
    const sourceWidth = boxRect.width
    const sourceHeight = boxRect.height
    
    // 获取图片原始尺寸
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    const scaleX = imgNaturalWidth / imgRect.width
    const scaleY = imgNaturalHeight / imgRect.height
    
    // 确保裁剪区域在图片范围内
    const clampedSourceX = Math.max(0, Math.min(sourceX, imgRect.width - sourceWidth))
    const clampedSourceY = Math.max(0, Math.min(sourceY, imgRect.height - sourceHeight))
    const clampedSourceWidth = Math.min(sourceWidth, imgRect.width - clampedSourceX)
    const clampedSourceHeight = Math.min(sourceHeight, imgRect.height - clampedSourceY)
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      clampedSourceX * scaleX,
      clampedSourceY * scaleY,
      clampedSourceWidth * scaleX,
      clampedSourceHeight * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    )
    
    // 转换为blob
    canvas.toBlob(async (blob) => {
      try {
        const uploadFormData = new FormData()
        uploadFormData.append('cover', blob, 'cover.jpg')
        
        const response = await uploadCoverImage(uploadFormData)
        formData.value.cropped_image_path = response.data.image_url
        formData.value.original_image_path = formData.value.original_image_path || response.data.image_url
        croppedPreviewUrl.value = getImageUrl(response.data.image_url)
        ElMessage.success('图片裁剪并上传成功')
        
        // 清空裁剪状态
        resetCropState()
      } catch (error) {
        console.error('上传错误:', error)
        ElMessage.error('图片上传失败')
      }
    }, 'image/jpeg', 0.9)
  } catch (error) {
    console.error('裁剪错误:', error)
    ElMessage.error('图片裁剪失败')
  } finally {
    uploading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U0ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
}

onMounted(() => {
  loadCovers()
})
</script>

<style scoped>
.cover-management {
  height: 100%;
}

.page-card {
  min-height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.add-button {
  margin-left: auto;
}

.search-bar {
  margin-bottom: 20px;
}

.cover-list {
  min-height: 400px;
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.cover-card {
  transition: transform 0.3s;
  cursor: pointer;
}

.cover-card:hover {
  transform: translateY(-5px);
}

.cover-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin-bottom: 10px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-info {
  margin-bottom: 10px;
}

.cover-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-meta {
  font-size: 12px;
  color: #909399;
}

/* 简单样式已迁移到 UnoCSS，复杂样式使用 @apply */

/* 复杂样式保留，简单样式已迁移到 UnoCSS */
.cover-upload {
  @apply w-full;
}

.crop-container {
  @apply mt-20px;
}

.crop-wrapper {
  @apply relative flex-center border border-[#dcdfe6] rounded-4px overflow-hidden bg-[#f5f7fa] min-h-400px max-h-600px;
}

.crop-image {
  @apply max-w-full max-h-600px block;
}

.crop-box {
  @apply absolute border-2 border-[#409EFF] cursor-move box-border;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.crop-handle {
  @apply absolute w-12px h-12px bg-[#409EFF] border-2 border-white rounded-full z-10;
}

.crop-handle-nw {
  @apply -top-6px -left-6px;
  cursor: nw-resize;
}

.crop-handle-ne {
  @apply -top-6px -right-6px;
  cursor: ne-resize;
}

.crop-handle-sw {
  @apply -bottom-6px -left-6px;
  cursor: sw-resize;
}

.crop-handle-se {
  @apply -bottom-6px -right-6px;
  cursor: se-resize;
}

.crop-controls {
  @apply mt-20px text-right;
}

.crop-controls .el-button {
  @apply ml-10px;
}

.image-preview {
  @apply mt-10px w-full h-200px rounded-4px overflow-hidden bg-[#f5f7fa] relative;
}

.image-preview img {
  @apply w-full h-full object-cover;
}

.image-preview-actions {
  @apply absolute top-10px right-10px;
}
</style>

