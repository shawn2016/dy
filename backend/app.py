from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import random
import string
import uuid

app = Flask(__name__, static_folder='../data', static_url_path='/data')
CORS(app)

# JWT配置
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# JWT错误处理器
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

# 数据库配置 - MySQL
# 请根据实际情况修改数据库连接信息
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '123456')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'video_cover_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 用户模型
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(500))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'avatar': self.avatar,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# 封面模型
class Cover(db.Model):
    __tablename__ = 'covers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'image_url': self.image_url,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 视频模型
class Video(db.Model):
    __tablename__ = 'videos'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    video_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500))
    duration = db.Column(db.Integer, default=0)  # 时长（秒）
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'duration': self.duration,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 初始化数据库
with app.app_context():
    db.create_all()
    
    # 检查并添加phone字段（如果不存在）
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        if 'phone' not in columns:
            print('正在添加phone字段到users表...')
            db.session.execute(text('ALTER TABLE users ADD COLUMN phone VARCHAR(20)'))
            db.session.commit()
            print('✓ phone字段添加成功')
    except Exception as e:
        print(f'检查phone字段时出错: {e}')
        db.session.rollback()
    
    # 创建默认管理员用户（如果不存在）
    try:
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin')
            admin.set_password('123456')
            admin.email = 'admin@example.com'
            db.session.add(admin)
            db.session.commit()
            print('默认管理员用户已创建: admin / 123456')
        else:
            # 如果用户已存在，更新密码为 123456
            admin.set_password('123456')
            db.session.commit()
            print('管理员用户密码已更新为: 123456')
    except Exception as e:
        print(f'初始化管理员用户时出错: {e}')
        db.session.rollback()

# 认证装饰器
def auth_required(f):
    @jwt_required()
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# 登录接口
@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'code': 400,
                'message': '用户名和密码不能为空',
                'data': None
            }), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'code': 401,
                'message': '用户名或密码错误',
                'data': None
            }), 401
        
        # 生成token（identity必须是字符串类型）
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'code': 200,
            'message': '登录成功',
            'data': {
                'token': access_token,
                'user': user.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 获取当前用户信息
@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        # 将字符串ID转换为整数
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({
                'code': 404,
                'message': '用户不存在',
                'data': None
            }), 404
        
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': user.to_dict()
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 退出登录
@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT是无状态的，客户端删除token即可
    # 这里可以添加token黑名单机制
    return jsonify({
        'code': 200,
        'message': '退出成功',
        'data': None
    })

# 获取所有封面
@app.route('/covers', methods=['GET'])
@auth_required
def get_covers():
    try:
        covers = Cover.query.order_by(Cover.created_at.desc()).all()
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': [cover.to_dict() for cover in covers]
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': []
        }), 500

# 获取单个封面
@app.route('/covers/<int:cover_id>', methods=['GET'])
@auth_required
def get_cover(cover_id):
    try:
        cover = Cover.query.get_or_404(cover_id)
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': cover.to_dict()
        })
    except Exception as e:
        return jsonify({
            'code': 404,
            'message': str(e),
            'data': None
        }), 404

# 创建封面
@app.route('/covers', methods=['POST'])
@auth_required
def create_cover():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({
                'code': 400,
                'message': '封面名称不能为空',
                'data': None
            }), 400
        
        if not data.get('image_url'):
            return jsonify({
                'code': 400,
                'message': '图片URL不能为空',
                'data': None
            }), 400
        
        cover = Cover(
            name=data.get('name'),
            image_url=data.get('image_url'),
            description=data.get('description', '')
        )
        
        db.session.add(cover)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '创建成功',
            'data': cover.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 更新封面
@app.route('/covers/<int:cover_id>', methods=['PUT'])
@auth_required
def update_cover(cover_id):
    try:
        cover = Cover.query.get_or_404(cover_id)
        data = request.get_json()
        
        if data.get('name'):
            cover.name = data.get('name')
        if data.get('image_url'):
            cover.image_url = data.get('image_url')
        if 'description' in data:
            cover.description = data.get('description')
        
        cover.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '更新成功',
            'data': cover.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 删除封面
@app.route('/covers/<int:cover_id>', methods=['DELETE'])
@auth_required
def delete_cover(cover_id):
    try:
        cover = Cover.query.get_or_404(cover_id)
        db.session.delete(cover)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '删除成功',
            'data': None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 获取所有视频
@app.route('/videos', methods=['GET'])
@auth_required
def get_videos():
    try:
        videos = Video.query.order_by(Video.created_at.desc()).all()
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': [video.to_dict() for video in videos]
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': []
        }), 500

# 获取单个视频
@app.route('/videos/<int:video_id>', methods=['GET'])
@auth_required
def get_video(video_id):
    try:
        video = Video.query.get_or_404(video_id)
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': video.to_dict()
        })
    except Exception as e:
        return jsonify({
            'code': 404,
            'message': str(e),
            'data': None
        }), 404

# 创建视频
@app.route('/videos', methods=['POST'])
@auth_required
def create_video():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({
                'code': 400,
                'message': '视频名称不能为空',
                'data': None
            }), 400
        
        if not data.get('video_url'):
            return jsonify({
                'code': 400,
                'message': '视频URL不能为空',
                'data': None
            }), 400
        
        video = Video(
            name=data.get('name'),
            video_url=data.get('video_url'),
            thumbnail_url=data.get('thumbnail_url', ''),
            duration=data.get('duration', 0),
            description=data.get('description', '')
        )
        
        db.session.add(video)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '创建成功',
            'data': video.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 更新视频
