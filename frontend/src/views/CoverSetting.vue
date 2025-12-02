<template>
  <!-- 外层容器（全屏高度） -->
  <el-container class="cover-setting-container">
    <!-- 顶部标题栏 -->
    <el-header class="header-section" height="60px">
      <div class="header-content">
        <div class="header-left">
          <el-button :icon="ArrowLeft" text @click="handleBack">返回</el-button>
          <span class="page-title">设置竖封面</span>
        </div>
        <div class="header-right">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleComplete">完成</el-button>
        </div>
      </div>
    </el-header>
    
    <el-container class="content-container">
    <!-- 左侧：导航+模板区 -->
    <el-aside width="280px" class="left-aside">
      <el-row class="left-content" :gutter="0">
        <!-- 左侧导航栏（窄栏） -->
        <el-col :span="6" class="nav-section">
          <div class="nav-item active">
            <el-icon><House /></el-icon>
            <span>模板</span>
          </div>
          <div class="nav-item">
            <el-icon><Clock /></el-icon>
            <span>贴纸</span>
          </div>
          <div class="nav-item">
            <el-icon><Document /></el-icon>
            <span>标题</span>
          </div>
          <div class="nav-item">
            <el-icon><Edit /></el-icon>
            <span>文字</span>
          </div>
          <div class="nav-item">
            <el-icon><Picture /></el-icon>
            <span>滤镜</span>
          </div>
        </el-col>
        
        <!-- 模板选择区（占位） -->
        <el-col :span="18" class="template-section">
          <!-- 模板分类标签 -->
          <div class="template-categories">
            <span class="category-tag active">用过</span>
            <span class="category-tag active">热门</span>
            <span class="category-tag">新春</span>
            <span class="category-tag">旅行</span>
            <span class="category-tag">游戏</span>
            <span class="category-tag">随拍</span>
            <span class="category-tag">美食</span>
            <span class="category-tag">影视</span>
            <span class="category-tag">亲子</span>
            <span class="category-tag">时尚</span>
            <span class="category-tag">萌宠</span>
            <span class="category-tag">知识</span>
          </div>
          
          <!-- 模板卡片网格 -->
          <div class="template-grid">
            <div class="template-card" v-for="i in 12" :key="i">
              <div class="template-thumbnail">
                模板{{ i }}
              </div>
              <div class="template-title">模板标题{{ i }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-aside>

      <!-- 中间+底部容器 -->
      <el-container class="main-container">
      <!-- 中间：裁剪+操作区 -->
      <el-main class="main-content">
        <!-- 新增：入口按钮区 -->
        <el-row style="margin-bottom: 10px;">
          <el-col :span="12">
            <el-button type="primary" :icon="VideoCamera" @click="openVideoImport">导入视频</el-button>
            <input
              ref="videoInput"
              type="file"
              accept="video/mp4,video/mov"
              style="display: none;"
              @change="handleVideoImport"
            >
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-button type="default" :icon="Picture" @click="openImageImport">选择本地图片</el-button>
            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png"
              style="display: none;"
              @change="handleImageImport"
            >
          </el-col>
        </el-row>
        
        <!-- 裁剪预览区（同步关键帧） -->
        <el-row>
          <el-col :span="24" class="crop-area">
            <div class="crop-preview" v-if="selectedKeyframe">
              <img
                :src="selectedKeyframe"
                style="max-width: 100%; max-height: 100%; object-fit: contain;"
              >
            </div>
            <div class="crop-placeholder" v-else>
              <el-icon :size="48"><Picture /></el-icon>
              <p>裁剪操作区（选中关键帧/图片后预览）</p>
            </div>
          </el-col>
          
          <!-- 操作区 -->
          <el-col :span="24" class="toolbar-area">
            <div class="toolbar-content">
              <el-button :icon="Star" text size="small">增强</el-button>
              <el-button :icon="View" text size="small">对比</el-button>
              <el-divider direction="vertical" />
              <div class="zoom-controls">
                <span style="font-size: 13px; margin-right: 8px;">缩放</span>
                <el-icon class="zoom-icon"><ZoomOut /></el-icon>
                <el-slider 
                  v-model="scaleValue" 
                  :min="50" 
                  :max="200" 
                  :step="10"
                  :show-tooltip="false"
                  class="zoom-slider"
                  style="width: 100px;"
                />
                <el-icon class="zoom-icon"><ZoomIn /></el-icon>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>

      <!-- 底部：关键帧栏 -->
      <el-footer class="footer-section">
        <el-row class="footer-content">
          <!-- 关键帧横向滚动区 -->
          <el-col :span="20" class="keyframe-section">
            <div class="keyframe-scroll">
              <div
                v-for="(frame, index) in keyframes"
                :key="index"
                class="keyframe-item"
                :class="{ 'keyframe-selected': selectedFrameIndex === index }"
                @click="selectKeyframe(index)"
              >
                <img :src="frame" class="keyframe-thumbnail" />
              </div>
              <div v-if="keyframes.length === 0" class="keyframe-empty">
                导入视频后将显示关键帧
              </div>
            </div>
          </el-col>
          
          <!-- 推荐按钮+上传按钮区 -->
          <el-col :span="4" class="upload-section">
            <div class="recommend-buttons">
              <el-button 
                type="default" 
                size="small" 
                @click="selectKeyframe(0)"
                :disabled="keyframes.length === 0"
              >
                推荐1
              </el-button>
              <el-button 
                type="default" 
                size="small" 
                @click="selectKeyframe(5)"
                :disabled="keyframes.length === 0"
              >
                推荐2
              </el-button>
              <el-button 
                type="default" 
                size="small" 
                @click="selectKeyframe(10)"
                :disabled="keyframes.length === 0"
              >
                推荐3
              </el-button>
              <el-button type="primary" :icon="Plus" style="margin-top: 10px;">
                上传封面
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>

      <!-- 右侧：预览区 -->
      <el-aside width="200px" class="right-aside">
      <div class="preview-header">
        <span>竖封面预览(3:4)</span>
      </div>
      <div class="preview-container">
        <div class="preview-placeholder">
          <div class="preview-content">
            <el-icon :size="32"><Picture /></el-icon>
            <p>竖封面预览区（3:4 - 占位）</p>
          </div>
        </div>
      </div>
    </el-aside>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElContainer, 
  ElAside, 
  ElMain, 
  ElFooter,
  ElHeader,
  ElRow, 
  ElCol, 
  ElButton,
  ElIcon,
  ElDivider,
  ElSlider
} from 'element-plus'
import {
  House,
  Clock,
  Document,
  Edit,
  Picture,
  Star,
  View,
  ZoomOut,
  ZoomIn,
  Search,
  Plus,
  ArrowLeft,
  VideoCamera
} from '@element-plus/icons-vue'

