import { defineConfig, presetUno, presetAttributify, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class', // 启用暗黑模式，使用 class 策略
    }), // 默认预设
    presetAttributify(), // 属性化模式
    presetIcons({
      collections: {
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirectives(), // 支持 @apply 指令
  ],
  shortcuts: {
    // 布局快捷方式
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    // 尺寸快捷方式
    'full': 'w-full h-full',
    'full-screen': 'w-screen h-screen',
    // 间距快捷方式
    'gap-sm': 'gap-2',
    'gap-md': 'gap-4',
    'gap-lg': 'gap-6',
    // 圆角快捷方式
    'rounded-sm': 'rounded-2px',
    'rounded-md': 'rounded-4px',
    'rounded-lg': 'rounded-8px',
  },
  theme: {
    colors: {
      primary: {
        DEFAULT: '#409eff',
        light: '#79bbff',
        dark: '#337ecc',
      },
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399',
    },
    breakpoints: {
      xs: '480px',
      sm: '768px',
      md: '1024px',
      lg: '1280px',
      xl: '1920px',
    },
  },
  rules: [
    // 自定义规则
    [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${d}px` })],
  ],
})

