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
            <!-- 封面比例切换按钮组 -->
            <div style="display: inline-flex; align-items: center; margin-left: 8px; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden;">
              <el-button 
                :type="coverRatio === 'vertical' ? 'primary' : 'default'" 
                @click="setCoverRatio('vertical')"
                :plain="coverRatio !== 'vertical'"
                style="border: none; border-radius: 0;"
              >
                竖封面(3:4)
              </el-button>
              <el-divider direction="vertical" style="margin: 0; height: 20px;" />
              <el-button 
                :type="coverRatio === 'horizontal' ? 'primary' : 'default'" 
                @click="setCoverRatio('horizontal')"
                :plain="coverRatio !== 'horizontal'"
                style="border: none; border-radius: 0;"
              >
                横封面(4:3)
              </el-button>
            </div>
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
          <el-col :span="24" class="crop-area" @wheel="handleWheelZoom" @mouseenter="onCropAreaEnter" @mouseleave="onCropAreaLeave">
            <div class="crop-preview" v-if="selectedKeyframe">
              <img
                ref="cropImage"
                :src="selectedKeyframe"
                class="crop-image"
                :style="imageStyle"
                @load="onImageLoad"
                @mousedown="startImageDrag"
              >
              <!-- 裁剪框（颜色框，标识选中区域） -->
              <div
                v-if="selectedKeyframe"
                class="crop-box"
                :style="cropBoxStyle"
              >
                <!-- 分辨率显示 -->
                <div class="crop-resolution">
                  {{ cropResolution }}
                </div>
              </div>
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
                <el-icon class="zoom-icon" @click="zoomOut"><ZoomOut /></el-icon>
                <el-slider 
                  v-model="scaleValue" 
                  :min="0" 
                  :max="100" 
                  :step="10"
                  :show-tooltip="false"
                  class="zoom-slider"
                  style="width: 100px;"
                  @input="onScaleChange"
                />
                <el-icon class="zoom-icon" @click="zoomIn"><ZoomIn /></el-icon>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>

      <!-- 底部：关键帧栏 -->
      <el-footer class="footer-section">
        <!-- 关键帧选择区域 -->
        <div class="keyframe-select-area">
          <div class="keyframe-container">
            <!-- 11个关键帧（紧密排列） -->
            <div class="preview-frames">
              <div
                v-for="(frame, index) in keyframes"
                :key="index"
                class="preview-frame"
                :class="{ 'preview-frame-selected': selectedFrameIndex === index }"
                :style="{ backgroundImage: `url(${frame})` }"
                @click="selectKeyframe(index)"
              ></div>
              <div v-if="keyframes.length === 0" class="keyframe-empty">
                导入视频后将显示关键帧
              </div>
            </div>
            
            <!-- 滑块（可拖动，叠加在关键帧上方） -->
            <div
              v-if="keyframes.length > 0"
              ref="slider"
              class="slider"
              :style="{ 
                left: `${(dragPercent >= 0 ? dragPercent : currentProgressPercent) * 100}%`,
                display: isDragging || dragPercent >= 0 ? 'block' : 'none'
              }"
            >
              <!-- 滑块预览图片 -->
              <div
                v-if="dragPreviewFrame"
                class="slider-preview"
                :style="{ backgroundImage: `url(${dragPreviewFrame})` }"
              ></div>
              <!-- 滑块箭头指示器 -->
              <div class="slider-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="#797979" viewBox="0 0 6 6" style="transform: rotate(180deg);">
                  <path d="M6 3 1.636.402v5.196z"></path>
                </svg>
                <div class="slider-arrow-decorator"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="#797979" viewBox="0 0 6 6">
                  <path d="M6 3 1.636.402v5.196z"></path>
                </svg>
              </div>
            </div>
            
            <!-- 拖动轨道（覆盖整个关键帧区域） -->
            <div
              v-if="keyframes.length > 0"
              ref="progressTrack"
              class="progress-track-overlay"
              @mousedown="startDrag"
            ></div>
            
            <!-- 推荐气泡（显示在特定关键帧上方） -->
            <div
              v-for="(bubble, index) in recommendBubbles"
              :key="index"
              class="recommend-bubble"
              :style="{ left: `${(bubble.index / (keyframes.length - 1 || 1)) * 100}%` }"
            >
              <div
                class="recommend-bubble-preview"
                :style="{ backgroundImage: `url(${keyframes[bubble.index]})` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- 2. 推荐按钮区（中间）+ 上传封面区（右侧） -->
        <div class="footer-actions">
          <!-- 推荐按钮 -->
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
          </div>
      
        </div>
      </el-footer>
    </el-container>

      <!-- 右侧：预览区 -->
      <el-aside width="200px" class="right-aside">
      <div class="preview-header">
        <span>{{ coverRatio === 'vertical' ? '竖封面预览(3:4)' : '横封面预览(4:3)' }}</span>
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
import { ref, onUnmounted, computed, nextTick, onMounted } from 'vue'
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
const scaleValue = ref(0) // 缩放值（百分比，0表示不缩放，100表示放大一倍）

