# 前端重构指南

## 重构进度

### ✅ 已完成
1. 安装 UnoCSS 和相关依赖
2. 配置 UnoCSS 和 Vite
3. 创建核心 Composables:
   - `useVideo.ts` - 视频处理
   - `useImageCrop.ts` - 图片裁剪
   - `useCoverPreview.ts` - 预览生成

### 🔄 进行中
1. 拆分 CoverSetting.vue 为多个组件
2. 迁移样式到 UnoCSS

### 📋 待完成
1. 创建组件文件
2. 更新 CoverSetting.vue 使用新组件
3. 测试所有功能

## 组件拆分计划

### 1. CoverHeader.vue
**位置**: `src/components/cover/CoverHeader.vue`
**职责**: 顶部标题栏
**Props**:
- `title?: string` - 页面标题
**Events**:
- `back` - 返回事件
- `cancel` - 取消事件
- `complete` - 完成事件

### 2. CoverSidebar.vue
**位置**: `src/components/cover/CoverSidebar.vue`
**职责**: 左侧导航和模板区
**Props**:
- `activeNav?: string` - 当前激活的导航项
- `activeCategory?: string` - 当前激活的分类
**Events**:
- `nav-change` - 导航切换事件
- `category-change` - 分类切换事件
- `template-select` - 模板选择事件

### 3. CoverCropArea.vue
**位置**: `src/components/cover/CoverCropArea.vue`
**职责**: 中间裁剪区域
**Props**:
- `selectedKeyframe?: string` - 当前选中的关键帧
- `coverRatio: 'vertical' | 'horizontal'` - 封面比例
- `cropBoxStyle: CropBoxStyle` - 裁剪框样式
- `imageStyle: ImageStyle` - 图片样式
- `cropResolution: string` - 裁剪分辨率
**Events**:
- `video-import` - 视频导入事件
- `image-import` - 图片导入事件
- `ratio-change` - 比例切换事件
- `image-drag-start` - 图片拖动开始
- `image-drag-move` - 图片拖动中
- `image-drag-end` - 图片拖动结束
- `image-load` - 图片加载完成

### 4. CoverToolbar.vue
**位置**: `src/components/cover/CoverToolbar.vue`
**职责**: 操作工具栏
**Props**:
- `scaleValue: number` - 缩放值
**Events**:
- `enhance` - 增强事件
- `compare` - 对比事件
- `scale-change` - 缩放改变事件
- `reset` - 重置事件

### 5. CoverKeyframes.vue
**位置**: `src/components/cover/CoverKeyframes.vue`
**职责**: 底部关键帧区域
**Props**:
- `keyframes: string[]` - 关键帧列表
- `selectedIndex: number` - 当前选中的索引
- `currentProgress: number` - 当前进度
**Events**:
- `keyframe-select` - 关键帧选择事件
- `progress-drag` - 进度拖动事件
- `recommend-click` - 推荐按钮点击事件
- `upload-cover` - 上传封面事件

### 6. CoverPreview.vue
**位置**: `src/components/cover/CoverPreview.vue`
**职责**: 右侧预览区
**Props**:
- `coverRatio: 'vertical' | 'horizontal'` - 封面比例
- `croppedPreviewImage?: string` - 当前裁剪的预览图
- `previewImages: string[]` - 其他预览图列表
**Events**: 无

## 使用示例

### CoverSetting.vue 重构后

