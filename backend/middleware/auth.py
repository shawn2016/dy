"""
认证中间件
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User


def auth_required(f):
    """认证装饰器"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({
                    'code': 401,
                    'message': '未提供Token，请先登录',
                    'data': None
                }), 401
            
            # 验证用户是否存在
            user = User.query.get(int(user_id))
            if not user:
                return jsonify({
                    'code': 401,
                    'message': '用户不存在',
                    'data': None
                }), 401
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'code': 401,
                'message': f'认证失败: {str(e)}',
                'data': None
            }), 401
    
    return decorated_function

