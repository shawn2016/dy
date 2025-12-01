<template>
  <el-card
    class="cover-card"
    :body-style="{ padding: '10px' }"
    shadow="hover"
  >
    <div class="cover-image-wrapper" @click="$emit('preview', cover)">
      <img 
        :src="imageUrl" 
        :alt="cover.name"
        class="cover-image"
        @error="handleImageError"
      />
      <div v-if="cover.video_path" class="video-badge">
        <el-icon><VideoPlay /></el-icon>
      </div>
    </div>
    <div class="cover-info">
      <div class="cover-name">{{ cover.name }}</div>
      <div class="cover-meta">
        <span class="cover-date">{{ formatDate(cover.created_at) }}</span>
        <el-tag :type="cover.status === 1 ? 'success' : 'info'" size="small" style="margin-left: 8px">
          {{ cover.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </div>
    </div>
    <div class="cover-actions">
      <el-button 
        type="primary" 
        :icon="Edit" 
        size="small"
        @click="$emit('edit', cover)"
      >
        编辑
      </el-button>
      <el-button 
        type="info" 
        :icon="VideoPlay" 
        size="small"
        @click="$emit('preview', cover)"
        v-if="cover.video_path"
      >
        预览
      </el-button>
      <el-button 
        type="danger" 
        :icon="Delete" 
        size="small"
        @click="$emit('delete', cover)"
      >
        删除
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Delete, VideoPlay } from '@element-plus/icons-vue'
import { getImageUrl, handleImageError } from '@/utils/imageUtils'
import { formatDate } from '@/utils/dateUtils'

const props = defineProps({
  cover: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'preview'])

const imageUrl = computed(() => {
  return getImageUrl(props.cover.cropped_image_path || props.cover.image_url)
})
</script>

<style scoped>
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
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
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
</style>