// 封面比例（vertical: 竖封面3:4, horizontal: 横封面4:3）
const coverRatio = ref('vertical') // 默认竖封面

// 拖动相关变量
const progressTrack = ref(null)
const keyframeScroll = ref(null)
const isDragging = ref(false)
const dragPreviewFrame = ref('')
const dragPercent = ref(-1) // 拖动进度百分比（-1表示未拖动）
const currentProgressPercent = ref(0) // 当前进度百分比（0-1）
const videoRef = ref(null) // 存储视频实例
const currentVideoFile = ref(null) // 存储当前导入的视频文件
const slider = ref(null) // 滑块元素
const cropImage = ref(null) // 裁剪区域的图片元素

// 推荐气泡配置（显示在第2、6、8个关键帧上方）
const recommendBubbles = ref([
  { index: 1 }, // 第2个（索引1）
  { index: 5 }, // 第6个（索引5）
  { index: 7 }  // 第8个（索引7）
])

// 裁剪框样式
const cropBoxStyle = ref({
  width: '0px',
  height: '0px',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)'
})

// 图片显示样式
const imageStyle = ref({})

// 裁剪分辨率显示
const cropResolution = ref('')

// 图片拖动相关变量
const isImageDragging = ref(false)
const imageDragStartX = ref(0) // 拖动开始时的鼠标X位置
const imageDragStartY = ref(0) // 拖动开始时的鼠标Y位置
const imageOffsetX = ref(0) // 图片相对容器的X偏移
const imageOffsetY = ref(0) // 图片相对容器的Y偏移
const imageOffsetXStart = ref(0) // 拖动开始时的图片X偏移
const imageOffsetYStart = ref(0) // 拖动开始时的图片Y偏移

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

  currentVideoFile.value = file

  try {
    // 1. 加载视频
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    videoRef.value = video // 保存视频实例
    
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
    
    // 初始化进度条
    currentProgressPercent.value = 0

    // 确保视频可以播放（用于拖动时截取帧）
    video.muted = true
    video.playsInline = true
    
    // 注意：不清理视频URL，因为拖动时需要用到
    console.log('视频加载完成，时长:', video.duration, '秒')
  } catch (error) {
    console.error('视频处理失败:', error)
    alert('视频处理失败，请检查视频格式')
    videoRef.value = null
    currentVideoFile.value = null
  }

  // 清空input，允许重复选择同一文件
  e.target.value = ''
}

// 选择关键帧（同步到裁剪区预览）
const selectKeyframe = (index) => {
  if (index < 0 || index >= keyframes.value.length) return
  selectedFrameIndex.value = index
  selectedKeyframe.value = keyframes.value[index]
  
  // 更新进度条位置
  if (keyframes.value.length > 1) {
    currentProgressPercent.value = index / (keyframes.value.length - 1)
  } else {
    currentProgressPercent.value = 0
  }
  
  // 如果视频已加载，同步视频时间
  if (videoRef.value && videoRef.value.duration) {
    const time = (index / (keyframes.value.length - 1 || 1)) * videoRef.value.duration
    videoRef.value.currentTime = time
  }
  
  // 等待图片加载后更新裁剪框
  nextTick(() => {
    if (cropImage.value && cropImage.value.complete) {
      updateCropBox()
    }
  })
}

