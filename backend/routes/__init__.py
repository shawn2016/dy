"""
路由模块
"""
from flask import Blueprint

# 创建蓝图
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
cover_bp = Blueprint('cover', __name__, url_prefix='/api')
video_bp = Blueprint('video', __name__, url_prefix='/api/videos')

# 导入路由（必须在蓝图创建后）
from . import auth_routes, cover_routes, video_routes

def register_routes(app):
    """注册所有路由"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(cover_bp)
    app.register_blueprint(video_bp)

