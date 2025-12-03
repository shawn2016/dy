# 前端项目结构说明

## 目录结构

```
frontend/src/
├── api/                    # API接口
│   ├── auth.js            # 认证API
│   ├── cover.js           # 封面API
│   └── video.js           # 视频API
├── components/             # 可复用组件
│   ├── CoverCard.vue      # 封面卡片组件
│   ├── CoverTable.vue     # 封面表格组件（待创建）
│   ├── CoverDialog.vue    # 封面编辑对话框（待创建）
│   ├── ImageCropper.vue   # 图片裁剪组件（待创建）
│   ├── TitleEditor.vue    # 标题编辑组件（待创建）
│   └── VideoGenerator.vue # 视频生成组件（待创建）
├── composables/            # 组合式函数
│   ├── useCoverList.js    # 封面列表逻辑
│   ├── useCoverForm.js    # 封面表单逻辑（待创建）
│   ├── useImageCrop.js    # 图片裁剪逻辑（待创建）
│   └── useTitleEditor.js  # 标题编辑逻辑（待创建）
├── stores/                 # 状态管理
│   └── auth.js            # 认证状态
├── utils/                  # 工具函数
│   ├── dateUtils.js       # 日期工具
│   └── imageUtils.js      # 图片工具
├── views/                  # 页面视图
│   ├── CoverManagement.vue # 封面管理页面（已重构）
│   ├── Login.vue
│   ├── Register.vue
│   └── ...
├── router/                 # 路由配置
│   └── index.js
├── styles/                 # 样式文件
│   └── reset.css
├── App.vue                 # 根组件
└── main.js                 # 入口文件
```

## 架构说明

采用 **组件化 + 组合式API** 架构：

### 组件化
- 将大组件拆分为小组件
- 提高代码复用性
- 便于维护和测试

### 组合式函数（Composables）
- 提取可复用的逻辑
- 遵循单一职责原则
- 便于测试和复用

### 工具函数
- 纯函数，无副作用
- 可被多个组件复用
- 便于单元测试

## 使用示例

### 使用组合式函数
```vue
<script setup>
import { useCoverList } from '@/composables/useCoverList'

const {
  loading,
  coverList,
  loadCovers,
  handleDelete
} = useCoverList()

onMounted(() => {
  loadCovers()
})
</script>
```

### 使用组件
```vue
<template>
  <CoverCard
    v-for="cover in coverList"
    :key="cover.id"
    :cover="cover"
    @edit="handleEdit"
    @delete="handleDelete"
    @preview="handlePreview"
  />
</template>
```

## 优势

- ✅ 代码结构清晰，易于维护
- ✅ 组件可复用，减少重复代码
- ✅ 逻辑与视图分离
- ✅ 便于单元测试
- ✅ 符合Vue 3最佳实践


