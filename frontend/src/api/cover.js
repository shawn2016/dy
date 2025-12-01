import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== undefined) {
      if (res.code === 200) {
        return { data: res.data }
      } else if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
        return Promise.reject(new Error(res.message || '未授权'))
      } else {
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
    }
    return response
  },
  (error) => {
    // 处理422错误（Token无效，通常是旧token格式问题）
    if (error.response?.status === 422) {
      const errorMessage = error.response?.data?.message || 'Token无效，请重新登录'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.error(errorMessage)
      window.location.href = '/login'
      return Promise.reject(new Error(errorMessage))
    }
    
    // 处理401错误（Token过期或未授权）
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '登录已过期，请重新登录'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.error(errorMessage)
      window.location.href = '/login'
      return Promise.reject(new Error(errorMessage))
    }
    
    // 其他错误
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 获取封面列表（支持分页和查询）
export const getCovers = (params = {}) => {
  return api.get('/covers', { params })
}

// 获取单个封面
export const getCover = (id) => {
  return api.get(`/covers/${id}`)
}

// 创建封面
export const createCover = (data) => {
  return api.post('/covers', data)
}

// 更新封面
export const updateCover = (id, data) => {
  return api.put(`/covers/${id}`, data)
}

// 删除封面
export const deleteCover = (id) => {
  return api.delete(`/covers/${id}`)
}

// 上传封面图片
export const uploadCoverImage = (formData) => {
  return api.post('/covers/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 生成视频
export const generateVideo = (data) => {
  return api.post('/api/generate/video', data)
}

// 获取封面视频URL
export const getCoverVideoUrl = (coverId) => {
  return `/api/covers/${coverId}/video`
}

export default api