// 图片加载完成后更新裁剪框
const onImageLoad = () => {
  updateCropBox()
}

// 更新裁剪框尺寸和位置
const updateCropBox = () => {
  if (!selectedKeyframe.value || !cropImage.value) return
  
  const container = document.querySelector('.crop-area')
  if (!container) return
  
  // 获取容器尺寸（预览区）
  const containerRect = container.getBoundingClientRect()
  const containerHeight = containerRect.height // 预览区高度（500px）
  
  // 裁剪框比例（根据封面类型：竖封面3:4，横封面4:3）
  const cropRatio = coverRatio.value === 'vertical' ? 3 / 4 : 4 / 3
  
  // 裁剪框高度等于预览区高度
  const cropHeight = containerHeight
  // 根据高度和比例计算宽度（等比例缩放）
  const cropWidth = cropHeight * cropRatio
  
  // 获取图片原始尺寸
  const img = cropImage.value
  const imgNaturalWidth = img.naturalWidth
  const imgNaturalHeight = img.naturalHeight
  const imgAspectRatio = imgNaturalWidth / imgNaturalHeight
  
  // 先让图片高度等于预览区高度，计算此时图片宽度（基础尺寸）
  let baseImgDisplayHeight = containerHeight
  let baseImgDisplayWidth = baseImgDisplayHeight * imgAspectRatio
  
  // 如果此时图片宽度小于颜色框宽度，则放大图片，使宽度至少等于颜色框宽度
  if (baseImgDisplayWidth < cropWidth) {
    baseImgDisplayWidth = cropWidth
    baseImgDisplayHeight = baseImgDisplayWidth / imgAspectRatio
  }
  
  // 应用缩放（scaleValue: 0表示不缩放，100表示放大一倍）
  const scale = 1 + scaleValue.value / 100
  let imgDisplayWidth = baseImgDisplayWidth * scale
  let imgDisplayHeight = baseImgDisplayHeight * scale
  
  // 计算裁剪框在容器中的位置（居中）
  const left = containerRect.width / 2
  const top = containerRect.height / 2
  
  cropBoxStyle.value = {
    width: `${cropWidth}px`,
    height: `${cropHeight}px`,
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translate(-50%, -50%)'
  }
  
  // 如果图片尺寸大于颜色框，可以拖动
  // 计算图片初始位置（居中）
  if (imgDisplayWidth > cropWidth) {
    // 图片宽度大于颜色框，初始位置居中
    imageOffsetX.value = 0
  } else {
    // 图片宽度小于等于颜色框，不需要偏移
    imageOffsetX.value = 0
  }
  
  if (imgDisplayHeight > cropHeight) {
    // 图片高度大于颜色框，初始位置居中
    imageOffsetY.value = 0
  } else {
    // 图片高度小于等于颜色框，不需要偏移
    imageOffsetY.value = 0
  }
  
  // 更新图片显示尺寸和位置
  updateImageStyle(imgDisplayWidth, imgDisplayHeight)
  
  // 计算裁剪后的实际分辨率（基于图片原始分辨率）
  // 裁剪后的分辨率 = (裁剪框像素尺寸 / 图片显示像素尺寸) × 图片原始分辨率
  const scaleX = cropWidth / imgDisplayWidth
  const scaleY = cropHeight / imgDisplayHeight
  const cropRealWidth = Math.round(imgNaturalWidth * scaleX)
  const cropRealHeight = Math.round(imgNaturalHeight * scaleY)
  
  // 更新分辨率显示（裁剪后的实际分辨率）
  cropResolution.value = `${cropRealWidth} × ${cropRealHeight}`
}

