import { ref, computed } from 'vue'

export type CoverRatio = 'vertical' | 'horizontal'

export interface CropBoxStyle {
  width: string
  height: string
  left: string
  top: string
  transform: string
}

export interface ImageStyle {
  width?: string
  height?: string
  left?: string
  top?: string
  objectFit?: string
  position?: string
  transform?: string
  cursor?: string
  [key: string]: any
}

/**
 * 图片裁剪相关的组合式函数
 */
export function useImageCrop() {
  const coverRatio = ref<CoverRatio>('vertical')
  const scaleValue = ref(0) // 缩放值（百分比，0表示不缩放，100表示放大一倍）
  const cropBoxStyle = ref<CropBoxStyle>({
    width: '0px',
    height: '0px',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  })
  const imageStyle = ref<ImageStyle>({})
  const imageOffsetX = ref(0) // 图片相对容器的X偏移
  const imageOffsetY = ref(0) // 图片相对容器的Y偏移
  const cropResolution = ref('')

  // 图片拖动相关
  const isImageDragging = ref(false)
  const imageDragStartX = ref(0)
  const imageDragStartY = ref(0)
  const imageOffsetXStart = ref(0)
  const imageOffsetYStart = ref(0)

  /**
   * 计算裁剪框尺寸和位置
   */
  const calculateCropBox = (
    containerHeight: number,
    imgNaturalWidth: number,
    imgNaturalHeight: number,
  ) => {
    const cropRatio = coverRatio.value === 'vertical' ? 3 / 4 : 4 / 3
    const cropHeight = containerHeight
    const cropWidth = cropHeight * cropRatio

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
    const imgDisplayWidth = baseImgDisplayWidth * scale
    const imgDisplayHeight = baseImgDisplayHeight * scale

    cropBoxStyle.value = {
      width: `${cropWidth}px`,
      height: `${cropHeight}px`,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }

    // 计算分辨率
    const scaleX = cropWidth / imgDisplayWidth
    const scaleY = cropHeight / imgDisplayHeight
    const cropRealWidth = Math.round(imgNaturalWidth * scaleX)
    const cropRealHeight = Math.round(imgNaturalHeight * scaleY)
    cropResolution.value = `${cropRealWidth} × ${cropRealHeight}`

    // 更新图片样式
    updateImageStyle(imgDisplayWidth, imgDisplayHeight)

    return {
      cropWidth,
      cropHeight,
      imgDisplayWidth,
      imgDisplayHeight,
    }
  }

  /**
   * 更新图片样式
   */
  const updateImageStyle = (width: number, height: number) => {
    const container = document.querySelector('.crop-area')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
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
      imageRendering: 'auto',
      WebkitImageRendering: 'auto',
      msInterpolationMode: 'bicubic',
    }
  }

  /**
   * 设置封面比例
   */
  const setCoverRatio = (ratio: CoverRatio) => {
    coverRatio.value = ratio
  }

  /**
   * 缩放值改变
   */
  const onScaleChange = (callback?: () => void) => {
    callback?.()
  }

  /**
   * 缩小
   */
  const zoomOut = () => {
    if (scaleValue.value > 0) {
      scaleValue.value = Math.max(0, scaleValue.value - 10)
    }
  }

  /**
   * 放大
   */
  const zoomIn = () => {
    if (scaleValue.value < 100) {
      scaleValue.value = Math.min(100, scaleValue.value + 10)
    }
  }

  /**
   * 鼠标滚轮缩放
   */
  const handleWheelZoom = (e: WheelEvent, callback?: () => void) => {
    e.preventDefault()
    e.stopPropagation()

    const delta = e.deltaY > 0 ? -5 : 5
    const newValue = scaleValue.value + delta
    scaleValue.value = Math.max(0, Math.min(100, newValue))
    callback?.()
  }

  /**
   * 开始拖动图片
   */
  const startImageDrag = (e: MouseEvent) => {
    isImageDragging.value = true
    imageDragStartX.value = e.clientX
    imageDragStartY.value = e.clientY
    imageOffsetXStart.value = imageOffsetX.value
    imageOffsetYStart.value = imageOffsetY.value
  }

  /**
   * 拖动图片中
   */
  const onImageDragMove = (e: MouseEvent, callback?: () => void) => {
    if (!isImageDragging.value) return

    e.preventDefault()
    e.stopPropagation()

    const deltaX = e.clientX - imageDragStartX.value
    const deltaY = e.clientY - imageDragStartY.value

    const container = document.querySelector('.crop-area')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const cropBoxWidth = parseFloat(cropBoxStyle.value.width)
    const cropBoxHeight = parseFloat(cropBoxStyle.value.height)
    const imgDisplayWidth = parseFloat(imageStyle.value.width || '0')
    const imgDisplayHeight = parseFloat(imageStyle.value.height || '0')

    const maxOffsetX = Math.max(0, (imgDisplayWidth - cropBoxWidth) / 2)
    const maxOffsetY = Math.max(0, (imgDisplayHeight - cropBoxHeight) / 2)

    const newOffsetX = imageOffsetXStart.value + deltaX
    const newOffsetY = imageOffsetYStart.value + deltaY

    imageOffsetX.value = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX))
    imageOffsetY.value = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY))

    const imageLeft = containerRect.width / 2 + imageOffsetX.value
    const imageTop = containerRect.height / 2 + imageOffsetY.value

    imageStyle.value = {
      ...imageStyle.value,
      left: `${imageLeft}px`,
      top: `${imageTop}px`,
    }

    callback?.()
  }

  /**
   * 结束拖动图片
   */
  const endImageDrag = (callback?: () => void) => {
    isImageDragging.value = false
    callback?.()
  }

  /**
   * 重置图片位置和缩放
   */
  const resetImage = () => {
    scaleValue.value = 0
    imageOffsetX.value = 0
    imageOffsetY.value = 0
  }

  return {
    coverRatio,
    scaleValue,
    cropBoxStyle,
    imageStyle,
    imageOffsetX,
    imageOffsetY,
    cropResolution,
    isImageDragging,
    calculateCropBox,
    updateImageStyle,
    setCoverRatio,
    onScaleChange,
    zoomOut,
    zoomIn,
    handleWheelZoom,
    startImageDrag,
    onImageDragMove,
    endImageDrag,
    resetImage,
  }
}

