"""
认证路由
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import auth_bp
from ..services import AuthService
from ..middleware import auth_required


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        result = AuthService.login(username, password)
        
        return jsonify({
            'code': 200,
            'message': '登录成功',
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'code': 401,
            'message': str(e),
            'data': None
        }), 401
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_user_by_id(user_id)
        
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': user
        })
    except ValueError as e:
        return jsonify({
            'code': 404,
            'message': str(e),
            'data': None
        }), 404
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """退出登录"""
    return jsonify({
        'code': 200,
        'message': '退出成功',
        'data': None
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        phone = data.get('phone')
        
        user = AuthService.register(username, password, email, phone)
        
        return jsonify({
            'code': 200,
            'message': '注册成功',
            'data': user
        }), 201
    except ValueError as e:
        return jsonify({
            'code': 400,
            'message': str(e),
            'data': None
        }), 400
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@auth_required
def change_password():
    """修改密码"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        AuthService.change_password(user_id, old_password, new_password)
        
        return jsonify({
            'code': 200,
            'message': '密码修改成功',
            'data': None
        })
    except ValueError as e:
        return jsonify({
            'code': 400,
            'message': str(e),
            'data': None
        }), 400
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@auth_bp.route('/upload-avatar', methods=['POST'])
@auth_required
def upload_avatar():
    """上传头像"""
    try:
        from werkzeug.utils import secure_filename
        import os
        import uuid
        
        user_id = get_jwt_identity()
        
        if 'avatar' not in request.files:
            return jsonify({
                'code': 400,
                'message': '请选择头像图片',
                'data': None
            }), 400
        
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({
                'code': 400,
                'message': '请选择头像图片',
                'data': None
            }), 400
        
        # 创建目录结构
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        avatar_dir = os.path.join(base_dir, '..', 'data', 'avatars', str(user_id))
        os.makedirs(avatar_dir, exist_ok=True)
        
        # 生成文件名
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        new_filename = f'{uuid.uuid4().hex}.{ext}'
        filepath = os.path.join(avatar_dir, new_filename)
        
        # 保存文件
        file.save(filepath)
        
        # 更新用户头像URL（相对路径）
        avatar_url = f'/data/avatars/{user_id}/{new_filename}'
        user = AuthService.update_avatar(user_id, avatar_url)
        
        return jsonify({
            'code': 200,
            'message': '头像上传成功',
            'data': {
                'avatar': avatar_url,
                'user': user
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