const router = useRouter()

// 视频/关键帧相关变量
const videoInput = ref(null)
const imageInput = ref(null)
const keyframes = ref([]) // 11个关键帧的图片地址
const selectedKeyframe = ref('') // 当前选中的关键帧
const selectedFrameIndex = ref(-1) // 当前选中的关键帧索引
const scaleValue = ref(100) // 缩放值（百分比）

// 返回
const handleBack = () => {
  router.back()
}

// 取消
const handleCancel = () => {
  router.back()
}

// 完成
const handleComplete = () => {
  // TODO: 保存封面数据
  console.log('完成封面设置')
  router.push('/cover-management')
}

// 打开视频导入选择框
const openVideoImport = () => {
  videoInput.value?.click()
}

// 处理视频导入，生成11个关键帧
const handleVideoImport = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    // 1. 加载视频
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.currentTime = 0
        resolve()
      }
      video.onerror = reject
    })

    // 2. 生成11个关键帧（均匀分布在视频时长）
    const frameCount = 11
    const duration = video.duration
    keyframes.value = []

    for (let i = 0; i < frameCount; i++) {
      const time = (i * duration) / (frameCount - 1)
      video.currentTime = time

      await new Promise((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve()
        }
        video.addEventListener('seeked', onSeeked)
      })

      // 3. 用canvas截取帧
      const canvas = document.createElement('canvas')
      const width = 200 // 关键帧缩略图宽度
      const height = (video.videoHeight / video.videoWidth) * width
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, width, height)

      // 4. 转成图片地址存入关键帧列表
      keyframes.value.push(canvas.toDataURL('image/jpeg', 0.8))
    }

    // 5. 默认选中第1个关键帧
    selectKeyframe(0)

    // 清理视频URL
    URL.revokeObjectURL(video.src)
  } catch (error) {
    console.error('视频处理失败:', error)
    alert('视频处理失败，请检查视频格式')
  }

  // 清空input，允许重复选择同一文件
  e.target.value = ''
}