```vue
<template>
  <el-container class="cover-setting-container">
    <CoverHeader
      title="设置竖封面"
      @back="handleBack"
      @cancel="handleCancel"
      @complete="handleComplete"
    />
    
    <el-container class="content-container">
      <CoverSidebar
        :active-nav="activeNav"
        :active-category="activeCategory"
        @nav-change="handleNavChange"
        @category-change="handleCategoryChange"
        @template-select="handleTemplateSelect"
      />
      
      <el-container class="main-container">
        <el-main class="main-content">
          <CoverCropArea
            :selected-keyframe="selectedKeyframe"
            :cover-ratio="coverRatio"
            :crop-box-style="cropBoxStyle"
            :image-style="imageStyle"
            :crop-resolution="cropResolution"
            @video-import="handleVideoImport"
            @image-import="handleImageImport"
            @ratio-change="setCoverRatio"
            @image-drag-start="startImageDrag"
            @image-drag-move="onImageDragMove"
            @image-drag-end="endImageDrag"
            @image-load="onImageLoad"
          />
          
          <CoverToolbar
            :scale-value="scaleValue"
            @enhance="handleEnhance"
            @compare="handleCompare"
            @scale-change="onScaleChange"
            @reset="resetImage"
          />
        </el-main>
        
        <el-footer class="footer-section">
          <CoverKeyframes
            :keyframes="keyframes"
            :selected-index="selectedFrameIndex"
            :current-progress="currentProgressPercent"
            @keyframe-select="selectKeyframe"
            @progress-drag="handleProgressDrag"
            @recommend-click="handleRecommendClick"
            @upload-cover="handleUploadCover"
          />
        </el-footer>
      </el-container>
      
      <CoverPreview
        :cover-ratio="coverRatio"
        :cropped-preview-image="croppedPreviewImage"
        :preview-images="previewImages"
      />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useVideo } from '@/composables/cover/useVideo'
import { useImageCrop } from '@/composables/cover/useImageCrop'
import { useCoverPreview } from '@/composables/cover/useCoverPreview'
import CoverHeader from '@/components/cover/CoverHeader.vue'
import CoverSidebar from '@/components/cover/CoverSidebar.vue'
import CoverCropArea from '@/components/cover/CoverCropArea.vue'
import CoverToolbar from '@/components/cover/CoverToolbar.vue'
import CoverKeyframes from '@/components/cover/CoverKeyframes.vue'
import CoverPreview from '@/components/cover/CoverPreview.vue'

// 使用 composables
const {
  videoRef,
  keyframes,
  selectedFrameIndex,
  currentProgressPercent,
  loadVideo,
  extractKeyframes,
  seekToTime,
  captureFrame,
} = useVideo()

const {
  coverRatio,
  scaleValue,
  cropBoxStyle,
  imageStyle,
  imageOffsetX,
  imageOffsetY,
  cropResolution,
  calculateCropBox,
  updateImageStyle,
  setCoverRatio,
  onScaleChange,
  startImageDrag,
  onImageDragMove,
  endImageDrag,
  resetImage,
} = useImageCrop()

const {
  croppedPreviewImage,
  previewImages,
  generateCroppedPreview,
  generatePreviewImages,
  updatePreview,
  clearPreviewUpdate,
} = useCoverPreview()

const selectedKeyframe = ref('')
const cropImage = ref<HTMLImageElement | null>(null)

// 处理视频导入
const handleVideoImport = async (file: File) => {
  const video = await loadVideo(file)
  await extractKeyframes(video, 11)
  selectKeyframe(0)
  generatePreviewImages(keyframes.value)
}

// 选择关键帧
const selectKeyframe = (index: number) => {
  selectedFrameIndex.value = index
  selectedKeyframe.value = keyframes.value[index]
  // 更新裁剪框
  nextTick(() => {
    if (cropImage.value?.complete) {
      updateCropBox()
    }
  })
}

// 更新裁剪框
const updateCropBox = () => {
  if (!cropImage.value) return
  const { imgDisplayWidth, imgDisplayHeight } = calculateCropBox(
    500,
    cropImage.value.naturalWidth,
    cropImage.value.naturalHeight,
  )
  // 更新预览
  updatePreview(() => {
    generateCroppedPreview(
      cropImage.value!,
      cropBoxStyle.value,
      imageStyle.value,
      imageOffsetX.value,
      imageOffsetY.value,
    )
  })
}

// 监听缩放变化
watch(scaleValue, () => {
  onScaleChange(() => {
    updateCropBox()
  })
})

// 监听图片拖动
watch([imageOffsetX, imageOffsetY], () => {
  updatePreview(
    () => {
      if (cropImage.value) {
        generateCroppedPreview(
          cropImage.value,
          cropBoxStyle.value,
          imageStyle.value,
          imageOffsetX.value,
          imageOffsetY.value,
        )
      }
    },
    true, // 使用 requestAnimationFrame
  )
})

// 图片加载完成
const onImageLoad = () => {
  updateCropBox()
}
</script>
```

## 样式迁移到 UnoCSS

### 示例：CoverHeader.vue

```vue
<template>
  <el-header class="h-60px border-b border-gray-200">
    <div class="flex-between h-full px-4">
      <div class="flex-center gap-4">
        <el-button text @click="$emit('back')">返回</el-button>
        <span class="text-lg font-medium">{{ title }}</span>
      </div>
      <div class="flex-center gap-2">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="$emit('complete')">完成</el-button>
      </div>
    </div>
  </el-header>
</template>
```

## 下一步操作

1. **创建组件文件** - 按照上述计划创建所有组件
2. **迁移代码** - 将 CoverSetting.vue 中的代码迁移到对应组件
3. **更新样式** - 使用 UnoCSS 类替代传统 CSS
4. **测试功能** - 确保所有功能正常工作
5. **优化性能** - 使用 `v-memo`、`shallowRef` 等优化

## 注意事项

1. **保持功能完整** - 确保所有原有功能都保留
2. **类型安全** - 使用 TypeScript 定义类型（可选）
3. **性能优化** - 使用 `requestAnimationFrame` 优化预览更新
4. **代码规范** - 遵循 Vue 3 最佳实践

