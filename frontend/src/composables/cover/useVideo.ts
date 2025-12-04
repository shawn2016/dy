import { ref } from 'vue'

export interface Keyframe {
  dataUrl: string
  time: number
  index: number
}

/**
 * 视频处理相关的组合式函数
 */
export function useVideo() {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const currentVideoFile = ref<File | null>(null)
  const keyframes = ref<string[]>([])
  const selectedFrameIndex = ref(-1)
  const currentProgressPercent = ref(0)

  /**
   * 加载视频文件
   */
  const loadVideo = async (file: File): Promise<HTMLVideoElement> => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.currentTime = 0
        resolve()
      }
      video.onerror = reject
    })

    videoRef.value = video
    currentVideoFile.value = file
    return video
  }

  /**
   * 跳转到指定时间
   */
  const seekToTime = async (video: HTMLVideoElement, time: number): Promise<void> => {
    video.currentTime = time
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked)
        resolve()
      }
      video.addEventListener('seeked', onSeeked)
    })
  }

  /**
   * 捕获当前帧
   */
  const captureFrame = (video: HTMLVideoElement, width = 200): string => {
    const canvas = document.createElement('canvas')
    const height = (video.videoHeight / video.videoWidth) * width
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height)
      return canvas.toDataURL('image/jpeg', 0.8)
    }
    return ''
  }

  /**
   * 提取关键帧
   */
  const extractKeyframes = async (video: HTMLVideoElement, count = 11): Promise<string[]> => {
    const duration = video.duration
    const frames: string[] = []

    for (let i = 0; i < count; i++) {
      const time = (i * duration) / (count - 1)
      await seekToTime(video, time)
      const frame = captureFrame(video)
      frames.push(frame)
    }

    keyframes.value = frames
    return frames
  }

  /**
   * 根据进度百分比获取视频时间
   */
  const getTimeFromPercent = (percent: number, duration: number): number => {
    return (percent / 100) * duration
  }

  /**
   * 根据时间获取进度百分比
   */
  const getPercentFromTime = (time: number, duration: number): number => {
    return (time / duration) * 100
  }

  /**
   * 清理资源
   */
  const cleanup = () => {
    if (videoRef.value?.src) {
      URL.revokeObjectURL(videoRef.value.src)
    }
    videoRef.value = null
    currentVideoFile.value = null
    keyframes.value = []
    selectedFrameIndex.value = -1
    currentProgressPercent.value = 0
  }

  return {
    videoRef,
    currentVideoFile,
    keyframes,
    selectedFrameIndex,
    currentProgressPercent,
    loadVideo,
    extractKeyframes,
    seekToTime,
    captureFrame,
    getTimeFromPercent,
    getPercentFromTime,
    cleanup,
  }
}