// 缩放值改变时的回调
const onScaleChange = () => {
  if (selectedKeyframe.value) {
    updateCropBox()
  }
}

// 缩小（每次-10）
const zoomOut = () => {
  if (scaleValue.value > 0) {
    scaleValue.value = Math.max(0, scaleValue.value - 10)
    onScaleChange()
  }
}

// 放大（每次+10）
const zoomIn = () => {
  if (scaleValue.value < 100) {
    scaleValue.value = Math.min(100, scaleValue.value + 10)
    onScaleChange()
  }
}

// 鼠标滚轮缩放
const handleWheelZoom = (e) => {
  if (!selectedKeyframe.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  // 滚轮向上放大，向下缩小
  const delta = e.deltaY > 0 ? -5 : 5 // 每次滚动调整5%
  const newValue = scaleValue.value + delta
  
  // 限制范围 0-100
  scaleValue.value = Math.max(0, Math.min(100, newValue))
  onScaleChange()
}

// 鼠标进入裁剪区域
const onCropAreaEnter = () => {
  // 可以添加一些视觉反馈
}

// 鼠标离开裁剪区域
const onCropAreaLeave = () => {
  // 可以添加一些视觉反馈
}

// 设置封面比例
const setCoverRatio = (ratio) => {
  coverRatio.value = ratio
  // 切换比例后重新计算裁剪框
  if (selectedKeyframe.value) {
    updateCropBox()
  }
}

// 更新图片样式（包括位置）
const updateImageStyle = (width, height) => {
  const container = document.querySelector('.crop-area')
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const cropBoxLeft = containerRect.width / 2 - parseFloat(cropBoxStyle.value.width) / 2
  const cropBoxTop = containerRect.height / 2 - parseFloat(cropBoxStyle.value.height) / 2
  const cropBoxWidth = parseFloat(cropBoxStyle.value.width)
  const cropBoxHeight = parseFloat(cropBoxStyle.value.height)
  
  // 计算图片的可拖动范围
  const maxOffsetX = Math.max(0, (width - cropBoxWidth) / 2)
  const maxOffsetY = Math.max(0, (height - cropBoxHeight) / 2)
  
  // 限制偏移范围
  imageOffsetX.value = Math.max(-maxOffsetX, Math.min(maxOffsetX, imageOffsetX.value))
  imageOffsetY.value = Math.max(-maxOffsetY, Math.min(maxOffsetY, imageOffsetY.value))
  
  // 计算图片在容器中的位置（居中 + 偏移）
  const imageLeft = containerRect.width / 2 + imageOffsetX.value
  const imageTop = containerRect.height / 2 + imageOffsetY.value
  
  imageStyle.value = {
    width: `${width}px`,
    height: `${height}px`,
    objectFit: 'contain',
    position: 'absolute',
    left: `${imageLeft}px`,
    top: `${imageTop}px`,
    transform: 'translate(-50%, -50%) translateZ(0)',
    cursor: 'move',
    // 改善图片渲染质量
    imageRendering: 'auto',
    WebkitImageRendering: 'auto',
    msInterpolationMode: 'bicubic'
  }
}

// 开始拖动图片
const startImageDrag = (e) => {
  if (!cropImage.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  isImageDragging.value = true
  
  // 记录初始鼠标位置
  imageDragStartX.value = e.clientX
  imageDragStartY.value = e.clientY
  
  // 记录拖动开始时的图片偏移
  imageOffsetXStart.value = imageOffsetX.value
  imageOffsetYStart.value = imageOffsetY.value
  
  document.addEventListener('mousemove', onImageDragMove)
  document.addEventListener('mouseup', endImageDrag)
}

// 拖动图片中
const onImageDragMove = (e) => {
  if (!isImageDragging.value || !cropImage.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  // 计算鼠标移动的距离
  const deltaX = e.clientX - imageDragStartX.value
  const deltaY = e.clientY - imageDragStartY.value
  
  // 获取图片和颜色框的尺寸
  const container = document.querySelector('.crop-area')
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const cropBoxWidth = parseFloat(cropBoxStyle.value.width)
  const cropBoxHeight = parseFloat(cropBoxStyle.value.height)
  const imgDisplayWidth = parseFloat(imageStyle.value.width) || 0
  const imgDisplayHeight = parseFloat(imageStyle.value.height) || 0
  
  // 计算图片的可拖动范围（确保图片边缘不超出颜色框）
  const maxOffsetX = Math.max(0, (imgDisplayWidth - cropBoxWidth) / 2)
  const maxOffsetY = Math.max(0, (imgDisplayHeight - cropBoxHeight) / 2)
  
  // 计算新的偏移量（初始偏移 + 鼠标移动距离）
  const newOffsetX = imageOffsetXStart.value + deltaX
  const newOffsetY = imageOffsetYStart.value + deltaY
  
  // 限制偏移范围
  imageOffsetX.value = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX))
  imageOffsetY.value = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY))
  
  // 更新图片位置
  const imageLeft = containerRect.width / 2 + imageOffsetX.value
  const imageTop = containerRect.height / 2 + imageOffsetY.value
  
  imageStyle.value = {
    ...imageStyle.value,
    left: `${imageLeft}px`,
    top: `${imageTop}px`
  }
}

