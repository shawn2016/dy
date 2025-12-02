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
        <el-row>
          <!-- 裁剪区域（占位） -->
          <el-col :span="24" class="crop-area">
            <div class="crop-placeholder">
              <el-icon :size="48"><Picture /></el-icon>
              <p>裁剪操作区（图片/视频帧裁剪 - 占位）</p>
            </div>
          </el-col>
          
          <!-- 操作按钮栏（占位） -->
          <el-col :span="24" class="toolbar-area">
            <div class="toolbar-content">
              <el-button :icon="Star" text size="small">增强</el-button>
              <el-button :icon="View" text size="small">对比</el-button>
              <el-divider direction="vertical" />
              <div class="zoom-controls">
                <el-icon class="zoom-icon"><ZoomOut /></el-icon>
                <el-slider 
                  v-model="zoomValue" 
                  :min="10" 
                  :max="200" 
                  :step="10"
                  :show-tooltip="false"
                  class="zoom-slider"
                />
                <el-icon class="zoom-icon"><ZoomIn /></el-icon>
                <el-button :icon="Search" text size="small" class="zoom-reset">1:1</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>

      <!-- 底部：关键帧栏 -->
      <el-footer class="footer-section">
        <el-row class="footer-content">
          <!-- 关键帧预览条（占位） -->
          <el-col :span="20" class="keyframe-section">
            <div class="keyframe-scroll">
              <div class="keyframe-item" v-for="i in 10" :key="i">
                <div class="keyframe-thumbnail">帧{{ i }}</div>
                <span v-if="i === 3" class="recommend-badge">推荐</span>
              </div>
            </div>
          </el-col>
          
          <!-- 上传封面按钮（占位） -->
          <el-col :span="4" class="upload-section">
            <el-button type="primary" :icon="Plus" size="large">
              上传封面
            </el-button>
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
  ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()

// 缩放值
const zoomValue = ref(100)

// 静态选中标签（无交互，仅展示）
const activeTab = ref('recommend')

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
  height: 80px;
  padding: 4px 20px;
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
}

.keyframe-item {
  position: relative;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
}

.keyframe-thumbnail {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.keyframe-thumbnail:hover {
  border-color: #409eff;
  transform: scale(1.05);
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

