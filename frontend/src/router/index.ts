import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import Profile from '@/views/Profile.vue'
import CoverManagement from '@/views/CoverManagement.vue'
import CoverSetting from '@/views/CoverSetting.vue'
import VideoManagement from '@/views/VideoManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/cover-management',
  },
  {
    path: '/cover-management',
    name: 'CoverManagement',
    component: CoverManagement,
    meta: { requiresAuth: true },
  },
  {
    path: '/cover-setting',
    name: 'CoverSetting',
    component: CoverSetting,
    meta: { requiresAuth: true },
  },
  {
    path: '/video-management',
    name: 'VideoManagement',
    component: VideoManagement,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

