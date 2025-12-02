import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import Profile from '@/views/Profile.vue'
import CoverManagement from '@/views/CoverManagement.vue'
import VideoManagement from '@/views/VideoManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/cover-management'
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/cover-management',
    name: 'CoverManagement',
    component: CoverManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/video-management',
    name: 'VideoManagement',
    component: VideoManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/cover-setting',
    name: 'CoverSetting',
    component: () => import('@/views/CoverSetting.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') && isAuthenticated) {
    // 已登录访问登录/注册/忘记密码页，跳转到首页
    next('/cover-management')
  } else {
    next()
  }
})

export default router