// 结束拖动图片
const endImageDrag = (e) => {
  isImageDragging.value = false
  document.removeEventListener('mousemove', onImageDragMove)
  document.removeEventListener('mouseup', endImageDrag)
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
  videoRef.value = null // 清空视频实例
  currentVideoFile.value = null
  
  // 等待图片加载后更新裁剪框
  nextTick(() => {
    if (cropImage.value && cropImage.value.complete) {
      updateCropBox()
    }
  })

  e.target.value = ''
}

// 拖动结束后显示当前帧预览（3秒后自动隐藏）
let previewHideTimeout = null
const showCurrentFramePreview = () => {
  // 清除之前的隐藏定时器
  if (previewHideTimeout) {
    clearTimeout(previewHideTimeout)
  }
  
  // 3秒后自动隐藏
  previewHideTimeout = setTimeout(() => {
    dragPreviewFrame.value = ''
  }, 3000)
}

// 更新预览帧（节流处理）
let previewTimeout = null
const updatePreviewFrame = (videoTime, clientX, clientY, showPopup = true) => {
  if (!videoRef.value) return
  
  // 清除之前的定时器
  if (previewTimeout) {
    clearTimeout(previewTimeout)
  }
  
  // 节流处理，避免频繁更新
  previewTimeout = setTimeout(() => {
    if (!videoRef.value) return
    
    const video = videoRef.value
    
    // 如果时间变化不大，不更新
    if (Math.abs(video.currentTime - videoTime) < 0.1) {
      return
    }
    
    video.currentTime = videoTime
    
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      if (!videoRef.value) return
      
      try {
        const canvas = document.createElement('canvas')
        const aspectRatio = video.videoHeight / video.videoWidth
        const width = 200
        const height = Math.round(width * aspectRatio)
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, width, height)
        dragPreviewFrame.value = canvas.toDataURL('image/jpeg', 0.8)
      } catch (error) {
        console.error('截取预览帧失败:', error)
      }
    }
    
    video.addEventListener('seeked', onSeeked, { once: true })
  }, 100) // 100ms节流
}

// 开始拖动（mousedown）
const startDrag = (e) => {
  // 如果点击的是关键帧标记点，不处理拖动
  if (e.target.classList.contains('keyframe-marker')) {
    return
  }
  
  if (!videoRef.value || !currentVideoFile.value) {
    console.log('无法拖动：视频未加载', { videoRef: !!videoRef.value, file: !!currentVideoFile.value })
    return
  }
  
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  
  // 清除之前的节流定时器
  if (dragTimeout) {
    clearTimeout(dragTimeout)
    dragTimeout = null
  }
  
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('mouseleave', endDrag) // 鼠标离开窗口也结束拖动
  
  // 触发一次移动事件，显示初始预览
  onDragMove(e)
}

