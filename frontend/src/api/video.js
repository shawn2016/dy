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
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

// 获取所有视频
export const getVideos = () => {
  return api.get('/videos')
}

// 获取单个视频
export const getVideo = (id) => {
  return api.get(`/videos/${id}`)
}

// 创建视频
export const createVideo = (data) => {
  return api.post('/videos', data)
}

// 更新视频
export const updateVideo = (id, data) => {
  return api.put(`/videos/${id}`, data)
}

// 删除视频
export const deleteVideo = (id) => {
  return api.delete(`/videos/${id}`)
}

export default api