// 选择关键帧（同步到裁剪区预览）
const selectKeyframe = (index) => {
  if (index < 0 || index >= keyframes.value.length) return
  selectedFrameIndex.value = index
  selectedKeyframe.value = keyframes.value[index]
}

// 打开图片导入选择框
const openImageImport = () => {
  imageInput.value?.click()
}

// 处理图片导入（占位，仅预览）
const handleImageImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 直接预览图片（后续补充裁剪逻辑）
  selectedKeyframe.value = URL.createObjectURL(file)
  keyframes.value = [] // 清空关键帧（图片和视频二选一）
  selectedFrameIndex.value = -1

  e.target.value = ''
}
</script>

<style scoped>
.cover-setting-container {
  height: 100vh;
  border: 1px solid #eee;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏 */
.header-section {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.content-container {
  flex: 1;
  overflow: hidden;
  display: flex;
}

/* 左侧区域 */
.left-aside {
  background-color: #f8f9fa;
  padding: 0;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.left-content {
  height: 100%;
  display: flex;
  flex-direction: row;
}

.nav-section {
  height: 100%;
  padding: 8px 4px;
  border-right: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  font-size: 12px;
}

.nav-item .el-icon {
  font-size: 20px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.template-section {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  background-color: #f8f9fa;
}

.template-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.category-tag {
  padding: 4px 12px;
  border-radius: 12px;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover {
  background-color: #e4e7ed;
}

.category-tag.active {
  background-color: #409eff;
  color: #fff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-2px);
}

.template-thumbnail {
  width: 100%;
  padding-top: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}

.template-thumbnail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
}

.template-title {
  font-size: 12px;
  color: #606266;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  padding: 20px 20px 0 20px;
  background-color: #fff;
  flex: 1;
  overflow: auto;
}

.crop-area {
  height: 500px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #fafafa;
  position: relative;
  overflow: hidden;
}

.crop-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.crop-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.crop-placeholder p {
  margin-top: 12px;
  font-size: 14px;
}

.toolbar-area {
  height: 40px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #fafafa;
  margin-bottom: 0;
}

.toolbar-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  padding: 0 12px;
}

.toolbar-content .el-button {
  padding: 4px 8px;
  font-size: 13px;
}

.toolbar-content .el-divider--vertical {
  margin: 0 4px;
  height: 20px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.zoom-icon {
  font-size: 16px;
  color: #606266;
  cursor: pointer;
}

.zoom-icon:hover {
  color: #409eff;
}

.zoom-slider {
  flex: 1;
  margin: 0;
}

.zoom-slider :deep(.el-slider__runway) {
  margin: 0;
  height: 4px;
}

.zoom-slider :deep(.el-slider__button) {
  width: 12px;
  height: 12px;
}

.zoom-reset {
  margin-left: 4px;
}

/* 底部关键帧栏 */
.footer-section {
  height: 120px;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #ddd;
}

.footer-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.keyframe-section {
  height: 100%;
  padding-right: 16px;
}

.keyframe-scroll {
  height: 100%;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  align-items: center;
  padding: 5px 0;
}

.keyframe-scroll::-webkit-scrollbar {
  height: 6px;
}

.keyframe-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.keyframe-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.keyframe-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.keyframe-item {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.keyframe-item:hover {
  transform: scale(1.02);
  border-color: #409eff;
}

.keyframe-item.keyframe-selected {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.keyframe-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.keyframe-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;
  font-size: 14px;
}

.recommend-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f56c6c;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
}

.upload-section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommend-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
}

/* 右侧预览区 */
.right-aside {
  background-color: #f8f9fa;
  padding: 10px;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  width: 100%;
  padding-top: 133.33%; /* 3:4比例 */
  border: 1px dashed #ccc;
  border-radius: 4px;
  position: relative;
  background-color: #fff;
}

.preview-placeholder > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.preview-placeholder p {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  padding: 0 8px;
}

/* 滚动条样式 */
.template-section::-webkit-scrollbar,
.keyframe-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.template-section::-webkit-scrollbar-track,
.keyframe-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.template-section::-webkit-scrollbar-thumb,
.keyframe-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.template-section::-webkit-scrollbar-thumb:hover,
.keyframe-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