@app.route('/videos/<int:video_id>', methods=['PUT'])
@auth_required
def update_video(video_id):
    try:
        video = Video.query.get_or_404(video_id)
        data = request.get_json()
        
        if data.get('name'):
            video.name = data.get('name')
        if data.get('video_url'):
            video.video_url = data.get('video_url')
        if 'thumbnail_url' in data:
            video.thumbnail_url = data.get('thumbnail_url')
        if 'duration' in data:
            video.duration = data.get('duration', 0)
        if 'description' in data:
            video.description = data.get('description')
        
        video.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '更新成功',
            'data': video.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 删除视频
@app.route('/videos/<int:video_id>', methods=['DELETE'])
@auth_required
def delete_video(video_id):
    try:
        video = Video.query.get_or_404(video_id)
        db.session.delete(video)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '删除成功',
            'data': None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 验证码存储（实际生产环境应使用Redis等）
verify_codes = {}

# 生成验证码
def generate_verify_code():
    return ''.join(random.choices(string.digits, k=6))

# 注册接口
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        phone = data.get('phone')
        email = data.get('email')
        
        if not username or not password or not phone:
            return jsonify({
                'code': 400,
                'message': '用户名、密码和手机号不能为空',
                'data': None
            }), 400
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            return jsonify({
                'code': 400,
                'message': '用户名已存在',
                'data': None
            }), 400
        
        # 检查手机号是否已存在
        if User.query.filter_by(phone=phone).first():
            return jsonify({
                'code': 400,
                'message': '手机号已被注册',
                'data': None
            }), 400
        
        # 创建新用户
        user = User(
            username=username,
            phone=phone,
            email=email
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '注册成功',
            'data': {
                'user': user.to_dict()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 发送验证码接口
@app.route('/auth/send-verify-code', methods=['POST'])
def send_verify_code():
    try:
        data = request.get_json()
        verify_type = data.get('type', 'phone')
        phone = data.get('phone')
        email = data.get('email')
        
        code = generate_verify_code()
        key = phone if verify_type == 'phone' else email
        
        # 存储验证码（5分钟有效期）
        verify_codes[key] = {
            'code': code,
            'expires_at': datetime.utcnow() + timedelta(minutes=5)
        }
        
        # 实际生产环境应该发送短信或邮件
        # 这里仅返回验证码用于测试
        print(f'验证码: {code} (用于 {key})')
        
        return jsonify({
            'code': 200,
            'message': '验证码已发送',
            'data': {
                'code': code  # 测试用，生产环境应删除
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 验证验证码接口
@app.route('/auth/verify-code', methods=['POST'])
def verify_code():
    try:
        data = request.get_json()
        username = data.get('username')
        verify_type = data.get('type', 'phone')
        phone = data.get('phone')
        email = data.get('email')
        code = data.get('code')
        
        if not username or not code:
            return jsonify({
                'code': 400,
                'message': '用户名和验证码不能为空',
                'data': None
            }), 400
        
        # 检查用户是否存在
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({
                'code': 404,
                'message': '用户不存在',
                'data': None
            }), 404
        
        # 验证手机号或邮箱是否匹配
        key = phone if verify_type == 'phone' else email
        if verify_type == 'phone' and user.phone != phone:
            return jsonify({
                'code': 400,
                'message': '手机号不匹配',
                'data': None
            }), 400
        if verify_type == 'email' and user.email != email:
            return jsonify({
                'code': 400,
                'message': '邮箱不匹配',
                'data': None
            }), 400
        
        # 验证验证码
        stored_code_info = verify_codes.get(key)
        if not stored_code_info:
            return jsonify({
                'code': 400,
                'message': '验证码已过期或未发送',
                'data': None
            }), 400
        
        if stored_code_info['expires_at'] < datetime.utcnow():
            del verify_codes[key]
            return jsonify({
                'code': 400,
                'message': '验证码已过期',
                'data': None
            }), 400
        
        if stored_code_info['code'] != code:
            return jsonify({
                'code': 400,
                'message': '验证码错误',
                'data': None
            }), 400
        
        # 验证成功，删除验证码
        del verify_codes[key]
        
        return jsonify({
            'code': 200,
            'message': '验证成功',
            'data': None
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 重置密码接口
@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        username = data.get('username')
        new_password = data.get('newPassword')
        
        if not username or not new_password:
            return jsonify({
                'code': 400,
                'message': '用户名和新密码不能为空',
                'data': None
            }), 400
        
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({
                'code': 404,
                'message': '用户不存在',
                'data': None
            }), 404
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '密码重置成功',
            'data': None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 修改密码接口
@app.route('/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        # 将字符串ID转换为整数
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({
                'code': 404,
                'message': '用户不存在',
                'data': None
            }), 404
        
        data = request.get_json()
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        if not old_password or not new_password:
            return jsonify({
                'code': 400,
                'message': '旧密码和新密码不能为空',
                'data': None
            }), 400
        
        if not user.check_password(old_password):
            return jsonify({
                'code': 401,
                'message': '旧密码错误',
                'data': None
            }), 401
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '密码修改成功',
            'data': None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 上传头像接口
@app.route('/auth/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    try:
        user_id = get_jwt_identity()
        # 将字符串ID转换为整数
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({
                'code': 404,
                'message': '用户不存在',
                'data': None
            }), 404
        
        if 'avatar' not in request.files:
            return jsonify({
                'code': 400,
                'message': '请选择头像文件',
                'data': None
            }), 400
        
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({
                'code': 400,
                'message': '请选择头像文件',
                'data': None
            }), 400
        
        # 创建目录结构（相对于backend目录）
        base_dir = os.path.dirname(os.path.abspath(__file__))
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
        user.avatar = avatar_url
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '头像上传成功',
            'data': {
                'avatar': avatar_url
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

# 健康检查
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'code': 200,
        'message': '服务运行正常',
        'data': None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)

