<template>
  <div class="cover-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="page-title">封面管理</span>
          <el-button 
            type="primary" 
            :icon="Plus" 
            @click="handleAdd"
            class="add-button"
          >
            新增
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索封面名称"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          style="width: 300px"
        />
      </div>

      <!-- 封面列表 -->
      <div class="cover-list" v-loading="loading">
        <el-empty v-if="filteredCovers.length === 0 && !loading" description="暂无封面数据" />
        <div v-else class="cover-grid">
          <el-card
            v-for="cover in filteredCovers"
            :key="cover.id"
            class="cover-card"
            :body-style="{ padding: '10px' }"
            shadow="hover"
          >
            <div class="cover-image-wrapper">
              <img 
                :src="cover.image_url || '/placeholder.png'" 
                :alt="cover.name"
                class="cover-image"
                @error="handleImageError"
              />
            </div>
            <div class="cover-info">
              <div class="cover-name">{{ cover.name }}</div>
              <div class="cover-meta">
                <span class="cover-date">{{ formatDate(cover.created_at) }}</span>
              </div>
            </div>
            <div class="cover-actions">
              <el-button 
                type="primary" 
                :icon="Edit" 
                size="small"
                @click="handleEdit(cover)"
              >
                编辑
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
        <el-form-item label="封面名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入封面名称" />
        </el-form-item>
        <el-form-item label="封面图片" prop="image_url">
          <el-input v-model="formData.image_url" placeholder="请输入图片URL" />
          <div v-if="formData.image_url" class="image-preview">
            <img :src="formData.image_url" alt="预览" @error="handleImageError" />
          </div>
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
import { getCovers, createCover, updateCover, deleteCover } from '@/api/cover'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const covers = ref([])

const formData = ref({
  id: null,
  name: '',
  image_url: '',
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入封面名称', trigger: 'blur' }
  ],
  image_url: [
    { required: true, message: '请输入图片URL', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑封面' : '新增封面'
})

const filteredCovers = computed(() => {
  if (!searchKeyword.value) {
    return covers.value
  }
  return covers.value.filter(cover => 
    cover.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载封面列表
const loadCovers = async () => {
  loading.value = true
  try {
    const response = await getCovers()
    covers.value = response.data || []
  } catch (error) {
    ElMessage.error('加载封面列表失败')
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
    image_url: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (cover) => {
  isEdit.value = true
  formData.value = {
    id: cover.id,
    name: cover.name,
    image_url: cover.image_url,
    description: cover.description || ''
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (cover) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除封面"${cover.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCover(cover.id)
    ElMessage.success('删除成功')
    loadCovers()
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
      await updateCover(formData.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createCover(formData.value)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadCovers()
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

.cover-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.image-preview {
  margin-top: 10px;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

