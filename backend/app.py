"""
Flask应用主文件
采用MVC架构，代码结构清晰
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import sys
import os

# 添加当前目录到路径，确保可以导入模块
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 使用绝对导入
from config import Config
from config.database import db, init_db
from routes import register_routes


def create_app():
    """创建Flask应用"""
    app = Flask(__name__, static_folder='../data', static_url_path='/data')
    
    # 加载配置
    app.config.from_object(Config)
    
    # 初始化CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # 初始化JWT
    jwt = JWTManager(app)
    
    # 配置JWT错误处理器
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'code': 401,
            'message': 'Token已过期，请重新登录',
            'data': None
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'code': 422,
            'message': 'Token无效，请重新登录',
            'data': None
        }), 422
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'code': 401,
            'message': '未提供Token，请先登录',
            'data': None
        }), 401
    
    # 初始化数据库
    init_db(app)
    
    # 注册路由
    register_routes(app)
    
    # 健康检查
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({
            'code': 200,
            'message': '服务运行正常',
            'data': None
        })
    
    return app


if __name__ == '__main__':
    app = create_app()
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)

