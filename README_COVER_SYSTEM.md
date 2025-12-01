# 抖音风格视频封面管理系统

## 已完成功能

### 1. 后端API ✅
- ✅ 数据库模型更新：添加了标题编辑和视频相关字段
- ✅ 分页查询接口：支持名称、时间范围、状态查询
- ✅ 视频生成接口：使用 moviepy 生成3秒封面视频
- ✅ 文件上传接口：支持图片上传到 `data/covers/` 目录

### 2. 前端功能 ✅
- ✅ 封面列表页：
  - 查询条件（名称、时间范围、状态）
  - 视图切换（卡片视图/列表视图）
  - 分页功能
  - 视频预览功能
- ✅ 封面编辑/新增页：
  - 步骤式流程（5个步骤）
  - 图片上传和裁剪（9:16比例）
  - 标题编辑（字体、大小、颜色、位置、粗体/斜体）
  - 视频生成（3秒抖音风格封面视频）
  - 保存提交

## 安装依赖

### 后端依赖
```bash
cd backend
pip install -r requirements.txt
```

新增依赖：
- `moviepy==1.0.3` - 视频生成
- `Pillow==10.1.0` - 图片处理

### 前端依赖
```bash
cd frontend
npm install
```

新增依赖（已在 package.json 中）：
- `vue-cropper` - 图片裁剪（可选，当前使用自定义裁剪）
- `@ffmpeg/ffmpeg` - 前端视频生成（可选，当前使用后端生成）

## 数据库迁移

由于更新了 Cover 模型，需要执行数据库迁移：

```python
# 在 backend/app.py 的初始化部分会自动检查并添加新字段
# 或者手动执行 SQL：

ALTER TABLE covers ADD COLUMN IF NOT EXISTS original_image_path VARCHAR(255);
ALTER TABLE covers ADD COLUMN IF NOT EXISTS cropped_image_path VARCHAR(255);
ALTER TABLE covers ADD COLUMN IF NOT EXISTS video_path VARCHAR(255);
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_text VARCHAR(30);
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_font VARCHAR(20) DEFAULT 'Arial';
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_font_size INT DEFAULT 24;
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_color VARCHAR(20) DEFAULT '#FFFFFF';
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_position_x INT DEFAULT 0;
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_position_y INT DEFAULT 0;
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_bold BOOLEAN DEFAULT FALSE;
ALTER TABLE covers ADD COLUMN IF NOT EXISTS title_italic BOOLEAN DEFAULT FALSE;
ALTER TABLE covers ADD COLUMN IF NOT EXISTS status INT DEFAULT 1;
```

## 使用说明

### 1. 启动后端
```bash
cd backend
./start.sh
# 或
python app.py
```

### 2. 启动前端
```bash
cd frontend
npm run dev
```

### 3. 使用流程

#### 新增封面：
1. 点击"新增"按钮
2. **步骤1 - 上传图片**：选择本地图片（JPG/PNG，≤10MB）
3. **步骤2 - 裁剪图片**：
   - 拖拽裁剪框调整位置
   - 保持9:16比例
   - 点击"确认裁剪并上传"
4. **步骤3 - 编辑标题**：
   - 输入标题文本（最多30字）
   - 选择字体、大小、颜色
   - 设置粗体/斜体
   - 拖拽标题文字调整位置
5. **步骤4 - 生成视频**：
   - 点击"生成3秒封面视频"
   - 等待生成完成
   - 预览视频效果
6. **步骤5 - 保存提交**：
   - 输入封面名称
   - 选择状态（启用/禁用）
   - 添加描述（可选）
   - 点击"保存"

#### 编辑封面：
- 点击"编辑"按钮，流程与新增相同
- 可以重新裁剪、修改标题、重新生成视频

#### 预览视频：
- 在列表页点击"预览"按钮
- 或点击封面图片（如果有视频）

## 文件结构

```
data/
├── covers/          # 裁剪后的封面图片
├── videos/          # 生成的封面视频
└── avatars/         # 用户头像（已有）

backend/
├── app.py           # 主应用文件
├── utils/
│   └── video_generator.py  # 视频生成工具
└── requirements.txt

frontend/
├── src/
│   ├── views/
│   │   └── CoverManagement.vue  # 封面管理页面
│   └── api/
│       └── cover.js  # 封面API
└── package.json
```

## 注意事项

1. **视频生成**：使用 moviepy 在后台生成，可能需要一些时间
2. **图片裁剪**：当前使用 Canvas API 实现，支持9:16比例
3. **标题位置**：使用拖拽方式调整，位置相对于图片左上角
4. **文件存储**：所有文件存储在 `data/` 目录下，需要确保目录权限

## 已知限制

1. 视频生成依赖 moviepy，首次使用可能需要下载 ffmpeg
2. 标题字体支持有限，取决于系统安装的字体
3. 视频生成为同步操作，大量生成可能影响性能

## 后续优化建议

1. 视频生成改为异步任务（使用 Celery 或类似工具）
2. 支持更多裁剪比例（1:1, 16:9等）
3. 支持视频预览时添加音效
4. 优化图片裁剪体验（支持缩放、旋转）
5. 添加批量操作功能

