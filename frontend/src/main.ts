import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // Element Plus 暗黑模式
import 'virtual:uno.css' // UnoCSS
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router/index'
import './styles/reset.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.applyTheme(themeStore.theme)

app.mount('#app')