// 拖动中（mousemove）
let dragTimeout = null
const onDragMove = (e) => {
  if (!isDragging.value || !progressTrack.value || !videoRef.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  // 1. 计算鼠标在进度条的相对位置 → 映射为视频时间
  const trackRect = progressTrack.value.getBoundingClientRect()
  const mouseX = e.clientX - trackRect.left
  const percent = Math.max(0, Math.min(1, mouseX / trackRect.width))
  dragPercent.value = percent // 更新拖动进度
  currentProgressPercent.value = percent // 更新当前进度
  const videoTime = percent * videoRef.value.duration
  
  // 2. 让关键帧缩略图栏跟随鼠标滚动（可选）
  if (keyframeScroll.value) {
    const scrollLeft = percent * (keyframeScroll.value.scrollWidth - trackRect.width)
    keyframeScroll.value.scrollLeft = scrollLeft
  }
  
  // 3. 更新预览图（拖动时显示在滑块位置）
  updatePreviewFrame(videoTime, e.clientX, e.clientY, false)
}

// 结束拖动（mouseup）
const endDrag = (e) => {
  if (!isDragging.value) return
  
  // 清除节流定时器
  if (dragTimeout) {
    clearTimeout(dragTimeout)
    dragTimeout = null
  }
  
  isDragging.value = false
  dragPreviewFrame.value = ''
  
  if (!progressTrack.value || !videoRef.value) {
    dragPercent.value = -1
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', endDrag)
    document.removeEventListener('mouseleave', endDrag)
    return
  }
  
  // 松开后选中当前拖动到的帧，同步到裁剪区
  const trackRect = progressTrack.value.getBoundingClientRect()
  const mouseX = e ? (e.clientX - trackRect.left) : (dragPercent.value * trackRect.width)
  const percent = e ? Math.max(0, Math.min(1, mouseX / trackRect.width)) : dragPercent.value
  const videoTime = percent * videoRef.value.duration
  currentProgressPercent.value = percent // 更新当前进度
  
  const video = videoRef.value
  
  // 设置视频时间并等待加载
  video.currentTime = videoTime
  
  const onSeeked = () => {
    if (!videoRef.value) return
    
    try {
      // 截取最终帧并设置为选中
      const canvas = document.createElement('canvas')
      const aspectRatio = video.videoHeight / video.videoWidth
      canvas.width = 200
      canvas.height = Math.round(200 * aspectRatio) // 保持视频宽高比
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // 更新选中帧（使用拖动位置的帧，不限于11个关键帧）
      const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      selectedKeyframe.value = frameDataUrl
      
      // 保存当前帧预览（用于在滑块位置显示）
      dragPreviewFrame.value = canvas.toDataURL('image/jpeg', 0.8)
      
      // 显示当前帧预览（3秒后自动隐藏）
      showCurrentFramePreview()
      
      // 更新选中索引（找到最接近的关键帧，用于高亮显示）
      const frameCount = keyframes.value.length
      if (frameCount > 0) {
        const closestIndex = Math.round(percent * (frameCount - 1))
        selectedFrameIndex.value = Math.max(0, Math.min(frameCount - 1, closestIndex))
      } else {
        selectedFrameIndex.value = -1
      }
      
      console.log('拖动完成，时间:', videoTime.toFixed(2), '秒', '进度:', (percent * 100).toFixed(1) + '%')
    } catch (error) {
      console.error('截取最终帧失败:', error)
    }
  }
  
  // 如果视频已经在目标时间附近，直接截取
  if (Math.abs(video.currentTime - videoTime) < 0.1) {
    onSeeked()
  } else {
    video.addEventListener('seeked', onSeeked, { once: true })
  }
  
  // 拖动结束后，保持滑块和预览显示3秒
  showCurrentFramePreview()
  
  // 3秒后隐藏滑块
  setTimeout(() => {
    if (!isDragging.value) {
      dragPercent.value = -1
      dragPreviewFrame.value = ''
    }
  }, 3000)
  
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('mouseleave', endDrag)
}

// 监听窗口大小改变，更新裁剪框
const handleResize = () => {
  if (selectedKeyframe.value) {
    updateCropBox()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 监听全局鼠标离开页面，防止悬浮窗残留
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('mouseleave', endDrag)
  document.removeEventListener('mousemove', onImageDragMove)
  document.removeEventListener('mouseup', endImageDrag)
  if (dragTimeout) {
    clearTimeout(dragTimeout)
  }
  if (previewTimeout) {
    clearTimeout(previewTimeout)
  }
})
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
  position: relative;
}

