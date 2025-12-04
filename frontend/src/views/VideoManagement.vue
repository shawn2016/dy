<template>
  <div class="h-full">
    <el-card class="min-h-[calc(100vh-120px)]">
      <template #header>
        <div class="flex-between items-center">
          <span class="text-20px font-semibold text-[#303133]">视频管理</span>
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

      <!-- 搜索栏 -->
      <div class="mb-20px">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索视频名称"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          style="width: 300px"
        />
      </div>

      <!-- 视频列表 -->
      <div class="min-h-400px" v-loading="loading">
        <el-empty v-if="filteredVideos.length === 0 && !loading" description="暂无视频数据" />
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-20px">
          <el-card
            v-for="video in filteredVideos"
            :key="video.id"
            class="transition-transform duration-300 cursor-pointer hover:translate-y--5px"
            :body-style="{ padding: '10px' }"
            shadow="hover"
          >
            <div class="w-full h-200px overflow-hidden rounded-4px bg-[#f5f7fa] mb-10px relative">
              <img 
                :src="video.thumbnail_url || '/placeholder.png'" 
                :alt="video.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div class="absolute bottom-5px right-5px bg-black/70 text-white px-6px py-2px rounded-2px text-12px" v-if="video.duration">
                {{ formatDuration(video.duration) }}
              </div>
            </div>
            <div class="mb-10px">
              <div class="text-16px font-medium text-[#303133] mb-5px overflow-hidden text-ellipsis whitespace-nowrap">{{ video.name }}</div>
              <div class="text-12px text-[#909399]">
                <span class="video-date">{{ formatDate(video.created_at) }}</span>
              </div>
            </div>
            <div class="flex gap-10px justify-end">
              <el-button 
                type="primary" 
                :icon="Edit" 
                size="small"
                @click="handleEdit(video)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                :icon="Delete" 
                size="small"
                @click="handleDelete(video)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="视频名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入视频名称" />
        </el-form-item>
        <el-form-item label="视频URL" prop="video_url">
          <el-input v-model="formData.video_url" placeholder="请输入视频URL" />
        </el-form-item>
        <el-form-item label="封面图" prop="thumbnail_url">
          <el-input v-model="formData.thumbnail_url" placeholder="请输入封面图URL" />
          <div v-if="formData.thumbnail_url" class="mt-10px w-full h-200px rounded-4px overflow-hidden bg-[#f5f7fa]">
            <img :src="formData.thumbnail_url" alt="预览" class="w-full h-full object-cover" @error="handleImageError" />
          </div>
        </el-form-item>
        <el-form-item label="时长(秒)" prop="duration">
          <el-input-number 
            v-model="formData.duration" 
            :min="0" 
            placeholder="请输入视频时长（秒）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { getVideos, createVideo, updateVideo, deleteVideo } from '@/api/video'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const videos = ref([])

const formData = ref({
  id: null,
  name: '',
  video_url: '',
  thumbnail_url: '',
  duration: 0,
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入视频名称', trigger: 'blur' }
  ],
  video_url: [
    { required: true, message: '请输入视频URL', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑视频' : '新增视频'
})

const filteredVideos = computed(() => {
  if (!searchKeyword.value) {
    return videos.value
  }
  return videos.value.filter(video => 
    video.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载视频列表
const loadVideos = async () => {
  loading.value = true
  try {
    const response = await getVideos()
    videos.value = response.data || []
  } catch (error) {
    ElMessage.error('加载视频列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    id: null,
    name: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (video) => {
  isEdit.value = true
  formData.value = {
    id: video.id,
    name: video.name,
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url || '',
    duration: video.duration || 0,
    description: video.description || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (video) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除视频"${video.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteVideo(video.id)
    ElMessage.success('删除成功')
    loadVideos()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      await updateVideo(formData.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createVideo(formData.value)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadVideos()
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

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U0ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
}

onMounted(() => {
  loadVideos()
})
</script>

<style scoped>
/* 样式已迁移到 UnoCSS */
</style>


