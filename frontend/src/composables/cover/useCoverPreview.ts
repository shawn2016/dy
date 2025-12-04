import { ref, nextTick } from 'vue'
import type { CropBoxStyle, ImageStyle } from './useImageCrop'

/**
 * 封面预览相关的组合式函数
 */
export function useCoverPreview() {
  const croppedPreviewImage = ref('')
  const previewImages = ref<string[]>([])

  /**
   * 生成裁剪后的预览图（第一个预览）
   */
  const generateCroppedPreview = (
    image: HTMLImageElement,
    cropBoxStyle: CropBoxStyle,
    imageStyle: ImageStyle,
    imageOffsetX: number,
    imageOffsetY: number,
  ) => {
    if (!image || !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
      croppedPreviewImage.value = ''
      return
    }

    const container = document.querySelector('.crop-area')
    if (!container) return

    const cropBoxWidth = parseFloat(cropBoxStyle.width)
    const cropBoxHeight = parseFloat(cropBoxStyle.height)
    const imgDisplayWidth = parseFloat(imageStyle.width || '0')
    const imgDisplayHeight = parseFloat(imageStyle.height || '0')

    if (cropBoxWidth <= 0 || cropBoxHeight <= 0 || imgDisplayWidth <= 0 || imgDisplayHeight <= 0) {
      return
    }

    const containerRect = container.getBoundingClientRect()

    // 图片中心在容器中的位置（考虑偏移）
    const imgCenterX = containerRect.width / 2 + imageOffsetX
    const imgCenterY = containerRect.height / 2 + imageOffsetY

    // 裁剪框中心在容器中的位置（居中，无偏移）
    const cropBoxCenterX = containerRect.width / 2
    const cropBoxCenterY = containerRect.height / 2

    // 图片的左上角位置（相对于容器）
    const imgLeft = imgCenterX - imgDisplayWidth / 2
    const imgTop = imgCenterY - imgDisplayHeight / 2

    // 裁剪框的左上角位置（相对于容器）
    const cropBoxLeft = cropBoxCenterX - cropBoxWidth / 2
    const cropBoxTop = cropBoxCenterY - cropBoxHeight / 2

    // 计算裁剪框相对于图片的偏移（在显示尺寸下）
    const sourceX = cropBoxLeft - imgLeft
    const sourceY = cropBoxTop - imgTop

    // 确保源区域在图片范围内
    const finalSourceX = Math.max(0, sourceX)
    const finalSourceY = Math.max(0, sourceY)
    const finalSourceWidth = Math.min(cropBoxWidth, imgDisplayWidth - finalSourceX)
    const finalSourceHeight = Math.min(cropBoxHeight, imgDisplayHeight - finalSourceY)

    if (finalSourceWidth <= 0 || finalSourceHeight <= 0) {
      croppedPreviewImage.value = ''
      return
    }

    // 计算源图片的缩放比例（从自然尺寸到显示尺寸）
    const scaleX = image.naturalWidth / imgDisplayWidth
    const scaleY = image.naturalHeight / imgDisplayHeight

    // 创建canvas来裁剪图片
    const canvas = document.createElement('canvas')
    canvas.width = cropBoxWidth
    canvas.height = cropBoxHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // 绘制裁剪区域（从原始图片中裁剪）
      ctx.drawImage(
        image,
        finalSourceX * scaleX,
        finalSourceY * scaleY,
        finalSourceWidth * scaleX,
        finalSourceHeight * scaleY,
        0,
        0,
        cropBoxWidth,
        cropBoxHeight,
      )

      // 转换为base64
      croppedPreviewImage.value = canvas.toDataURL('image/jpeg', 0.9)
    }
  }

  /**
   * 生成其他预览图（从关键帧）
   */
  const generatePreviewImages = (keyframes: string[], count = 5) => {
    previewImages.value = []

    if (keyframes.length > 0) {
      const step = Math.max(1, Math.floor(keyframes.length / count))
      for (let i = 0; i < count; i++) {
        const index = i * step
        if (index < keyframes.length) {
          previewImages.value.push(keyframes[index])
        } else {
          previewImages.value.push('')
        }
      }
    } else {
      previewImages.value = Array(count).fill('')
    }
  }

  /**
   * 更新预览（使用 requestAnimationFrame 优化性能）
   */
  const updatePreview = (
    callback: () => void,
    useRAF = true,
  ) => {
    if (useRAF) {
      if (window.previewUpdateFrame) {
        cancelAnimationFrame(window.previewUpdateFrame)
      }
      window.previewUpdateFrame = requestAnimationFrame(() => {
        nextTick(() => {
          callback()
        })
      })
    } else {
      nextTick(() => {
        callback()
      })
    }
  }

  /**
   * 清除预览更新动画帧
   */
  const clearPreviewUpdate = () => {
    if (window.previewUpdateFrame) {
      cancelAnimationFrame(window.previewUpdateFrame)
      window.previewUpdateFrame = null
    }
  }

  return {
    croppedPreviewImage,
    previewImages,
    generateCroppedPreview,
    generatePreviewImages,
    updatePreview,
    clearPreviewUpdate,
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    previewUpdateFrame?: number | null
  }
}

