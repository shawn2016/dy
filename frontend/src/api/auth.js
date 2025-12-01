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
        // 将 res.data 直接赋值给 response.data，保持 axios 响应对象结构
        response.data = res.data
        return response
      } else if (res.code === 401) {
        // 检查是否是登录接口，登录接口的401不应该跳转
        const isLoginRequest = response.config?.url?.includes('/auth/login')
        if (!isLoginRequest) {
          // token过期，清除登录信息并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          ElMessage.error('登录已过期，请重新登录')
          window.location.href = '/login'
        }
        // 登录接口的401（用户名密码错误）或其他401错误，都返回错误信息
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
    
    // HTTP状态码401（不是业务code 401）
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (isLoginRequest) {
        // 登录接口的401错误，显示后端返回的错误消息
        const errorMessage = error.response?.data?.message || '用户名或密码错误'
        ElMessage.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      } else {
        const errorMessage = error.response?.data?.message || '登录已过期，请重新登录'
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.error(errorMessage)
        window.location.href = '/login'
      }
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

// 登录
export const login = (data) => {
  return api.post('/auth/login', data)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get('/auth/me')
}

// 退出登录
export const logout = () => {
  return api.post('/auth/logout')
}

// 注册
export const register = (data) => {
  return api.post('/auth/register', data)
}

// 发送验证码
export const sendVerifyCode = (data) => {
  return api.post('/auth/send-verify-code', data)
}

// 验证验证码
export const verifyCode = (data) => {
  return api.post('/auth/verify-code', data)
}

// 重置密码
export const resetPassword = (data) => {
  return api.post('/auth/reset-password', data)
}

// 修改密码
export const changePassword = (data) => {
  return api.post('/auth/change-password', data)
}

// 上传头像
export const uploadAvatar = (formData) => {
  return api.post('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api

