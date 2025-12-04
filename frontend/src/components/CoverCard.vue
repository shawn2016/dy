<template>
  <el-card
    class="transition-transform duration-300 cursor-pointer hover:translate-y--5px"
    :body-style="{ padding: '10px' }"
    shadow="hover"
  >
    <div class="w-full h-200px overflow-hidden rounded-4px bg-[#f5f7fa] mb-10px relative" @click="$emit('preview', cover)">
      <img 
        :src="imageUrl" 
        :alt="cover.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-if="cover.video_path" class="absolute top-10px right-10px bg-black/60 text-white px-10px py-5px rounded-4px text-12px">
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
/* 样式已迁移到 UnoCSS */
</style>