.crop-image {
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  /* 改善图片渲染质量 - 使用平滑插值 */
  image-rendering: auto;
  image-rendering: -webkit-optimize-contrast;
  -ms-interpolation-mode: bicubic;
  /* 强制使用GPU加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform;
}

.crop-image:active {
  cursor: grabbing !important;
}

/* 裁剪框（颜色框，标识选中区域） */
.crop-box {
  position: absolute;
  border: 2px solid #1677ff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 10;
  box-sizing: border-box;
}

/* 分辨率显示 */
.crop-resolution {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 11;
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
  position: relative;
}

/* 关键帧选择区域 */
.keyframe-select-area {
  width: 100%;
  height: 100px;
  position: relative;
}

.keyframe-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 11个关键帧（紧密排列） */
.preview-frames {
  display: flex;
  gap: 0;
  height: 100%;
  align-items: center;
  position: relative;
  z-index: 1;
}

.preview-frame {
  flex: 1;
  height: 80px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.preview-frame:hover {
  border-color: #409eff;
  transform: scale(1.02);
}

.preview-frame-selected {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.keyframe-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: #909399;
  font-size: 14px;
  width: 100%;
}

/* 滑块（叠加在关键帧上方） */
.slider {
  position: absolute;
  top: 0;
  width: 42px;
  height: 100%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

/* 滑块预览图片 */
.slider-preview {
  position: absolute;
  top: -90px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 53px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 滑块箭头指示器 */
.slider-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 11;
}

.slider-arrow-decorator {
  width: 2px;
  height: 60px;
  background-color: #797979;
}

/* 拖动轨道（覆盖整个关键帧区域） */
.progress-track-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
  z-index: 5;
  pointer-events: auto;
  background: transparent;
}

.progress-track-overlay:active {
  cursor: grabbing;
}

/* 推荐气泡 */
.recommend-bubble {
  position: absolute;
  top: -70px;
  width: 8px;
  height: 8px;
  transform: translateX(-50%);
  z-index: 8;
  pointer-events: none;
}

.recommend-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background-color: #1677ff;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.recommend-bubble-preview {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 53px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.recommend-bubble:hover .recommend-bubble-preview {
  opacity: 1;
}

.keyframe-thumbnails-scroll::-webkit-scrollbar {
  height: 6px;
}

.keyframe-thumbnails-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.keyframe-thumbnails-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.keyframe-thumbnails-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.keyframe-thumbnail-item {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  pointer-events: auto;
  z-index: 2;
}

.keyframe-thumbnail-item:hover {
  transform: scale(1.05);
  border-color: #409eff;
}

.keyframe-thumbnail-item.keyframe-thumbnail-selected {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.keyframe-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.keyframe-thumbnail-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: #fff;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
  font-weight: bold;
}

.keyframe-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
  color: #909399;
  font-size: 14px;
  width: 100%;
}

/* 底部操作区 */
.footer-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: relative;
}

.recommend-buttons {
  display: flex;
  gap: 15px;
}

.upload-button-wrapper {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.upload-cover-btn {
  width: 120px;
  height: 60px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #000 !important;
  border-color: #000 !important;
}

.upload-cover-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
}

.upload-icon {
  font-size: 20px;
  font-weight: bold;
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

