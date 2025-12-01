# 后端项目结构说明

## 目录结构

```
backend/
├── app.py                 # 应用入口文件
├── config/                # 配置模块
│   ├── __init__.py       # 配置类
│   └── database.py       # 数据库配置和初始化
├── models/                # 数据模型层
│   ├── __init__.py
│   ├── user.py           # 用户模型
│   ├── cover.py          # 封面模型
│   └── video.py          # 视频模型
├── services/              # 业务逻辑层
│   ├── __init__.py
│   ├── auth_service.py   # 认证服务
│   ├── cover_service.py  # 封面服务
│   └── video_service.py  # 视频服务
├── routes/                # 路由层（控制器）
│   ├── __init__.py
│   ├── auth_routes.py    # 认证路由
│   ├── cover_routes.py   # 封面路由
│   └── video_routes.py   # 视频路由
├── middleware/            # 中间件
│   ├── __init__.py
│   └── auth.py           # 认证中间件
├── utils/                 # 工具函数
│   ├── __init__.py
│   └── video_generator.py # 视频生成工具
└── requirements.txt       # 依赖列表
```

## 架构说明

采用 **MVC（Model-View-Controller）** 架构：

- **Model（模型层）**: `models/` - 数据模型定义
- **View（视图层）**: `routes/` - API路由和响应处理
- **Controller（控制层）**: `services/` - 业务逻辑处理

### 各层职责

1. **Models（模型层）**
   - 定义数据库表结构
   - 提供数据转换方法（to_dict）
   - 不包含业务逻辑

2. **Services（服务层）**
   - 处理业务逻辑
   - 数据验证
   - 数据库操作封装
   - 可被多个路由复用

3. **Routes（路由层）**
   - 处理HTTP请求
   - 参数解析和验证
   - 调用服务层
   - 返回HTTP响应

4. **Middleware（中间件）**
   - 认证授权
   - 请求拦截
   - 通用功能封装

5. **Config（配置层）**
   - 应用配置
   - 数据库配置
   - 环境变量管理

## 使用示例

### 添加新功能

1. **定义模型** (`models/xxx.py`)
```python
class Xxx(db.Model):
    # 模型定义
    pass
```

2. **创建服务** (`services/xxx_service.py`)
```python
class XxxService:
    @staticmethod
    def get_xxx():
        # 业务逻辑
        pass
```

3. **添加路由** (`routes/xxx_routes.py`)
```python
@xxx_bp.route('/xxx', methods=['GET'])
@auth_required
def get_xxx():
    result = XxxService.get_xxx()
    return jsonify({'code': 200, 'data': result})
```

4. **注册路由** (`routes/__init__.py`)
```python
xxx_bp = Blueprint('xxx', __name__, url_prefix='/api/xxx')
app.register_blueprint(xxx_bp)
```

## 优势

- ✅ 代码结构清晰，易于维护
- ✅ 职责分离，便于测试
- ✅ 可扩展性强，易于添加新功能
- ✅ 符合单一职责原则
- ✅ 便于团队协作

