# 前端架构设计文档

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **CSS 框架**: UnoCSS (原子化 CSS)
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios

## 目录结构

```
frontend/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── images/          # 图片资源
│   │   └── fonts/           # 字体资源
│   ├── components/          # 组件
│   │   ├── common/          # 通用组件
│   │   │   ├── AppHeader.vue
│   │   │   └── AppFooter.vue
│   │   └── cover/           # 封面相关组件
│   │       ├── CoverHeader.vue          # 封面设置页头部
│   │       ├── CoverSidebar.vue         # 左侧导航和模板区
│   │       ├── CoverCropArea.vue        # 中间裁剪区域
│   │       ├── CoverToolbar.vue         # 操作工具栏
│   │       ├── CoverKeyframes.vue       # 底部关键帧区域
│   │       └── CoverPreview.vue         # 右侧预览区
│   ├── composables/         # 组合式函数
│   │   ├── useVideo.ts      # 视频处理相关
│   │   ├── useImageCrop.ts  # 图片裁剪相关
│   │   ├── useCoverPreview.ts # 预览生成相关
│   │   └── useCoverList.ts  # 封面列表相关
│   ├── views/               # 页面视图
│   │   ├── cover/
│   │   │   ├── CoverManagement.vue
│   │   │   └── CoverSetting.vue
│   │   ├── Login.vue
│   │   └── ...
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   └── cover.ts
│   ├── api/                 # API 接口
│   │   ├── request.ts       # Axios 封装
│   │   ├── auth.ts
│   │   ├── cover.ts
│   │   └── video.ts
│   ├── utils/               # 工具函数
│   │   ├── dateUtils.ts
│   │   ├── imageUtils.ts
│   │   └── constants.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── api.ts
│   │   └── cover.ts
│   ├── styles/              # 全局样式
│   │   ├── reset.css
│   │   └── variables.css
│   ├── App.vue
│   └── main.ts
├── uno.config.js            # UnoCSS 配置
├── vite.config.js           # Vite 配置
└── package.json
```

## 组件拆分说明

### CoverSetting.vue 拆分

原 `CoverSetting.vue` 文件过大（约 2000 行），拆分为以下组件：

1. **CoverHeader.vue** - 顶部标题栏
   - 返回按钮
   - 页面标题
   - 取消/完成按钮

2. **CoverSidebar.vue** - 左侧导航和模板区
   - 导航菜单（模板/贴纸/标题/文字/滤镜）
   - 模板分类标签
   - 模板卡片列表

3. **CoverCropArea.vue** - 中间裁剪区域
   - 视频/图片导入按钮
   - 封面比例切换
   - 裁剪框（蓝色框）
   - 图片显示和拖动
   - 分辨率显示

4. **CoverToolbar.vue** - 操作工具栏
   - 增强/对比按钮
   - 缩放滑块
   - 重置按钮

5. **CoverKeyframes.vue** - 底部关键帧区域
   - 关键帧缩略图列表
   - 拖动进度条
   - 推荐按钮
   - 上传封面按钮

6. **CoverPreview.vue** - 右侧预览区
   - 预览标题
   - 预览图网格（竖封面3列/横封面2列）
   - 第一个预览（当前裁剪图）
   - 其他预览（从关键帧生成）

## Composables 设计

### useVideo.ts
- `loadVideo(file: File)` - 加载视频
- `extractKeyframes(video: HTMLVideoElement, count: number)` - 提取关键帧
- `seekToTime(video: HTMLVideoElement, time: number)` - 跳转到指定时间
- `captureFrame(video: HTMLVideoElement)` - 捕获当前帧

### useImageCrop.ts
- `calculateCropBox(container, image, ratio)` - 计算裁剪框尺寸
- `updateImagePosition(image, offsetX, offsetY)` - 更新图片位置
- `handleImageDrag(startX, startY, moveX, moveY)` - 处理图片拖动
- `calculateCropBounds(image, cropBox)` - 计算裁剪边界

### useCoverPreview.ts
- `generateCroppedPreview(image, cropBox, offset)` - 生成裁剪预览
- `generatePreviewImages(keyframes, count)` - 生成预览图列表
- `updatePreviewOnDrag()` - 拖动时更新预览
- `updatePreviewOnScale()` - 缩放时更新预览

## 样式迁移到 UnoCSS

- 使用原子化 CSS 类替代传统 CSS
- 使用 `@apply` 指令处理复杂样式
- 使用 UnoCSS 的 shortcuts 定义常用组合
- 保持响应式设计

## 状态管理

使用 Pinia 管理全局状态：
- `authStore` - 用户认证状态
- `coverStore` - 封面相关状态（可选，如果需要在多个组件间共享）

## 最佳实践

1. **组件职责单一** - 每个组件只负责一个功能
2. **Composables 复用** - 将可复用的逻辑提取到 composables
3. **类型安全** - 使用 TypeScript 定义类型（可选）
4. **性能优化** - 使用 `v-memo`、`shallowRef` 等优化性能
5. **代码规范** - 使用 ESLint + Prettier

